import { useEffect, useState } from 'react';
import { Home } from './components/Home';
import { Explore } from './components/Explore';
import { DestinationDetail } from './components/DestinationDetail';
import { Experiences } from './components/Experiences';
import { Restaurants } from './components/Restaurants';
import { RestaurantBooking } from './components/RestaurantBooking';
import { RestaurantReview } from './components/RestaurantReview';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { RestaurantDashboardComplete } from './components/RestaurantDashboardComplete';
import { Navigation } from './components/Navigation';
import { User, LogOut, Bell } from 'lucide-react';
import { useSession } from './context/SessionProvider';

export type Page = 'home' | 'explore' | 'destination' | 'experiences' | 'restaurants' | 'restaurant-booking' | 'restaurant-review' | 'login' | 'register' | 'dashboard';

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  category: string;
  highlights: string[];
  activities: string[];
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  openHours: string;
  phone: string;
  specialties: string[];
}


export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user: userSession, status: sessionStatus, logout: sessionLogout, fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'destination') {
      setSelectedDestination(null);
    }
    if (page !== 'restaurant-booking' && page !== 'restaurant-review') {
      setSelectedRestaurant(null);
    }
  };

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentPage('destination');
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurant-booking');
  };

  const handleLogout = async () => {
    await sessionLogout();
    setCurrentPage('home');
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    if (userSession) {
      setShowUserMenu(!showUserMenu);
    } else {
      setCurrentPage('login');
    }
  };

  const loadNotifications = async () => {
    if (!userSession) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const endpoint = apiUrl ? `${apiUrl}/notifications/` : '/api/notifications/';
      const response = await fetchWithAuth(endpoint);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setNotifications(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.unread_count || 0));
    } catch {
      // ignore silently
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const endpoint = apiUrl
        ? `${apiUrl}/notifications/${notificationId}/read`
        : `/api/notifications/${notificationId}/read`;
      await fetchWithAuth(endpoint, { method: 'PUT' });
      await loadNotifications();
    } catch {
      // ignore silently
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const endpoint = apiUrl ? `${apiUrl}/notifications/read-all` : '/api/notifications/read-all';
      await fetchWithAuth(endpoint, { method: 'PUT' });
      await loadNotifications();
    } catch {
      // ignore silently
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userSession, apiUrl]);

  useEffect(() => {
    if (!userSession) return;
    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, [userSession, apiUrl]);

  // Dashboard tem seu próprio layout
  if (currentPage === 'dashboard' && userSession?.type === 'restaurant' && userSession.restaurantId) {
    return (
      <div className="size-full">
        <RestaurantDashboardComplete 
          restaurantId={userSession.restaurantId}
          restaurantName={userSession.name}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" aria-label="A carregar sessão" />
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">TK</span>
          </div>
          <h1 className="font-semibold text-lg">Tukula</h1>
        </div>
        
        {/* User Menu */}
        <div className="relative flex items-center gap-2">
          {userSession && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="size-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-semibold text-gray-900">Notificações</p>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Marcar todas
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-500">Sem notificações</p>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => markNotificationAsRead(item.id)}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            item.is_read ? 'bg-white' : 'bg-red-50/40'
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {item.created_at ? new Date(item.created_at).toLocaleString('pt-PT') : ''}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setShowNotifications(false);
              handleProfileClick();
            }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="size-5 text-gray-600" />
            {userSession && (
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {userSession.name}
              </span>
            )}
          </button>
          
          {/* Dropdown Menu */}
          {showUserMenu && userSession && (
            <div className="absolute right-0 top-4 mt-8 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{userSession.name}</p>
                <p className="text-sm text-gray-500">{userSession.email}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  userSession.type === 'restaurant' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {userSession.type === 'restaurant' ? 'Restaurante' : 'Utilizador'}
                </span>
              </div>
              
              {userSession.type === 'restaurant' && (
                <button
                  onClick={() => {
                    setCurrentPage('dashboard');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Dashboard de Reservas
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="size-4" />
                Terminar Sessão
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {currentPage === 'home' && <Home onNavigate={handleNavigate} onSelectDestination={handleSelectDestination} />}
        {currentPage === 'explore' && <Explore onSelectDestination={handleSelectDestination} />}
        {currentPage === 'destination' && selectedDestination && (
          <DestinationDetail destination={selectedDestination} onBack={() => handleNavigate('explore')} />
        )}
        {currentPage === 'experiences' && <Experiences />}
        {currentPage === 'restaurants' && <Restaurants onSelectRestaurant={handleSelectRestaurant} />}
        {currentPage === 'restaurant-booking' && selectedRestaurant && (
          <RestaurantBooking 
            restaurant={selectedRestaurant} 
            onBack={() => handleNavigate('restaurants')} 
            onReview={() => setCurrentPage('restaurant-review')}
            userSession={userSession}
            onRequireAuth={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'restaurant-review' && selectedRestaurant && (
          <RestaurantReview 
            restaurant={selectedRestaurant} 
            onBack={() => handleNavigate('restaurant-booking')} 
            onGoHome={() => handleNavigate('home')}
            userSession={userSession}
            onRequireAuth={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'login' && (
          <Login 
            onBack={() => handleNavigate('home')} 
            onSwitchToRegister={() => setCurrentPage('register')}
            onSuccess={() => {
              setCurrentPage('home');
              setShowUserMenu(false);
            }}
          />
        )}
        {currentPage === 'register' && (
          <Register 
            onBack={() => handleNavigate('home')} 
            onSwitchToLogin={() => setCurrentPage('login')}
            onSuccess={() => setCurrentPage('login')}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}