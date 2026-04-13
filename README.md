# Here are your Instructions
## Deploy estatico

O projeto agora funciona assim:

- em desenvolvimento, o frontend usa a API local do `backend`
- no build, o frontend exporta um snapshot do `backend/catalog.db`
- em producao, as rotas publicas usam o snapshot embutido no bundle
- a area admin continua disponivel apenas em desenvolvimento

### Build

```bash
npm run build:front
```

Durante o build, o script `scripts/export-catalog-snapshot.mjs`:

- le o `backend/catalog.db`
- gera `frontend/src/data/catalogSnapshot.json`
- copia o banco para `frontend/public/snapshot/catalog.db`

Se o banco nao puder ser lido, o snapshot atual e preservado para nao quebrar o deploy.
