/**
 * Smart Grocery Retail Management and Payment System
 * Standalone Production Server
 * Course: BCSE302P - Database Systems (Lab Project)
 *
 * To run:
 *   npx tsx server.ts
 */

import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import { app } from './src/backend/expressApp.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Serve static frontend assets from dist folder if built
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send('Server running. For development, use: npm run dev');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Smart Grocery Retail Management and Payment System   `);
  console.log(` University Lab Final Project (BCSE302P)             `);
  console.log(` Student: Ankur Anil Jadhav (24BDS0162)               `);
  console.log(` Server running on http://localhost:${PORT}          `);
  console.log(` Oracle DB ACID Transaction Engine Active             `);
  console.log(`=======================================================`);
});
