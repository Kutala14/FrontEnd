import { Clock, DollarSign, Users, Star, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface Experience {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: string;
  groupSize: string;
  rating: number;
  reviews: number;
  category: string;
}

const experiences: Experience[] = [
  {
    id: 1,
    title: 'Tour Gastronómico em Luanda',
    description: 'Descubra os sabores autênticos de Angola com um guia local. Visite mercados tradicionais e prove pratos típicos.',
    image: 'https://images.unsplash.com/photo-1665332561290-cc6757172890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZm9vZCUyMGN1aXNpbmV8ZW58MXx8fHwxNzY4MDYzMjg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '4 horas',
    price: 'Desde $45',
    groupSize: '2-8 pessoas',
    rating: 4.9,
    reviews: 87,
    category: 'Gastronomia'
  },
  {
    id: 2,
    title: 'Espetáculo de Dança Tradicional',
    description: 'Assista a uma apresentação vibrante de danças tradicionais angolanas e aprenda sobre a rica cultura local.',
    image: 'https://images.unsplash.com/photo-1591874128553-8748ccf0956f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGRhbmNlJTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzY4MDYzMjg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '2 horas',
    price: 'Desde $30',
    groupSize: '1-20 pessoas',
    rating: 4.8,
    reviews: 124,
    category: 'Cultura'
  },
  {
    id: 3,
    title: 'Passeio de Barco na Ilha de Luanda',
    description: 'Explore a beleza da Ilha de Luanda num passeio de barco relaxante com vistas deslumbrantes.',
    image: 'https://images.unsplash.com/photo-1561789706-b21375e5392e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2F0JTIwdG91ciUyMG9jZWFufGVufDF8fHx8MTc2ODAwNzkxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '3 horas',
    price: 'Desde $60',
    groupSize: '2-12 pessoas',
    rating: 4.7,
    reviews: 95,
    category: 'Aventura'
  },
  {
    id: 4,
    title: 'Caminhada na Serra da Leba',
    description: 'Aventura de trekking com vistas panorâmicas espetaculares. Inclui guia experiente e equipamento.',
    image: 'https://images.unsplash.com/photo-1595368062405-e4d7840cba14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjBtb3VudGFpbiUyMGFkdmVudHVyZXxlbnwxfHx8fDE3Njc5NzkxMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '6 horas',
    price: 'Desde $75',
    groupSize: '4-10 pessoas',
    rating: 4.9,
    reviews: 68,
    category: 'Natureza'
  },
  {
    id: 5,
    title: 'Safari no Parque da Kissama',
    description: 'Experiência de safari autêntica para observar elefantes, girafas e outros animais em seu habitat natural.',
    image: 'https://images.unsplash.com/photo-1729359035276-189519a4b072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZhcmklMjB3aWxkbGlmZSUyMGFmcmljYXxlbnwxfHx8fDE3NjgwMjMzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: 'Dia completo',
    price: 'Desde $120',
    groupSize: '2-6 pessoas',
    rating: 5.0,
    reviews: 142,
    category: 'Vida Selvagem'
  },
  {
    id: 6,
    title: 'Workshop de Artesanato Local',
    description: 'Aprenda técnicas tradicionais de artesanato com artesãos locais e crie a sua própria obra de arte.',
    image: 'https://images.unsplash.com/photo-1515657241610-a6b33f0f6c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmliYWwlMjBjdWx0dXJlJTIwYWZyaWNhfGVufDF8fHx8MTc2ODA2MzE5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '3 horas',
    price: 'Desde $35',
    groupSize: '1-8 pessoas',
    rating: 4.8,
    reviews: 76,
    category: 'Cultura'
  }
];

export function Experiences() {
  const categories = ['Todas', 'Gastronomia', 'Cultura', 'Aventura', 'Natureza', 'Vida Selvagem'];
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredExperiences = experiences.filter(
    exp => selectedCategory === 'Todas' || exp.category === selectedCategory
  );

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Experiências</h2>
        <p className="text-gray-600">Atividades e tours únicos em Angola</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Experiences List */}
      <div className="space-y-4 pb-4">
        {filteredExperiences.map((experience) => (
          <div
            key={experience.id}
            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={experience.image}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{experience.rating}</span>
                <span className="text-xs text-gray-500">({experience.reviews})</span>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                {experience.category}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{experience.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{experience.description}</p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="size-4" />
                  <span className="text-xs">{experience.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="size-4" />
                  <span className="text-xs">{experience.groupSize}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <DollarSign className="size-4" />
                  <span className="text-xs font-medium">{experience.price}</span>
                </div>
              </div>

              <button className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                Ver Detalhes
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}