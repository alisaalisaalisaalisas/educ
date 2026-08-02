import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const cartRouter = Router();

// ── In-memory carts (будет заменён на Redis) ──────────────
interface CartItem {
  beer_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

const carts: Map<string, Cart> = new Map();

// Утилита для пересчёта total
function recalcTotal(cart: Cart): void {
  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// GET /api/cart — получить корзину (по session/user id в хедере)
cartRouter.get('/', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const cart = carts.get(userId) || { id: uuidv4(), items: [], total: 0 };

  res.json({ success: true, data: cart });
});

// POST /api/cart — добавить товар в корзину
cartRouter.post('/', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const { beer_id, name, price, quantity = 1 } = req.body;

  if (!beer_id || !name || !price) {
    res.status(400).json({ success: false, error: { message: 'beer_id, name и price обязательны' } });
    return;
  }

  let cart = carts.get(userId);
  if (!cart) {
    cart = { id: uuidv4(), items: [], total: 0 };
    carts.set(userId, cart);
  }

  const existing = cart.items.find(item => item.beer_id === beer_id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ beer_id, name, price, quantity });
  }

  recalcTotal(cart);

  res.status(201).json({ success: true, data: cart });
});

// DELETE /api/cart/:beerId — удалить товар из корзины
cartRouter.delete('/:beerId', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const cart = carts.get(userId);

  if (!cart) {
    res.status(404).json({ success: false, error: { message: 'Корзина не найдена' } });
    return;
  }

  cart.items = cart.items.filter(item => item.beer_id !== req.params.beerId);
  recalcTotal(cart);

  res.json({ success: true, data: cart });
});
