import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home } from './components/Home';
import { Explore } from './components/Explore';
import { DestinationDetail } from './components/DestinationDetail';
import { Experiences } from './components/Experiences';
import { Restaurants } from './components/Restaurants';
import { SearchPage } from './components/SearchPage';
import { RestaurantBooking } from './components/RestaurantBooking';
import { RestaurantReview } from './components/RestaurantReview';
import { RestaurantReviewsPage } from './components/RestaurantReviewsPage';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { RestaurantDashboardComplete } from './components/RestaurantDashboardComplete';
import { Navigation } from './components/Navigation';
import { User, LogOut, Bell, Moon, Sun } from 'lucide-react';
import { useSession } from './context/SessionProvider';
import { useTheme } from './context/ThemeProvider';
import { UserSession } from './types/session';

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

interface ExploreSpot {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url?: string | null;
  category: string;
  rating?: number;
  highlights?: string[];
  activities?: string[];
}

const defaultDestinationImage =
  'https://images.unsplash.com/photo-1562859422-29f5c0f4b24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

const categoryFallbackImages: Record<string, string> = {
  Praia: 'https://images.unsplash.com/photo-1658872739589-0691c8039617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Natureza: 'https://images.unsplash.com/photo-1636380778575-34508e634145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Cultura: 'https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Aventura: 'https://images.unsplash.com/photo-1612222780225-04d3384823fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'Vida Selvagem': 'https://images.unsplash.com/photo-1729359035276-189519a4b072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  Cidade: defaultDestinationImage,
};

const normalizeCategory = (value: string | null | undefined) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Cultura';
  if (normalized === 'cidade') return 'Cidade';
  if (normalized === 'natureza') return 'Natureza';
  if (normalized === 'aventura') return 'Aventura';
  if (normalized === 'praia') return 'Praia';
  if (normalized === 'vida selvagem' || normalized === 'vidaselvagem') return 'Vida Selvagem';
  if (normalized === 'cultura') return 'Cultura';
  return String(value || '').trim();
};

const resolveExploreImage = (imageUrl: string | null | undefined, category: string) => {
  const normalizedCategory = normalizeCategory(category);
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return categoryFallbackImages[normalizedCategory] || defaultDestinationImage;
};

const mapExploreSpotToDestination = (spot: ExploreSpot): Destination => ({
  id: 100000 + Number(spot.id),
  name: spot.name,
  location: spot.location,
  description: spot.description,
  image: resolveExploreImage(spot.image_url, spot.category || ''),
  rating: Number(spot.rating || 0),
  category: normalizeCategory(spot.category),
  highlights: Array.isArray(spot.highlights) && spot.highlights.length > 0 ? spot.highlights : ['Local da comunidade'],
  activities: Array.isArray(spot.activities) && spot.activities.length > 0 ? spot.activities : ['Explorar'],
});

const mapRestaurantPayload = (payload: any): Restaurant => ({
  id: Number(payload.id),
  name: payload.name || '',
  cuisine: payload.cuisine || 'Sem categoria',
  description: payload.description || '',
  image: payload.image || payload.image_url || defaultDestinationImage,
  rating: Number(payload.rating || 0),
  reviews: Number(payload.reviews ?? payload.reviews_count ?? 0),
  priceRange: payload.priceRange || payload.price_range || '$$',
  location: payload.location || 'Não informado',
  openHours: payload.openHours || payload.open_hours || '-',
  phone: payload.phone || '-',
  specialties: Array.isArray(payload.specialties) ? payload.specialties : [],
});

function DestinationRoutePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const stateDestination = (location.state as { destination?: Destination } | null)?.destination;
  const [destination, setDestination] = useState<Destination | null>(stateDestination || null);
  const [isLoading, setIsLoading] = useState(!stateDestination);

  useEffect(() => {
    const routeId = Number(id || 0);
    if (!routeId || Number.isNaN(routeId)) {
      setDestination(null);
      setIsLoading(false);
      return;
    }

    if (stateDestination && stateDestination.id === routeId) {
      setDestination(stateDestination);
      setIsLoading(false);
      return;
    }

    const spotId = routeId >= 100000 ? routeId - 100000 : routeId;

    const loadDestination = async () => {
      setIsLoading(true);
      try {
        const endpoint = apiUrl ? `${apiUrl}/explore/${spotId}` : `/api/explore/${spotId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          setDestination(null);
          return;
        }

        const payload = await response.json();
        setDestination(mapExploreSpotToDestination(payload));
      } catch {
        setDestination(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDestination();
  }, [apiUrl, id, stateDestination]);

  if (isLoading) {
    return <div className="p-6 text-gray-600">A carregar destino...</div>;
  }

  if (!destination) {
    return <Navigate to="/explore" replace />;
  }

  return <DestinationDetail destination={destination} onBack={() => navigate('/explore')} />;
}

function RestaurantBookingRoute({ userSession }: { userSession: UserSession | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const stateRestaurant = (location.state as { restaurant?: Restaurant } | null)?.restaurant;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(stateRestaurant || null);
  const [isLoading, setIsLoading] = useState(!stateRestaurant);

  useEffect(() => {
    const restaurantId = Number(id || 0);
    if (!restaurantId || Number.isNaN(restaurantId)) {
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    if (stateRestaurant && Number(stateRestaurant.id) === restaurantId) {
      setRestaurant(stateRestaurant);
      setIsLoading(false);
      return;
    }

    const loadRestaurant = async () => {
      setIsLoading(true);
      try {
        const endpoint = apiUrl ? `${apiUrl}/restaurants/${restaurantId}` : `/api/restaurants/${restaurantId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          setRestaurant(null);
          return;
        }

        const payload = await response.json();
        setRestaurant(mapRestaurantPayload(payload));
      } catch {
        setRestaurant(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurant();
  }, [apiUrl, id, stateRestaurant]);

  if (isLoading) {
    return <div className="p-6 text-gray-600">A carregar restaurante...</div>;
  }

  if (!restaurant) {
    return <Navigate to="/restaurants" replace />;
  }

  return (
    <RestaurantBooking
      restaurant={restaurant}
      onBack={() => navigate('/restaurants')}
      onReview={() => navigate(`/restaurants/${restaurant.id}/review`, { state: { restaurant } })}
      userSession={userSession}
      onRequireAuth={() => navigate('/login')}
    />
  );
}

function RestaurantReviewRoute({ userSession }: { userSession: UserSession | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const stateRestaurant = (location.state as { restaurant?: Restaurant } | null)?.restaurant;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(stateRestaurant || null);
  const [isLoading, setIsLoading] = useState(!stateRestaurant);

  useEffect(() => {
    const restaurantId = Number(id || 0);
    if (!restaurantId || Number.isNaN(restaurantId)) {
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    if (stateRestaurant && Number(stateRestaurant.id) === restaurantId) {
      setRestaurant(stateRestaurant);
      setIsLoading(false);
      return;
    }

    const loadRestaurant = async () => {
      setIsLoading(true);
      try {
        const endpoint = apiUrl ? `${apiUrl}/restaurants/${restaurantId}` : `/api/restaurants/${restaurantId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          setRestaurant(null);
          return;
        }

        const payload = await response.json();
        setRestaurant(mapRestaurantPayload(payload));
      } catch {
        setRestaurant(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurant();
  }, [apiUrl, id, stateRestaurant]);

  if (isLoading) {
    return <div className="p-6 text-gray-600">A carregar restaurante...</div>;
  }

  if (!restaurant) {
    return <Navigate to="/restaurants" replace />;
  }

  return (
    <RestaurantReview
      restaurant={restaurant}
      onBack={() => navigate(`/restaurants/${restaurant.id}/booking`, { state: { restaurant } })}
      onGoHome={() => navigate('/')}
      userSession={userSession}
      onRequireAuth={() => navigate('/login')}
    />
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

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
  const { theme, toggleTheme } = useTheme();
  const apiUrl = import.meta.env.VITE_API_URL;

  const isRestaurantUser = userSession?.type === 'restaurant' && userSession.restaurantId;

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (isRestaurantUser && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!isRestaurantUser && location.pathname === '/dashboard') {
      navigate('/', { replace: true });
    }
  }, [sessionStatus, isRestaurantUser, location.pathname, navigate]);

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

  const handleLogout = async () => {
    await sessionLogout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    if (userSession) {
      setShowUserMenu((previous) => !previous);
    } else {
      navigate('/login');
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

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" aria-label="A carregar sessão" />
      </div>
    );
  }

  if (isRestaurantUser) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <div className="size-full">
              <RestaurantDashboardComplete
                restaurantId={userSession.restaurantId!}
                restaurantName={userSession.name}
                onLogout={handleLogout}
              />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">TK</span>
          </div>
          <h1 className="font-semibold text-lg">Tukula</h1>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          >
            {theme === 'dark' ? <Sun className="size-5 text-gray-600" /> : <Moon className="size-5 text-gray-600" />}
          </button>

          {userSession && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((previous) => !previous);
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
                    <button onClick={markAllNotificationsAsRead} className="text-xs text-red-600 hover:text-red-700">
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
            {userSession && <span className="text-sm font-medium text-gray-700 hidden sm:inline">{userSession.name}</span>}
          </button>

          {showUserMenu && userSession && (
            <div className="absolute right-0 top-4 mt-8 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{userSession.name}</p>
                <p className="text-sm text-gray-500">{userSession.email}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    userSession.type === 'restaurant' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {userSession.type === 'restaurant' ? 'Restaurante' : 'Utilizador'}
                </span>
              </div>

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

      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onNavigate={(path) => navigate(path)}
                onSelectDestination={(destination) =>
                  navigate(`/destination/${destination.id}`, { state: { destination } })
                }
                onOpenSearch={(query) => navigate('/search', { state: { query } })}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                initialQuery={(location.state as { query?: string } | null)?.query || ''}
                onSelectDestination={(destination) =>
                  navigate(`/destination/${destination.id}`, { state: { destination } })
                }
                onSelectRestaurant={(restaurant) =>
                  navigate(`/restaurants/${restaurant.id}/booking`, { state: { restaurant } })
                }
                onOpenExperiences={() => navigate('/experiences')}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <Explore
                onSelectDestination={(destination) =>
                  navigate(`/destination/${destination.id}`, { state: { destination } })
                }
              />
            }
          />
          <Route path="/destination/:id" element={<DestinationRoutePage />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route
            path="/restaurants"
            element={
              <Restaurants
                onSelectRestaurant={(restaurant) =>
                  navigate(`/restaurants/${restaurant.id}/booking`, { state: { restaurant } })
                }
              />
            }
          />
          <Route path="/restaurants/:id/booking" element={<RestaurantBookingRoute userSession={userSession} />} />
          <Route path="/restaurants/:id/reviews" element={<RestaurantReviewsPage />} />
          <Route path="/restaurants/:id/review" element={<RestaurantReviewRoute userSession={userSession} />} />
          <Route
            path="/login"
            element={
              <Login
                onBack={() => navigate('/')}
                onSwitchToRegister={() => navigate('/register')}
                onSuccess={() => {
                  setShowUserMenu(false);
                  navigate('/');
                }}
              />
            }
          />
          <Route
            path="/register"
            element={<Register onBack={() => navigate('/')} onSwitchToLogin={() => navigate('/login')} onSuccess={() => navigate('/login')} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Navigation currentPath={location.pathname} />
    </div>
  );
}
