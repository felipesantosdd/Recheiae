import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dbPath = path.join(rootDir, 'backend', 'catalog.db');
const snapshotDir = path.join(rootDir, 'frontend', 'src', 'data');
const publicSnapshotDir = path.join(rootDir, 'frontend', 'public', 'snapshot');
const snapshotPath = path.join(snapshotDir, 'catalogSnapshot.json');
const metadataPath = path.join(publicSnapshotDir, 'build-metadata.json');
const publicDbPath = path.join(publicSnapshotDir, 'catalog.db');
const IMPORT_METADATA_PREFIX = '__IMPORT_METADATA__';

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function rowToRecord(row) {
  const record = { ...row };
  if ('ativo' in record) {
    record.ativo = Boolean(record.ativo);
  }
  return record;
}

function normalizeCatalogText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function parseCashObservation(value) {
  const raw = String(value || '');
  if (!raw.startsWith(IMPORT_METADATA_PREFIX)) {
    return null;
  }

  const newlineIndex = raw.indexOf('\n');
  const metadataText = newlineIndex >= 0
    ? raw.slice(IMPORT_METADATA_PREFIX.length, newlineIndex)
    : raw.slice(IMPORT_METADATA_PREFIX.length);

  try {
    return JSON.parse(metadataText);
  } catch {
    return null;
  }
}

function getTopProducts(products, db) {
  const activeFoodProducts = products.filter((item) => item.ativo && item.categoria !== 'Bebidas');
  const salesBySlug = {};

  try {
    const cashEntries = db
      .prepare("SELECT observacao FROM cash_entries WHERE descricao IN ('Vendas WhatsApp', 'Vendas iFood')")
      .all();

    cashEntries.forEach((entry) => {
      const metadata = parseCashObservation(entry.observacao);
      (metadata?.batches || []).forEach((batch) => {
        (batch.orders || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            const slug = normalizeCatalogText(item.name);
            const quantity = Number(item.quantity) || 0;
            if (!slug || quantity <= 0) return;
            salesBySlug[slug] = (salesBySlug[slug] || 0) + quantity;
          });
        });
      });
    });
  } catch {
    return [];
  }

  return activeFoodProducts
    .map((item) => ({
      ...item,
      sold_count: salesBySlug[normalizeCatalogText(item.nome)] || 0,
    }))
    .filter((item) => item.sold_count > 0)
    .sort((a, b) => {
      if (b.sold_count !== a.sold_count) return b.sold_count - a.sold_count;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    })
    .slice(0, 3);
}

function exportSnapshotFromDb(databaseFile) {
  const db = new DatabaseSync(databaseFile, { open: true });

  try {
    const products = db
      .prepare('SELECT * FROM products ORDER BY categoria, nome')
      .all()
      .map(rowToRecord);

    const combos = db
      .prepare('SELECT * FROM combos ORDER BY nome')
      .all()
      .map((row) => {
        const record = rowToRecord(row);
        record.produto_ids = JSON.parse(record.produto_ids || '[]');
        return record;
      });

    const paymentMethods = db
      .prepare('SELECT * FROM payment_methods ORDER BY nome')
      .all()
      .map(rowToRecord);

    const addons = db
      .prepare('SELECT * FROM addons ORDER BY nome')
      .all()
      .map(rowToRecord);

    let settings = null;
    try {
      settings =
        db
          .prepare('SELECT whatsapp, delivery_time, business_hours FROM store_settings WHERE id = 1')
          .get() || null;
    } catch {
      settings = null;
    }

    const activeProducts = products.filter((item) => item.ativo);
    const activeCombos = combos.filter((item) => item.ativo);
    const activePaymentMethods = paymentMethods.filter((item) => item.ativo);
    const activeAddons = addons.filter((item) => item.ativo);
    const categories = [...new Set(activeProducts.map((item) => item.categoria))].sort();
    const topProducts = getTopProducts(products, db);

    return {
      generatedAt: new Date().toISOString(),
      products,
      activeProducts,
      topProducts,
      combos,
      activeCombos,
      paymentMethods,
      activePaymentMethods,
      addons,
      activeAddons,
      settings,
      categories,
    };
  } finally {
    db.close();
  }
}

async function main() {
  await mkdir(snapshotDir, { recursive: true });
  await mkdir(publicSnapshotDir, { recursive: true });

  const dbExists = await exists(dbPath);
  const metadata = {
    builtAt: new Date().toISOString(),
    dbPath,
    dbCopied: false,
    snapshotExported: false,
    snapshotError: null,
    dbPublicPath: null,
  };

  if (!dbExists) {
    metadata.snapshotError = 'catalog.db nao encontrado';
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('catalog.db nao encontrado. Preservando snapshot atual.');
    return;
  }

  await copyFile(dbPath, publicDbPath);
  metadata.dbCopied = true;
  metadata.dbPublicPath = '/snapshot/catalog.db';
  console.log(`Banco copiado para ${publicDbPath}`);

  try {
    const snapshot = exportSnapshotFromDb(dbPath);
    await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    metadata.snapshotExported = true;
    metadata.snapshotBytes = (await readFile(snapshotPath)).byteLength;
    console.log(`Snapshot gerado em ${snapshotPath}`);
  } catch (error) {
    metadata.snapshotError = error instanceof Error ? error.message : String(error);
    console.warn('Falha ao exportar snapshot do SQLite. Snapshot anterior foi preservado.');
  }

  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Metadata atualizada em ${metadataPath}`);
}

main().catch((error) => {
  console.error('Falha ao preparar snapshot estatico:', error);
  process.exit(1);
});
