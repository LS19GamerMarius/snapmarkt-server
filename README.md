# SnapMarkt Scraping Server

This server provides real-time price comparison data by scraping various German supermarket websites.

## Supported Supermarkets

- REWE
- Lidl
- Aldi Süd
- Penny

## API Endpoints

### GET /api/products
Search for products across all supermarkets.

Query parameters:
- `search`: Product name to search for

Response format:
```json
{
  "rewe": [
    {
      "name": "Product Name",
      "price": 1.99,
      "image": "image_url",
      "unit": "per unit"
    }
  ],
  "lidl": [...],
  "aldi": [...],
  "penny": [...]
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Deployment

The server is ready to be deployed to Heroku or similar platforms:

1. Create a new app on Heroku
2. Add the following buildpacks:
   - heroku/nodejs
   - https://github.com/jontewks/puppeteer-heroku-buildpack
3. Deploy using Git or Heroku CLI

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Notes

- The server uses Puppeteer for web scraping
- All prices are in EUR
- Response times may vary depending on the supermarket websites 