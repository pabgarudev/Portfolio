import {
	AmbientLight,
	Color,
	DirectionalLight,
	EdgesGeometry,
	Group,
	LineBasicMaterial,
	LineSegments,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	Timer,
	WebGLRenderer,
} from "three";
import { buildIcon3DGroup } from "./icon3d";

interface IconState {
	// Set true between a lost WebGL context and its restoration; the shared
	// render loop skips these rather than calling render() on a dead context.
	lost: boolean;
}

interface LiveIcon {
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
	pivot: Group;
	baseRotation: [number, number, number];
	// Each icon drifts on its own clock so several identical sine waves
	// don't visibly breathe in unison.
	phase: number;
	// timer.getElapsed() at the moment this icon joined the shared loop.
	// Icons that join late (popIn, after its own entrance+hold) would
	// otherwise snap straight into whatever point the shared sine waves
	// already happen to be at — this anchors each icon's own motion to
	// start at zero (see FLOAT_EASE_IN_S) regardless of when it joins.
	joinedAt: number;
	state: IconState;
}

// Small, slow sine drift: a hint of floating and turning in place, never a
// spin. Z carries most of the readable motion since it rotates the
// silhouette in-plane; X/Y just add a bit of light-catching tilt.
const FLOAT_SPEED = 0.65;
const FLOAT_AMPLITUDE = 3.6;
const ROT_SPEED = 0.5;
const TILT_AMPLITUDE = 0.16;
const SWAY_AMPLITUDE = 0.18;
const DEFAULT_ROTATION: [number, number, number] = [-0.4, 0.35, 0.12];
// Floating amplitude eases in from zero over this many seconds after an
// icon joins the shared loop, so it always starts exactly at its resting
// pose (baseRotation, no offset) and drifts into motion rather than
// snapping straight into an arbitrary point on the sine waves.
const FLOAT_EASE_IN_S = 0.8;

// popIn entrance (see Icon3D.astro): the mesh's edges sketch in first, then
// the solid faces fade in underneath, with a small springy scale overshoot
// for a bit of spawn energy. Edges settle to a faint permanent outline
// afterward instead of disappearing, so the icon keeps a hint of linework.
const POP_EDGES_MS = 900;
const POP_FILL_DELAY_MS = 600;
const POP_FILL_MS = 950;
const POP_TOTAL_MS = POP_FILL_DELAY_MS + POP_FILL_MS;
const POP_EDGE_RESIDUAL_OPACITY = 0.22;
const POP_SCALE_FROM = 0.55;
// Pause after the entrance settles before the icon joins the shared
// floating-idle loop, so it doesn't start drifting the instant it lands.
const POP_HOLD_MS = 500;

// The default ("inherits currentColor") mesh material has no CSS to read
// currentColor from at WebGL-build time, so it's resolved from the theme
// attribute directly: white reads as invisible on the light theme's white
// page background, so it flips to near-black there.
const ICON_COLOR_DARK = 0xffffff;
const ICON_COLOR_LIGHT = 0x9998d8;
function currentIconColor(): number {
	return document.documentElement.dataset.theme === "light" ? ICON_COLOR_LIGHT : ICON_COLOR_DARK;
}

function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Runs the popIn entrance on one icon: builds a matching edge-line overlay
 * for every mesh in the group, then animates edges in, solid fill in after
 * them, and a springy scale-up, all via its own short-lived render loop.
 * Calls onDone once it settles (letting the caller hand the icon off to the
 * shared floating-idle loop) — cancelled early on view-transition navigation.
 */
