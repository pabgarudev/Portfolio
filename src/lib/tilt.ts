interface TiltOptions {
	/** Max rotation in degrees at the card's edge. */
	maxTilt?: number;
	/** Slight scale-up while tilted, so the card reads as lifted toward the cursor. */
	scale?: number;
	/** Perspective distance in px: smaller = more exaggerated foreshortening. */
	perspective?: number;
}

/**
 * Wires a subtle cursor-driven 3D tilt to every element matching `selector`.
 * Mouse-only (pointerType check) since touch has no real hover to tilt
 * toward. Pairs with each caller's own CSS: `transform-style: preserve-3d`
 * on the tilted element plus a static `translateZ` on its inner content
 * layer, so foreground content (title, pills) appears to sit above the
 * card's background layers (glow blob, scan-grid) as it tilts — the
 * perspective() below only becomes visually meaningful once something
 * inside has its own Z offset.
 */
export function initTiltCards(selector: string, options: TiltOptions = {}): void {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const { maxTilt = 6, scale = 1.015, perspective = 900 } = options;

	document.querySelectorAll<HTMLElement>(selector).forEach((card) => {
		function onMove(event: PointerEvent) {
			if (event.pointerType !== "mouse") return;
			const rect = card.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width;
			const py = (event.clientY - rect.top) / rect.height;
			const rotateY = (px - 0.5) * maxTilt * 2;
			const rotateX = (0.5 - py) * maxTilt * 2;
			card.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
		}

		function onLeave(event: PointerEvent) {
			if (event.pointerType !== "mouse") return;
			card.style.transform = "";
		}

		card.addEventListener("pointermove", onMove);
		card.addEventListener("pointerleave", onLeave);
	});
}
