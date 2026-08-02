import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const beersRouter = Router();

// ── In-memory data (будет заменена на PostgreSQL) ─────────
interface Beer {
  id: string;
  name: string;
  brand: string;
  style: string;
  abv: number;
  volume_ml: number;
  price: number;
  description: string;
  image_url: string;
  in_stock: boolean;
  created_at: string;
}

const beers: Beer[] = [
  {
    id: uuidv4(),
    name: 'Балтика №7 Экспортное',
    brand: 'Балтика',
    style: 'Lager',
    abv: 5.4,
    volume_ml: 500,
    price: 89.90,
    description: 'Классический светлый лагер с мягким вкусом и лёгкой горчинкой.',
    image_url: '/images/baltika-7.jpg',
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Guinness Draught',
    brand: 'Guinness',
    style: 'Stout',
    abv: 4.2,
    volume_ml: 440,
    price: 249.00,
    description: 'Ирландский сухой стаут с кремовой пенкой и нотками кофе.',
    image_url: '/images/guinness.jpg',
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Hoegaarden White',
    brand: 'Hoegaarden',
    style: 'Witbier',
    abv: 4.9,
    volume_ml: 330,
    price: 179.00,
    description: 'Бельгийское пшеничное пиво с кориандром и апельсиновой цедрой.',
    image_url: '/images/hoegaarden.jpg',
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'IPA Brew Dog Punk',
    brand: 'BrewDog',
    style: 'IPA',
    abv: 5.4,
    volume_ml: 330,
    price: 299.00,
    description: 'Шотландский IPA с тропическими нотами и яркой хмелевой горечью.',
    image_url: '/images/brewdog-punk.jpg',
    in_stock: true,
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Жигулёвское',
    brand: 'Жигулёвское',
    style: 'Lager',
    abv: 4.5,
    volume_ml: 500,
    price: 59.90,
    description: 'Легендарное советское пиво с чистым солодовым вкусом.',
    image_url: '/images/zhigulevskoe.jpg',
    in_stock: true,
    created_at: new Date().toISOString(),
  },
];

// GET /api/beers — список всех товаров (с фильтрацией)
beersRouter.get('/', (req: Request, res: Response) => {
  let result = [...beers];

  // Фильтрация по стилю
  if (req.query.style) {
    result = result.filter(b => b.style.toLowerCase() === (req.query.style as string).toLowerCase());
  }

  // Фильтрация по бренду
  if (req.query.brand) {
    result = result.filter(b => b.brand.toLowerCase().includes((req.query.brand as string).toLowerCase()));
  }

  // Поиск по имени
  if (req.query.search) {
    const search = (req.query.search as string).toLowerCase();
    result = result.filter(b => b.name.toLowerCase().includes(search) || b.description.toLowerCase().includes(search));
  }

  // Фильтр по цене
  if (req.query.min_price) {
    result = result.filter(b => b.price >= Number(req.query.min_price));
  }
  if (req.query.max_price) {
    result = result.filter(b => b.price <= Number(req.query.max_price));
  }

  // Сортировка
  if (req.query.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  if (req.query.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  if (req.query.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

  res.json({
    success: true,
    count: result.length,
    data: result,
  });
});

// GET /api/beers/:id — детали конкретного товара
beersRouter.get('/:id', (req: Request, res: Response) => {
  const beer = beers.find(b => b.id === req.params.id);

  if (!beer) {
    res.status(404).json({ success: false, error: { message: 'Пиво не найдено' } });
    return;
  }

  res.json({ success: true, data: beer });
});

// POST /api/beers — добавить новый товар
beersRouter.post('/', (req: Request, res: Response) => {
  const { name, brand, style, abv, volume_ml, price, description, image_url } = req.body;

  if (!name || !brand || !price) {
    res.status(400).json({ success: false, error: { message: 'name, brand и price обязательны' } });
    return;
  }

  const newBeer: Beer = {
    id: uuidv4(),
    name,
    brand,
    style: style || 'Other',
    abv: abv || 0,
    volume_ml: volume_ml || 500,
    price,
    description: description || '',
    image_url: image_url || '',
    in_stock: true,
    created_at: new Date().toISOString(),
  };

  beers.push(newBeer);

  res.status(201).json({ success: true, data: newBeer });
});
