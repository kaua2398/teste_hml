import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Caminho da pasta dist (ajuste se o nome do projeto Angular mudar)
const distFolder = path.join(__dirname, 'dist', 'timesheet-valeshop', 'browser');

// Middleware para servir os arquivos estáticos
app.use(express.static(distFolder, {
  setHeaders: (res, filePath) => {
    // Cache control para arquivos estáticos
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Fallback: Handle SPA routing by sending index.html for non-file GET requests
app.use((req, res, next) => {
  // Check if it's a GET request and if the client accepts HTML
  if (req.method === 'GET' && req.accepts('html') && !req.path.includes('.')) {
     // If it looks like a route request (no file extension), send index.html
    res.sendFile(path.join(distFolder, 'index.html'));
  } else {
     // Otherwise, let other middleware/handlers handle it (like 404)
    next();
  }
});


// Porta padrão
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Angular app rodando em http://localhost:${PORT}`);
});

