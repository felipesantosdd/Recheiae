import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CategoryNav({ categories, activeCategory, onCategoryClick }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-4">
      <div className="relative">
        {/* Scroll arrows for desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 bg-card/90 shadow-sm border border-border"
          onClick={() => scroll(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-8 w-8 bg-card/90 shadow-sm border border-border"
          onClick={() => scroll(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryClick(cat)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-[color,background-color,border-color] duration-200",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
