import type { Colorway, Product, Silhouette } from "@/lib/types";

/**
 * Brand-consistent SVG product art, used until real photography is dropped
 * into public/assets/img/products/. Every silhouette below is drawn as a
 * centered lens shape; the right lens is the mirrored left.
 */

const LX = 150; // left lens center x
const RX = 330; // right lens center x
const CY = 172; // lens center y

function lensPath(s: Silhouette) {
  switch (s) {
    case "round":
      return <circle r="62" />;
    case "square":
      return <rect x="-74" y="-52" width="148" height="104" rx="26" />;
    case "wayfarer":
      return (
        <path d="M -76 -42 C -76 -52 -68 -56 -58 -56 L 58 -56 C 68 -56 76 -50 77 -40 L 72 28 C 70 48 54 58 34 58 L -32 58 C -58 58 -74 44 -76 20 Z" />
      );
    case "aviator":
      return (
        <path d="M -72 -38 C -42 -58 28 -58 58 -44 C 72 -36 76 -16 68 6 C 54 40 22 60 -8 60 C -46 60 -74 32 -76 -4 C -77 -18 -76 -30 -72 -38 Z" />
      );
    case "cat-eye":
      return (
        <path d="M -80 -46 C -62 -62 -22 -58 18 -50 C 54 -42 72 -18 66 12 C 58 44 28 60 -6 58 C -48 56 -78 26 -80 -14 Z" />
      );
    case "sport":
      return (
        <path d="M -80 -32 C -42 -52 40 -52 80 -28 C 82 0 68 28 36 42 C 0 54 -54 44 -72 14 C -78 2 -80 -16 -80 -32 Z" />
      );
    case "accessory":
      return <rect x="-74" y="-52" width="148" height="104" rx="26" />;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (t - c) * p);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

export default function ProductArt({
  product,
  uid,
  colorway,
}: {
  product: Product;
  uid: string;
  /** Selected variant; defaults to the product's first colorway. */
  colorway?: Colorway;
}) {
  const cw = colorway ?? product.colorways[0];
  const grad = `lg-${uid}`;
  const clip = `cp-${uid}`;
  const shape = lensPath(product.silhouette);
  const lensLight = shade(cw.lensColor, 0.28);
  const lensDark = shade(cw.lensColor, -0.18);
  const bg = product.tint;
  const bgDeep = shade(bg, -0.1);
  const frame = cw.frameColor;
  const strokeW = product.silhouette === "aviator" || product.silhouette === "round" ? 7 : 10;

  const lens = (cx: number, flip: boolean) => (
    <g transform={`translate(${cx} ${CY})${flip ? " scale(-1 1)" : ""}`}>
      {shape}
    </g>
  );

  const glare = (cx: number) => (
    <g transform={`translate(${cx} ${CY})`} opacity="0.9">
      <rect
        x="-52"
        y="-80"
        width="16"
        height="150"
        rx="8"
        fill="#ffffff"
        opacity="0.22"
        transform="rotate(24)"
      />
      <rect
        x="-18"
        y="-80"
        width="7"
        height="150"
        rx="3.5"
        fill="#ffffff"
        opacity="0.14"
        transform="rotate(24)"
      />
    </g>
  );

  return (
    <svg
      viewBox="0 0 480 360"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${product.name} sunglasses illustration`}
      className="product-art"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lensLight} />
          <stop offset="55%" stopColor={cw.lensColor} />
          <stop offset="100%" stopColor={lensDark} />
        </linearGradient>
        <radialGradient id={`hl-${uid}`} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          {lens(LX, false)}
          {lens(RX, true)}
        </clipPath>
      </defs>

      {/* backdrop */}
      <rect width="480" height="360" fill={bg} />
      <rect width="480" height="360" fill={`url(#hl-${uid})`} />
      <circle cx="240" cy="180" r="128" fill={bgDeep} opacity="0.55" />
      <circle cx="240" cy="180" r="128" fill="none" stroke="#fff" strokeOpacity="0.5" />

      {/* ground shadow */}
      <ellipse cx="240" cy="272" rx="150" ry="14" fill={bgDeep} opacity="0.8" />

      {/* lenses */}
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(${LX} ${CY})`} fill={`url(#${grad})`}>
          {shape}
        </g>
        <g transform={`translate(${RX} ${CY}) scale(-1 1)`} fill={`url(#${grad})`}>
          {shape}
        </g>
        {glare(LX)}
        {glare(RX)}
      </g>

      {/* frame rims */}
      <g
        transform={`translate(${LX} ${CY})`}
        fill="none"
        stroke={frame}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      >
        {shape}
      </g>
      <g
        transform={`translate(${RX} ${CY}) scale(-1 1)`}
        fill="none"
        stroke={frame}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      >
        {shape}
      </g>

      {/* bridge */}
      <path
        d={`M ${LX + 74} ${CY - 22} Q 240 ${CY - 44} ${RX - 74} ${CY - 22}`}
        fill="none"
        stroke={frame}
        strokeWidth={strokeW - 2}
        strokeLinecap="round"
      />
      {product.silhouette === "aviator" && (
        <path
          d={`M ${LX + 70} ${CY - 34} Q 240 ${CY - 58} ${RX - 70} ${CY - 34}`}
          fill="none"
          stroke={frame}
          strokeWidth={strokeW - 3}
          strokeLinecap="round"
        />
      )}

      {/* temples */}
      <path
        d={`M ${LX - 74} ${CY - 28} L ${LX - 96} ${CY - 40}`}
        stroke={frame}
        strokeWidth={strokeW - 1}
        strokeLinecap="round"
      />
      <path
        d={`M ${RX + 74} ${CY - 28} L ${RX + 96} ${CY - 40}`}
        stroke={frame}
        strokeWidth={strokeW - 1}
        strokeLinecap="round"
      />
      <circle cx={LX - 72} cy={CY - 28} r="4" fill={shade(frame, 0.35)} />
      <circle cx={RX + 72} cy={CY - 28} r="4" fill={shade(frame, 0.35)} />
    </svg>
  );
}
