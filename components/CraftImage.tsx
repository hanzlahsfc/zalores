export default function CraftImage({ sizes }: { sizes: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="craft-photo"
      src="/assets/img/campaign-craft-1200.webp"
      srcSet="/assets/img/campaign-craft-640.webp 640w, /assets/img/campaign-craft-1200.webp 1200w"
      sizes={sizes}
      alt="An eyewear maker adjusts the hinge of a gold aviator frame at a workbench."
      width={1200}
      height={800}
      loading="lazy"
      decoding="async"
    />
  );
}
