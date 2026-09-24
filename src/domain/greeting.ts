const MAX_NAME_LENGTH = 40;

export interface Greeting {
  lead: string;
  /** Boşsa yalnızca `lead` gösterilir. */
  name: string;
}

export function buildGreeting(name: string): Greeting {
  return { lead: 'Hoş geldin', name: name.trim().slice(0, MAX_NAME_LENGTH) };
}
