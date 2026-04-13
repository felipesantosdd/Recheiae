import { MapPin, Clock, Star, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STORE_CONFIG, formatPrice } from '@/utils/calculations';

export function HeroBanner() {
  return (
    <div className="relative w-full h-[200px] sm:h-[260px] md:h-[320px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=1400&h=500&fit=crop&auto=format&q=80"
        alt="Recheiaê - Batata Recheada Delivery"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-gradient absolute inset-0" />
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-5 sm:pb-7">
        <Badge variant="success" className="w-fit mb-2 text-[10px] uppercase tracking-wider">
          Aberto agora
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-card drop-shadow-md">
          {STORE_CONFIG.nome}
        </h1>
        <p className="text-sm md:text-base text-card/80 mt-1 max-w-md">
          Batata recheada artesanal com entrega rápida
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-3 text-card/70 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {STORE_CONFIG.cidade}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {STORE_CONFIG.deliveryTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.9
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Frete {formatPrice(STORE_CONFIG.deliveryFee)}
          </span>
        </div>
      </div>
    </div>
  );
}
