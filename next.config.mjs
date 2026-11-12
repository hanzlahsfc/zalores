/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export. `npm run build` emits a plain HTML/CSS/JS site in `out/`
  // that can be uploaded to any static host (incl. Hostinger shared hosting)
  // or deployed from Git by any provider that runs `npm run build`.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
