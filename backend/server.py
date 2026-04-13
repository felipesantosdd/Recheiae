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
    conn.commit()
    cur.execute("SELECT COUNT(*) as cnt FROM products")
    if cur.fetchone()['cnt'] == 0:
        seed_data(conn)
    conn.close()

def seed_data(conn):
    cur = conn.cursor()
    products = [
        ("prod-001", "Pizza Margherita G", "Molho de tomate especial, mussarela de búfala, manjericão fresco e azeite extra virgem", 49.90, 0, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop", "Pizzas", 120, 1),
        ("prod-002", "Pizza Calabresa Acebolada G", "Calabresa selecionada fatiada com cebola fresca, orégano e mussarela gratinada sobre massa artesanal", 54.90, 10, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", "Pizzas", 200, 1),
        ("prod-003", "Pizza Frango Catupiry G", "Frango desfiado temperado, catupiry cremoso, milho e orégano com mussarela", 59.90, 0, "https://images.pexels.com/photos/28484142/pexels-photo-28484142.jpeg?auto=compress&cs=tinysrgb&w=400", "Pizzas", 180, 1),
        ("prod-004", "Pizza Portuguesa G", "Presunto, ovo, cebola, azeitona, ervilha, mussarela e orégano", 54.90, 0, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop&crop=top", "Pizzas", 95, 1),
        ("prod-005", "Pizza 4 Queijos G", "Mussarela, provolone, gorgonzola e parmesão sobre massa artesanal crocante", 64.90, 15, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&crop=center", "Pizzas", 150, 1),
        ("prod-006", "Pizza Pepperoni G", "Pepperoni fatiado importado, mussarela especial e molho de tomate italiano", 59.90, 0, "https://images.pexels.com/photos/28484142/pexels-photo-28484142.jpeg?auto=compress&cs=tinysrgb&w=400&h=300", "Pizzas", 110, 1),
        ("prod-007", "Refrigerante 2 Litros", "Coca-Cola, Guaraná ou Fanta - escolha na observação", 14.00, 0, "https://images.unsplash.com/photo-1632996988606-274cfd06eb68?w=400&h=300&fit=crop", "Bebidas", 300, 1),
        ("prod-008", "Suco Natural 500ml", "Laranja, limão, maracujá ou abacaxi - feito na hora", 12.00, 0, "https://images.pexels.com/photos/4113669/pexels-photo-4113669.jpeg?auto=compress&cs=tinysrgb&w=400", "Bebidas", 80, 1),
        ("prod-009", "Água Mineral 500ml", "Água mineral sem gás gelada", 5.00, 0, "https://images.unsplash.com/photo-1653122024753-d7322d90b3d7?w=400&h=300&fit=crop", "Bebidas", 250, 1),
        ("prod-010", "Petit Gateau", "Bolo quente de chocolate com sorvete de creme e calda especial", 24.90, 20, "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop", "Sobremesas", 70, 1),
        ("prod-011", "Brownie com Sorvete", "Brownie artesanal quentinho com sorvete de creme e calda", 22.90, 0, "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop", "Sobremesas", 60, 1),
        ("prod-012", "Batata Frita Crocante", "Porção generosa de batata frita sequinha e crocante com molho especial", 19.90, 0, "https://images.unsplash.com/photo-1502998070258-dc1338445ac2?w=400&h=300&fit=crop", "Porções", 130, 1),
        ("prod-013", "Bolinha de Queijo 12un", "Bolinhas de queijo crocantes recheadas com catupiry cremoso", 18.90, 0, "https://images.unsplash.com/photo-1550367363-ea12860cc124?w=400&h=300&fit=crop", "Porções", 90, 1),
        ("prod-014", "Refrigerante Lata 350ml", "Coca-Cola, Guaraná, Fanta ou Sprite gelada", 7.00, 0, "https://images.pexels.com/photos/31336111/pexels-photo-31336111.jpeg?auto=compress&cs=tinysrgb&w=400", "Bebidas", 350, 1),
    ]
    for p in products:
        cur.execute("INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?)", p)
    combos = [
        ("combo-001", "Combo Família", "Pizza Calabresa G + Refrigerante 2L. Ideal para a família toda!", json.dumps(["prod-002", "prod-007"]), 59.90, 5, 150, "https://images.unsplash.com/photo-1734988353291-9ac67fa5997b?w=400&h=300&fit=crop", 1),
        ("combo-002", "Combo Casal", "Pizza Margherita G + 2 Sucos Naturais. Perfeito para dois!", json.dumps(["prod-001", "prod-008"]), 55.90, 0, 100, "https://images.unsplash.com/photo-1763689389824-dd2cea2e5772?w=400&h=300&fit=crop", 1),
        ("combo-003", "Combo Completo", "Pizza Pepperoni G + Batata Frita + Refrigerante 2L", json.dumps(["prod-006", "prod-012", "prod-007"]), 79.90, 10, 80, "https://images.unsplash.com/photo-1651440204227-a9a5b9d19712?w=400&h=300&fit=crop", 1),
    ]
    for c in combos:
        cur.execute("INSERT INTO combos VALUES (?,?,?,?,?,?,?,?,?)", c)
    conn.commit()
    logger.info("Database seeded with sample data")

# Public routes
@api_router.get("/")
def root():
    return {"message": "Sabor Express API"}

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
