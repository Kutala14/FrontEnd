import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSession } from '../../context/SessionProvider';

interface DashboardOverviewProps {
  restaurantId: number;
}

interface Stats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalRevenue: number;
  avgRating: number;
  totalReviews: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export function DashboardOverview({ restaurantId }: DashboardOverviewProps) {
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    totalRevenue: 0,
    avgRating: 4.5,
    totalReviews: 0,
    pendingBookings: 0,
    confirmedBookings: 0
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const { fetchWithAuth } = useSession();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadDashboardData();
  }, [restaurantId]);

  const loadDashboardData = async () => {
    const reservationsEndpoint = apiUrl
      ? `${apiUrl}/reservations/restaurant/${restaurantId}`
      : `/api/reservations/restaurant/${restaurantId}`;
    const reviewsEndpoint = apiUrl
      ? `${apiUrl}/reviews/?restaurant_id=${restaurantId}`
      : `/api/reviews/?restaurant_id=${restaurantId}`;

    const [reservationsResponse, reviewsResponse] = await Promise.all([
      fetchWithAuth(reservationsEndpoint),
      fetch(reviewsEndpoint),
    ]);

    const restaurantBookings = reservationsResponse.ok ? await reservationsResponse.json() : [];
    const restaurantReviews = reviewsResponse.ok ? await reviewsResponse.json() : [];

    // Calcular estatísticas
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayBookings = restaurantBookings.filter((b: any) => b.reservation_date === today).length;
    const weekBookings = restaurantBookings.filter((b: any) => 
      new Date(b.created_at) >= weekAgo
    ).length;
    const monthBookings = restaurantBookings.filter((b: any) => 
      new Date(b.created_at) >= monthAgo
    ).length;

    const confirmedBookings = restaurantBookings.filter((b: any) => b.status === 'confirmed').length;
    const pendingBookings = restaurantBookings.filter((b: any) => b.status === 'pending').length;

    // Calcular receita estimada (assumindo 50 USD por pessoa)
    const totalRevenue = confirmedBookings * 50;

    const avgRating = restaurantReviews.length > 0
      ? restaurantReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / restaurantReviews.length
      : 4.5;

    setStats({
      todayBookings,
      weekBookings,
      monthBookings,
      totalRevenue,
      avgRating,
      totalReviews: restaurantReviews.length,
      pendingBookings,
      confirmedBookings
    });

    // Reservas recentes
    const recent = restaurantBookings
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setRecentBookings(recent);

  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu hotel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Bookings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="size-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Hoje
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.todayBookings}</h3>
          <p className="text-sm text-gray-600">Reservas de hoje</p>
        </div>

        {/* Week Bookings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <TrendingUp className="size-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              7 dias
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.weekBookings}</h3>
          <p className="text-sm text-gray-600">Reservas esta semana</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <DollarSign className="size-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              30 dias
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-gray-600">Receita estimada</p>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Star className="size-6 text-yellow-600" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              {stats.totalReviews} avaliações
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avgRating.toFixed(1)}</h3>
          <p className="text-sm text-gray-600">Avaliação média</p>
        </div>
      </div>

      {/* Booking Status */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Estado das Reservas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-900">Pendentes</p>
                  <p className="text-sm text-gray-600">Aguardam confirmação</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-5 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Confirmadas</p>
                  <p className="text-sm text-gray-600">Este mês</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Total do Mês</p>
                  <p className="text-sm text-gray-600">Últimos 30 dias</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.monthBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-lg mb-4">Reservas Recentes</h3>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma reserva ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-500 rounded-xl text-white font-bold">
                    {booking.people_count}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="size-3" />
                      <span>{booking.reservation_date}</span>
                      <Clock className="size-3 ml-2" />
                      <span>{booking.reservation_time || '-'}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'pending' ? 'Pendente' : 'Cancelada'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
