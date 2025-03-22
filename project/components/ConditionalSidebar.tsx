// components/ConditionalSidebar.tsx

'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalSidebar() {
  const pathname = usePathname();

  // Définir les routes où la Sidebar ne doit pas être affichée
  const noSidebarRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/room'];

  // Vérifier si la route actuelle est dans la liste des routes sans Sidebar
  const shouldHideSidebar = noSidebarRoutes.some(route => pathname.startsWith(route));

  if (shouldHideSidebar) {
    return null; // Ne rien afficher
  }

  return <Sidebar />;
}
