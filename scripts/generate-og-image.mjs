// Regenerates public/og-image.png — a designed 1200x630 social card, replacing
// the raw profile photo previously used as og:image/twitter:image. Re-run this
// (`node scripts/generate-og-image.mjs`) whenever the name/role copy changes.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO_CENTER = { x: 964, y: 315 };
const PHOTO_RADIUS = 168;

const EYEBROW = "COMPUTER VISION · PHD";
const NAME = "Pablo García Ruiz";
const ROLE = "Senior Vision Engineer at Indra Group";
const DOMAIN = "pablogarciaruiz.com";

const FONT_SANS = "'Segoe UI', Arial, sans-serif";
const FONT_MONO = "'Consolas', 'Courier New', monospace";

function escapeXml(str) {
	return str.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

const baseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <filter id="blob-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="70" />
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0a0a" />

  <!-- Decorative blobs, same accent pair + blur treatment as Contact.astro's card -->
  <circle cx="80" cy="60" r="180" fill="#7877c6" opacity="0.16" filter="url(#blob-blur)" />
  <ellipse cx="${PHOTO_CENTER.x}" cy="${PHOTO_CENTER.y}" rx="230" ry="230" fill="#00e08f" opacity="0.14" filter="url(#blob-blur)" />

  <!-- Card framing, echoing the site's border-white/10 rounded-2xl card treatment -->
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="28" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />

  <text x="72" y="228" font-family="${FONT_MONO}" font-size="24" letter-spacing="4" fill="rgba(255,255,255,0.55)">${escapeXml(EYEBROW)}</text>
  <text x="70" y="308" font-family="${FONT_SANS}" font-size="80" font-weight="700" fill="#ffffff">${escapeXml(NAME)}</text>
  <text x="72" y="360" font-family="${FONT_SANS}" font-size="32" font-weight="400" fill="rgba(255,255,255,0.7)">${escapeXml(ROLE)}</text>

  <text x="72" y="562" font-family="${FONT_MONO}" font-size="22" fill="rgba(255,255,255,0.45)">${escapeXml(DOMAIN)}</text>

  <!-- Ring around where the circular photo will be composited -->
  <circle cx="${PHOTO_CENTER.x}" cy="${PHOTO_CENTER.y}" r="${PHOTO_RADIUS + 6}" fill="none" stroke="#00e08f" stroke-width="3" opacity="0.85" />
</svg>
`;

const grainSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
    <feComponentTransfer>
      <feFuncR type="linear" slope="0.28" intercept="0.72" />
      <feFuncG type="linear" slope="0.28" intercept="0.72" />
      <feFuncB type="linear" slope="0.28" intercept="0.72" />
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" />
</svg>
`;

async function run() {
	const photoPath = path.join(root, "src/assets/me.png");

	const circleMask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO_RADIUS * 2}" height="${PHOTO_RADIUS * 2}">
			<circle cx="${PHOTO_RADIUS}" cy="${PHOTO_RADIUS}" r="${PHOTO_RADIUS}" fill="#fff" />
		</svg>`
	);

	const circularPhoto = await sharp(photoPath)
		.resize(PHOTO_RADIUS * 2, PHOTO_RADIUS * 2, { fit: "cover" })
		.composite([{ input: circleMask, blend: "dest-in" }])
		.png()
		.toBuffer();

	const grainBuffer = await sharp(Buffer.from(grainSvg)).png().toBuffer();

	await sharp(Buffer.from(baseSvg))
		.composite([
			{
				input: circularPhoto,
				left: PHOTO_CENTER.x - PHOTO_RADIUS,
				top: PHOTO_CENTER.y - PHOTO_RADIUS,
			},
			{ input: grainBuffer, blend: "soft-light" },
		])
		.png({ quality: 90 })
		.toFile(path.join(root, "public/og-image.png"));

	console.log("Wrote public/og-image.png");
}

run();
