/** `navigator`ın paylaşımla ilgili alt kümesi; testte sahte bir nesneyle değiştirilebilir. */
export interface ShareCapableNavigator {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

export const isAbortError = (error: unknown): boolean => (error as { name?: string } | null)?.name === 'AbortError';
