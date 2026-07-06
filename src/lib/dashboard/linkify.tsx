const LINK_PATTERN =
  /(https?:\/\/[^\s]+|www\.[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\+?\d[\d\s\-()]{8,}\d)/g;

/** Превращает ссылки, email и телефоны в тексте в кликабельные ссылки, остальной текст не трогает. */
export function linkifyText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, url, email, phone] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    if (url) {
      const href = url.startsWith("www.") ? `https://${url}` : url;
      nodes.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      );
    } else if (email) {
      nodes.push(
        <a key={key++} href={`mailto:${email}`}>
          {email}
        </a>
      );
    } else if (phone) {
      const digits = phone.replace(/[^\d+]/g, "");
      nodes.push(
        <a key={key++} href={`tel:${digits}`}>
          {phone}
        </a>
      );
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
