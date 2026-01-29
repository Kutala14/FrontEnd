import { ArrowLeft, MapPin, Star, Calendar, Users, Heart, Share2 } from 'lucide-react';
import { Destination } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface DestinationDetailProps {
  destination: Destination;
  onBack: () => void;
}

export function DestinationDetail({ destination, onBack }: DestinationDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-full bg-white">
      {/* Header Image */}
      <div className="relative h-72">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Navigation */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart className={`size-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Share2 className="size-5" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {destination.category}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Title and Rating */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{destination.name}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="size-4" />
              <span className="text-sm">{destination.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{destination.rating}</span>
              <span className="text-sm text-gray-500">(124 avaliações)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-semibold mb-2">Sobre</h2>
          <p className="text-gray-600 leading-relaxed">{destination.description}</p>
        </div>

        {/* Highlights */}
        <div>
          <h2 className="font-semibold mb-3">Destaques</h2>
          <div className="grid grid-cols-1 gap-2">
            {destination.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-red-600 rounded-full" />
                <span className="text-sm text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h2 className="font-semibold mb-3">Atividades Disponíveis</h2>
          <div className="flex flex-wrap gap-2">
            {destination.activities.map((activity, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
              >
                {activity}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-blue-50 rounded-xl">
            <Calendar className="size-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Melhor época</p>
            <p className="text-sm font-medium">Maio - Outubro</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <Users className="size-5 text-green-600 mb-2" />
            <p className="text-xs text-gray-600 mb-1">Ideal para</p>
            <p className="text-sm font-medium">Famílias e Grupos</p>
          </div>
        </div>

        {/* Book Button */}
        <button className="w-full bg-red-600 text-white py-4 rounded-xl font-medium hover:bg-red-700 transition-colors">
          Reservar Experiência
        </button>
      </div>
    </div>
  );
}
