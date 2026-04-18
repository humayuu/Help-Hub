export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="mx-hero" aria-labelledby="mx-hero-title">
      <p className="mx-hero__eyebrow">{eyebrow}</p>
      <h1 id="mx-hero-title" className="mx-hero__title">
        {title}
      </h1>
      {subtitle ? <p className="mx-hero__lead">{subtitle}</p> : null}
    </section>
  );
}
