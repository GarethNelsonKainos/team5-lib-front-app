import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import booksRouter from './routes/books.js';
import membersRouter from './routes/members.js';
import borrowingRouter from './routes/borrowing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const appViews = path.join(__dirname, 'views');

const app = express();
const port = 8080;

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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('homepage');
});

app.use('/books', booksRouter);
app.use('/members', membersRouter);
app.use('/borrowing', borrowingRouter);

// Static assets
app.use('/govuk', express.static(
  path.join(projectRoot, 'node_modules/govuk-frontend/dist/govuk')
));

app.use('/assets', express.static(
  path.join(projectRoot, 'node_modules/govuk-frontend/dist/govuk/assets')
));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});