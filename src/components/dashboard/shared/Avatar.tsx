export function Avatar({
  name,
  size = 36,
  imageUrl,
}: {
  name: string;
  size?: number;
  imageUrl?: string | null;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="dash-avatar"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
