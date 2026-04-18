export default function PlaceholderPage({ title, hint, eyebrow = "Coming soon" }) {
  return (
    <main className="app-page">
      <article className="panel placeholder-panel">
        <p className="eyebrow eyebrow--teal">{eyebrow}</p>
        <h1 className="app-page__title">{title}</h1>
        <p className="app-page__lead" style={{ marginBottom: 0 }}>
          {hint ??
            "This section is wired in the app shell. Replace this placeholder with the full feature when you are ready."}
        </p>
      </article>
    </main>
  );
}
