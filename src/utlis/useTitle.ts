import { usePathname } from 'expo-router';

/**
 * Custom hook to get the current page title based on the pathname
 * @returns The formatted title for the current page
 */
export function useTitle(): string {
  const pathname = usePathname();
  return getTitleFromPath(pathname);
}

/**
 * Utility function to get title from pathname
 * Can be used independently without hooks for static scenarios
 * @param pathname - The current pathname
 * @returns The formatted title for the given pathname
 */
export function getTitleFromPath(pathname: string): string {
  if (pathname === '/' || pathname.includes('(tabs)')) return 'DuWeeNext';
  
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  if (lastSegment?.includes('(') && lastSegment?.includes(')')) {
    return 'DuWeeNext';
  }
  
  return lastSegment
    ?.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'DuWeeNext';
}
