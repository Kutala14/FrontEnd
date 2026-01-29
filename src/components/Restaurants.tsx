import { useState } from 'react';
import { MapPin, Star, DollarSign, Clock, Phone, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Restaurant {
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

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Lookal Ocean Club',
    cuisine: 'Frutos do Mar',
    description: 'Restaurante sofisticado com vista para o mar, especializado em frutos do mar frescos e cozinha internacional.',
    image: 'https://images.unsplash.com/photo-1672636402078-4b957a572e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwcmVzdGF1cmFudCUyMGRpc2h8ZW58MXx8fHwxNzY4MDYzNzE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 234,
    priceRange: '$$$',
    location: 'Ilha de Luanda',
    openHours: '12:00 - 23:00',
    phone: '+244 923 456 789',
    specialties: ['Lagosta Grelhada', 'Caldeirada de Peixe', 'Camarão à Guilho']
  },
  {
    id: 2,
    name: 'Restaurante Miami Beach',
    cuisine: 'Cozinha Angolana',
    description: 'Autêntica cozinha angolana com pratos tradicionais e ambiente acolhedor junto à praia.',
    image: 'https://images.unsplash.com/photo-1609792790758-0994786ad983?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcmVzdGF1cmFudCUyMGZvb2R8ZW58MXx8fHwxNzY4MDA1MTUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 189,
    priceRange: '$$',
    location: 'Ilha de Luanda',
    openHours: '11:00 - 22:00',
    phone: '+244 924 567 890',
    specialties: ['Muamba de Galinha', 'Calulu', 'Funge']
  },
  {
    id: 3,
    name: 'Cais de Quatro',
    cuisine: 'Internacional',
    description: 'Restaurante elegante com menu variado de cozinha internacional e vinhos selecionados.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NjgwNTYzOTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 312,
    priceRange: '$$$',
    location: 'Luanda, Marginal',
    openHours: '12:00 - 00:00',
    phone: '+244 922 345 678',
    specialties: ['Risotto de Marisco', 'Steak Angus', 'Tártaro de Atum']
  },
  {
    id: 4,
    name: 'Café del Mar',
    cuisine: 'Café & Pastelaria',
    description: 'Café moderno com excelentes cafés, bolos caseiros e refeições leves. Perfeito para brunch.',
    image: 'https://images.unsplash.com/photo-1604552914267-90a8d81a4254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwc2hvcHxlbnwxfHx8fDE3NjgwNDYzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 156,
    priceRange: '$',
    location: 'Talatona, Luanda',
    openHours: '07:00 - 20:00',
    phone: '+244 925 678 901',
    specialties: ['Cappuccino Especial', 'Croissant Artesanal', 'Bowls Saudáveis']
  },
  {
    id: 5,
    name: 'Espeto Brasileiro',
    cuisine: 'Churrascaria',
    description: 'Churrascaria tradicional com rodízio de carnes nobres e buffet completo de saladas.',
    image: 'https://images.unsplash.com/photo-1702741168115-cd3d9a682972?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjBncmlsbGVkJTIwbWVhdHxlbnwxfHx8fDE3NjgwNjM3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 267,
    priceRange: '$$',
    location: 'Morro Bento, Luanda',
    openHours: '12:00 - 23:00',
    phone: '+244 923 789 012',
    specialties: ['Picanha', 'Costela', 'Fraldinha']
  },
  {
    id: 6,
    name: 'Tamariz',
    cuisine: 'Portuguesa',
    description: 'Cozinha portuguesa tradicional com pratos autênticos e ambiente familiar.',
    image: 'https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBlbGVnYW50fGVufDF8fHx8MTc2Nzk5ODg4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 201,
    priceRange: '$$',
    location: 'Maianga, Luanda',
    openHours: '11:00 - 22:30',
    phone: '+244 924 890 123',
    specialties: ['Bacalhau à Brás', 'Polvo à Lagareiro', 'Arroz de Marisco']
  }
];

interface RestaurantsProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export function Restaurants({ onSelectRestaurant }: RestaurantsProps) {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Todas');

  const cuisines = ['Todas', 'Frutos do Mar', 'Cozinha Angolana', 'Internacional', 'Café & Pastelaria', 'Churrascaria', 'Portuguesa'];

  const filteredRestaurants = restaurants.filter(
    restaurant => selectedCuisine === 'Todas' || restaurant.cuisine === selectedCuisine
  );

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Restaurantes</h2>
        <p className="text-gray-600">Os melhores lugares para comer em Angola</p>
      </div>

      {/* Cuisine Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCuisine === cuisine
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-200'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
      </div>

      {/* Restaurants List */}
      <div className="space-y-4 pb-4">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
                <span className="text-xs text-gray-500">({restaurant.reviews})</span>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {restaurant.cuisine}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                <span className="text-red-600 font-medium text-sm">{restaurant.priceRange}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{restaurant.description}</p>
              
              <div className="space-y-2 mb-3">
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

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => onSelectRestaurant(restaurant)}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Ver Menu & Reservar
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}