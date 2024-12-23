// Converts a string to a URL-friendly slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Ensures a slug is unique by appending a number if necessary
export async function ensureUniqueSlug(
  baseSlug: string,
  productId: string | null | undefined,
  supabase: any
): Promise<string> {
  let slug = baseSlug;
  let counter = 0;
  
  while (true) {
    let query = supabase
      .from('products')
      .select('id')
      .eq('slug', slug);
    
    // Only add the neq filter if we have a valid product ID
    if (productId) {
      query = query.neq('id', productId);
    }
    
    const { data, error } = await query.maybeSingle();
      
    if (error) throw error;
    if (!data) break; // Slug is unique
    
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}