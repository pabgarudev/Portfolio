import {
	AmbientLight,
	DirectionalLight,
	Group,
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

	const slots = document.querySelectorAll<HTMLElement>(".icon3d-slot");
	slots.forEach((slot, index) => {
		const canvas = slot.querySelector<HTMLCanvasElement>(".icon3d-canvas");
		const fallbackSvg = slot.querySelector<SVGElement>(".icon3d-fallback");
		if (!canvas || !fallbackSvg) return;

		let renderer: WebGLRenderer;
		try {
			renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
		} catch {
			// No WebGL: fall back to the original flat icon rather than an empty canvas.
			slot.classList.add("icon3d-fallback-active");
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

		renderer.render(scene, camera);

		if (!prefersReducedMotion) {
			live.push({ scene, camera, renderer, pivot, baseRotation: rotation, phase: index * 1.7 });
		}
	});

	if (prefersReducedMotion || live.length === 0) return;

	const timer = new Timer();
	timer.connect(document);
	let raf = 0;

	function render(timestamp: number) {
		timer.update(timestamp);
		const t = timer.getElapsed();
		for (const { scene, camera, renderer, pivot, baseRotation, phase } of live) {
			pivot.position.y = Math.sin(t * FLOAT_SPEED + phase) * FLOAT_AMPLITUDE;
			pivot.rotation.x = baseRotation[0] + Math.sin(t * ROT_SPEED * 0.8 + phase) * TILT_AMPLITUDE;
			pivot.rotation.y = baseRotation[1] + Math.cos(t * ROT_SPEED + phase) * TILT_AMPLITUDE;
			pivot.rotation.z = baseRotation[2] + Math.sin(t * ROT_SPEED * 0.6 + phase) * SWAY_AMPLITUDE;
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

	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("astro:before-swap", dispose, { once: true });
	raf = requestAnimationFrame(render);
}
