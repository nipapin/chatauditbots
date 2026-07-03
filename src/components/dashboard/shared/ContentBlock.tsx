export function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dash-content-block">
      <div className="dash-content-block-title">{title}</div>
      {children}
    </div>
  );
}
