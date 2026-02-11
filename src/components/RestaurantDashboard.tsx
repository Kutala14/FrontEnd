import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Phone, Mail, CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface Booking {
  id: number;
  restaurantId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface RestaurantDashboardProps {
  onBack: () => void;
  restaurantId: number;
  restaurantName: string;
}

export function RestaurantDashboard({ onBack, restaurantId, restaurantName }: RestaurantDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalGuests: 0
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const bookingsData = localStorage.getItem('tukula_bookings');
    const allBookings: Booking[] = bookingsData ? JSON.parse(bookingsData) : [];
    
    // Filtrar apenas reservas deste restaurante
    const restaurantBookings = allBookings.filter(b => b.restaurantId === restaurantId);
    
    // Ordenar por data (mais recentes primeiro)
    restaurantBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setBookings(restaurantBookings);
    
    // Calcular estatísticas
    const pending = restaurantBookings.filter(b => b.status === 'pending').length;
    const confirmed = restaurantBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = restaurantBookings.filter(b => b.status === 'cancelled').length;
    const totalGuests = restaurantBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.guests, 0);
    
    setStats({
      total: restaurantBookings.length,
      pending,
      confirmed,
      cancelled,
      totalGuests
    });
  };

  const updateBookingStatus = (bookingId: number, status: 'confirmed' | 'cancelled') => {
    const bookingsData = localStorage.getItem('tukula_bookings');
    const allBookings: Booking[] = bookingsData ? JSON.parse(bookingsData) : [];
    
    const updatedBookings = allBookings.map(b => 
      b.id === bookingId ? { ...b, status } : b
    );
    
    localStorage.setItem('tukula_bookings', JSON.stringify(updatedBookings));
    loadBookings();
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="size-4" />;
      case 'cancelled':
        return <XCircle className="size-4" />;
      default:
        return <AlertCircle className="size-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
        >
          <ArrowLeft className="size-5" />
          <span>Voltar</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-1">Dashboard do Restaurante</h1>
        <p className="text-white/90">{restaurantName}</p>
      </div>

      <div className="px-4 -mt-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="size-4" />
              <span className="text-xs">Total Reservas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <AlertCircle className="size-4" />
              <span className="text-xs">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="size-4" />
              <span className="text-xs">Confirmadas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users className="size-4" />
              <span className="text-xs">Total Pessoas</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalGuests}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <h3 className="font-semibold mb-3">Filtrar Reservas</h3>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmadas ({stats.confirmed})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <Calendar className="size-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Nenhuma reserva encontrada</h3>
              <p className="text-sm text-gray-500">
                {filter === 'all' 
                  ? 'Ainda não há reservas para o seu restaurante'
                  : `Não há reservas ${filter === 'pending' ? 'pendentes' : filter === 'confirmed' ? 'confirmadas' : 'canceladas'}`
                }
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-100">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span>{getStatusLabel(booking.status)}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ID: {booking.id}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-gray-400" />
                    <span className="font-semibold">{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="size-4 text-gray-400" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="size-4 text-gray-400" />
                    <span>{booking.customerPhone}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Calendar className="size-3" />
                      <span>Data</span>
                    </div>
                    <p className="text-sm font-medium">{booking.date}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="size-3" />
                      <span>Hora</span>
                    </div>
                    <p className="text-sm font-medium">{booking.time}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Users className="size-3" />
                      <span>Pessoas</span>
                    </div>
                    <p className="text-sm font-medium">{booking.guests}</p>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Pedidos Especiais:</p>
                    <p className="text-sm text-blue-800">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="size-4" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="size-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
