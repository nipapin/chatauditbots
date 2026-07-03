const STEPS = [
  {
    title: "Скопируйте код виджета",
    text: "Нажмите «Скопировать код» в блоке выше — это готовый фрагмент для вставки на сайт.",
  },
  {
    title: "Вставьте перед закрывающим тегом </body>",
    text: "На каждой странице сайта, где должен появляться чат, добавьте код в HTML-шаблон.",
  },
  {
    title: "Если сайт на конструкторе",
    text: "В Tilda: Настройки сайта → Ещё → Вставка кода в HTML. В WordPress: через плагин «Insert Headers and Footers» или в footer.php темы.",
  },
  {
    title: "Проверьте подключение",
    text: "После публикации сайта нажмите «Проверить установку» ниже — мы убедимся, что виджет отвечает.",
  },
];

export function InstallInstructions() {
  return (
    <ol style={{ display: "flex", flexDirection: "column", gap: 14, paddingLeft: 0, listStyle: "none" }}>
      {STEPS.map((step, i) => (
        <li key={step.title} style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--dash-bg-subtle)",
              color: "var(--dash-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{step.title}</div>
            <div style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 2, lineHeight: 1.5 }}>
              {step.text}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
