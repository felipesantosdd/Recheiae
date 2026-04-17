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

    const activeProducts = products.filter((item) => item.ativo);
    const activeCombos = combos.filter((item) => item.ativo);
    const activePaymentMethods = paymentMethods.filter((item) => item.ativo);
    const activeAddons = addons.filter((item) => item.ativo);
    const categories = [...new Set(activeProducts.map((item) => item.categoria))].sort();

    return {
      generatedAt: new Date().toISOString(),
      products,
      activeProducts,
      combos,
      activeCombos,
      paymentMethods,
      activePaymentMethods,
      addons,
      activeAddons,
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
