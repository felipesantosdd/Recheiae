import { useState, useEffect, useMemo, useRef } from 'react';
import { HeroBanner } from '@/components/menu/HeroBanner';
import { CategoryNav } from '@/components/menu/CategoryNav';
import { ProductCard } from '@/components/menu/ProductCard';
import { ComboCard } from '@/components/menu/ComboCard';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, Package, Loader2 } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function MenuPage() {
  const { normalizedSettings } = useStoreSettings();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, comboRes, catRes, topRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/combos'),
        api.get('/categories'),
        api.get('/products/top'),
      ]);
      if (prodRes.status !== 'fulfilled' || comboRes.status !== 'fulfilled' || catRes.status !== 'fulfilled') {
        throw new Error('Falha ao carregar o cardapio');
      }
      setProducts(prodRes.value.data);
      setCombos(comboRes.value.data);
      setCategories(catRes.value.data);
      setTopProducts(topRes.status === 'fulfilled' ? topRes.value.data : []);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(p =>
        p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredProducts.filter(p => p.categoria === cat);
    return acc;
  }, {});

  const topProductIds = new Set(topProducts.map((product) => product.uuid));
  const promotedProduct = useMemo(() => {
    if (!normalizedSettings.promotionActive || !normalizedSettings.promotionProductUuid) {
      return null;
    }
    return products.find((product) => product.uuid === normalizedSettings.promotionProductUuid) || null;
  }, [products, normalizedSettings]);

  const getPromotionProps = (product) => {
    if (
      promotedProduct
      && product.uuid === promotedProduct.uuid
      && Number.isFinite(Number(normalizedSettings.promotionPrice))
    ) {
      return {
        showPromo: true,
        priceOverride: Number(normalizedSettings.promotionPrice),
        promoBadgeText: 'Promo do Dia',
      };
    }

    return {
      showPromo: product.desconto > 0,
      priceOverride: null,
      promoBadgeText: null,
    };
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const el = sectionRefs.current[cat];
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-28 md:pb-8">
      <HeroBanner />

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 mt-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no cardápio..."
            className="pl-10 h-11 bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category nav */}
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={scrollToCategory}
      />

      {/* Search results */}
      {searchQuery && (
        <section className="max-w-6xl mx-auto px-4 mt-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Resultados para "{searchQuery}"
          </h2>
          {filteredProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Nenhum produto encontrado
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.uuid} product={product} {...getPromotionProps(product)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Combos */}
      {!searchQuery && combos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Combos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {combos.map(combo => (
              <ComboCard key={combo.uuid} combo={combo} />
            ))}
          </div>
        </section>
      )}

      {!searchQuery && promotedProduct && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Promocao do Dia</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <ProductCard
              key={`promotion-${promotedProduct.uuid}`}
              product={promotedProduct}
              {...getPromotionProps(promotedProduct)}
            />
          </div>
        </section>
      )}

      {!searchQuery && topProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Top 3 Mais Pedidos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {topProducts.map(product => (
              <ProductCard
                key={`top-${product.uuid}`}
                product={product}
                showPopular
                {...getPromotionProps(product)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category sections */}
      {!searchQuery && categories.map(cat => {
        const catProducts = productsByCategory[cat] || [];
        if (catProducts.length === 0) return null;
        return (
          <section
            key={cat}
            ref={el => { sectionRefs.current[cat] = el; }}
            className="max-w-6xl mx-auto px-4 mt-10 scroll-mt-20"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">{cat}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {catProducts.map(product => (
                <ProductCard
                  key={product.uuid}
                  product={product}
                  showPopular={topProductIds.has(product.uuid)}
                  {...getPromotionProps(product)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
