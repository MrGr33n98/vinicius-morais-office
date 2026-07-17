export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SHOULD_SKIP_BUILD_FETCH =
  process.env.NODE_ENV === "production" &&
  process.env.npm_lifecycle_event === "build" &&
  process.env.NEXT_PUBLIC_BUILD_FETCH !== "true";

export function normalizeCollection(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchPublicJson(path, options = {}) {
  if (SHOULD_SKIP_BUILD_FETCH) return null;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Falha ao carregar ${path}.`, error?.message || error);
    }
    return null;
  }
}
