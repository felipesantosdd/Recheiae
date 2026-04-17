import { MapPin, Phone, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { STORE_CONFIG, formatWhatsAppNumber } from '@/utils/calculations';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export function Footer() {
  const { normalizedSettings } = useStoreSettings();
  const hours = normalizedSettings.businessHours.split('\n').filter(Boolean);

  return (
    <footer className="bg-card border-t border-border mt-12 pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-foreground text-lg">{STORE_CONFIG.nome}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Batata recheada artesanal com ingredientes selecionados e entrega rapida.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Informacoes</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {STORE_CONFIG.cidade}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                WhatsApp: {formatWhatsAppNumber(normalizedSettings.whatsapp)}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                Entrega em ate {normalizedSettings.deliveryTime}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Horarios</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {hours.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {STORE_CONFIG.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