function runPopEntrance(
	pivot: Group,
	iconGroup: Group,
	renderer: WebGLRenderer,
	scene: Scene,
	camera: PerspectiveCamera,
	onDone: () => void,
): void {
	const meshes: Mesh[] = [];
	const edgeLines: LineSegments[] = [];

	iconGroup.traverse((child) => {
		if (!(child instanceof Mesh)) return;
		const material = child.material as MeshStandardMaterial;
		material.transparent = true;
		material.opacity = 0;
		meshes.push(child);

		// Threshold angle skips the many near-flat bevel-segment edges,
		// keeping just the icon's real silhouette and crease lines.
		const edgeGeometry = new EdgesGeometry(child.geometry, 25);
		const edgeMaterial = new LineBasicMaterial({
			color: (material.color as Color).getHex(),
			transparent: true,
			opacity: 0,
		});
		const lines = new LineSegments(edgeGeometry, edgeMaterial);
		child.add(lines);
		edgeLines.push(lines);
	});

	pivot.scale.setScalar(POP_SCALE_FROM);

	let raf = 0;
	function cancel() {
		cancelAnimationFrame(raf);
		window.removeEventListener("astro:before-swap", cancel);
	}
	window.addEventListener("astro:before-swap", cancel, { once: true });

	const start = performance.now();
	function frame(now: number) {
		const elapsed = now - start;
		const edgeT = easeOutCubic(Math.min(1, elapsed / POP_EDGES_MS));
		const fillT = easeOutCubic(Math.min(1, Math.max(0, (elapsed - POP_FILL_DELAY_MS) / POP_FILL_MS)));
		const scaleT = easeOutBack(Math.min(1, elapsed / POP_EDGES_MS));

		pivot.scale.setScalar(POP_SCALE_FROM + (1 - POP_SCALE_FROM) * scaleT);
		for (const lines of edgeLines) {
			(lines.material as LineBasicMaterial).opacity = edgeT - fillT * (1 - POP_EDGE_RESIDUAL_OPACITY);
		}
		for (const mesh of meshes) {
			(mesh.material as MeshStandardMaterial).opacity = fillT;
		}

		renderer.render(scene, camera);

		if (elapsed < POP_TOTAL_MS) {
			raf = requestAnimationFrame(frame);
			return;
		}

		pivot.scale.setScalar(1);
		for (const mesh of meshes) {
			const material = mesh.material as MeshStandardMaterial;
			material.opacity = 1;
			material.transparent = false;
		}
		for (const lines of edgeLines) {
			(lines.material as LineBasicMaterial).opacity = POP_EDGE_RESIDUAL_OPACITY;
		}
		renderer.render(scene, camera);
		window.removeEventListener("astro:before-swap", cancel);
		onDone();
	}

	raf = requestAnimationFrame(frame);
}

/**
 * Frees the geometries/materials this icon's group owns, including the
 * edge-line overlays runPopEntrance adds as children of each mesh.
 */
function disposeIconGroup(group: Group): void {
	group.traverse((child) => {
		if (child instanceof Mesh) {
			child.geometry.dispose();
			const material = child.material;
			if (Array.isArray(material)) material.forEach((m) => m.dispose());
			else material.dispose();
		} else if (child instanceof LineSegments) {
			child.geometry.dispose();
			(child.material as LineBasicMaterial).dispose();
		}
	});
}

/**
 * Finds every `.icon3d-slot` on the current page (rendered by
 * src/components/Icon3D.astro) and turns each one's flat fallback icon into
 * a solid, gently floating 3D mesh, all driven by one shared render loop.
 * Called fresh from Layout.astro on every "astro:page-load" since the
 * slots themselves live inside <main> and don't survive view transitions.
 */
