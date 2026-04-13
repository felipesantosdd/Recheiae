import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Save, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/calculations';

const emptyProduct = {
  nome: '', descricao: '', preco: '', desconto: '0',
  foto: '', categoria: 'Batatas Recheadas', vendas: '0', ativo: true,
};

const emptyCombo = {
  nome: '', descricao: '', valor: '', desconto: '0',
  foto: '', vendas: '0', ativo: true, produto_ids: [],
};

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prodDialog, setProdDialog] = useState(false);
  const [comboDialog, setComboDialog] = useState(false);
  const [pmDialog, setPmDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editCombo, setEditCombo] = useState(null);
  const [editPM, setEditPM] = useState(null);
  const [prodForm, setProdForm] = useState({ ...emptyProduct });
  const [comboForm, setComboForm] = useState({ ...emptyCombo });
  const [pmForm, setPmForm] = useState({ nome: '', ativo: true });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [pRes, cRes, pmRes] = await Promise.all([
        api.get('/products/all'),
        api.get('/combos/all'),
        api.get('/payment-methods/all'),
      ]);
      setProducts(pRes.data);
      setCombos(cRes.data);
      setPaymentMethods(pmRes.data);
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD
  const openNewProduct = () => { setEditProduct(null); setProdForm({ ...emptyProduct }); setProdDialog(true); };
  const openEditProduct = (p) => {
    setEditProduct(p);
    setProdForm({
      nome: p.nome, descricao: p.descricao || '', preco: String(p.preco),
      desconto: String(p.desconto || 0), foto: p.foto || '',
      categoria: p.categoria, vendas: String(p.vendas || 0), ativo: p.ativo,
    });
    setProdDialog(true);
  };
  const saveProduct = async () => {
    const payload = { ...prodForm, preco: parseFloat(prodForm.preco), desconto: parseFloat(prodForm.desconto) || 0, vendas: parseInt(prodForm.vendas) || 0 };
    try {
      if (editProduct) { await api.put(`/admin/products/${editProduct.uuid}`, payload); toast.success('Produto atualizado!'); }
      else { await api.post('/admin/products', payload); toast.success('Produto criado!'); }
      setProdDialog(false); fetchAll();
    } catch (e) { toast.error('Erro ao salvar produto'); }
  };
  const deleteProduct = async (uuid) => {
    if (!window.confirm('Remover este produto?')) return;
    try { await api.delete(`/admin/products/${uuid}`); toast.success('Produto removido!'); fetchAll(); }
    catch (e) { toast.error('Erro ao remover'); }
  };
  const toggleProductActive = async (p) => {
    try { await api.put(`/admin/products/${p.uuid}`, { ativo: !p.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar'); }
  };

  // Combo CRUD
  const openNewCombo = () => { setEditCombo(null); setComboForm({ ...emptyCombo }); setComboDialog(true); };
  const openEditCombo = (c) => {
    setEditCombo(c);
    setComboForm({
      nome: c.nome, descricao: c.descricao || '', valor: String(c.valor),
      desconto: String(c.desconto || 0), foto: c.foto || '',
      vendas: String(c.vendas || 0), ativo: c.ativo, produto_ids: c.produto_ids || [],
    });
    setComboDialog(true);
  };
  const saveCombo = async () => {
    const payload = { ...comboForm, valor: parseFloat(comboForm.valor), desconto: parseFloat(comboForm.desconto) || 0, vendas: parseInt(comboForm.vendas) || 0 };
    try {
      if (editCombo) { await api.put(`/admin/combos/${editCombo.uuid}`, payload); toast.success('Combo atualizado!'); }
      else { await api.post('/admin/combos', payload); toast.success('Combo criado!'); }
      setComboDialog(false); fetchAll();
    } catch (e) { toast.error('Erro ao salvar combo'); }
  };
  const deleteCombo = async (uuid) => {
    if (!window.confirm('Remover este combo?')) return;
    try { await api.delete(`/admin/combos/${uuid}`); toast.success('Combo removido!'); fetchAll(); }
    catch (e) { toast.error('Erro ao remover'); }
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
    if (!window.confirm('Remover esta forma de pagamento?')) return;
    try { await api.delete(`/admin/payment-methods/${uuid}`); toast.success('Removida!'); fetchAll(); }
    catch (e) { toast.error('Erro ao remover'); }
  };
  const togglePMActive = async (pm) => {
    try { await api.put(`/admin/payment-methods/${pm.uuid}`, { ativo: !pm.ativo }); fetchAll(); }
    catch (e) { toast.error('Erro ao atualizar'); }
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
          <TabsTrigger value="payments">Pagamentos ({paymentMethods.length})</TabsTrigger>
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
                      {pm.nome.toLowerCase() === 'pix' && <Badge variant="success" className="text-[10px]">-R$ 10</Badge>}
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
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={prodDialog} onOpenChange={setProdDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>Preencha os dados do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-sm">Nome</Label><Input value={prodForm.nome} onChange={e => setProdForm(p => ({ ...p, nome: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm">Descrição</Label><Textarea value={prodForm.descricao} onChange={e => setProdForm(p => ({ ...p, descricao: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Preço (R$)</Label><Input type="number" step="0.01" value={prodForm.preco} onChange={e => setProdForm(p => ({ ...p, preco: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm">Desconto (%)</Label><Input type="number" value={prodForm.desconto} onChange={e => setProdForm(p => ({ ...p, desconto: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm">URL da Foto</Label><Input value={prodForm.foto} onChange={e => setProdForm(p => ({ ...p, foto: e.target.value }))} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Categoria</Label><Input value={prodForm.categoria} onChange={e => setProdForm(p => ({ ...p, categoria: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm">Vendas</Label><Input type="number" value={prodForm.vendas} onChange={e => setProdForm(p => ({ ...p, vendas: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={prodForm.ativo} onCheckedChange={v => setProdForm(p => ({ ...p, ativo: v }))} /><Label className="text-sm">Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdDialog(false)}>Cancelar</Button>
            <Button onClick={saveProduct}><Save className="h-4 w-4" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={comboDialog} onOpenChange={setComboDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCombo ? 'Editar Combo' : 'Novo Combo'}</DialogTitle>
            <DialogDescription>Preencha os dados do combo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-sm">Nome</Label><Input value={comboForm.nome} onChange={e => setComboForm(p => ({ ...p, nome: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label className="text-sm">Descrição</Label><Textarea value={comboForm.descricao} onChange={e => setComboForm(p => ({ ...p, descricao: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-sm">Valor (R$)</Label><Input type="number" step="0.01" value={comboForm.valor} onChange={e => setComboForm(p => ({ ...p, valor: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-sm">Desconto (%)</Label><Input type="number" value={comboForm.desconto} onChange={e => setComboForm(p => ({ ...p, desconto: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-sm">URL da Foto</Label><Input value={comboForm.foto} onChange={e => setComboForm(p => ({ ...p, foto: e.target.value }))} placeholder="https://..." /></div>
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
            <Button variant="outline" onClick={() => setComboDialog(false)}>Cancelar</Button>
            <Button onClick={saveCombo}><Save className="h-4 w-4" /> Salvar</Button>
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
    </div>
  );
}
