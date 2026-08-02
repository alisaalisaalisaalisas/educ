import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const ordersRouter = Router();

// ── In-memory orders ─────────────────────────────────────
interface OrderItem {
  beer_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

const orders: Order[] = [];

// GET /api/orders — список заказов пользователя
ordersRouter.get('/', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const userOrders = orders.filter(o => o.user_id === userId);

  res.json({ success: true, count: userOrders.length, data: userOrders });
});

// GET /api/orders/:id — детали заказа
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ success: false, error: { message: 'Заказ не найден' } });
    return;
  }

  res.json({ success: true, data: order });
});

// POST /api/orders — оформить заказ
ordersRouter.post('/', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || 'anonymous';
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: { message: 'items обязателен (массив товаров)' } });
    return;
  }

  const total = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0);

  const order: Order = {
    id: uuidv4(),
    user_id: userId,
    items,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  orders.push(order);

  res.status(201).json({ success: true, data: order });
});
