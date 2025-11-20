/**
 * Generate a URL-safe slug from a string
 * Converts to lowercase, removes accents, replaces spaces with hyphens
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()                          // 1. Lowercase
    .normalize('NFD')                       // 2. Normalize Unicode (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '')       // 3. Remove diacritics (accents)
    .replace(/đ/g, 'd')                    // 4. Vietnamese đ → d
    .replace(/Đ/g, 'd')                    // 4. Vietnamese Đ → d
    .replace(/[^a-z0-9\s-]/g, '')          // 5. Remove special chars (keep space & -)
    .replace(/\s+/g, '-')                  // 6. Replace spaces with hyphens
    .replace(/-+/g, '-')                   // 7. Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');              // 8. Trim leading/trailing hyphens
}

