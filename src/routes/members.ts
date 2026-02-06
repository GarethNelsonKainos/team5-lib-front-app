import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('members', {
    activePage: 'members',
  });
});

export default router;
