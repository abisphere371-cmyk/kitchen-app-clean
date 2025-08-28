// API-only shim so any previous imports still compile.
// Forces the app to use your REST API paths instead of Supabase.

export const supabase = null as any;

export const subscribeToTable = (
  _table: string,
  _callback: (payload: any) => void
) => {
  return { unsubscribe() {} };
};

export class DatabaseService {
  static isConnected() {
    // Always false → your code paths fall back to REST
    return false;
  }
}