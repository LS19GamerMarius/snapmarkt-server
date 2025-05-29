const express = require('express');
const cors = require('cors');
const scraper = require('./services/scrapers');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize scraper on server start
scraper.initialize().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await scraper.close();
  process.exit(0);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    const results = await scraper.searchAllSupermarkets(search);
    res.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Scraping server running on port ${port}`);
}); 