export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
