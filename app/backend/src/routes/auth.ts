import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const authRouter = Router();

// ── In-memory users (будет заменена на PostgreSQL) ────────
interface User {
  id: string;
  email: string;
  password: string; // В продакшне — bcrypt hash
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

const users: User[] = [
  {
    id: uuidv4(),
    email: 'admin@beer.local',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
];

// POST /api/auth/register — регистрация
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ success: false, error: { message: 'email, password и name обязательны' } });
    return;
  }

  if (users.find(u => u.email === email)) {
    res.status(409).json({ success: false, error: { message: 'Пользователь с таким email уже существует' } });
    return;
  }

  const user: User = {
    id: uuidv4(),
    email,
    password, // TODO: bcrypt hash
    name,
    role: 'user',
    created_at: new Date().toISOString(),
  };

  users.push(user);

  res.status(201).json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// POST /api/auth/login — авторизация
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: { message: 'email и password обязательны' } });
    return;
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ success: false, error: { message: 'Неверный email или пароль' } });
    return;
  }

  // TODO: JWT token
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: `mock-jwt-token-${user.id}`,
    },
  });
});
