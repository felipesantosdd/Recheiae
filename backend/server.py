from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sqlite3
import json
import uuid as uuid_lib
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

DB_PATH = ROOT_DIR / "catalog.db"
IS_DEVELOPMENT = os.environ.get('IS_DEVELOPMENT', 'true').lower() == 'true'

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# SQLite helpers
def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    if 'ativo' in d:
        d['ativo'] = bool(d['ativo'])
    return d

# Pydantic models
class ProductCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float
    desconto: Optional[float] = 0
    foto: Optional[str] = None
    categoria: str
    vendas: Optional[int] = 0
    ativo: Optional[bool] = True

class ProductUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco: Optional[float] = None
    desconto: Optional[float] = None
    foto: Optional[str] = None
    categoria: Optional[str] = None
    vendas: Optional[int] = None
    ativo: Optional[bool] = None

class ComboCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    produto_ids: Optional[List[str]] = []
    valor: float
    desconto: Optional[float] = 0
    vendas: Optional[int] = 0
    foto: Optional[str] = None
    ativo: Optional[bool] = True

class ComboUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    produto_ids: Optional[List[str]] = None
    valor: Optional[float] = None
    desconto: Optional[float] = None
    vendas: Optional[int] = None
    foto: Optional[str] = None
    ativo: Optional[bool] = None

class PaymentMethodCreate(BaseModel):
    nome: str
    ativo: Optional[bool] = True

class PaymentMethodUpdate(BaseModel):
    nome: Optional[str] = None
    ativo: Optional[bool] = None

