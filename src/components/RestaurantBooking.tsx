import { useState } from 'react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Calendar, Users, User, Mail, MessageSquare, Check } from 'lucide-react';
import { Restaurant } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantBookingProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export function RestaurantBooking({ restaurant, onBack }: RestaurantBookingProps) {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    phone: '',
    email: '',
    specialRequests: ''
  });
  const [isBooked, setIsBooked] = useState(false);

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Criar a reserva
    const newBooking = {
      id: Date.now(),
      restaurantId: restaurant.id,
      customerName: bookingData.name,
      customerEmail: bookingData.email,
      customerPhone: bookingData.phone,
      date: bookingData.date,
      time: bookingData.time,
      guests: parseInt(bookingData.guests),
      specialRequests: bookingData.specialRequests,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    const bookingsData = localStorage.getItem('tukula_bookings');
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    bookings.push(newBooking);
    localStorage.setItem('tukula_bookings', JSON.stringify(bookings));
    
    setIsBooked(true);
  };

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
            <span className="text-gray-600">Nome:</span>
            <span className="font-medium">{bookingData.name}</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full max-w-md bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Voltar aos Restaurantes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      {/* Header Image */}
      <div className="relative h-56">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Restaurant Info Overlay */}
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

      {/* Restaurant Details */}
      <div className="px-4 py-4 border-b border-gray-100">
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
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Fazer Reserva</h2>
          
          {/* Date Selection */}
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

          {/* Time Selection */}
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
                    bookingData.time === time
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Guests */}
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

        <div className="border-t border-gray-100 pt-6">
          <h3 className="font-semibold mb-4">Informações de Contacto</h3>
          
          {/* Name */}
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <User className="size-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={bookingData.name}
              onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
              placeholder="Digite o seu nome"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <Phone className="size-4 inline mr-2" />
              Telefone
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

          {/* Email */}
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <Mail className="size-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              required
              value={bookingData.email}
              onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
              placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Special Requests */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!bookingData.date || !bookingData.time}
          className="w-full bg-red-600 text-white py-4 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Reserva
        </button>

        <p className="text-xs text-gray-500 text-center">
          Ao confirmar, você concorda em compartilhar suas informações com o restaurante.
        </p>
      </form>
    </div>
  );
}