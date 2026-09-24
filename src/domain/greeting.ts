const MAX_NAME_LENGTH = 40;

export function buildGreeting(name: string): string {
  const cleaned = name.trim().slice(0, MAX_NAME_LENGTH);
  return cleaned ? `Hoş geldin ${cleaned}` : 'Hoş geldin';
}
