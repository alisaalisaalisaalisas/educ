import { useState, useEffect } from 'react'
import './App.css'

// ── Types ─────────────────────────────────────────────────
interface Beer {
  id: string
  name: string
  brand: string
  style: string
  abv: number
  volume_ml: number
  price: number
  description: string
  image_url: string
  in_stock: boolean
}

interface CartItem {
  beer_id: string
  name: string
  price: number
  quantity: number
}

const API = 'http://localhost:3000/api'

// ── Beer Card Component ───────────────────────────────────
function BeerCard({ beer, onAdd }: { beer: Beer; onAdd: (b: Beer) => void }) {
  const styleEmoji: Record<string, string> = {
    Lager: '🍺', Stout: '🖤', Witbier: '🌾', IPA: '🍋', Other: '🍻'
  }

  return (
    <div className="beer-card">
      <div className="beer-card__badge">{styleEmoji[beer.style] || '🍻'} {beer.style}</div>
      <div className="beer-card__emoji">🍺</div>
      <h3 className="beer-card__name">{beer.name}</h3>
      <p className="beer-card__brand">{beer.brand}</p>
      <p className="beer-card__desc">{beer.description}</p>
      <div className="beer-card__meta">
        <span>{beer.abv}% ABV</span>
        <span>{beer.volume_ml} мл</span>
      </div>
      <div className="beer-card__footer">
        <span className="beer-card__price">{beer.price.toFixed(2)} ₽</span>
        <button className="beer-card__btn" onClick={() => onAdd(beer)}>
          В корзину
        </button>
      </div>
    </div>
  )
}

// ── Cart Sidebar ──────────────────────────────────────────
function CartSidebar({ items, open, onClose, onRemove }: {
  items: CartItem[]
  open: boolean
  onClose: () => void
  onRemove: (id: string) => void
}) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className={`cart-sidebar ${open ? 'cart-sidebar--open' : ''}`}>
      <div className="cart-sidebar__header">
        <h2>🛒 Корзина</h2>
        <button className="cart-sidebar__close" onClick={onClose}>✕</button>
      </div>

      {items.length === 0 ? (
        <p className="cart-sidebar__empty">Корзина пуста</p>
      ) : (
        <>
          <div className="cart-sidebar__items">
            {items.map(item => (
              <div key={item.beer_id} className="cart-item">
                <div>
                  <p className="cart-item__name">{item.name}</p>
                  <p className="cart-item__qty">{item.quantity} × {item.price.toFixed(2)} ₽</p>
                </div>
                <button className="cart-item__remove" onClick={() => onRemove(item.beer_id)}>✕</button>
              </div>
            ))}
          </div>
          <div className="cart-sidebar__total">
            <span>Итого:</span>
            <span className="cart-sidebar__total-price">{total.toFixed(2)} ₽</span>
          </div>
          <button className="cart-sidebar__checkout">Оформить заказ</button>
        </>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────
function App() {
  const [beers, setBeers] = useState<Beer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [sort, setSort] = useState('')
  const [loading, setLoading] = useState(true)

  // Загрузка каталога
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (styleFilter) params.set('style', styleFilter)
    if (sort) params.set('sort', sort)

    fetch(`${API}/beers?${params}`)
      .then(r => r.json())
      .then(d => { setBeers(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, styleFilter, sort])

  // Добавить в корзину
  const addToCart = (beer: Beer) => {
    setCart(prev => {
      const existing = prev.find(i => i.beer_id === beer.id)
      if (existing) {
        return prev.map(i => i.beer_id === beer.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { beer_id: beer.id, name: beer.name, price: beer.price, quantity: 1 }]
    })
  }

  const removeFromCart = (beerId: string) => {
    setCart(prev => prev.filter(i => i.beer_id !== beerId))
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const styles = [...new Set(beers.map(b => b.style))]

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="header">
        <div className="header__inner">
          <h1 className="header__logo">🍺 BeerMarket</h1>
          <p className="header__tagline">Лучшее пиво со всего мира</p>
          <button className="header__cart" onClick={() => setCartOpen(true)}>
            🛒 {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ── Filters ────────────────────────────────────── */}
      <section className="filters">
        <input
          className="filters__search"
          type="text"
          placeholder="🔍 Поиск пива..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filters__select" value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>
          <option value="">Все стили</option>
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filters__select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Сортировка</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
          <option value="name">По названию</option>
        </select>
      </section>

      {/* ── Catalog ────────────────────────────────────── */}
      <main className="catalog">
        {loading ? (
          <div className="catalog__loading">Загрузка каталога...</div>
        ) : beers.length === 0 ? (
          <div className="catalog__empty">Ничего не найдено</div>
        ) : (
          <div className="catalog__grid">
            {beers.map(beer => (
              <BeerCard key={beer.id} beer={beer} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="footer">
        <p>© 2026 BeerMarket — DevOps Demo Project</p>
      </footer>

      {/* ── Cart Sidebar ───────────────────────────────── */}
      <CartSidebar items={cart} open={cartOpen} onClose={() => setCartOpen(false)} onRemove={removeFromCart} />
      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
    </div>
  )
}

export default App
