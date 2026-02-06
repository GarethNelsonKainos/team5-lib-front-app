import { Router, Request, Response } from 'express';

const router = Router();
const booksApiUrl = 'http://localhost:3000/api/books';
const PAGE_SIZE = 10;

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

// GET /books - List with search, sort, pagination
router.get('/', async (req: Request, res: Response) => {
  const searchQuery = (req.query.q as string) || '';
  const sortBy = (req.query.sort as string) || 'title';
  const page = parseInt((req.query.page as string) || '1', 10);

  try {
    const response = await fetch(booksApiUrl, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Books API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    let books: Book[] = payload?.success && Array.isArray(payload.data) ? payload.data : [];

    // Filter by search query
    if (searchQuery) {
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'author':
        books.sort((a, b) => a.authors[0]?.localeCompare(b.authors[0] || '') || 0);
        break;
      case 'published':
        books.sort((a, b) => b.publication_year - a.publication_year);
        break;
      case 'availability':
        books.sort((a, b) => b.available_copies - a.available_copies);
        break;
      case 'title':
      default:
        books.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Paginate
    const totalBooks = books.length;
    const totalPages = Math.ceil(totalBooks / PAGE_SIZE);
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedBooks = books.slice(startIdx, startIdx + PAGE_SIZE);

    res.render('books', {
      activePage: 'books',
      books: paginatedBooks,
      searchQuery,
      sortBy,
      currentPage: page,
      totalPages,
      apiError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';

    res.render('books', {
      activePage: 'books',
      books: [],
      searchQuery,
      sortBy,
      currentPage: 1,
      totalPages: 1,
      apiError: message,
    });
  }
});

// GET /books/:id - Book detail page
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const response = await fetch(booksApiUrl, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Books API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const books: Book[] = payload?.success && Array.isArray(payload.data) ? payload.data : [];
    const book = books.find((b) => b.book_id === parseInt(id, 10));

    if (!book) {
      return res.status(404).render('404', { message: 'Book not found' });
    }

    res.render('book-detail', {
      activePage: 'books',
      book,
      apiError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';

    res.render('book-detail', {
      activePage: 'books',
      book: {},
      apiError: message,
    });
  }
});

// GET /books/:id/edit - Edit form page
router.get('/:id/edit', async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const response = await fetch(booksApiUrl, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Books API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const books: Book[] = payload?.success && Array.isArray(payload.data) ? payload.data : [];
    const book = books.find((b) => b.book_id === parseInt(id, 10));

    if (!book) {
      return res.status(404).render('404', { message: 'Book not found' });
    }

    res.render('book-edit', {
      activePage: 'books',
      book,
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';

    res.render('book-edit', {
      activePage: 'books',
      book: {},
      error: message,
    });
  }
});

// POST /books/:id/update - Save edited book
router.post('/:id/update', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { title, authors, genre, isbn, publication_year, total_copies, available_copies, description } = req.body;

  try {
    const bookData = {
      title,
      authors: (authors as string).split(',').map((a) => a.trim()),
      genre,
      isbn,
      publication_year: parseInt(publication_year as string, 10),
      total_copies: parseInt(total_copies as string, 10),
      available_copies: parseInt(available_copies as string, 10),
      description,
    };

    const updateResponse = await fetch(`http://localhost:3000/api/books/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update book: ${updateResponse.statusText}`);
    }

    res.redirect(`/books/${id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.render('book-edit', {
      activePage: 'books',
      book: { book_id: parseInt(id, 10), ...req.body },
      error: message,
    });
  }
});

// POST /books/:id/delete - Delete book
router.post('/:id/delete', async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const deleteResponse = await fetch(`http://localhost:3000/api/books/${id}`, {
      method: 'DELETE',
      headers: { accept: 'application/json' },
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete book: ${deleteResponse.statusText}`);
    }

    res.redirect('/books');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    res.render('books', {
      activePage: 'books',
      books: [],
      searchQuery: '',
      sortBy: 'title',
      currentPage: 1,
      totalPages: 1,
      apiError: `Delete failed: ${message}`,
    });
  }
});

export default router;
