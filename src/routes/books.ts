import { Router, Request, Response } from 'express';

const router = Router();
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

router.get('/', async (req: Request, res: Response) => {
  const searchQuery = req.query.q as string | undefined;

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

    res.render('books', {
      activePage: 'books',
      books,
      searchQuery: searchQuery || '',
      apiError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';

    res.render('books', {
      activePage: 'books',
      books: [],
      searchQuery: searchQuery || '',
      apiError: message,
    });
  }
});

export default router;