# Database initialization
def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''CREATE TABLE IF NOT EXISTS products (
        uuid TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL,
        desconto REAL DEFAULT 0,
        foto TEXT,
        categoria TEXT NOT NULL,
        vendas INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS combos (
        uuid TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        produto_ids TEXT DEFAULT '[]',
        valor REAL NOT NULL,
        desconto REAL DEFAULT 0,
        vendas INTEGER DEFAULT 0,
        foto TEXT,
        ativo INTEGER DEFAULT 1
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS payment_methods (
        uuid TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        ativo INTEGER DEFAULT 1
    )''')
    conn.commit()
    cur.execute("SELECT COUNT(*) as cnt FROM products")
    if cur.fetchone()['cnt'] == 0:
        seed_data(conn)
    cur.execute("SELECT COUNT(*) as cnt FROM payment_methods")
    if cur.fetchone()['cnt'] == 0:
        seed_payment_methods(conn)
    conn.close()

def seed_payment_methods(conn):
    cur = conn.cursor()
    methods = [
        ("pm-001", "Pix", 1),
        ("pm-002", "Cartão de crédito", 1),
        ("pm-003", "Cartão de débito", 1),
        ("pm-004", "Dinheiro", 1),
    ]
    for m in methods:
        cur.execute("INSERT INTO payment_methods VALUES (?,?,?)", m)
    conn.commit()
    logger.info("Payment methods seeded")

def seed_data(conn):
    cur = conn.cursor()
    products = [
        ("prod-001", "Batata Carne Seca", "Batata recheada com carne seca desfiada, cheddar cremoso, cebola caramelizada e cebolinha", 32.90, 0, "https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=400&h=300&fit=crop", "Batatas Recheadas", 200, 1),
        ("prod-002", "Batata Frango Catupiry", "Frango desfiado temperado com catupiry original, milho e orégano", 29.90, 10, "https://images.unsplash.com/photo-1639744210631-209fce3e256c?w=400&h=300&fit=crop", "Batatas Recheadas", 180, 1),
        ("prod-003", "Batata Calabresa", "Calabresa acebolada com queijo mussarela derretido e molho especial", 28.90, 0, "https://images.unsplash.com/photo-1761712826074-5f1bab2b2f32?w=400&h=300&fit=crop", "Batatas Recheadas", 150, 1),
        ("prod-004", "Batata 4 Queijos", "Mussarela, cheddar, provolone e parmesão com creme de leite", 34.90, 15, "https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=400&h=300&fit=crop&crop=center", "Batatas Recheadas", 130, 1),
        ("prod-005", "Batata Bacon Cheddar", "Bacon crocante picado com cheddar cremoso derretido e cebolinha", 31.90, 0, "https://images.unsplash.com/photo-1639744210631-209fce3e256c?w=400&h=300&fit=crop&crop=top", "Batatas Recheadas", 170, 1),
        ("prod-006", "Batata Brócolis com Cheddar", "Brócolis cozido no vapor com cheddar cremoso e bacon bits", 30.90, 0, "https://images.unsplash.com/photo-1761712826074-5f1bab2b2f32?w=400&h=300&fit=crop&crop=center", "Batatas Recheadas", 90, 1),
        ("prod-007", "Batata Strogonoff", "Strogonoff de carne cremoso com batata palha e salsinha", 33.90, 10, "https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=400&h=300&fit=crop&crop=top", "Batatas Recheadas", 160, 1),
        ("prod-008", "Batata Vegana", "Cogumelos refogados, milho, ervilha, tomate seco e azeite trufado", 27.90, 0, "https://images.unsplash.com/photo-1639744210631-209fce3e256c?w=400&h=300&fit=crop&crop=center", "Batatas Recheadas", 60, 1),
        ("prod-009", "Refrigerante 2 Litros", "Coca-Cola, Guaraná ou Fanta - escolha na observação", 14.00, 0, "https://images.unsplash.com/photo-1632996988606-274cfd06eb68?w=400&h=300&fit=crop", "Bebidas", 300, 1),
        ("prod-010", "Suco Natural 500ml", "Laranja, limão, maracujá ou abacaxi - feito na hora", 12.00, 0, "https://images.pexels.com/photos/4113669/pexels-photo-4113669.jpeg?auto=compress&cs=tinysrgb&w=400", "Bebidas", 80, 1),
        ("prod-011", "Água Mineral 500ml", "Água mineral sem gás gelada", 5.00, 0, "https://images.unsplash.com/photo-1653122024753-d7322d90b3d7?w=400&h=300&fit=crop", "Bebidas", 250, 1),
        ("prod-012", "Refrigerante Lata 350ml", "Coca-Cola, Guaraná, Fanta ou Sprite gelada", 7.00, 0, "https://images.pexels.com/photos/31336111/pexels-photo-31336111.jpeg?auto=compress&cs=tinysrgb&w=400", "Bebidas", 350, 1),
        ("prod-013", "Petit Gateau", "Bolo quente de chocolate com sorvete de creme e calda especial", 24.90, 20, "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop", "Sobremesas", 70, 1),
        ("prod-014", "Brownie com Sorvete", "Brownie artesanal quentinho com sorvete de creme e calda", 22.90, 0, "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop", "Sobremesas", 60, 1),
    ]
    for p in products:
        cur.execute("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?)", p)
    combos = [
        ("combo-001", "Combo Recheiaê Família", "Batata Carne Seca + Batata Frango Catupiry + Refrigerante 2L", json.dumps(["prod-001", "prod-002", "prod-009"]), 69.90, 10, 150, "https://images.unsplash.com/photo-1645673197548-9adfa2ea55dc?w=400&h=300&fit=crop", 1),
        ("combo-002", "Combo Casal", "Batata Bacon Cheddar + Batata Calabresa + 2 Refri Lata", json.dumps(["prod-005", "prod-003", "prod-012"]), 59.90, 5, 100, "https://images.unsplash.com/photo-1639744210631-209fce3e256c?w=400&h=300&fit=crop", 1),
        ("combo-003", "Combo Solo", "Batata Strogonoff + Refrigerante Lata + Brownie", json.dumps(["prod-007", "prod-012", "prod-014"]), 54.90, 0, 80, "https://images.unsplash.com/photo-1761712826074-5f1bab2b2f32?w=400&h=300&fit=crop", 1),
    ]
    for c in combos:
        cur.execute("INSERT INTO combos VALUES (?,?,?,?,?,?,?,?,?)", c)
    conn.commit()
    logger.info("Database seeded with sample data")

# Public routes
@api_router.get("/")
def root():
    return {"message": "Recheiaê API"}

@api_router.get("/products")
def get_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products WHERE ativo = 1 ORDER BY vendas DESC").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@api_router.get("/products/all")
def get_all_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products ORDER BY categoria, nome").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@api_router.get("/combos")
def get_combos():
    conn = get_db()
    rows = conn.execute("SELECT * FROM combos WHERE ativo = 1 ORDER BY vendas DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = row_to_dict(r)
        d['produto_ids'] = json.loads(d.get('produto_ids') or '[]')
        result.append(d)
    return result

@api_router.get("/combos/all")
def get_all_combos():
    conn = get_db()
    rows = conn.execute("SELECT * FROM combos ORDER BY nome").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = row_to_dict(r)
        d['produto_ids'] = json.loads(d.get('produto_ids') or '[]')
        result.append(d)
    return result

@api_router.get("/categories")
def get_categories():
    conn = get_db()
    rows = conn.execute("SELECT DISTINCT categoria FROM products WHERE ativo = 1 ORDER BY categoria").fetchall()
    conn.close()
    return [r['categoria'] for r in rows]

@api_router.get("/payment-methods")
def get_payment_methods():
    conn = get_db()
    rows = conn.execute("SELECT * FROM payment_methods WHERE ativo = 1 ORDER BY nome").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

@api_router.get("/payment-methods/all")
def get_all_payment_methods():
    conn = get_db()
    rows = conn.execute("SELECT * FROM payment_methods ORDER BY nome").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

# Admin routes
@api_router.post("/admin/products")
def create_product(product: ProductCreate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    new_uuid = str(uuid_lib.uuid4())
    conn.execute(
        "INSERT INTO products (uuid, nome, descricao, preco, desconto, foto, categoria, vendas, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (new_uuid, product.nome, product.descricao, product.preco, product.desconto or 0, product.foto, product.categoria, product.vendas or 0, 1 if product.ativo else 0)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM products WHERE uuid = ?", (new_uuid,)).fetchone()
    conn.close()
    return row_to_dict(row)

@api_router.put("/admin/products/{product_uuid}")
def update_product(product_uuid: str, product: ProductUpdate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    existing = conn.execute("SELECT * FROM products WHERE uuid = ?", (product_uuid,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
    updates = {}
    for field, value in product.model_dump(exclude_unset=True).items():
        if field == 'ativo':
            updates[field] = 1 if value else 0
        else:
            updates[field] = value
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        conn.execute(f"UPDATE products SET {set_clause} WHERE uuid = ?", list(updates.values()) + [product_uuid])
        conn.commit()
    row = conn.execute("SELECT * FROM products WHERE uuid = ?", (product_uuid,)).fetchone()
    conn.close()
    return row_to_dict(row)

@api_router.delete("/admin/products/{product_uuid}")
def delete_product(product_uuid: str):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    conn.execute("DELETE FROM products WHERE uuid = ?", (product_uuid,))
    conn.commit()
    conn.close()
    return {"message": "Product deleted"}

@api_router.post("/admin/combos")
def create_combo(combo: ComboCreate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    new_uuid = str(uuid_lib.uuid4())
    conn.execute(
        "INSERT INTO combos (uuid, nome, descricao, produto_ids, valor, desconto, vendas, foto, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (new_uuid, combo.nome, combo.descricao, json.dumps(combo.produto_ids or []), combo.valor, combo.desconto or 0, combo.vendas or 0, combo.foto, 1 if combo.ativo else 0)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM combos WHERE uuid = ?", (new_uuid,)).fetchone()
    conn.close()
    d = row_to_dict(row)
    d['produto_ids'] = json.loads(d.get('produto_ids') or '[]')
    return d

@api_router.put("/admin/combos/{combo_uuid}")
def update_combo(combo_uuid: str, combo: ComboUpdate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    existing = conn.execute("SELECT * FROM combos WHERE uuid = ?", (combo_uuid,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Combo not found")
    updates = {}
    for field, value in combo.model_dump(exclude_unset=True).items():
        if field == 'ativo':
            updates[field] = 1 if value else 0
        elif field == 'produto_ids':
            updates[field] = json.dumps(value or [])
        else:
            updates[field] = value
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        conn.execute(f"UPDATE combos SET {set_clause} WHERE uuid = ?", list(updates.values()) + [combo_uuid])
        conn.commit()
    row = conn.execute("SELECT * FROM combos WHERE uuid = ?", (combo_uuid,)).fetchone()
    conn.close()
    d = row_to_dict(row)
    d['produto_ids'] = json.loads(d.get('produto_ids') or '[]')
    return d

@api_router.delete("/admin/combos/{combo_uuid}")
def delete_combo(combo_uuid: str):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    conn.execute("DELETE FROM combos WHERE uuid = ?", (combo_uuid,))
    conn.commit()
    conn.close()
    return {"message": "Combo deleted"}

# Payment methods admin
@api_router.post("/admin/payment-methods")
def create_payment_method(pm: PaymentMethodCreate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    new_uuid = str(uuid_lib.uuid4())
    conn.execute("INSERT INTO payment_methods (uuid, nome, ativo) VALUES (?, ?, ?)",
                 (new_uuid, pm.nome, 1 if pm.ativo else 0))
    conn.commit()
    row = conn.execute("SELECT * FROM payment_methods WHERE uuid = ?", (new_uuid,)).fetchone()
    conn.close()
    return row_to_dict(row)

@api_router.put("/admin/payment-methods/{pm_uuid}")
def update_payment_method(pm_uuid: str, pm: PaymentMethodUpdate):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    existing = conn.execute("SELECT * FROM payment_methods WHERE uuid = ?", (pm_uuid,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Payment method not found")
    updates = {}
    for field, value in pm.model_dump(exclude_unset=True).items():
        if field == 'ativo':
            updates[field] = 1 if value else 0
        else:
            updates[field] = value
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        conn.execute(f"UPDATE payment_methods SET {set_clause} WHERE uuid = ?", list(updates.values()) + [pm_uuid])
        conn.commit()
    row = conn.execute("SELECT * FROM payment_methods WHERE uuid = ?", (pm_uuid,)).fetchone()
    conn.close()
    return row_to_dict(row)

@api_router.delete("/admin/payment-methods/{pm_uuid}")
def delete_payment_method(pm_uuid: str):
    if not IS_DEVELOPMENT:
        raise HTTPException(status_code=403, detail="Admin not available in production")
    conn = get_db()
    conn.execute("DELETE FROM payment_methods WHERE uuid = ?", (pm_uuid,))
    conn.commit()
    conn.close()
    return {"message": "Payment method deleted"}

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
logger.info(f"Database initialized at {DB_PATH}")
logger.info(f"Development mode: {IS_DEVELOPMENT}")
