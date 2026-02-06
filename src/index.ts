import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const appViews = path.join(__dirname, 'views');

const app = express();
const port = 8080;
const booksApiUrl = 'http://localhost:3000/api/books';

type Book = {
  book_id: number;
  title: string;
  isbn: string;
  genre: string;
  publication_year: number;
  description: string;
  total_copies: number;
  available_copies: number;
  authors: string[];
};

const nunjucksConfig = {
  autoescape: true,
  noCache: true,
  express: app,
};

app.set('view engine', 'njk');
app.set('views', appViews);

const nunjucksEnv = nunjucks.configure(
  [appViews, path.join(projectRoot, 'node_modules/govuk-frontend/dist')],
  nunjucksConfig
);
nunjucksEnv.addGlobal('govukRebrand', true);

app.get('/', async (req: Request, res: Response) => {
  try {
    const response = await fetch(booksApiUrl, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Books API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const books: Book[] = payload?.success && Array.isArray(payload.data) ? payload.data : [];

    res.render('homepage', {
      books,
      apiError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';

    res.render('homepage', {
      books: [],
      apiError: message,
    });
  }
});

app.use('/govuk', express.static(
  path.join(projectRoot, 'node_modules/govuk-frontend/dist/govuk')
));

app.use('/assets', express.static(
  path.join(projectRoot, 'node_modules/govuk-frontend/dist/govuk/assets')
));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});