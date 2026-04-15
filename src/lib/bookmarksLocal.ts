function storageKey(userId: string) {
  return `civicBookmarks:${userId}`;
}

export function getBookmarkedModuleIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function isModuleBookmarked(userId: string, moduleId: string): boolean {
  return getBookmarkedModuleIds(userId).includes(moduleId);
}

export function toggleBookmarkModule(
  userId: string,
  moduleId: string,
): boolean {
  const current = getBookmarkedModuleIds(userId);
  const has = current.includes(moduleId);
  const next = has
    ? current.filter((id) => id !== moduleId)
    : [...current, moduleId];
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return !has;
}
