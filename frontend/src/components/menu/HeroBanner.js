import { MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STORE_CONFIG, getBusinessHoursStatus } from "@/utils/calculations";
import { useStoreSettings } from "@/context/StoreSettingsContext";

const ACTIVE_PROMOTION_TEXT =
  "10% DE DESCONTO EM TODA A LOJA NOS PAGAMENTOS VIA PIX!";

export function HeroBanner() {
  const { normalizedSettings } = useStoreSettings();
  const businessHoursStatus = getBusinessHoursStatus(
    normalizedSettings.businessHours,
  );

  return (
    <div className="relative w-full h-[232px] sm:h-[292px] md:h-[352px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=1400&h=500&fit=crop&auto=format&q=80"
        alt="Recheiae - Batata Recheada Delivery"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-gradient absolute inset-0" />
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-11 sm:pb-12 md:pb-14">
        <Badge
          variant={businessHoursStatus.isOpen ? "success" : "outline"}
          className={
            businessHoursStatus.isOpen
              ? "w-fit mb-2 text-[10px] uppercase tracking-wider"
              : "w-fit mb-2 border-orange-300/70 bg-orange-500/15 text-orange-100 text-[10px] uppercase tracking-wider"
          }
        >
          {businessHoursStatus.isOpen ? "Aberto agora" : "Fechado no momento"}
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-card drop-shadow-md">
          {STORE_CONFIG.nome}
        </h1>
        <p className="text-sm md:text-base text-card/80 mt-1 max-w-md">
          Batata recheada artesanal com entrega rapida
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-3 text-card/70 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {STORE_CONFIG.cidade}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {normalizedSettings.deliveryTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            4.9
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-emerald-700/40 bg-emerald-600 text-white shadow-[0_-6px_20px_rgba(0,0,0,0.18)]">
        <div className="promo-marquee">
          <div className="promo-marquee-track">
            <span>{ACTIVE_PROMOTION_TEXT}</span>
            <span>{ACTIVE_PROMOTION_TEXT}</span>
            <span>{ACTIVE_PROMOTION_TEXT}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
