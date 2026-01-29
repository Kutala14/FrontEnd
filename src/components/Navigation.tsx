import { Home, Compass, Star, UtensilsCrossed } from 'lucide-react';
import { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Início', icon: Home },
    { id: 'explore' as Page, label: 'Explorar', icon: Compass },
    { id: 'restaurants' as Page, label: 'Restaurantes', icon: UtensilsCrossed },
    { id: 'experiences' as Page, label: 'Experiências', icon: Star },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (currentPage === 'destination' && item.id === 'explore');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                isActive ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`size-6 ${isActive ? 'fill-red-600' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}