import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Save, CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, calculateItemPrice } from '@/utils/calculations';
import { useStoreSettings } from '@/context/StoreSettingsContext';

const formatMoneyInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const cents = Number(digits) / 100;
  return cents.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseMoneyInput = (value) => {
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toMoneyInput = (value) => formatMoneyInput(
  Math.round((Number(value) || 0) * 100),
);

const IMPORT_METADATA_PREFIX = '__IMPORT_METADATA__';

const normalizeCatalogText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const buildCashObservation = (displayObservation, metadata) => {
  const cleanObservation = String(displayObservation || '').trim();
  if (!metadata) return cleanObservation;
  return `${IMPORT_METADATA_PREFIX}${JSON.stringify(metadata)}\n${cleanObservation}`.trim();
};

const parseCashObservation = (value) => {
  const raw = String(value || '');
  if (!raw.startsWith(IMPORT_METADATA_PREFIX)) {
    return { displayObservation: raw, metadata: null };
  }

  const newlineIndex = raw.indexOf('\n');
  const metadataText = newlineIndex >= 0
    ? raw.slice(IMPORT_METADATA_PREFIX.length, newlineIndex)
    : raw.slice(IMPORT_METADATA_PREFIX.length);
  const displayObservation = newlineIndex >= 0 ? raw.slice(newlineIndex + 1).trim() : '';

  try {
    return {
      displayObservation,
      metadata: JSON.parse(metadataText),
    };
  } catch (error) {
    return { displayObservation: raw, metadata: null };
  }
};

const emptyProduct = {
  nome: '', descricao: '', preco: '', desconto: '0',
  foto: '', categoria: 'Batatas Recheadas', vendas: '0', ativo: true,
};

const emptyCombo = {
  nome: '', descricao: '', valor: '', desconto: '0',
  foto: '', vendas: '0', ativo: true, produto_ids: [],
};

const emptyAddon = {
  nome: '', preco: toMoneyInput(3), ativo: true,
};

const emptySettings = {
  whatsapp: '',
  delivery_time: '',
  business_hours: '',
  promotion_product_uuid: '',
  promotion_price: '',
  promotion_active: true,
};

const emptyCashEntry = {
  tipo: 'entrada',
  categoria: 'venda',
  descricao: '',
  valor: '',
  forma_pagamento: '',
  data_lancamento: '',
  observacao: '',
};

const cashCategories = [
  'venda',
  'delivery',
  'compra',
  'insumo',
  'embalagem',
  'marketing',
  'outros',
];

const emptyIfoodImport = {
  fileName: '',
};

const emptyWhatsappImport = {
  date: new Date().toISOString().slice(0, 10),
  rawText: '',
};

const emptyStockItem = {
  nome: '',
  unidade: 'kg',
  quantidade: '',
  valor_pago: '',
  ativo: true,
};

const emptyRecipeForm = {
  product_uuid: '',
  stock_item_uuid: '',
  quantidade_utilizada: '',
};

const emptyConfirmDialog = {
  open: false,
  title: '',
  description: '',
  actionLabel: 'Confirmar',
  tone: 'default',
  onConfirm: null,
};

export default function AdminPage() {
  const { setSettings: setGlobalSettings, refreshSettings } = useStoreSettings();
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addons, setAddons] = useState([]);
  const [cashEntries, setCashEntries] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [productRecipes, setProductRecipes] = useState([]);
  const [settings, setSettings] = useState({ ...emptySettings });
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCombo, setSavingCombo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCash, setSavingCash] = useState(false);
  const [savingIfoodImport, setSavingIfoodImport] = useState(false);
  const [savingWhatsappImport, setSavingWhatsappImport] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [addonDialog, setAddonDialog] = useState(false);
  const [prodDialog, setProdDialog] = useState(false);
  const [comboDialog, setComboDialog] = useState(false);
  const [pmDialog, setPmDialog] = useState(false);
  const [cashDialog, setCashDialog] = useState(false);
  const [ifoodImportDialog, setIfoodImportDialog] = useState(false);
  const [whatsappImportDialog, setWhatsappImportDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [stockLibraryDialog, setStockLibraryDialog] = useState(false);
  const [recipeDialog, setRecipeDialog] = useState(false);
  const [recipeManagerProduct, setRecipeManagerProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editCombo, setEditCombo] = useState(null);
  const [editPM, setEditPM] = useState(null);
  const [editAddon, setEditAddon] = useState(null);
  const [editCashEntry, setEditCashEntry] = useState(null);
  const [editStockItem, setEditStockItem] = useState(null);
  const [editRecipe, setEditRecipe] = useState(null);
  const [prodForm, setProdForm] = useState({ ...emptyProduct });
  const [comboForm, setComboForm] = useState({ ...emptyCombo });
  const [pmForm, setPmForm] = useState({ nome: '', ativo: true });
  const [addonForm, setAddonForm] = useState({ ...emptyAddon });
  const [cashForm, setCashForm] = useState({ ...emptyCashEntry });
  const [stockForm, setStockForm] = useState({ ...emptyStockItem });
  const [recipeForm, setRecipeForm] = useState({ ...emptyRecipeForm });
  const [recipeStockSearch, setRecipeStockSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ ...emptyConfirmDialog });
  const [cashTypeFilter, setCashTypeFilter] = useState('todos');
  const [cashDateFrom, setCashDateFrom] = useState('');
  const [cashDateTo, setCashDateTo] = useState('');
  const [expandedCashEntries, setExpandedCashEntries] = useState({});
  const [ifoodImportForm, setIfoodImportForm] = useState({ ...emptyIfoodImport });
  const [ifoodImportFile, setIfoodImportFile] = useState(null);
  const [whatsappImportForm, setWhatsappImportForm] = useState({ ...emptyWhatsappImport });
  const [productImageFile, setProductImageFile] = useState(null);
  const [comboImageFile, setComboImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [comboImagePreview, setComboImagePreview] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const filteredCashEntries = useMemo(() => {
    return cashEntries.filter((entry) => {
      if (cashTypeFilter !== 'todos' && entry.tipo !== cashTypeFilter) {
        return false;
      }
      const datePart = String(entry.data_lancamento || '').slice(0, 10);
      if (cashDateFrom && datePart < cashDateFrom) {
        return false;
      }
      if (cashDateTo && datePart > cashDateTo) {
        return false;
      }
      return true;
    });
  }, [cashEntries, cashTypeFilter, cashDateFrom, cashDateTo]);

  const cashSummary = useMemo(() => {
    return filteredCashEntries.reduce((acc, entry) => {
      const value = Number(entry.valor) || 0;
      if (entry.tipo === 'entrada') {
        acc.entradas += value;
      } else {
        acc.saidas += value;
      }
      acc.saldo = acc.entradas - acc.saidas;
      return acc;
    }, { entradas: 0, saidas: 0, saldo: 0 });
  }, [filteredCashEntries]);

  const channelSalesSummary = useMemo(() => {
    return filteredCashEntries.reduce((acc, entry) => {
      const value = Number(entry.valor) || 0;
      if (entry.tipo !== 'entrada') {
        return acc;
      }
      if (entry.descricao === 'Vendas iFood') {
        acc.ifood += value;
      }
      if (entry.descricao === 'Vendas WhatsApp') {
        acc.whatsapp += value;
      }
      return acc;
    }, { ifood: 0, whatsapp: 0 });
  }, [filteredCashEntries]);

  const groupedCashEntries = useMemo(() => {
    return filteredCashEntries.reduce((groups, entry) => {
      const dateKey = String(entry.data_lancamento || '').slice(0, 10) || 'Sem data';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
      return groups;
    }, {});
  }, [filteredCashEntries]);

  const productCostSummaries = useMemo(() => {
    const grouped = {};
    productRecipes.forEach((recipe) => {
      if (!grouped[recipe.product_uuid]) {
        grouped[recipe.product_uuid] = {
          product_uuid: recipe.product_uuid,
          product_nome: recipe.product_nome,
          total_cost: 0,
          items: [],
        };
      }
      grouped[recipe.product_uuid].items.push(recipe);
      grouped[recipe.product_uuid].total_cost += Number(recipe.custo_estimado || 0);
    });
    return Object.values(grouped).sort((a, b) => a.product_nome.localeCompare(b.product_nome, 'pt-BR'));
  }, [productRecipes]);

  const productCostMap = useMemo(() => {
    return productCostSummaries.reduce((acc, summary) => {
      acc[summary.product_uuid] = summary;
      return acc;
    }, {});
  }, [productCostSummaries]);

  const catalogProductsForStock = useMemo(() => {
    return [...products].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [products]);

  const selectedProductRecipes = useMemo(() => {
    if (!recipeManagerProduct) return [];
    return productRecipes
      .filter((recipe) => recipe.product_uuid === recipeManagerProduct.uuid)
      .sort((a, b) => a.stock_item_nome.localeCompare(b.stock_item_nome, 'pt-BR'));
  }, [productRecipes, recipeManagerProduct]);

  const filteredStockItems = useMemo(() => {
    const term = recipeStockSearch.trim().toLowerCase();
    if (!term) return stockItems.filter(item => item.ativo);
    return stockItems.filter((item) => (
      item.ativo && item.nome.toLowerCase().includes(term)
    ));
  }, [stockItems, recipeStockSearch]);

  const selectedProductSummary = useMemo(() => {
    if (!recipeManagerProduct) return null;
    return productCostMap[recipeManagerProduct.uuid] || null;
  }, [productCostMap, recipeManagerProduct]);

  const selectedPromotionProduct = useMemo(() => {
    if (!settings.promotion_product_uuid) return null;
    return products.find((product) => product.uuid === settings.promotion_product_uuid) || null;
  }, [products, settings.promotion_product_uuid]);

  const selectedProductMargin = useMemo(() => {
    if (!recipeManagerProduct || selectedProductRecipes.length === 0) return null;
    const price = Number(recipeManagerProduct.preco) || 0;
    const totalCost = Number(selectedProductSummary?.total_cost || 0);
    const profit = price - totalCost;
    const percent = price > 0 ? (profit / price) * 100 : 0;
    return { price, totalCost, profit, percent };
  }, [recipeManagerProduct, selectedProductRecipes, selectedProductSummary]);

  const toggleCashEntryExpanded = (entryUuid) => {
    setExpandedCashEntries((prev) => ({
      ...prev,
      [entryUuid]: !prev[entryUuid],
    }));
  };

  const openConfirmDialog = ({ title, description, actionLabel = 'Confirmar', tone = 'default', onConfirm }) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      actionLabel,
      tone,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ ...emptyConfirmDialog });
  };

  const applyPromotionProduct = (product) => {
    setSettings((prev) => ({
      ...prev,
      promotion_product_uuid: product.uuid,
      promotion_price: prev.promotion_product_uuid === product.uuid && prev.promotion_price
        ? prev.promotion_price
        : toMoneyInput(calculateItemPrice(product.preco, product.desconto || 0)),
      promotion_active: true,
    }));
  };

  const clearPromotionSettings = () => {
    setSettings((prev) => ({
      ...prev,
      promotion_product_uuid: '',
      promotion_price: '',
      promotion_active: false,
    }));
  };

  const runConfirmDialog = async () => {
    if (!confirmDialog.onConfirm) {
      closeConfirmDialog();
      return;
    }
    try {
      await confirmDialog.onConfirm();
    } finally {
      closeConfirmDialog();
    }
  };

  const renderCashEntryCard = (entry) => {
    const parsedObservation = parseCashObservation(entry.observacao);
    const importMetadata = parsedObservation.metadata;
    const importBatches = importMetadata?.batches || [];
    const isExpanded = Boolean(expandedCashEntries[entry.uuid]);
    const totalImportedOrders = importBatches.reduce((acc, batch) => acc + (batch.orderCount || 0), 0);

    return (
      <Card key={entry.uuid}>
        <CardContent className="p-4 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            {entry.tipo === 'entrada'
              ? <ArrowUpCircle className="h-5 w-5 text-success" />
              : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{entry.descricao}</h3>
              <Badge variant={entry.tipo === 'entrada' ? 'success' : 'outline'} className="text-[10px]">
                {entry.tipo}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{entry.categoria}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPrice(entry.valor)}
              {entry.forma_pagamento && <span className="ml-2">• {entry.forma_pagamento}</span>}
            </p>
            {parsedObservation.displayObservation && (
              <p className="text-xs text-muted-foreground mt-2">{parsedObservation.displayObservation}</p>
            )}
            {importBatches.length > 0 && (
              <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Detalhes do import</p>
                    <p className="text-sm text-foreground">{totalImportedOrders} pedido(s) em {importBatches.length} importacao(oes)</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCashEntryExpanded(entry.uuid)}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isExpanded ? 'Ocultar' : 'Ver pedidos'}
                  </Button>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {importBatches.map((batch, batchIndex) => (
                      <div key={`${entry.uuid}-batch-${batchIndex}`} className="rounded-md border border-border bg-background p-3">
                        <p className="text-xs text-muted-foreground">
                          Importacao {batchIndex + 1}: {batch.orderCount || 0} pedido(s) • total {formatPrice(batch.total || 0)}
                        </p>
                        <div className="mt-2 space-y-2">
                          {(batch.orders || []).map((order, orderIndex) => (
                            <div key={`${entry.uuid}-order-${batchIndex}-${orderIndex}`} className="rounded-md border border-border/70 p-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <p className="text-sm font-medium text-foreground">
                                  {order.orderId ? `Pedido ${order.orderId}` : order.orderNumber ? `Pedido ${order.orderNumber}` : `Pedido ${orderIndex + 1}`}
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatPrice(order.net || order.total || 0)}
                                </p>
                              </div>
                              {(order.time || order.createdAt || order.gross) && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {[order.time, order.createdAt, order.gross ? `bruto ${formatPrice(order.gross)}` : ''].filter(Boolean).join(' • ')}
                                </p>
                              )}
                              {Array.isArray(order.items) && order.items.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {order.items.map((item, itemIndex) => (
                                    <p key={`${entry.uuid}-item-${batchIndex}-${orderIndex}-${itemIndex}`} className="text-xs text-muted-foreground">
                                      {item.quantity}x {item.name}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => openEditCashEntry(entry)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCashEntry(entry.uuid)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getImportedOrderIds = (channel) => {
    const ids = new Set();
    cashEntries.forEach((entry) => {
      const parsedObservation = parseCashObservation(entry.observacao);
      if (parsedObservation.metadata?.channel !== channel) return;
      (parsedObservation.metadata?.batches || []).forEach((batch) => {
        (batch.orders || []).forEach((order) => {
          const orderId = order.id || order.orderId || order.orderNumber;
          if (orderId) ids.add(String(orderId));
        });
      });
    });
    return ids;
  };

  const clearProductImageSelection = () => {
    if (productImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(productImagePreview);
    }
    setProductImageFile(null);
    setProductImagePreview('');
  };

  const clearComboImageSelection = () => {
    if (comboImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(comboImagePreview);
    }
    setComboImageFile(null);
    setComboImagePreview('');
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];
    clearProductImageSelection();
    if (!file) return;
    setProductImageFile(file);
    setProductImagePreview(URL.createObjectURL(file));
  };

  const handleComboImageChange = (event) => {
    const file = event.target.files?.[0];
    clearComboImageSelection();
    if (!file) return;
    setComboImageFile(file);
    setComboImagePreview(URL.createObjectURL(file));
  };

  const closeProductDialog = () => {
    clearProductImageSelection();
    setProdDialog(false);
  };

  const closeComboDialog = () => {
    clearComboImageSelection();
    setComboDialog(false);
  };

  const uploadImageFile = async (file, scope, itemId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', scope);
    if (itemId) {
      formData.append('item_id', itemId);
    }

    const response = await api.post('/admin/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.path;
  };

  const fetchAll = async () => {
    try {
      const [pRes, cRes, pmRes, addonRes, settingsRes, cashRes, stockRes, recipeRes] = await Promise.all([
        api.get('/products/all'),
        api.get('/combos/all'),
        api.get('/payment-methods/all'),
        api.get('/addons/all'),
        api.get('/settings'),
        api.get('/admin/cash-entries'),
        api.get('/admin/stock-items'),
        api.get('/admin/product-recipes'),
      ]);
      setProducts(pRes.data);
      setCombos(cRes.data);
      setPaymentMethods(pmRes.data);
      setAddons(addonRes.data);
      setCashEntries(cashRes.data);
      setStockItems(stockRes.data);
      setProductRecipes(recipeRes.data);
      setSettings({
        whatsapp: settingsRes.data?.whatsapp || '',
        delivery_time: settingsRes.data?.delivery_time || '',
        business_hours: settingsRes.data?.business_hours || '',
        promotion_product_uuid: settingsRes.data?.promotion_product_uuid || '',
        promotion_price: settingsRes.data?.promotion_price ? toMoneyInput(settingsRes.data.promotion_price) : '',
        promotion_active: typeof settingsRes.data?.promotion_active === 'boolean'
          ? settingsRes.data.promotion_active
          : Boolean(settingsRes.data?.promotion_active),
      });
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD
  const openNewProduct = () => {
    clearProductImageSelection();
    setEditProduct(null);
    setProdForm({ ...emptyProduct });
    setProdDialog(true);
  };
  const openEditProduct = (p) => {
    clearProductImageSelection();
    setEditProduct(p);
    setProdForm({
      nome: p.nome, descricao: p.descricao || '', preco: toMoneyInput(p.preco),
      desconto: String(p.desconto || 0), foto: p.foto || '',
      categoria: p.categoria, vendas: String(p.vendas || 0), ativo: p.ativo,
    });
    setProdDialog(true);
  };
  const saveProduct = async () => {
    try {
      setSavingProduct(true);
      const payload = { ...prodForm, preco: parseMoneyInput(prodForm.preco), desconto: parseFloat(prodForm.desconto) || 0, vendas: parseInt(prodForm.vendas) || 0 };
      if (productImageFile) {
        payload.foto = await uploadImageFile(productImageFile, 'product', editProduct?.uuid);
      }
      if (editProduct) { await api.put(`/admin/products/${editProduct.uuid}`, payload); toast.success('Produto atualizado!'); }
      else { await api.post('/admin/products', payload); toast.success('Produto criado!'); }
      clearProductImageSelection();
      setProdDialog(false);
      fetchAll();
    } catch (e) { toast.error('Erro ao salvar produto'); }
    finally { setSavingProduct(false); }
  };
  const deleteProduct = async (uuid) => {
    openConfirmDialog({
      title: 'Remover produto',
      description: 'Esse produto sera removido do sistema.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try { await api.delete(`/admin/products/${uuid}`); toast.success('Produto removido!'); fetchAll(); }
        catch (e) { toast.error('Erro ao remover'); }
      },
    });
  };
  const toggleProductActive = async (p) => {
    try { await api.put(`/admin/products/${p.uuid}`, { ativo: !p.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar'); }
  };

  // Combo CRUD
  const openNewCombo = () => {
    clearComboImageSelection();
    setEditCombo(null);
    setComboForm({ ...emptyCombo });
    setComboDialog(true);
  };
  const openEditCombo = (c) => {
    clearComboImageSelection();
    setEditCombo(c);
    setComboForm({
      nome: c.nome, descricao: c.descricao || '', valor: toMoneyInput(c.valor),
      desconto: String(c.desconto || 0), foto: c.foto || '',
      vendas: String(c.vendas || 0), ativo: c.ativo, produto_ids: c.produto_ids || [],
    });
    setComboDialog(true);
  };
  const saveCombo = async () => {
    try {
      setSavingCombo(true);
      const payload = { ...comboForm, valor: parseMoneyInput(comboForm.valor), desconto: parseFloat(comboForm.desconto) || 0, vendas: parseInt(comboForm.vendas) || 0 };
      if (comboImageFile) {
        payload.foto = await uploadImageFile(comboImageFile, 'combo', editCombo?.uuid);
      }
      if (editCombo) { await api.put(`/admin/combos/${editCombo.uuid}`, payload); toast.success('Combo atualizado!'); }
      else { await api.post('/admin/combos', payload); toast.success('Combo criado!'); }
      clearComboImageSelection();
      setComboDialog(false);
      fetchAll();
    } catch (e) { toast.error('Erro ao salvar combo'); }
    finally { setSavingCombo(false); }
  };
  const deleteCombo = async (uuid) => {
    openConfirmDialog({
      title: 'Remover combo',
      description: 'Esse combo sera removido do sistema.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try { await api.delete(`/admin/combos/${uuid}`); toast.success('Combo removido!'); fetchAll(); }
        catch (e) { toast.error('Erro ao remover'); }
      },
    });
  };
  const toggleComboActive = async (c) => {
    try { await api.put(`/admin/combos/${c.uuid}`, { ativo: !c.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar'); }
  };
  const toggleProductInCombo = (prodId) => {
    setComboForm(prev => {
      const ids = prev.produto_ids || [];
      return { ...prev, produto_ids: ids.includes(prodId) ? ids.filter(id => id !== prodId) : [...ids, prodId] };
    });
  };

  // Payment methods CRUD
  const openNewPM = () => { setEditPM(null); setPmForm({ nome: '', ativo: true }); setPmDialog(true); };
  const openEditPM = (pm) => { setEditPM(pm); setPmForm({ nome: pm.nome, ativo: pm.ativo }); setPmDialog(true); };
  const savePM = async () => {
    if (!pmForm.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    try {
      if (editPM) { await api.put(`/admin/payment-methods/${editPM.uuid}`, pmForm); toast.success('Forma de pagamento atualizada!'); }
      else { await api.post('/admin/payment-methods', pmForm); toast.success('Forma de pagamento criada!'); }
      setPmDialog(false); fetchAll();
    } catch (e) { toast.error('Erro ao salvar'); }
  };
  const deletePM = async (uuid) => {
    openConfirmDialog({
      title: 'Remover forma de pagamento',
      description: 'Essa forma de pagamento sera removida do checkout.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try { await api.delete(`/admin/payment-methods/${uuid}`); toast.success('Removida!'); fetchAll(); }
        catch (e) { toast.error('Erro ao remover'); }
      },
    });
  };
  const togglePMActive = async (pm) => {
    try { await api.put(`/admin/payment-methods/${pm.uuid}`, { ativo: !pm.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar'); }
  };

  // Addons CRUD
  const openNewAddon = () => { setEditAddon(null); setAddonForm({ ...emptyAddon }); setAddonDialog(true); };
  const openEditAddon = (addon) => { setEditAddon(addon); setAddonForm({ nome: addon.nome, preco: toMoneyInput(addon.preco), ativo: addon.ativo }); setAddonDialog(true); };
  const saveAddon = async () => {
    if (!addonForm.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    const payload = { ...addonForm, preco: parseMoneyInput(addonForm.preco) || 0 };
    try {
      if (editAddon) { await api.put(`/admin/addons/${editAddon.uuid}`, payload); toast.success('Adicional atualizado!'); }
      else { await api.post('/admin/addons', payload); toast.success('Adicional criado!'); }
      setAddonDialog(false); fetchAll();
    } catch (e) { toast.error('Erro ao salvar adicional'); }
  };
  const deleteAddon = async (uuid) => {
    openConfirmDialog({
      title: 'Remover adicional',
      description: 'Esse adicional sera removido do sistema.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try { await api.delete(`/admin/addons/${uuid}`); toast.success('Adicional removido!'); fetchAll(); }
        catch (e) { toast.error('Erro ao remover adicional'); }
      },
    });
  };
  const toggleAddonActive = async (addon) => {
    try { await api.put(`/admin/addons/${addon.uuid}`, { ativo: !addon.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar adicional'); }
  };

  // Stock CRUD
  const openNewStockItem = () => {
    setEditStockItem(null);
    setStockForm({ ...emptyStockItem });
    setStockDialog(true);
  };
  const openEditStockItem = (item) => {
    setEditStockItem(item);
    setStockForm({
      nome: item.nome || '',
      unidade: 'kg',
      quantidade: String(item.quantidade ?? ''),
      valor_pago: toMoneyInput(item.valor_pago),
      ativo: item.ativo,
    });
    setStockDialog(true);
  };
  const saveStockItem = async () => {
    if (!stockForm.nome.trim()) { toast.error('Nome do insumo e obrigatorio'); return; }
    if (!stockForm.quantidade || Number(stockForm.quantidade) <= 0) { toast.error('Quantidade invalida'); return; }
    if (!stockForm.valor_pago || parseMoneyInput(stockForm.valor_pago) <= 0) { toast.error('Valor pago invalido'); return; }
    try {
      setSavingStock(true);
      const payload = {
        ...stockForm,
        quantidade: parseFloat(stockForm.quantidade),
        valor_pago: parseMoneyInput(stockForm.valor_pago),
      };
      if (editStockItem) {
        await api.put(`/admin/stock-items/${editStockItem.uuid}`, payload);
        toast.success('Insumo atualizado!');
      } else {
        await api.post('/admin/stock-items', payload);
        toast.success('Insumo criado!');
      }
      setStockDialog(false);
      fetchAll();
    } catch (e) {
      toast.error('Erro ao salvar insumo');
    } finally {
      setSavingStock(false);
    }
  };
  const deleteStockItem = async (uuid) => {
    openConfirmDialog({
      title: 'Remover insumo',
      description: 'Esse insumo sera removido e tambem saira das fichas tecnicas vinculadas.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/stock-items/${uuid}`);
          toast.success('Insumo removido!');
          fetchAll();
        } catch (e) {
          toast.error('Erro ao remover insumo');
        }
      },
    });
  };
  const toggleStockItemActive = async (item) => {
    try {
      await api.put(`/admin/stock-items/${item.uuid}`, { ativo: !item.ativo });
      fetchAll();
    } catch (e) {
      toast.error('Erro ao atualizar insumo');
    }
  };

  // Recipe CRUD
  const openRecipeManager = (product) => {
    setRecipeManagerProduct(product);
    setEditRecipe(null);
    setRecipeStockSearch('');
    setRecipeForm({
      ...emptyRecipeForm,
      product_uuid: product.uuid,
    });
  };
  const openNewRecipe = (productUuid = '') => {
    setEditRecipe(null);
    setRecipeStockSearch('');
    setRecipeForm({
      ...emptyRecipeForm,
      product_uuid: productUuid,
    });
    setRecipeDialog(true);
  };
  const openEditRecipe = (recipe) => {
    setEditRecipe(recipe);
    setRecipeForm({
      product_uuid: recipe.product_uuid || '',
      stock_item_uuid: recipe.stock_item_uuid || '',
      quantidade_utilizada: String(recipe.quantidade_utilizada ?? ''),
    });
    setRecipeDialog(true);
  };
  const addRecipeToCurrentProduct = async () => {
    if (!recipeManagerProduct?.uuid) { toast.error('Selecione um produto'); return; }
    if (!recipeForm.stock_item_uuid) { toast.error('Selecione um insumo'); return; }
    if (!recipeForm.quantidade_utilizada || Number(recipeForm.quantidade_utilizada) <= 0) { toast.error('Quantidade utilizada invalida'); return; }
    try {
      setSavingRecipe(true);
      await api.post('/admin/product-recipes', {
        product_uuid: recipeManagerProduct.uuid,
        stock_item_uuid: recipeForm.stock_item_uuid,
        quantidade_utilizada: parseFloat(recipeForm.quantidade_utilizada),
      });
      toast.success('Insumo vinculado ao produto!');
      setRecipeStockSearch('');
      setRecipeForm({
        ...emptyRecipeForm,
        product_uuid: recipeManagerProduct.uuid,
      });
      fetchAll();
    } catch (e) {
      toast.error('Erro ao salvar ficha tecnica');
    } finally {
      setSavingRecipe(false);
    }
  };
  const saveRecipe = async () => {
    if (!recipeForm.product_uuid) { toast.error('Selecione um produto'); return; }
    if (!recipeForm.stock_item_uuid) { toast.error('Selecione um insumo'); return; }
    if (!recipeForm.quantidade_utilizada || Number(recipeForm.quantidade_utilizada) <= 0) { toast.error('Quantidade utilizada invalida'); return; }
    try {
      setSavingRecipe(true);
      const payload = {
        ...recipeForm,
        quantidade_utilizada: parseFloat(recipeForm.quantidade_utilizada),
      };
      if (editRecipe) {
        await api.put(`/admin/product-recipes/${editRecipe.uuid}`, payload);
        toast.success('Ficha tecnica atualizada!');
      } else {
        await api.post('/admin/product-recipes', payload);
        toast.success('Insumo vinculado ao produto!');
      }
      setRecipeDialog(false);
      fetchAll();
    } catch (e) {
      toast.error('Erro ao salvar ficha tecnica');
    } finally {
      setSavingRecipe(false);
    }
  };
  const deleteRecipe = async (uuid) => {
    openConfirmDialog({
      title: 'Remover item da ficha tecnica',
      description: 'Esse insumo deixara de ser usado nesse produto.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/product-recipes/${uuid}`);
          toast.success('Item removido da ficha tecnica!');
          fetchAll();
        } catch (e) {
          toast.error('Erro ao remover item da ficha tecnica');
        }
      },
    });
  };

  const openNewCashEntry = () => {
    setEditCashEntry(null);
    setCashForm({
      ...emptyCashEntry,
      data_lancamento: new Date().toISOString().slice(0, 10),
    });
    setCashDialog(true);
  };
  const openEditCashEntry = (entry) => {
    const parsedObservation = parseCashObservation(entry.observacao);
    setEditCashEntry(entry);
    setCashForm({
      tipo: entry.tipo || 'entrada',
      categoria: entry.categoria || 'outros',
      descricao: entry.descricao || '',
      valor: toMoneyInput(entry.valor),
      forma_pagamento: entry.forma_pagamento || '',
      data_lancamento: String(entry.data_lancamento || '').slice(0, 10),
      observacao: parsedObservation.displayObservation || '',
    });
    setCashDialog(true);
  };
  const saveCashEntry = async () => {
    if (!cashForm.descricao.trim()) { toast.error('Descricao e obrigatoria'); return; }
    if (!cashForm.valor || parseMoneyInput(cashForm.valor) <= 0) { toast.error('Valor invalido'); return; }
    try {
      setSavingCash(true);
      const existingObservation = editCashEntry ? parseCashObservation(editCashEntry.observacao) : null;
      const payload = {
        ...cashForm,
        valor: parseMoneyInput(cashForm.valor),
        data_lancamento: cashForm.data_lancamento || new Date().toISOString().slice(0, 10),
        observacao: existingObservation?.metadata
          ? buildCashObservation(cashForm.observacao, existingObservation.metadata)
          : cashForm.observacao,
      };
      if (editCashEntry) {
        await api.put(`/admin/cash-entries/${editCashEntry.uuid}`, payload);
        toast.success('Lancamento atualizado!');
      } else {
        await api.post('/admin/cash-entries', payload);
        toast.success('Lancamento criado!');
      }
      setCashDialog(false);
      fetchAll();
    } catch (e) {
      toast.error('Erro ao salvar lancamento');
    } finally {
      setSavingCash(false);
    }
  };
  const deleteCashEntry = async (uuid) => {
    openConfirmDialog({
      title: 'Remover lancamento',
      description: 'Esse lancamento sera removido do caixa.',
      actionLabel: 'Remover',
      tone: 'destructive',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/cash-entries/${uuid}`);
          toast.success('Lancamento removido!');
          fetchAll();
        } catch (e) {
          toast.error('Erro ao remover lancamento');
        }
      },
    });
  };

  const openIfoodImport = () => {
    setIfoodImportForm({
      fileName: '',
    });
    setIfoodImportFile(null);
    setIfoodImportDialog(true);
  };

  const openWhatsappImport = () => {
    setWhatsappImportForm({
      date: '',
      rawText: '',
    });
    setWhatsappImportDialog(true);
  };

  const parseCurrencyText = (value) => {
    const match = String(value ?? '').match(/R\$\s*([\d.,]+)/i);
    if (!match) return 0;
    return Number(match[1].replace(/\./g, '').replace(',', '.')) || 0;
  };

  const parseWhatsappOrders = (rawText) => {
    const text = String(rawText || '').trim();
    if (!text) {
      return { orders: [], total: 0, productCounts: {}, parsedDate: '' };
    }

    const headingRegex = /^(?:####\s*NOVO PEDIDO\s*####|PEDIDO AGENDADO|NOVO PEDIDO)$/gim;
    const matches = [...text.matchAll(headingRegex)];
    const blocks = matches.length > 0
      ? matches.map((match, index) => {
          const start = match.index ?? 0;
          const end = index + 1 < matches.length
            ? (matches[index + 1].index ?? text.length)
            : text.length;
          return text.slice(start, end).trim();
        }).filter(Boolean)
      : [text];

    const orders = blocks.map((block) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const finalLine = lines.find((line) => /^(VALOR FINAL|Total):/i.test(line));
      const freightLine = lines.find((line) => /^FRETE:/i.test(line));
      const paymentLine = lines.find((line) => (
        /^Pagamento:/i.test(line)
        || /^(Pix|Dinheiro|Cart[aã]o|Cr[eé]dito|D[eé]bito)/i.test(line)
      ));
      const itemLines = lines.filter((line) => /^\d+\s*x\s+.+/i.test(line) && !/R\$\s*/i.test(line));
      const orderNumberLine = lines.find((line) => (/N[ºo°]?\s*pedido:/i.test(line) || /^Pedido\s*n[ºo°]/i.test(line)));
      const createdAtLine = lines.find((line) => (
        /^feito em /i.test(line)
        || /^\d{2}\/\d{2}\/\d{4}\s+as\s+\d{2}:\d{2}$/i.test(line)
      ));

      const items = itemLines.map((line) => {
        const match = line.match(/^(\d+)\s*x\s+(.+)$/i);
        if (!match) return null;
        return {
          quantity: Number(match[1]) || 0,
          name: match[2].trim(),
        };
      }).filter(Boolean);

      const total = parseCurrencyText(finalLine);
      const freight = parseCurrencyText(freightLine);
      const parsedPaymentMethod = paymentLine
        ? (/^Pagamento:/i.test(paymentLine)
            ? paymentLine.replace(/^Pagamento:\s*/i, '').trim()
            : paymentLine.split(':')[0].trim())
        : 'WhatsApp';

      return {
        orderNumber: orderNumberLine
          ? orderNumberLine
              .replace(/^Pedido\s*n[ºo°]\s*/i, '')
              .replace(/.*:\s*/i, '')
              .trim()
          : '',
        createdAt: createdAtLine
          ? createdAtLine
              .replace(/^feito em\s*/i, '')
              .trim()
          : '',
        total,
        freight,
        netTotal: Math.max(0, total - freight),
        paymentMethod: parsedPaymentMethod || 'WhatsApp',
        items,
      };
    }).filter((order) => order.total > 0);

    const total = orders.reduce((acc, order) => acc + order.netTotal, 0);
    const productCounts = {};
    const firstOrderDate = orders.find((order) => /\d{2}\/\d{2}\/\d{4}/.test(order.createdAt || ''))?.createdAt || '';
    const parsedDateMatch = firstOrderDate.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    const parsedDate = parsedDateMatch
      ? `${parsedDateMatch[3]}-${parsedDateMatch[2]}-${parsedDateMatch[1]}`
      : '';

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = normalizeCatalogText(item.name);
        productCounts[key] = (productCounts[key] || 0) + item.quantity;
      });
    });

    return { orders, total, productCounts, parsedDate };
  };

  const importIfoodSales = async () => {
    if (!ifoodImportFile) {
      toast.error('Selecione a planilha do iFood para importar');
      return;
    }

    try {
      setSavingIfoodImport(true);
      const formData = new FormData();
      formData.append('file', ifoodImportFile);
      const response = await api.post('/admin/imports/ifood-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const parsedOrders = Array.isArray(response.data?.orders) ? response.data.orders : [];
      const existingIds = getImportedOrderIds('ifood');
      const uniqueOrders = parsedOrders.filter((order) => {
        const uniqueId = order.id || order.orderId;
        return uniqueId && !existingIds.has(String(uniqueId));
      });

      if (uniqueOrders.length === 0) {
        toast.error('Nenhum pedido novo encontrado nessa planilha');
        return;
      }

      const ordersByDate = uniqueOrders.reduce((acc, order) => {
        const targetDate = order.parsedDate;
        if (!targetDate) return acc;
        if (!acc[targetDate]) acc[targetDate] = [];
        acc[targetDate].push(order);
        return acc;
      }, {});

      const dates = Object.keys(ordersByDate);
      if (dates.length === 0) {
        toast.error('Nao foi possivel identificar datas validas na planilha');
        return;
      }

      for (const targetDate of dates) {
        const orders = ordersByDate[targetDate];
        const total = orders.reduce((acc, order) => acc + (Number(order.net) || 0), 0);
        const existingEntry = cashEntries.find((entry) => (
          entry.tipo === 'entrada'
          && entry.descricao === 'Vendas iFood'
          && String(entry.data_lancamento || '').slice(0, 10) === targetDate
        ));

        const importNote = `Importado do iFood: ${orders.length} pedido(s) somando ${formatPrice(total)} em ${targetDate}.`;
        const batchDetails = {
          channel: 'ifood',
          importedAt: new Date().toISOString(),
          fileName: ifoodImportFile.name,
          date: targetDate,
          total,
          orderCount: orders.length,
          orders,
        };

        if (existingEntry) {
          const existingObservation = parseCashObservation(existingEntry.observacao);
          const mergedMetadata = {
            channel: 'ifood',
            batches: [...(existingObservation.metadata?.batches || []), batchDetails],
          };

          await api.put(`/admin/cash-entries/${existingEntry.uuid}`, {
            valor: Number(existingEntry.valor || 0) + total,
            observacao: buildCashObservation(importNote, mergedMetadata),
          });
        } else {
          await api.post('/admin/cash-entries', {
            tipo: 'entrada',
            categoria: 'venda',
            descricao: 'Vendas iFood',
            valor: total,
            forma_pagamento: 'iFood',
            data_lancamento: targetDate,
            observacao: buildCashObservation(importNote, {
              channel: 'ifood',
              batches: [batchDetails],
            }),
          });
        }
      }

      setIfoodImportFile(null);
      setIfoodImportDialog(false);
      toast.success(`${uniqueOrders.length} pedido(s) novos do iFood importados`);
      fetchAll();
    } catch (e) {
      toast.error('Erro ao importar vendas do iFood');
    } finally {
      setSavingIfoodImport(false);
    }
  };

  const importWhatsappSales = async () => {
    if (!whatsappImportForm.rawText.trim()) {
      toast.error('Cole o texto dos pedidos do WhatsApp para importar');
      return;
    }

    const { orders, total, parsedDate } = parseWhatsappOrders(whatsappImportForm.rawText);
    if (orders.length === 0 || total <= 0) {
      toast.error('Nao foi possivel encontrar pedidos validos no texto');
      return;
    }
    if (!parsedDate) {
      toast.error('Nao foi possivel identificar a data automaticamente no texto do WhatsApp');
      return;
    }

    try {
      setSavingWhatsappImport(true);

      const targetDate = parsedDate;
      const existingEntry = cashEntries.find((entry) => (
        entry.tipo === 'entrada'
        && entry.descricao === 'Vendas WhatsApp'
        && String(entry.data_lancamento || '').slice(0, 10) === targetDate
      ));

      const paymentSummary = orders.reduce((acc, order) => {
        const key = order.paymentMethod || 'WhatsApp';
        acc[key] = (acc[key] || 0) + order.total;
        return acc;
      }, {});

      const paymentLabel = Object.entries(paymentSummary)
        .map(([method, amount]) => `${method}: ${formatPrice(amount)}`)
        .join(', ');

      const importNote = `Importado do WhatsApp: ${orders.length} pedido(s) somando ${formatPrice(total)} em ${targetDate}. ${paymentLabel}`;
      const batchDetails = {
        channel: 'whatsapp',
        importedAt: new Date().toISOString(),
        date: targetDate,
        total,
        orderCount: orders.length,
        orders,
      };

      if (existingEntry) {
        const existingObservation = parseCashObservation(existingEntry.observacao);
        const mergedMetadata = {
          channel: 'whatsapp',
          batches: [...(existingObservation.metadata?.batches || []), batchDetails],
        };

        await api.put(`/admin/cash-entries/${existingEntry.uuid}`, {
          valor: Number(existingEntry.valor || 0) + total,
          observacao: buildCashObservation(importNote, mergedMetadata),
          forma_pagamento: paymentLabel || existingEntry.forma_pagamento,
        });
      } else {
        await api.post('/admin/cash-entries', {
          tipo: 'entrada',
          categoria: 'venda',
          descricao: 'Vendas WhatsApp',
          valor: total,
          forma_pagamento: paymentLabel || 'WhatsApp',
          data_lancamento: targetDate,
          observacao: buildCashObservation(importNote, {
            channel: 'whatsapp',
            batches: [batchDetails],
          }),
        });
      }

      setWhatsappImportDialog(false);
      toast.success(`Pedidos do WhatsApp importados para ${targetDate}`);
      fetchAll();
    } catch (e) {
      toast.error('Erro ao importar pedidos do WhatsApp');
    } finally {
      setSavingWhatsappImport(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSavingSettings(true);
      const payload = {
        whatsapp: settings.whatsapp.trim(),
        delivery_time: settings.delivery_time.trim(),
        business_hours: settings.business_hours.trim(),
        promotion_product_uuid: settings.promotion_product_uuid || null,
        promotion_price: settings.promotion_product_uuid && settings.promotion_price
          ? parseMoneyInput(settings.promotion_price)
          : null,
        promotion_active: Boolean(settings.promotion_active && settings.promotion_product_uuid && settings.promotion_price),
      };
      await api.put('/admin/settings', payload);
      setGlobalSettings({
        ...payload,
        promotion_price: payload.promotion_price,
        promotion_active: payload.promotion_active,
      });
      refreshSettings();
      toast.success('Configuracoes atualizadas!');
    } catch (e) {
      toast.error('Erro ao salvar configuracoes');
    } finally {
      setSavingSettings(false);
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin do Catálogo</h1>
          <p className="text-sm text-muted-foreground mt-1">Disponível apenas em desenvolvimento</p>
        </div>
        <Badge variant="secondary">DEV</Badge>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos ({products.length})</TabsTrigger>
          <TabsTrigger value="combos">Combos ({combos.length})</TabsTrigger>
          <TabsTrigger value="addons">Adicionais ({addons.length})</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos ({paymentMethods.length})</TabsTrigger>
          <TabsTrigger value="cash">Caixa ({cashEntries.length})</TabsTrigger>
          <TabsTrigger value="settings">Loja</TabsTrigger>
          <TabsTrigger value="promotion">Promocao do Dia</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewProduct}><Plus className="h-4 w-4" /> Novo Produto</Button>
          </div>
          <div className="space-y-2">
            {products.map(p => (
              <Card key={p.uuid}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                    {p.foto ? <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{p.nome}</h3>
                      <Badge variant="secondary" className="text-[10px] shrink-0">{p.categoria}</Badge>
                      {!p.ativo && <Badge variant="outline" className="text-[10px] shrink-0">Inativo</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(p.preco)}
                      {p.desconto > 0 && <span className="text-promo-badge ml-2">-{p.desconto}%</span>}
                      <span className="ml-2">• {p.vendas} vendas</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={p.ativo} onCheckedChange={() => toggleProductActive(p)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditProduct(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(p.uuid)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Combos Tab */}
        <TabsContent value="combos">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewCombo}><Plus className="h-4 w-4" /> Novo Combo</Button>
          </div>
          <div className="space-y-2">
            {combos.map(c => (
              <Card key={c.uuid}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                    {c.foto ? <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{c.nome}</h3>
                      {!c.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(c.valor)}
                      {c.desconto > 0 && <span className="text-promo-badge ml-2">-{c.desconto}%</span>}
                      <span className="ml-2">• {c.vendas} vendas</span>
                      <span className="ml-2">• {(c.produto_ids || []).length} produtos</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={c.ativo} onCheckedChange={() => toggleComboActive(c)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditCombo(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCombo(c.uuid)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewAddon}><Plus className="h-4 w-4" /> Novo Adicional</Button>
          </div>
          <div className="space-y-2">
            {addons.map(addon => (
              <Card key={addon.uuid}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{addon.nome}</h3>
                      {!addon.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatPrice(addon.preco)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={addon.ativo} onCheckedChange={() => toggleAddonActive(addon)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditAddon(addon)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAddon(addon.uuid)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <div className="space-y-6">
            <div className="flex justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-semibold text-foreground">Fichas tecnicas do cardapio</h2>
                <p className="text-sm text-muted-foreground">
                  Clique em um item para abrir a ficha tecnica e gerenciar os insumos usados nele.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStockLibraryDialog(true)}>Visualizar insumos</Button>
                <Button variant="outline" onClick={openNewStockItem}><Plus className="h-4 w-4" /> Novo Insumo</Button>
              </div>
            </div>

            <div className="grid gap-3">
              {catalogProductsForStock.length === 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
                  </CardContent>
                </Card>
              )}
              {catalogProductsForStock.map(product => {
                const summary = productCostMap[product.uuid];
                const recipeCount = summary?.items.length || 0;
                return (
                  <Card
                    key={product.uuid}
                    className="cursor-pointer transition-colors hover:border-primary/40"
                    onClick={() => openRecipeManager(product)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                        {product.foto ? <img src={product.foto} alt={product.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground truncate">{product.nome}</h3>
                          {!product.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{recipeCount} insumo(s) cadastrados</p>
                        <p className="text-sm text-muted-foreground">
                          Custo estimado: <span className="font-semibold text-foreground">{formatPrice(summary?.total_cost || 0)}</span>
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); openRecipeManager(product); }}>
                        Gerenciar ficha
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Insumos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stockItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum insumo cadastrado ainda.</p>
                )}
                {stockItems.map(item => (
                  <Card key={item.uuid}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground">{item.nome}</h3>
                          {!item.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                          <Badge variant="secondary" className="text-[10px]">kg</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {Number(item.quantidade)} kg • pago {formatPrice(item.valor_pago)} • custo por kg {formatPrice(item.custo_unitario)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch checked={item.ativo} onCheckedChange={() => toggleStockItemActive(item)} />
                        <Button variant="ghost" size="icon" onClick={() => openEditStockItem(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteStockItem(item.uuid)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="hidden">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Fichas Tecnicas por Produto</CardTitle>
                <Button onClick={() => openNewRecipe()}><Plus className="h-4 w-4" /> Vincular Insumo</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {productCostSummaries.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma ficha tecnica cadastrada ainda.</p>
                )}
                {productCostSummaries.map(summary => (
                  <Card key={summary.product_uuid}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{summary.product_nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            Custo estimado do produto: <span className="font-semibold text-foreground">{formatPrice(summary.total_cost)}</span>
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openNewRecipe(summary.product_uuid)}>
                          <Plus className="h-4 w-4" />
                          Adicionar insumo
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {summary.items.map(recipe => (
                          <div key={recipe.uuid} className="flex items-center gap-3 rounded-md border border-border p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{recipe.stock_item_nome}</p>
                              <p className="text-xs text-muted-foreground">
                                Usa {Number(recipe.quantidade_utilizada)} g • custo estimado {formatPrice(recipe.custo_estimado)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="ghost" size="icon" onClick={() => openEditRecipe(recipe)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRecipe(recipe.uuid)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments">
          <div className="flex justify-end mb-4">
            <Button onClick={openNewPM}><Plus className="h-4 w-4" /> Nova Forma de Pagamento</Button>
          </div>
          <div className="space-y-2">
            {paymentMethods.map(pm => (
              <Card key={pm.uuid}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{pm.nome}</h3>
                      {!pm.ativo && <Badge variant="outline" className="text-[10px]">Inativa</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={pm.ativo} onCheckedChange={() => togglePMActive(pm)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditPM(pm)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePM(pm.uuid)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cash">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Tipo</Label>
                  <Select value={cashTypeFilter} onValueChange={setCashTypeFilter}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entrada">Entradas</SelectItem>
                      <SelectItem value="saida">Saidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">De</Label>
                  <Input type="date" value={cashDateFrom} onChange={e => setCashDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Ate</Label>
                  <Input type="date" value={cashDateTo} onChange={e => setCashDateTo(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setCashTypeFilter('todos'); setCashDateFrom(''); setCashDateTo(''); }}>
                  Limpar filtros
                </Button>
                <Button variant="outline" onClick={openIfoodImport}>
                  <Upload className="h-4 w-4" />
                  Importar iFood
                </Button>
                <Button variant="outline" onClick={openWhatsappImport}>
                  <Upload className="h-4 w-4" />
                  Importar WhatsApp
                </Button>
                <Button onClick={openNewCashEntry}><Plus className="h-4 w-4" /> Novo Lancamento</Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <ArrowUpCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entradas</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(cashSummary.entradas)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <ArrowDownCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saidas</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(cashSummary.saidas)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className="text-lg font-bold text-foreground">{formatPrice(cashSummary.saldo)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Vendas iFood</p>
                  <p className="mt-1 text-base font-bold text-foreground">{formatPrice(channelSalesSummary.ifood)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Vendas WhatsApp</p>
                  <p className="mt-1 text-base font-bold text-foreground">{formatPrice(channelSalesSummary.whatsapp)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              {filteredCashEntries.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground text-center">
                    Nenhum lancamento encontrado para os filtros atuais.
                  </CardContent>
                </Card>
              )}

              {Object.entries(groupedCashEntries).map(([dateKey, entries]) => (
                <div key={dateKey} className="space-y-2">
                  <div className="sticky top-0 z-10 rounded-md bg-muted px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
                      {dateKey === 'Sem data'
                        ? dateKey
                        : new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                    </p>
                  </div>

                  {entries.map(renderCashEntryCard)}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuracoes da Loja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">WhatsApp</Label>
                <Input
                  value={settings.whatsapp}
                  onChange={e => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="5535998160726"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Prazo de entrega</Label>
                <Input
                  value={settings.delivery_time}
                  onChange={e => setSettings(prev => ({ ...prev, delivery_time: e.target.value }))}
                  placeholder="40 min"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Horarios</Label>
                <Textarea
                  value={settings.business_hours}
                  onChange={e => setSettings(prev => ({ ...prev, business_hours: e.target.value }))}
                  placeholder={"Seg a Sex: 18:00 - 23:00\nSab e Dom: 17:00 - 00:00"}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Use uma linha para cada horario que deve aparecer no footer.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar configuracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotion">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Promocao do Dia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.promotion_active}
                    onCheckedChange={value => setSettings(prev => ({ ...prev, promotion_active: value }))}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Promocao ativa</p>
                    <p className="text-xs text-muted-foreground">Ative ou pause a promocao do dia sem perder a configuracao.</p>
                  </div>
                </div>

                {selectedPromotionProduct ? (
                  <div className="rounded-md border border-border bg-muted/40 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedPromotionProduct.nome}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Preco atual: {formatPrice(calculateItemPrice(selectedPromotionProduct.preco, selectedPromotionProduct.desconto || 0))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Promocao do dia: {settings.promotion_price || '0,00'} {settings.promotion_active ? 'ativa no cardapio.' : 'pronta para ativar.'}
                        </p>
                      </div>
                      <Button variant="outline" onClick={clearPromotionSettings}>
                        Remover promocao
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Nenhum produto selecionado para a promocao do dia.
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Preco promocional (R$)</Label>
                  <Input
                    inputMode="numeric"
                    value={settings.promotion_price}
                    onChange={e => setSettings(prev => ({ ...prev, promotion_price: formatMoneyInput(e.target.value) }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar promocao
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escolher produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {products
                  .filter(product => product.ativo && product.categoria !== 'Bebidas')
                  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                  .map(product => {
                    const discountedPrice = calculateItemPrice(product.preco, product.desconto || 0);
                    const isSelected = settings.promotion_product_uuid === product.uuid;

                    return (
                      <div key={product.uuid} className="flex items-center gap-3 rounded-md border border-border p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{product.nome}</p>
                            {isSelected && <Badge variant="promo" className="text-[10px]">Atual</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Preco atual no cardapio: {formatPrice(discountedPrice)}
                          </p>
                        </div>
                        <Button
                          variant={isSelected ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => applyPromotionProduct(product)}
                        >
                          {isSelected ? 'Selecionado' : 'Usar na promocao'}
                        </Button>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={prodDialog} onOpenChange={(open) => { if (!open) closeProductDialog(); else setProdDialog(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-sm">Nome</Label><Input value={prodForm.nome} onChange={e => setProdForm(p => ({ ...p, nome: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm">Descrição</Label><Textarea value={prodForm.descricao} onChange={e => setProdForm(p => ({ ...p, descricao: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Preço (R$)</Label><Input inputMode="numeric" value={prodForm.preco} onChange={e => setProdForm(p => ({ ...p, preco: formatMoneyInput(e.target.value) }))} placeholder="0,00" /></div>
              <div className="space-y-1.5"><Label className="text-sm">Desconto (%)</Label><Input type="number" value={prodForm.desconto} onChange={e => setProdForm(p => ({ ...p, desconto: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Imagem do Produto</Label>
              {(productImagePreview || prodForm.foto) && (
                <div className="h-32 w-full overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={productImagePreview || prodForm.foto}
                    alt={prodForm.nome || 'Preview do produto'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleProductImageChange} />
              <p className="text-xs text-muted-foreground">
                Se selecionar um arquivo, ele sera enviado para dentro do sistema e substituira a imagem atual ao salvar.
              </p>
              <Input
                value={prodForm.foto}
                onChange={e => setProdForm(p => ({ ...p, foto: e.target.value }))}
                placeholder="/images/... ou https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Categoria</Label><Input value={prodForm.categoria} onChange={e => setProdForm(p => ({ ...p, categoria: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm">Vendas</Label><Input type="number" value={prodForm.vendas} onChange={e => setProdForm(p => ({ ...p, vendas: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={prodForm.ativo} onCheckedChange={v => setProdForm(p => ({ ...p, ativo: v }))} /><Label className="text-sm">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeProductDialog}>Cancelar</Button>
            <Button onClick={saveProduct} disabled={savingProduct}>
              {savingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={comboDialog} onOpenChange={(open) => { if (!open) closeComboDialog(); else setComboDialog(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCombo ? 'Editar Combo' : 'Novo Combo'}</DialogTitle>
            <DialogDescription>Preencha os dados do combo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-sm">Nome</Label><Input value={comboForm.nome} onChange={e => setComboForm(p => ({ ...p, nome: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm">Descrição</Label><Textarea value={comboForm.descricao} onChange={e => setComboForm(p => ({ ...p, descricao: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Valor (R$)</Label><Input inputMode="numeric" value={comboForm.valor} onChange={e => setComboForm(p => ({ ...p, valor: formatMoneyInput(e.target.value) }))} placeholder="0,00" /></div>
              <div className="space-y-1.5"><Label className="text-sm">Desconto (%)</Label><Input type="number" value={comboForm.desconto} onChange={e => setComboForm(p => ({ ...p, desconto: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Imagem do Combo</Label>
              {(comboImagePreview || comboForm.foto) && (
                <div className="h-32 w-full overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={comboImagePreview || comboForm.foto}
                    alt={comboForm.nome || 'Preview do combo'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleComboImageChange} />
              <p className="text-xs text-muted-foreground">
                Se selecionar um arquivo, ele sera enviado para dentro do sistema e substituira a imagem atual ao salvar.
              </p>
              <Input
                value={comboForm.foto}
                onChange={e => setComboForm(p => ({ ...p, foto: e.target.value }))}
                placeholder="/images/... ou https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Produtos incluídos</Label>
              <div className="border border-border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {products.map(p => (
                  <label key={p.uuid} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={(comboForm.produto_ids || []).includes(p.uuid)} onChange={() => toggleProductInCombo(p.uuid)} className="rounded border-border" />
                    <span className="text-foreground">{p.nome}</span>
                    <span className="text-muted-foreground ml-auto">{formatPrice(p.preco)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm">Vendas</Label><Input type="number" value={comboForm.vendas} onChange={e => setComboForm(p => ({ ...p, vendas: e.target.value }))} /></div>
            <div className="flex items-center gap-3"><Switch checked={comboForm.ativo} onCheckedChange={v => setComboForm(p => ({ ...p, ativo: v }))} /><Label className="text-sm">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeComboDialog}>Cancelar</Button>
            <Button onClick={saveCombo} disabled={savingCombo}>
              {savingCombo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={pmDialog} onOpenChange={setPmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editPM ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</DialogTitle>
            <DialogDescription>Nome que aparecerá no checkout</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Nome</Label>
              <Input value={pmForm.nome} onChange={e => setPmForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Pix, Cartão de crédito..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={pmForm.ativo} onCheckedChange={v => setPmForm(p => ({ ...p, ativo: v }))} />
              <Label className="text-sm">Ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPmDialog(false)}>Cancelar</Button>
            <Button onClick={savePM}><Save className="h-4 w-4" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addonDialog} onOpenChange={setAddonDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editAddon ? 'Editar Adicional' : 'Novo Adicional'}</DialogTitle>
            <DialogDescription>Defina nome, preco e status do adicional</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Nome</Label>
              <Input value={addonForm.nome} onChange={e => setAddonForm(a => ({ ...a, nome: e.target.value }))} placeholder="Ex: Bacon" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Preço (R$)</Label>
              <Input inputMode="numeric" value={addonForm.preco} onChange={e => setAddonForm(a => ({ ...a, preco: formatMoneyInput(e.target.value) }))} placeholder="0,00" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={addonForm.ativo} onCheckedChange={v => setAddonForm(a => ({ ...a, ativo: v }))} />
              <Label className="text-sm">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddonDialog(false)}>Cancelar</Button>
            <Button onClick={saveAddon}><Save className="h-4 w-4" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stockDialog} onOpenChange={setStockDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editStockItem ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
            <DialogDescription>Cadastre o que foi comprado para calcular custo por produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Nome do insumo</Label>
              <Input value={stockForm.nome} onChange={e => setStockForm(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex: Catupiry" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Quantidade comprada em kg</Label>
                <Input type="number" step="0.001" value={stockForm.quantidade} onChange={e => setStockForm(prev => ({ ...prev, quantidade: e.target.value }))} placeholder="Ex: 1 ou 0.500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Unidade</Label>
                <Input value="kg" disabled />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Valor pago (R$)</Label>
              <Input inputMode="numeric" value={stockForm.valor_pago} onChange={e => setStockForm(prev => ({ ...prev, valor_pago: formatMoneyInput(e.target.value) }))} placeholder="0,00" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={stockForm.ativo} onCheckedChange={v => setStockForm(prev => ({ ...prev, ativo: v }))} />
              <Label className="text-sm">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(false)}>Cancelar</Button>
            <Button onClick={saveStockItem} disabled={savingStock}>
              {savingStock ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(recipeManagerProduct)} onOpenChange={(open) => { if (!open) setRecipeManagerProduct(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{recipeManagerProduct?.nome || 'Ficha tecnica'}</DialogTitle>
            <DialogDescription>
              Veja os insumos usados nesse item e adicione novos componentes quando precisar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">
                  Preco cadastrado: <span className="font-semibold text-foreground">{formatPrice(recipeManagerProduct?.preco || 0)}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedProductRecipes.length} insumo(s) vinculados
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={openNewStockItem}>
                  <Plus className="h-4 w-4" />
                  Novo insumo
                </Button>
                <Button variant="outline" onClick={() => setStockLibraryDialog(true)}>
                  Exibir insumos
                </Button>
              </div>
            </div>

            {selectedProductMargin && (
              <Card>
                <CardContent className="grid gap-3 p-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Custo estimado</p>
                    <p className="text-sm font-semibold text-foreground">{formatPrice(selectedProductMargin.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Margem em reais</p>
                    <p className="text-sm font-semibold text-foreground">{formatPrice(selectedProductMargin.profit)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Margem percentual</p>
                    <p className="text-sm font-semibold text-foreground">{selectedProductMargin.percent.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Buscar insumo</Label>
                  <Input
                    value={recipeStockSearch}
                    onChange={e => setRecipeStockSearch(e.target.value)}
                    placeholder="Digite para buscar um insumo"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-end">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Insumo</Label>
                    <Select value={recipeForm.stock_item_uuid} onValueChange={value => setRecipeForm(prev => ({ ...prev, product_uuid: recipeManagerProduct?.uuid || prev.product_uuid, stock_item_uuid: value }))}>
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Selecione um insumo" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStockItems.map(item => (
                          <SelectItem key={item.uuid} value={item.uuid}>
                            {item.nome} (kg)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Quantidade (g)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={recipeForm.quantidade_utilizada}
                      onChange={e => setRecipeForm(prev => ({ ...prev, product_uuid: recipeManagerProduct?.uuid || prev.product_uuid, quantidade_utilizada: e.target.value }))}
                      placeholder="Ex: 120"
                    />
                  </div>
                  <Button onClick={addRecipeToCurrentProduct} disabled={savingRecipe} className="md:self-end">
                    {savingRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {selectedProductRecipes.length === 0 && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhum insumo vinculado ainda para esse produto.
                    </p>
                  </CardContent>
                </Card>
              )}
              {selectedProductRecipes.map(recipe => (
                <div key={recipe.uuid} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{recipe.stock_item_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Usa {Number(recipe.quantidade_utilizada)} g • custo estimado {formatPrice(recipe.custo_estimado)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditRecipe(recipe)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRecipe(recipe.uuid)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipeManagerProduct(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stockLibraryDialog} onOpenChange={setStockLibraryDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insumos cadastrados</DialogTitle>
            <DialogDescription>
              Edite quantidade comprada e valor pago sempre que fizer uma nova compra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {stockItems.length === 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Nenhum insumo cadastrado ainda.</p>
                </CardContent>
              </Card>
            )}
            {stockItems.map(item => (
              <div key={item.uuid} className="flex items-center gap-3 rounded-md border border-border p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{item.nome}</p>
                    {!item.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Number(item.quantidade)} kg • pago {formatPrice(item.valor_pago)} • custo por kg {formatPrice(item.custo_unitario)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.ativo} onCheckedChange={() => toggleStockItemActive(item)} />
                  <Button variant="ghost" size="icon" onClick={() => openEditStockItem(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteStockItem(item.uuid)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockLibraryDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recipeDialog} onOpenChange={setRecipeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRecipe ? 'Editar quantidade do insumo' : 'Vincular Insumo ao Produto'}</DialogTitle>
            <DialogDescription>
              {editRecipe ? 'Ajuste apenas a quantidade usada nesse produto.' : 'Defina quanto de cada insumo vai em cada produto'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Produto</Label>
              <Input
                value={recipeManagerProduct?.nome || products.find(product => product.uuid === recipeForm.product_uuid)?.nome || ''}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Insumo</Label>
              <Input
                value={stockItems.find(item => item.uuid === recipeForm.stock_item_uuid)?.nome || ''}
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Quantidade usada no produto em gramas</Label>
              <Input type="number" step="0.01" value={recipeForm.quantidade_utilizada} onChange={e => setRecipeForm(prev => ({ ...prev, quantidade_utilizada: e.target.value }))} placeholder="Ex: 120" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipeDialog(false)}>Cancelar</Button>
            <Button onClick={saveRecipe} disabled={savingRecipe}>
              {savingRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cashDialog} onOpenChange={setCashDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCashEntry ? 'Editar Lancamento' : 'Novo Lancamento'}</DialogTitle>
            <DialogDescription>Registre entradas e saidas do caixa manualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Tipo</Label>
                <Select value={cashForm.tipo} onValueChange={value => setCashForm(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Categoria</Label>
                <Select value={cashForm.categoria} onValueChange={value => setCashForm(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cashCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Descricao</Label>
              <Input value={cashForm.descricao} onChange={e => setCashForm(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Ex: Recebimento pix do dia" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Valor (R$)</Label>
                <Input inputMode="numeric" value={cashForm.valor} onChange={e => setCashForm(prev => ({ ...prev, valor: formatMoneyInput(e.target.value) }))} placeholder="0,00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Forma de pagamento</Label>
                <Input value={cashForm.forma_pagamento} onChange={e => setCashForm(prev => ({ ...prev, forma_pagamento: e.target.value }))} placeholder="Pix, Dinheiro, Cartao..." />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Data</Label>
              <Input type="date" value={cashForm.data_lancamento} onChange={e => setCashForm(prev => ({ ...prev, data_lancamento: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Observacao</Label>
              <Textarea value={cashForm.observacao} onChange={e => setCashForm(prev => ({ ...prev, observacao: e.target.value }))} rows={3} placeholder="Detalhes adicionais do lancamento" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCashDialog(false)}>Cancelar</Button>
            <Button onClick={saveCashEntry} disabled={savingCash}>
              {savingCash ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ifoodImportDialog} onOpenChange={setIfoodImportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar vendas do iFood</DialogTitle>
            <DialogDescription>
              Envie a planilha `.xlsx` do iFood. Os pedidos serao agrupados por dia e pedidos repetidos pelo mesmo ID nao serao contabilizados duas vezes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Arquivo do iFood</Label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setIfoodImportFile(file);
                  setIfoodImportForm({ fileName: file?.name || '' });
                }}
              />
              <p className="text-xs text-muted-foreground">
                {ifoodImportForm.fileName
                  ? `Arquivo selecionado: ${ifoodImportForm.fileName}`
                  : 'Selecione a planilha exportada do iFood.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIfoodImportDialog(false)}>Cancelar</Button>
            <Button onClick={importIfoodSales} disabled={savingIfoodImport}>
              {savingIfoodImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={whatsappImportDialog} onOpenChange={setWhatsappImportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar pedidos do WhatsApp</DialogTitle>
            <DialogDescription>
              Cole o texto dos pedidos. O sistema vai somar o valor final, lancar no caixa e atualizar as vendas dos itens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Texto do WhatsApp</Label>
              <Textarea
                value={whatsappImportForm.rawText}
                onChange={e => setWhatsappImportForm(prev => ({ ...prev, rawText: e.target.value }))}
                rows={18}
                placeholder={`#### NOVO PEDIDO ####

Nº pedido: 3
feito em 18/04/2026 20:09

Thales
35992147338

2 x Batata Recheada De Frango Com Catupiry
1 x Batata Recheada De Brocolis Com Queijo

VALOR FINAL: R$ 86,68

PAGAMENTO
Pix: R$ 86,68`}
              />
              <p className="text-xs text-muted-foreground">
                A data sera lida automaticamente da linha "feito em ...". Se ja existir um lancamento "Vendas WhatsApp" nessa data, o valor sera somado ao existente e as vendas dos itens serao atualizadas.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappImportDialog(false)}>Cancelar</Button>
            <Button onClick={importWhatsappSales} disabled={savingWhatsappImport}>
              {savingWhatsappImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => { if (!open) closeConfirmDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>Cancelar</Button>
            <Button
              variant={confirmDialog.tone === 'destructive' ? 'destructive' : 'default'}
              onClick={runConfirmDialog}
            >
              {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
