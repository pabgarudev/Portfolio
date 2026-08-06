import {
	Box3,
	BufferGeometry,
	DoubleSide,
	Float32BufferAttribute,
	Group,
	Mesh,
	MeshStandardMaterial,
	Vector2,
	Vector3,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

function key(x: number, y: number): string {
	return `${x.toFixed(2)},${y.toFixed(2)}`;
}

/**
 * Turns a flat, triangulated 2D mesh (every vertex at z=0, as produced by
 * SVGLoader.pointsToStroke) into a solid volume: the original triangles
 * become front/back caps, and side walls are built along the mesh's
 * boundary — edges whose reverse direction never shows up on any other
 * triangle, meaning only one triangle owns them. Non-indexed in, non-indexed
 * out, so computeVertexNormals() gives flat per-face shading (the same
 * hard-edged, faceted look as the gear/asterisk meshes) rather than
 * smoothing across the extrusion's edges.
 */
export function solidifyFlatMesh(flat: BufferGeometry, depth: number): BufferGeometry {
	const pos = flat.attributes.position.array as ArrayLike<number>;
	const triCount = pos.length / 9;
	const halfDepth = depth / 2;

	const front: number[] = [];
	const back: number[] = [];
	const directed = new Set<string>();
	const triPoints: [number, number][][] = [];

	for (let t = 0; t < triCount; t++) {
		const base = t * 9;
		const p0: [number, number] = [pos[base], pos[base + 1]];
		const p1: [number, number] = [pos[base + 3], pos[base + 4]];
		const p2: [number, number] = [pos[base + 6], pos[base + 7]];
		triPoints.push([p0, p1, p2]);

		front.push(p0[0], p0[1], halfDepth, p1[0], p1[1], halfDepth, p2[0], p2[1], halfDepth);
		back.push(p2[0], p2[1], -halfDepth, p1[0], p1[1], -halfDepth, p0[0], p0[1], -halfDepth);

		directed.add(`${key(...p0)}|${key(...p1)}`);
		directed.add(`${key(...p1)}|${key(...p2)}`);
		directed.add(`${key(...p2)}|${key(...p0)}`);
	}

	const sides: number[] = [];
	for (const [p0, p1, p2] of triPoints) {
		const edges: [[number, number], [number, number]][] = [
			[p0, p1],
			[p1, p2],
			[p2, p0],
		];
		for (const [a, b] of edges) {
			// Interior edge (shared by a neighboring triangle in the opposite
			// direction): skip, it's not part of the mesh's outer boundary.
			if (directed.has(`${key(...b)}|${key(...a)}`)) continue;
			sides.push(
				a[0], a[1], halfDepth, b[0], b[1], halfDepth, b[0], b[1], -halfDepth,
				a[0], a[1], halfDepth, b[0], b[1], -halfDepth, a[0], a[1], -halfDepth
			);
		}
	}

	const all = new Float32Array(front.length + back.length + sides.length);
	all.set(front, 0);
	all.set(back, front.length);
	all.set(sides, front.length + back.length);

	const geo = new BufferGeometry();
	geo.setAttribute("position", new Float32BufferAttribute(all, 3));
	geo.computeVertexNormals();
	return geo;
}

export interface Icon3DOptions {
	/** Extrusion thickness, in the icon's own SVG units (viewBox is usually 0-24). */
	depth?: number;
	/** Must match the icon's actual stroke-width attribute. */
	strokeWidth?: number;
	color?: number;
	metalness?: number;
	roughness?: number;
}

/**
 * Parses a rendered icon <svg>'s markup and builds a solid, centered,
 * three.js Group from its stroked paths. Skips the invisible full-canvas
 * hitbox rect Tabler-style icons carry as their first path (stroke="none")
 * — it has no visible stroke, and solidifying it would extrude a giant flat
 * plate behind the real icon.
 */
export function buildIcon3DGroup(svgMarkup: string, options: Icon3DOptions = {}): Group {
	const { depth = 2.4, strokeWidth = 2, color = 0xffffff, metalness = 0.35, roughness = 0.45 } = options;

	const loader = new SVGLoader();
	const parsed = loader.parse(svgMarkup);
	// Bevel joins (not round): round joins fan out into several overlapping
	// triangles at every vertex along a curve, which is both far denser than
	// this needs and, worse, produces edges that don't line up exactly with
	// the ribbon's own edges — that mismatch is what was misclassifying
	// interior edges as boundary and punching the stray notches/gaps into
	// the solidified mesh. Bevel joins are simple, non-overlapping, and look
	// the same as round here since curves are already finely subdivided
	// (consecutive segments are nearly collinear).
	const style = SVGLoader.getStrokeStyle(strokeWidth, "#fff", "bevel", "round", 4);
	const material = new MeshStandardMaterial({ color, metalness, roughness, side: DoubleSide });

	const group = new Group();

	for (const path of parsed.paths) {
		const strokeAttr = (path.userData?.node as SVGElement | undefined)?.getAttribute?.("stroke");
		if (strokeAttr === "none") continue;

		for (const subPath of path.subPaths) {
			const rawPoints = subPath.getPoints();
			if (rawPoints.length < 2) continue;
			// SVG's y-down convention flipped to three.js's y-up, right at the
			// source, so nothing downstream needs to know about the flip.
			const points = rawPoints.map((p) => new Vector2(p.x, -p.y));
			const flat = SVGLoader.pointsToStroke(points, style);
			if (!flat) continue;
			const solid = solidifyFlatMesh(flat, depth);
			group.add(new Mesh(solid, material));
		}
	}

	// Center every mesh's geometry on the icon's own bounding box, baked
	// directly into the vertex positions, so the returned group starts at
	// identity transform and is free for the caller to rotate/position.
	const box = new Box3().setFromObject(group);
	const center = new Vector3();
	box.getCenter(center);
	for (const child of group.children) {
		(child as Mesh).geometry.translate(-center.x, -center.y, -center.z);
	}

	return group;
}
