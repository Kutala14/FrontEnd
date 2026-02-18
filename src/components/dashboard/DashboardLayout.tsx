import { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Menu as MenuIcon, 
  Calendar, 
  Star, 
  Settings,
  LogOut,
  X,
  ChevronRight,
  Briefcase,
  Compass,
  Image,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../../context/ThemeProvider';

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  restaurantName: string;
  onLogout: () => void;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'restaurant', label: 'Meu Hotel', icon: Store },
  { id: 'menu', label: 'Menu', icon: MenuIcon },
  { id: 'bookings', label: 'Reservas', icon: Calendar },
  { id: 'experiences', label: 'Experiências', icon: Compass },
  { id: 'services', label: 'Serviços', icon: Briefcase },
  { id: 'gallery', label: 'Galeria', icon: Image },
  { id: 'reviews', label: 'Avaliações', icon: Star },
];

export function DashboardLayout({ 
  children, 
  activeSection, 
  onSectionChange, 
  restaurantName,
  onLogout 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TK</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 truncate">Tukula</h2>
              <p className="text-xs text-gray-500 truncate">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl">
            <Store className="size-5 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Hotel</p>
              <p className="font-semibold text-sm text-gray-900 truncate">{restaurantName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="size-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="size-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors mb-2"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            <span className="font-medium">{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="size-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TK</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Tukula</h2>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Restaurant Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl">
                <Store className="size-5 text-red-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Hotel</p>
                  <p className="font-semibold text-sm text-gray-900 truncate">{restaurantName}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="size-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MenuIcon className="size-6" />
          </button>
          <h1 className="font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
