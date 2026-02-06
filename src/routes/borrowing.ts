import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('borrowing', {
    activePage: 'borrowing',
  });
});

export default router;
