import { useEffect, useRef, useState } from 'react';
import { Home, Compass, Star, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  currentPath: string;
}


export function Navigation({ currentPath }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const lastDirection = useRef<'up' | 'down' | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 24) {
        if (!isVisible) setIsVisible(true);
        lastDirection.current = null;
      } else if (currentScrollY > lastScrollY.current) {
        if (lastDirection.current !== 'down') {
          setIsVisible(false);
          lastDirection.current = 'down';
        }
      } else if (currentScrollY < lastScrollY.current) {
        if (lastDirection.current !== 'up') {
          setIsVisible(true);
          lastDirection.current = 'up';
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isVisible]);

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explore', label: 'Explorar', icon: Compass },
    { path: '/restaurants', label: 'Hotéis', icon: UtensilsCrossed },
    { path: '/experiences', label: 'Experiências', icon: Star },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom notranslate transition-transform duration-400 ease-in-out z-50 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ boxShadow: '0 0 24px 0 rgba(0,0,0,0.08)' }}
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