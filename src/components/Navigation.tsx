import { Home, Compass, Star, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  currentPath: string;
}

export function Navigation({ currentPath }: NavigationProps) {
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explore', label: 'Explorar', icon: Compass },
    { path: '/restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
    { path: '/experiences', label: 'Experiências', icon: Star },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom notranslate"
      translate="no"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path
            || (currentPath === '/destination' && item.path === '/explore')
            || (currentPath.startsWith('/destination/') && item.path === '/explore')
            || (currentPath.startsWith('/restaurants/') && item.path === '/restaurants');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              translate="no"
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                isActive ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`size-6 ${isActive ? 'fill-red-600' : ''}`} />
              <span className="text-xs font-medium whitespace-nowrap notranslate" translate="no">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}