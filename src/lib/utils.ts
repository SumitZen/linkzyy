/**
 * Returns a contrasting text color (white or black) based on a background hex color.
 */
export function getContrastingColor(hex: string | undefined): string {
    if (!hex || !hex.startsWith('#')) return 'rgba(255,255,255,0.95)'; // Default to white
    
    // Remove # if present
    const color = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Check if components are valid numbers
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(255,255,255,0.95)';
    
    // Calculation from https://www.w3.org/TR/WCAG20/#relativeluminancedef
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 140 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
}
