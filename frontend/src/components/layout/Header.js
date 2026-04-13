import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORE_CONFIG } from '@/utils/calculations';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Cardápio', path: '/' },
    ...(IS_DEVELOPMENT ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-extrabold text-base">R</span>
          </div>
          <span className="font-extrabold text-foreground text-xl tracking-tight">{STORE_CONFIG.nome}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                size="sm"
                className="text-sm"
              >
                {item.label === 'Admin' && <Settings className="h-3.5 w-3.5" />}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 animate-slide-up">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block py-2 px-3 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
