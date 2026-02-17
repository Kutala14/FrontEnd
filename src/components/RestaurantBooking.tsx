import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Calendar, Users, User, Mail, MessageSquare, Check, PenSquare, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Restaurant } from '../App';
import { UserSession } from '../types/session';
import { useSession } from '../context/SessionProvider';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantBookingProps {
  restaurant: Restaurant;
  onBack: () => void;
  onReview: () => void;
  userSession: UserSession | null;
  onRequireAuth: () => void;
}

interface MenuCategory {
  id: number;
  name: string;
}

interface MenuItem {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
}

interface RestaurantService {
  id: number;
  type: 'hosting' | 'events' | 'catering';
  name: string;
  description: string | null;
  price: number;
  price_unit: string;
  is_available: boolean;
  features: string[];
}

export function RestaurantBooking({ restaurant, onBack, onReview, userSession, onRequireAuth }: RestaurantBookingProps) {
  const { fetchWithAuth } = useSession();
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: '2',
    phone: '',
    specialRequests: '',
  });
  const [isBooked, setIsBooked] = useState(false);
  const [bookingUser, setBookingUser] = useState<{ name: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [services, setServices] = useState<RestaurantService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError('');

      try {
        const endpoint = apiUrl
          ? `${apiUrl}/restaurants/${restaurant.id}/menu`
          : `/api/restaurants/${restaurant.id}/menu`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Erro ao carregar menu');
        }

        const data = await response.json();
        setMenuCategories(Array.isArray(data.categories) ? data.categories : []);
        setMenuItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        setMenuError('Não foi possível carregar o menu deste restaurante.');
      } finally {
        setMenuLoading(false);
      }
    };

    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError('');

      try {
        const endpoint = apiUrl
          ? `${apiUrl}/restaurants/${restaurant.id}/services`
          : `/api/restaurants/${restaurant.id}/services`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Erro ao carregar serviços');
        }

        const data = await response.json();
        setServices(Array.isArray(data.items) ? data.items : []);
      } catch {
        setServicesError('Não foi possível carregar os serviços deste restaurante.');
      } finally {
        setServicesLoading(false);
      }
    };

    loadMenu();
    loadServices();
  }, [apiUrl, restaurant.id]);

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userSession) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = apiUrl ? `${apiUrl}/reservations/` : '/api/reservations/';

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          reservation_date: bookingData.date,
          reservation_time: bookingData.time,
          people_count: parseInt(bookingData.guests, 10),
          notes: `Telefone: ${bookingData.phone}\n${bookingData.specialRequests}`.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Não foi possível criar a reserva');
      }

      setBookingUser({ name: userSession.name, email: userSession.email });
      setIsBooked(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao criar reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoginRequired = () => (
    <div className="px-4 py-10 text-center space-y-4">
      <h2 className="text-2xl font-bold">Entre na sua conta</h2>
      <p className="text-gray-600">
        É necessário iniciar sessão para reservar uma mesa ou avaliar um restaurante.
      </p>
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <button
          onClick={onRequireAuth}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Entrar ou criar conta
        </button>
        <button
          onClick={onBack}
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Voltar aos restaurantes
        </button>
      </div>
    </div>
  );

  if (isBooked) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <div className="bg-green-50 rounded-full p-6 mb-6">
          <Check className="size-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Reserva Confirmada!</h2>
        <p className="text-gray-600 text-center mb-6">
          A sua reserva foi enviada para {restaurant.name}. Receberá uma confirmação em breve.
        </p>

        <div className="w-full max-w-md bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Restaurante:</span>
            <span className="font-medium">{restaurant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">{new Date(bookingData.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hora:</span>
            <span className="font-medium">{bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pessoas:</span>
            <span className="font-medium">{bookingData.guests} {bookingData.guests === '1' ? 'pessoa' : 'pessoas'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cliente:</span>
            <span className="font-medium">{(bookingUser ?? userSession)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{(bookingUser ?? userSession)?.email}</span>
          </div>
          {bookingData.phone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone:</span>
              <span className="font-medium">{bookingData.phone}</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-md flex flex-col gap-3">
          <button
            onClick={onBack}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Voltar aos Restaurantes
          </button>
          <button
            onClick={onReview}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <PenSquare className="size-5" />
            Avaliar este Restaurante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <div className="relative h-56">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-2xl font-bold mb-1">{restaurant.name}</h1>
          <div className="flex items-center gap-3 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-white" />
              <span>{restaurant.rating}</span>
            </div>
            <span>•</span>
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="size-4" />
            <span>{restaurant.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Clock className="size-4" />
            <span>{restaurant.openHours}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Phone className="size-4" />
            <span>{restaurant.phone}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-yellow-500 text-white flex flex-col gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide font-semibold text-white/80">Partilhe a sua experiência</p>
            <p className="text-lg font-bold leading-tight">Já conhece o {restaurant.name}? Conte-nos como foi.</p>
          </div>
          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Escrever uma Avaliação
          </button>
        </div>
      </div>

      <div className="px-4 py-6 border-b border-gray-100 space-y-4">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-left">Menu</h2>
          {isMenuOpen ? <ChevronUp className="size-5 text-gray-600" /> : <ChevronDown className="size-5 text-gray-600" />}
        </button>

        {isMenuOpen && (
          <>
            {menuLoading && <p className="text-sm text-gray-600">A carregar menu...</p>}

            {!menuLoading && menuError && <p className="text-sm text-red-600">{menuError}</p>}

            {!menuLoading && !menuError && menuItems.length === 0 && (
              <p className="text-sm text-gray-600">Este restaurante ainda não publicou itens no menu.</p>
            )}

            {!menuLoading && !menuError && menuCategories.map((category) => {
              const items = menuItems.filter((item) => item.category_id === category.id);
              if (items.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-3 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-red-600">${Number(item.price).toFixed(2)}</p>
                            {!item.is_available && <p className="text-xs text-gray-500">Indisponível</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="px-4 py-6 border-b border-gray-100 space-y-4">
        <button
          type="button"
          onClick={() => setIsServicesOpen(!isServicesOpen)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-left">Serviços</h2>
          {isServicesOpen ? <ChevronUp className="size-5 text-gray-600" /> : <ChevronDown className="size-5 text-gray-600" />}
        </button>

        {isServicesOpen && (
          <>
            {servicesLoading && <p className="text-sm text-gray-600">A carregar serviços...</p>}

            {!servicesLoading && servicesError && <p className="text-sm text-red-600">{servicesError}</p>}

            {!servicesLoading && !servicesError && services.length === 0 && (
              <p className="text-sm text-gray-600">Este restaurante ainda não publicou serviços adicionais.</p>
            )}

            {!servicesLoading && !servicesError && services.length > 0 && (
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4 text-gray-500" />
                          <p className="font-semibold text-gray-900">{service.name}</p>
                        </div>
                        {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                        {service.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {service.features.map((feature, index) => (
                              <span key={`${service.id}-${index}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-red-600">${Number(service.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">/{service.price_unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-6 space-y-4">
        <button
          type="button"
          onClick={() => setIsReservationOpen(!isReservationOpen)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-xl font-bold text-left">Fazer Reserva</h2>
          {isReservationOpen ? <ChevronUp className="size-5 text-gray-600" /> : <ChevronDown className="size-5 text-gray-600" />}
        </button>

        {isReservationOpen && (
          <>
            {!userSession && renderLoginRequired()}

            {userSession && (
              <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="size-4 inline mr-2" />
                Data
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="size-4 inline mr-2" />
                Hora
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setBookingData({ ...bookingData, time })}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      bookingData.time === time ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="size-4 inline mr-2" />
                Número de Pessoas
              </label>
              <select
                required
                value={bookingData.guests}
                onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'pessoa' : 'pessoas'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="font-semibold">Contacto</h3>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="size-4" />
                <span className="font-medium">{userSession.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="size-4" />
                <span className="text-sm text-gray-600">{userSession.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Phone className="size-4 inline mr-2" />
                Telefone para contacto
              </label>
              <input
                type="tel"
                required
                value={bookingData.phone}
                onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                placeholder="+244 9XX XXX XXX"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <MessageSquare className="size-4 inline mr-2" />
                Pedidos Especiais (opcional)
              </label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                placeholder="Alergias, preferências alimentares, ocasião especial..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={!bookingData.date || !bookingData.time || isSubmitting}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'A confirmar...' : 'Confirmar Reserva'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Ao confirmar, você concorda em compartilhar suas informações com o restaurante.
          </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
