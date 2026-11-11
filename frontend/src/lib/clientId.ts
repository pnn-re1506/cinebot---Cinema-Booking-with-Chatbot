export const CLIENT_ID_STORAGE_KEY = "cb_client_id";

export function getClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_STORAGE_KEY, created);
  return created;
}
