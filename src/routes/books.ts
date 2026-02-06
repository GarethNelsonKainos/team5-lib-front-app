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
  try {
    const response = await fetch(booksApiUrl);
    const books: Book[] = await response.json();

    res.render('books', {
      activePage: 'books',
      books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Error fetching books');
  }
});

export default router;
