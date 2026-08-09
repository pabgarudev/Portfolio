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
 * Finds every `.icon3d-slot` on the current page (rendered by
 * src/components/Icon3D.astro) and turns each one's flat fallback icon into
 * a solid, gently floating 3D mesh, all driven by one shared render loop.
 * Called fresh from Layout.astro on every "astro:page-load" since the
 * slots themselves live inside <main> and don't survive view transitions.
 */
export function initIcon3DSlots(): void {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const live: LiveIcon[] = [];

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
		for (const { scene, camera, renderer, pivot, baseRotation, phase, joinedAt } of live) {
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

	function dispose() {
		cancelAnimationFrame(raf);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("astro:before-swap", dispose);
		timer.dispose();
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

	const slots = document.querySelectorAll<HTMLElement>(".icon3d-slot");
	slots.forEach((slot, index) => {
		const canvas = slot.querySelector<HTMLCanvasElement>(".icon3d-canvas");
		const fallbackSvg = slot.querySelector<SVGElement>(".icon3d-fallback");
		if (!canvas || !fallbackSvg) return;

		const isPop = slot.classList.contains("icon3d-slot--pop");

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
		} catch {
			// No WebGL: fall back to the original flat icon rather than an empty canvas.
			slot.classList.add("icon3d-fallback-active");
			slot.classList.add("icon3d-ready");
			return;
		}

		// Render at 2x the icon's own displayed size for crisp edges; the
		// slot sizes itself with plain Tailwind size classes (e.g. size-11,
		// or a responsive size-8 sm:size-10), so read it back live instead
		// of assuming a fixed footprint.
		const displaySize = canvas.clientWidth || slot.clientWidth || 44;
		const SIZE = displaySize * 2;

		renderer.outputColorSpace = SRGBColorSpace;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(SIZE, SIZE, false);

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

		const iconGroup = buildIcon3DGroup(fallbackSvg.outerHTML, { depth });

		const pivot = new Group();
		pivot.rotation.set(...rotation);
		pivot.add(iconGroup);
		scene.add(pivot);

		const phase = index * 1.7;

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
					live.push({ scene, camera, renderer, pivot, baseRotation: rotation, phase, joinedAt: timer.getElapsed() });
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
				live.push({ scene, camera, renderer, pivot, baseRotation: rotation, phase, joinedAt: timer.getElapsed() });
			}
		}
	});

	if (prefersReducedMotion) return;

	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("astro:before-swap", dispose, { once: true });
	raf = requestAnimationFrame(render);
}
