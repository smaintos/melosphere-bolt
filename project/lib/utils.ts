import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour obtenir l'URL complète d'une image, incluant l'URL du serveur si nécessaire
export function getFullImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://87.106.162.205:5001';
  return `${apiUrl}${imageUrl}`;
}