export function initIcon3DSlots(): void {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const live: LiveIcon[] = [];
	// Tracks every renderer/group this page opened, regardless of whether it
	// ever joined `live` — needed so disposeResources() can free all of them
	// on navigation even under reduced motion, or for icons still mid
	// entrance or waiting to scroll into view.
	const allIcons: { renderer: WebGLRenderer; group: Group }[] = [];
	// Every icon's "inherits currentColor" material, plus enough to re-render
	// it immediately on a theme toggle — kept separate from `live` since that
	// only holds icons that joined the floating-idle loop, but a mid-entrance
	// or reduced-motion icon still needs its one-shot render call redone once
	// its material's color changes underneath it.
	const themedMaterials: MeshStandardMaterial[] = [];
	const renderTargets: { renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera; state: IconState }[] = [];
	const resizeObservers: ResizeObserver[] = [];
	let activatedCount = 0;

	// Timer/loop are set up before the per-slot loop below (rather than
	// after) so a popIn icon's late, async join can stamp joinedAt off the
	// same running clock the render loop already uses, and so the loop is
	// there to pick it up even if no other icon on the page ever went live.
	// connect() (not just construction) is what registers a document
	// listener, so it's skipped under reduced motion — nothing below ever
	// calls render()/dispose() in that case, which would otherwise leak one
	// listener per page load since dispose() is never reached to remove it.
	const timer = new Timer();
	if (!prefersReducedMotion) timer.connect(document);
	let raf = 0;

	function render(timestamp: number) {
		timer.update(timestamp);
		const t = timer.getElapsed();
		for (const { scene, camera, renderer, pivot, baseRotation, phase, joinedAt, state } of live) {
			// A lost context can't be rendered into; skip until it's restored
			// (or forever, if it never is — the icon just stays on the flat
			// fallback shown by the contextlost handler below).
			if (state.lost) continue;
			const lt = t - joinedAt;
			const ease = Math.min(1, lt / FLOAT_EASE_IN_S);
			pivot.position.y = Math.sin(lt * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE * ease;
			pivot.rotation.x = baseRotation[0] + Math.sin(lt * ROT_SPEED * 0.8 + phase) * TILT_AMPLITUDE * ease;
			pivot.rotation.y = baseRotation[1] + Math.cos(lt * ROT_SPEED + phase) * TILT_AMPLITUDE * ease;
			pivot.rotation.z = baseRotation[2] + Math.sin(lt * ROT_SPEED * 0.6 + phase) * SWAY_AMPLITUDE * ease;
			renderer.render(scene, camera);
		}
		raf = requestAnimationFrame(render);
	}

	// Frees every GL context, geometry, and material this page opened, and
	// disconnects the observers below. Needed regardless of whether the
	// shared idle loop ever ran, since each icon opens its own WebGLRenderer
	// the moment it's activated (immediately under reduced motion, or on
	// intersection otherwise) — mobile browsers have a low ceiling on
	// simultaneous WebGL contexts, so leaking these across view-transition
	// navigations compounds fast.
	function disposeResources() {
		intersectionObserver?.disconnect();
		for (const observer of resizeObservers) observer.disconnect();
		for (const { renderer, group } of allIcons) {
			renderer.dispose();
			disposeIconGroup(group);
		}
		document.removeEventListener("themechange", onThemeChange);
	}

	// Fired by src/lib/themeToggle.ts's click handler. Retints every icon's
	// default material in place (no geometry rebuild) and immediately
	// re-renders each one, including icons mid-entrance or paused under
	// reduced motion that would otherwise never call render() again.
	function onThemeChange() {
		const color = currentIconColor();
		for (const material of themedMaterials) material.color.setHex(color);
		for (const { renderer, scene, camera, state } of renderTargets) {
			if (!state.lost) renderer.render(scene, camera);
		}
	}
	document.addEventListener("themechange", onThemeChange);

	function dispose() {
		cancelAnimationFrame(raf);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("astro:before-swap", dispose);
		timer.dispose();
		disposeResources();
	}

	// Stop rendering every icon while the tab is hidden rather than
	// animating somewhere unseen.
	function onVisibilityChange() {
		if (document.hidden) {
			cancelAnimationFrame(raf);
		} else {
			raf = requestAnimationFrame(render);
		}
	}

	function activateSlot(slot: HTMLElement): void {
		const canvas = slot.querySelector<HTMLCanvasElement>(".icon3d-canvas");
		const fallbackSvg = slot.querySelector<SVGElement>(".icon3d-fallback");
		if (!canvas || !fallbackSvg) return;

		const isPop = slot.classList.contains("icon3d-slot--pop");

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
		} catch {
			// No WebGL: fall back to the original flat icon rather than an empty canvas.
			slot.classList.add("icon3d-fallback-active", "icon3d-ready");
			return;
		}

		// Render at 2x the icon's own displayed size for crisp edges; the
		// slot sizes itself with plain Tailwind size classes (e.g. size-11,
		// or a responsive size-8 sm:size-10), so read it back live instead
		// of assuming a fixed footprint. Kept mutable (not const SIZE) since
		// the ResizeObserver below re-derives it on breakpoint/orientation
		// changes.
		let displaySize = canvas.clientWidth || slot.clientWidth || 44;

		renderer.outputColorSpace = SRGBColorSpace;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(displaySize * 2, displaySize * 2, false);

		const scene = new Scene();
		const camera = new PerspectiveCamera(28, 1, 0.1, 200);
		camera.position.set(0, 0, 62);
		camera.lookAt(0, 0, 0);

		scene.add(new AmbientLight(0xffffff, 1.5));
		const keyLight = new DirectionalLight(0xffffff, 2.1);
		keyLight.position.set(4, 5, 6);
		scene.add(keyLight);
		const rimLight = new DirectionalLight(0xffffff, 0.8);
		rimLight.position.set(-4, -2, -4);
		scene.add(rimLight);

		const depth = Number(slot.dataset.depth) || 4.2;
		let rotation = DEFAULT_ROTATION;
		if (slot.dataset.rotation) {
			try {
				rotation = JSON.parse(slot.dataset.rotation) as [number, number, number];
			} catch {
				rotation = DEFAULT_ROTATION;
			}
		}

		const iconGroup = buildIcon3DGroup(fallbackSvg.outerHTML, { depth, color: currentIconColor() });
		allIcons.push({ renderer, group: iconGroup });
		themedMaterials.push(iconGroup.userData.defaultMaterial as MeshStandardMaterial);

		const pivot = new Group();
		pivot.rotation.set(...rotation);
		pivot.add(iconGroup);
		scene.add(pivot);

		const phase = activatedCount++ * 1.7;
		const state: IconState = { lost: false };
		renderTargets.push({ renderer, scene, camera, state });

		// Mobile browsers reclaim WebGL contexts under memory pressure far
		// more readily than desktop, especially with several of these icons'
		// contexts open on one page at once. Left unhandled this leaves the
		// canvas permanently blank with no recovery; show the flat fallback
		// instead, and recover on our own if the browser hands the context
		// back.
		canvas.addEventListener(
			"webglcontextlost",
			(event) => {
				event.preventDefault();
				state.lost = true;
				slot.classList.add("icon3d-fallback-active");
			},
			false,
		);
		canvas.addEventListener(
			"webglcontextrestored",
			() => {
				state.lost = false;
				slot.classList.remove("icon3d-fallback-active");
				renderer.setSize(displaySize * 2, displaySize * 2, false);
				renderer.render(scene, camera);
			},
			false,
		);

		// The slot's own CSS size can change under it (responsive size
		// classes crossing a breakpoint, or a device rotation), which the
		// one-time size read above won't catch on its own — re-sync the
		// canvas's internal render resolution whenever that happens.
		const resizeObserver = new ResizeObserver(() => {
			const nextSize = canvas.clientWidth || slot.clientWidth;
			if (!nextSize || nextSize === displaySize) return;
			displaySize = nextSize;
			renderer.setSize(displaySize * 2, displaySize * 2, false);
			if (!state.lost) renderer.render(scene, camera);
		});
		resizeObserver.observe(slot);
		resizeObservers.push(resizeObserver);

		if (isPop && !prefersReducedMotion) {
			// Canvas starts genuinely empty (nothing rendered yet) until the
			// entrance kicks off, so the reserved slot just looks blank rather
			// than showing a static, unfinished mesh.
			runPopEntrance(pivot, iconGroup, renderer, scene, camera, () => {
				slot.classList.add("icon3d-ready");
				// Hold still a beat once landed before joining the shared
				// floating-idle loop, instead of drifting the instant it lands.
				const holdTimeout = window.setTimeout(() => {
					window.removeEventListener("astro:before-swap", clearHold);
					live.push({ scene, camera, renderer, pivot, baseRotation: rotation, phase, joinedAt: timer.getElapsed(), state });
				}, POP_HOLD_MS);
				function clearHold() {
					window.clearTimeout(holdTimeout);
				}
				window.addEventListener("astro:before-swap", clearHold, { once: true });
			});
		} else {
			renderer.render(scene, camera);
			slot.classList.add("icon3d-ready");
			if (!prefersReducedMotion) {
				live.push({ scene, camera, renderer, pivot, baseRotation: rotation, phase, joinedAt: timer.getElapsed(), state });
			}
		}
	}

	const slots = document.querySelectorAll<HTMLElement>(".icon3d-slot");

	// Icons well below the fold (e.g. footer sections) would otherwise open
	// a WebGL context immediately on page load along with every other icon
	// on the page, pushing mobile browsers toward their (much lower than
	// desktop) ceiling on simultaneous contexts. Activate each one only once
	// it's about to scroll into view instead.
	let intersectionObserver: IntersectionObserver | null = null;
	if ("IntersectionObserver" in window) {
		intersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					intersectionObserver!.unobserve(entry.target);
					activateSlot(entry.target as HTMLElement);
				}
			},
			{ rootMargin: "200px" },
		);
		slots.forEach((slot) => intersectionObserver!.observe(slot));
	} else {
		slots.forEach((slot) => activateSlot(slot));
	}

	// Registered regardless of reduced motion so contexts/observers from
	// off-screen icons that activated (or are still waiting to) get cleaned
	// up on navigation either way; see the comment on disposeResources.
	window.addEventListener("astro:before-swap", prefersReducedMotion ? disposeResources : dispose, { once: true });

	if (prefersReducedMotion) return;

	document.addEventListener("visibilitychange", onVisibilityChange);
	raf = requestAnimationFrame(render);
}
