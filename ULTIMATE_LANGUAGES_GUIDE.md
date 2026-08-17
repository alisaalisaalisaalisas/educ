# 🚀 Ультимативный Практический Справочник Разработчика: C#, Go, Python, JavaScript / TypeScript

> **Цель руководства:** Объяснить 4 главных языка программирования настолько просто, наглядно и без академической воды, чтобы любой человек мог сразу понять суть, скопировать рабочий паттерн и писать надежный код.

---

# 📑 Содержание

1. [Общая Сравнительная Таблица Ментальных Моделей](#0-общая-сравнительная-таблица)
2. [Язык 1: Python (Змеиный Экспресс)](#1-python)
3. [Язык 2: Go / Golang (Инженерный Минимализм)](#2-go-golang)
4. [Язык 3: JavaScript / TypeScript (Хозяин Веба)](#3-javascript--typescript)
5. [Язык 4: C# / .NET (Корпоративный Танк)](#4-c--net)
6. [🔥 Сводная шпаргалка: Одна и та же задача на 4 языках](#5-сводная-шпаргалка-одна-задача-на-4-языках)

---

# 0. Общая Сравнительная Таблица

| Язык | Философия / Как думать | Типизация | Память | Главное применение |
|---|---|---|---|---|
| **Python** | *"Пиши как думаешь, быстро прототипируй"* | Динамическая (сильная) | Garbage Collector | Backend (FastAPI/Django), AI/ML, Скрипты, Data Science |
| **Go** | *"Минимум магии, один способ сделать вещь"* | Статическая (строгая) | Garbage Collector (быстрый) | Высоконагруженный Backend, DevOps утилиты (Docker/K8s), Microservices |
| **JS / TS** | *"Работает везде, где есть браузер и Node.js"* | Динамическая (JS) / Статическая (TS) | Garbage Collector | Frontend (React/Vue), Fullstack (Node.js/Next.js), Мобилки |
| **C#** | *"Надежность, строгая ООП архитектура, мощная экосистема"* | Статическая (строгая) | Garbage Collector (.NET CLR) | Enterprise Backend, GameDev (Unity), Cloud (.NET Core), Desktop |

---

# 1. 🐍 Python

### 🧠 Ментальная модель за 30 секунд
> В Python **нет фигурных скобок `{}` и точек с запятой `;`**. Всё строится на **отступах (4 пробела)**. Всё является объектом. Код читается как английский текст.

---

### 1.1 Базовый синтаксис

```python
# 1. Переменные (типы определяются автоматически)
name: str = "Alice"       # Аннотация типа (для подсказок IDE)
age: int = 25
salary: float = 3500.50
is_active: bool = True
nothing: None = None      # Аналог null / nil

# 2. Форматирование строк (F-строки)
print(f"Привет, {name}! Возраст: {age}")

# 3. Условия
if age >= 18:
    print("Совершеннолетний")
elif age > 12:
    print("Подросток")
else:
    print("Ребенок")

# Тернарный оператор (условие в одну строку)
status = "Доступ открыт" if is_active else "Заблокирован"
```

---

### 1.2 Коллекции (Списки, Словари, Кортежи, Множества)

```python
# 1. Список (List - динамический массив)
fruits = ["яблоко", "банан", "груша"]
fruits.append("апельсин")  # Добавить в конец
first = fruits[0]          # "яблоко"
last = fruits[-1]          # "апельсин" (с конца!)
sub = fruits[1:3]          # Срез: ['банан', 'груша']

# 2. Словарь (Dict - ключ: значение / JSON-подобный)
user = {
    "id": 1,
    "username": "coder",
    "roles": ["admin", "user"]
}
user["email"] = "coder@dev.io"      # Добавление/изменение
role = user.get("roles", [])         # Безопасное получение (не падает с ошибкой, если ключа нет)

# 3. List Comprehension (Генераторы списков — супер-фича Python)
numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers if x % 2 == 0]  # [4, 16] (квадраты только четных)
```

---

### 1.3 Циклы и Функции

```python
# 1. Цикл for (итерация по элементам)
for fruit in fruits:
    print(fruit)

# С индексами
for idx, fruit in enumerate(fruits):
    print(f"{idx}: {fruit}")

# Цикл по диапазону (0..4)
for i in range(5):
    print(i)

# 2. Функции
def calculate_tax(amount: float, tax_rate: float = 0.2) -> float:
    """Вычисляет налог с дефолтной ставкой 20%"""
    if amount < 0:
        raise ValueError("Сумма не может быть отрицательной!")
    return amount * tax_rate

# Лямбда (анонимная функция)
double = lambda x: x * 2
```

---

### 1.4 Классы и Датаклассы (Pydantic / dataclass)

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Server:
    ip: str
    port: int
    hostname: str
    is_online: bool = True
    location: Optional[str] = None

    def get_url(self) -> str:
        return f"http://{self.ip}:{self.port}"

srv = Server(ip="192.168.1.10", port=8080, hostname="node-01")
print(srv.get_url())  # http://192.168.1.10:8080
```

---

### 1.5 Асинхронность и обработка ошибок

```python
import asyncio

# Обработка ошибок
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Ошибка деления на 0: {e}")
finally:
    print("Выполняется всегда (закрытие соединений)")

# Асинхронность (async / await)
async def fetch_metrics(service: str) -> dict:
    print(f"Запрос метрик для {service}...")
    await asyncio.sleep(1)  # Имитация неблокирующего сетевого запроса
    return {"service": service, "status": "UP", "latency_ms": 12}

async def main():
    # Запуск параллельно нескольких задач
    results = await asyncio.gather(
        fetch_metrics("auth-api"),
        fetch_metrics("payment-api"),
        fetch_metrics("database")
    )
    print("Все метрики получены:", results)

# Запуск: asyncio.run(main())
```

---

### 1.6 Боевой REST API (FastAPI)

```python
# pip install fastapi uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="DevOps API")

class DeployRequest(BaseModel):
    app_name: str
    version: str
    replicas: int = 1

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/deploy")
def deploy_service(req: DeployRequest):
    if req.replicas < 1:
        raise HTTPException(status_code=400, detail="Replicas must be >= 1")
    return {"message": f"Деплой {req.app_name}:{req.version} запущен с {req.replicas} репликами"}

# Запуск: uvicorn main:app --reload
```

---

### 1.7 CLI и Пакетный менеджер Python

```bash
python -m venv .venv               # Создать виртуальное окружение
source .venv/bin/activate          # Активировать (Linux/Mac)
.venv\Scripts\activate             # Активировать (Windows)
pip install requests fastapi uvicorn pytest  # Установка пакетов
pip freeze > requirements.txt      # Сохранить зависимости
pip install -r requirements.txt    # Установить зависимости
pytest                             # Запуск тестов
```

---

### 💀 Главные грабли новичков в Python
1. **Изменяемые аргументы по умолчанию:** `def add(item, lst=[])` — список `lst` создается **один раз** при старте программы! Используйте `def add(item, lst=None): if lst is None: lst = []`.
2. **GIL (Global Interpreter Lock):** Для вычислений на CPU используйте `multiprocessing`, а `asyncio`/`threading` — для сетевых и дисковых операций (I/O).
3. **Забытая активация venv:** Всегда ставьте пакеты внутри активного `.venv`.

---

# 2. 🦫 Go (Golang)

### 🧠 Ментальная модель за 30 секунд
> В Go **нет классов и наследования**, **нет исключений (`try/catch`)**, **нет сложной магии**. Есть `struct`, `interface`, простые функции, возврат ошибок `(value, error)` и легковесные потоки — **горутины (`go func()`)** с каналами `chan`. Go компилируется в один автономный бинарник без внешних зависимостей.

---

### 2.1 Базовый синтаксис

```go
package main

import (
	"fmt"
)

func main() {
	// 1. Переменные
	var name string = "Alice"
	age := 25              // Краткое объявление с автовыводом типа (только внутри функций)
	salary := 3500.50
	isActive := true

	// 2. Печать
	fmt.Printf("Привет, %s! Возраст: %d, Оклад: %.2f\n", name, age, salary)

	// 3. Условия (без скобок вокруг условия!)
	if age >= 18 {
		fmt.Println("Совершеннолетний")
	} else if age > 12 {
		fmt.Println("Подросток")
	} else {
		fmt.Println("Ребенок")
	}

	// Инициализация в if (очень частый Go-паттерн)
	if length := len(name); length > 3 {
		fmt.Println("Длинное имя")
	}
}
```

---

### 2.2 Коллекции (Срезы / Slices, Мапы / Maps)

```go
package main

import "fmt"

func main() {
	// 1. Слайс (динамический массив)
	fruits := []string{"яблоко", "банан", "груша"}
	fruits = append(fruits, "апельсин") // Добавление элемента
	fmt.Println(fruits[0], fruits[len(fruits)-1]) // Первый и последний

	// Срез по индексам [start:end]
	sub := fruits[1:3] // ["банан", "груша"]
	fmt.Println(sub)

	// 2. Мапа (хеш-таблица: ключ -> значение)
	ports := map[string]int{
		"http":  80,
		"https": 443,
		"ssh":   22,
	}
	ports["k8s"] = 6443

	// Проверка наличия ключа (идиома comma-ok)
	val, ok := ports["redis"]
	if !ok {
		fmt.Println("Порт redis не найден!")
	} else {
		fmt.Println("Redis port:", val)
	}
}
```

---

### 2.3 Циклы и Функции

```go
package main

import (
	"errors"
	"fmt"
)

// 1. В Go только ОДИН оператор цикла — `for`!
func loopsDemo() {
	// Обычный for
	for i := 0; i < 5; i++ {
		fmt.Println(i)
	}

	// Итерация по слайсу / мапе (range)
	items := []string{"cpu", "ram", "disk"}
	for idx, val := range items {
		fmt.Printf("[%d] %s\n", idx, val)
	}

	// Аналог while (пока условие истинно)
	count := 3
	for count > 0 {
		count--
	}
}

// 2. Функции с множественным возвратом (значение + ошибка)
func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("деление на ноль недопустимо")
	}
	return a / b, nil // nil означает отсутствие ошибки
}
```

---

### 2.4 Структуры и Интерфейсы

```go
package main

import "fmt"

// Структура данных
type Server struct {
	IP       string `json:"ip"`       // Struct tag для JSON
	Port     int    `json:"port"`
	Hostname string `json:"hostname"`
}

// Метод для структуры Server (Receiver)
func (s Server) GetAddress() string {
	return fmt.Sprintf("%s:%d", s.IP, s.Port)
}

// Интерфейс (реализуется неявно! Если метод совпадает — интерфейс реализован)
type Pinger interface {
	GetAddress() string
}

func CheckHealth(p Pinger) {
	fmt.Println("Пингуем адрес:", p.GetAddress())
}
```

---

### 2.5 Горутины и Каналы (Суперсила Go)

```go
package main

import (
	"fmt"
	"time"
)

// Функция для запуска в горутине
func worker(id int, jobs <-chan string, results chan<- string) {
	for job := range jobs {
		fmt.Printf("Воркер %d обрабатывает %s...\n", id, job)
		time.Sleep(500 * time.Millisecond)
		results <- fmt.Sprintf("Результат %s готов", job)
	}
}

func main() {
	jobs := make(chan string, 5)
	results := make(chan string, 5)

	// Запускаем 3 параллельных воркера
	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results) // Ключевое слово `go` запускает горутину!
	}

	// Отправляем задачи
	tasks := []string{"deploy-nginx", "build-docker", "migrate-db"}
	for _, task := range tasks {
		jobs <- task
	}
	close(jobs)

	// Собираем результаты
	for a := 1; a <= len(tasks); a++ {
		res := <-results
		fmt.Println("Получено:", res)
	}
}
```

---

### 2.6 Боевой REST API (Стандартный пакет `net/http`)

```go
package main

import (
	"encoding/json"
	"net/http"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Uptime  string `json:"uptime"`
}

type DeployRequest struct {
	AppName  string `json:"app_name"`
	Replicas int    `json:"replicas"`
}

func main() {
	// GET /health
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(HealthResponse{
			Status: "UP",
			Uptime: "99.99%",
		})
	})

	// POST /deploy
	http.HandleFunc("/deploy", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req DeployRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Деплой " + req.AppName + " успешно запущен",
		})
	})

	http.ListenAndServe(":8080", nil)
}
```

---

### 2.7 CLI команды Go

```bash
go mod init my-project             # Инициализировать Go модуль
go get github.com/gin-gonic/gin    # Скачать внешнюю библиотеку
go mod tidy                        # Автоматически почистить и обновить зависимости
go run main.go                     # Скомпилировать в память и запустить
go build -o myapp main.go          # Собрать готовый бинарник
CGO_ENABLED=0 GOOS=linux go build  # Кросс-компиляция под Linux (для Docker!)
go test ./...                      # Запуск всех тестов
```

---

### 💀 Главные грабли новичков в Go
1. **Игнорирование ошибок:** `val, _ := DoSomething()` — никогда не глушите ошибку через `_` без веской причины. Всегда пишите `if err != nil { return err }`.
2. **Путаница со значениями и указателями (`*` vs `&`):** Если методу нужно изменить поля структуры, передавайте указатель: `func (s *Server) UpdatePort(p int)`.
3. **Гонка горутин (Data Race):** Запускайте тесты с флагом `go test -race`.

---

# 3. 🌐 JavaScript / TypeScript

### 🧠 Ментальная модель за 30 секунд
> JavaScript — язык **однопоточный**, работающий на **Event Loop (цикле событий)**. TypeScript — это JavaScript с **компилятором строгих типов**, который спасает от 90% ошибок `undefined is not a function` еще до запуска кода.

---

### 3.1 Базовый синтаксис (TypeScript)

```typescript
// 1. Переменные: const (нельзя переназначить) и let (можно)
const appName: string = "DevOps Hub";
let port: number = 3000;
const isDebug: boolean = false;
const tags: string[] = ["k8s", "docker", "ci-cd"];

// 2. Шаблонные строки (Backticks ` `)
console.log(`Сервер ${appName} запущен на порту ${port}`);

// 3. Условия
if (port === 3000) { // ВСЕГДА используйте строгое сравнение === (не ==)
  console.log("Стандартный порт разработки");
}

// 4. Опциональная цепочка и Nullish Coalescing (Супер-фичи TS)
interface User {
  id: number;
  profile?: {
    nickname?: string;
  };
}

const user: User = { id: 1 };
// ?. не падает с ошибкой, если profile undefined! ?? дает дефолт, если null/undefined
const nick = user.profile?.nickname ?? "Аноним";
```

---

### 3.2 Функции и Стрелочные функции

```typescript
// 1. Обычная функция
function add(a: number, b: number): number {
  return a + b;
}

// 2. Стрелочная функция (Arrow Function)
const multiply = (a: number, b: number): number => a * b;

// 3. Деструктуризация параметров
interface ServerConfig {
  host: string;
  port: number;
  timeout?: number;
}

const startServer = ({ host, port, timeout = 5000 }: ServerConfig): string => {
  return `Connected to ${host}:${port} with timeout ${timeout}ms`;
};
```

---

### 3.3 Методы Массивов (Главное оружие JS/TS разработчика)

```typescript
const numbers: number[] = [10, 20, 30, 40, 50];

// 1. .map() — преобразовать каждый элемент
const doubled = numbers.map(n => n * 2); // [20, 40, 60, 80, 100]

// 2. .filter() — отфильтровать по условию
const greaterThan25 = numbers.filter(n => n > 25); // [30, 40, 50]

// 3. .find() — найти первый подходящий элемент
const found = numbers.find(n => n === 30); // 30

// 4. .reduce() — свернуть массив в одно значение (например, сумму)
const sum = numbers.reduce((acc, curr) => acc + curr, 0); // 150

// 5. .some() и .every() — проверки
const hasHuge = numbers.some(n => n > 40); // true
```

---

### 3.4 Типы (Types), Интерфейсы (Interfaces) и Дженерики (Generics)

```typescript
// Type Alias (объединения типов / Union)
type Environment = "development" | "staging" | "production";
type ID = string | number;

// Interface (описание контракта объекта)
interface Pod {
  id: ID;
  name: string;
  env: Environment;
  restartCount: number;
}

// Generic (универсальный тип-обертка)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const podResponse: ApiResponse<Pod> = {
  success: true,
  data: {
    id: "pod-981",
    name: "auth-service-78f9",
    env: "production",
    restartCount: 0,
  }
};
```

---

### 3.5 Асинхронность: Promises и Async/Await

```typescript
// Имитация асинхронного API-запроса
const fetchPodStatus = async (podId: string): Promise<{ status: string }> => {
  // await ждет завершения Promise без блокировки Event Loop
  await new Promise(resolve => setTimeout(resolve, 500));
  return { status: "Running" };
};

// Вызов
async function main() {
  try {
    const res = await fetchPodStatus("pod-01");
    console.log("Статус пода:", res.status);
    
    // Параллельный запуск нескольких промисов:
    const [p1, p2] = await Promise.all([
      fetchPodStatus("pod-01"),
      fetchPodStatus("pod-02"),
    ]);
  } catch (error) {
    console.error("Ошибка запроса:", error);
  }
}
```

---

### 3.6 Боевой REST API (Node.js + Express + TypeScript)

```typescript
// npm install express
// npm install -D @types/express typescript ts-node
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json()); // Парсинг JSON тела запроса

interface DeployBody {
  appName: string;
  replicas: number;
}

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/deploy', (req: Request<{}, {}, DeployBody>, res: Response) => {
  const { appName, replicas } = req.body;
  if (!appName || replicas < 1) {
    return res.status(400).json({ error: 'Некорректные параметры деплоя' });
  }
  return res.json({ message: `Деплой ${appName} (${replicas} реплик) отправлен в K8s` });
});

app.listen(3000, () => console.log('Сервер запущен на http://localhost:3000'));
```

---

### 3.7 CLI команды JS / TS (npm / pnpm / yarn)

```bash
npm init -y                        # Инициализировать package.json
npm install express                # Установить рантайм зависимость
npm install -D typescript @types/node tsx  # Установить dev-зависимости
npx tsc --init                     # Создать конфиг tsconfig.json
npx tsx server.ts                  # Запустить TS-файл напрямую без сборки
npm run build                      # Запустить скрипт сборки из package.json
```

---

### 💀 Главные грабли новичков в JS/TS
1. **Нестрогое равенство `==` vs `===`:** Всегда используйте `===` (в JS `0 == ""` — это `true`, а `0 === ""` — `false`).
2. **Забытый `await`:** Если функция возвращает `Promise`, без `await` вы получите объект Promise вместо результата.
3. **Мутация массивов:** Методы `.push()`, `.splice()`, `.sort()` мутируют исходный массив! Для React/Redux делайте копию: `[...items].sort()`.

---

# 4. 🔷 C# / .NET

### 🧠 Ментальная модель за 30 секунд
> C# — это современный, супер-производительный строго типизированный язык от Microsoft. Он совмещает мощь компилируемого языка, лаконичный синтаксис (Top-Level statements, Pattern Matching, Records) и надежность экосистемы **.NET Core**.

---

### 4.1 Базовый синтаксис (C# 12 / .NET 8)

```csharp
// В современном C# не нужно писать class Program и static void Main!
// Top-Level statements: сразу пишем код:

string appName = "K8s Controller";
int port = 5000;
double cpuUsage = 45.8;
bool isHealthy = true;

// 1. Интерполяция строк с $
Console.WriteLine($"Сервис {appName} на порту {port}, CPU: {cpuUsage}%");

// 2. Условия и Pattern Matching
if (cpuUsage > 90)
{
    Console.WriteLine("Критическая нагрузка!");
}
else if (cpuUsage > 70)
{
    Console.WriteLine("Предупреждение");
}
else
{
    Console.WriteLine("Нагрузка в норме");
}

// Switch Expression (современный лаконичный выбор)
string healthMessage = isHealthy switch
{
    true => "Все системы в норме",
    false => "Обнаружена деградация"
};
```

---

### 4.2 Коллекции (Списки `List<T>`, Словари `Dictionary<TKey, TValue>`)

```csharp
// 1. Список (List)
var pods = new List<string> { "auth-pod", "api-pod", "worker-pod" };
pods.Add("cron-pod");
Console.WriteLine($"Первый: {pods[0]}, Всего: {pods.Count}");

// 2. Словарь (Dictionary)
var nodeCapacity = new Dictionary<string, int>
{
    ["node-alpha"] = 16,
    ["node-beta"] = 32
};
nodeCapacity["node-gamma"] = 64;

// Безопасное чтение
if (nodeCapacity.TryGetValue("node-beta", out int ram))
{
    Console.WriteLine($"RAM: {ram} GB");
}
```

---

### 4.3 LINQ (Супер-оружие C# для работы с данными)

```csharp
// LINQ позволяет фильтровать и преобразовывать коллекции в стиле SQL:
var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 1. Фильтрация и проекция
var evenSquares = numbers
    .Where(n => n % 2 == 0)       // Оставить только четные
    .Select(n => n * n)           // Возвести в квадрат
    .ToList();                    // [4, 16, 36, 64, 100]

// 2. Агрегация
int totalSum = numbers.Sum();
int maxVal = numbers.Max();
bool hasLarge = numbers.Any(n => n > 8); // true
```

---

### 4.4 Записи (Records), Классы и Nullable Reference Types

```csharp
// Record — неизменяемый класс в одну строку с автоматическим Equals, HashCode и ToString!
public record ServerDto(string Host, int Port, bool IsActive = true);

// Обычный класс с инкапсуляцией:
public class ClusterNode
{
    public string Id { get; init; } // init — можно задать только при создании
    public string Name { get; set; }
    public int CpuCores { get; private set; }

    public ClusterNode(string id, string name, int cores)
    {
        Id = id;
        Name = name;
        CpuCores = cores;
    }

    public void UpgradeCpu(int addedCores)
    {
        if (addedCores <= 0)
            throw new ArgumentException("Количество ядер должно быть > 0");
        CpuCores += addedCores;
    }
}
```

---

### 4.5 Асинхронность (async / await и Tasks)

```csharp
using System.Net.Http.Json;

public class MetricService
{
    private readonly HttpClient _http = new();

    public async Task<string> FetchStatusAsync(string url)
    {
        try
        {
            // Неблокирующий HTTP запрос
            var response = await _http.GetStringAsync(url);
            return response;
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Ошибка сети: {ex.Message}");
            return "UNKNOWN";
        }
    }

    public async Task CheckAllAsync()
    {
        // Параллельный запуск нескольких тасок:
        var task1 = FetchStatusAsync("https://api.github.com");
        var task2 = FetchStatusAsync("https://httpbin.org/status/200");

        string[] results = await Task.WhenAll(task1, task2);
        Console.WriteLine($"Успешно проверено {results.Length} сервисов");
    }
}
```

---

### 4.6 Боевой REST API (C# .NET Minimal APIs)

```csharp
// Создается командой: dotnet new web -n DevOpsApi
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Маршрут GET /health
app.MapGet("/health", () => Results.Ok(new
{
    Status = "Healthy",
    Uptime = "100%",
    Timestamp = DateTime.UtcNow
}));

// Маршрут POST /deploy
app.MapPost("/deploy", (DeployRequest req) =>
{
    if (req.Replicas < 1)
    {
        return Results.BadRequest(new { Error = "Реплик должно быть >= 1" });
    }
    return Results.Ok(new { Message = $"Сервис {req.AppName} развернут ({req.Replicas} реплик)" });
});

app.Run();

// DTO модель запроса
public record DeployRequest(string AppName, int Replicas);
```

---

### 4.7 CLI команды .NET

```bash
dotnet new console -n MyApp        # Создать консольное приложение
dotnet new webapi -n MyApi         # Создать Web API проект
dotnet add package Newtonsoft.Json # Добавить NuGet пакет
dotnet run                         # Собрать и запустить
dotnet build -c Release            # Собрать релизный билд
dotnet test                        # Запуск тестов
dotnet publish -c Release -o ./out # Опубликовать проект для деплоя
```

---

### 💀 Главные грабли новичков в C#
1. **Блокировка асинхронного кода (`.Result` или `.Wait()`):** Никогда не пишите `task.Result` внутри контроллеров — это приводит к Deadlock (взаимной блокировке потоков). Всегда используйте `await`.
2. **`IDisposable` и `using`:** Объекты, работающие с сетевыми соединениями или файлами (`StreamReader`, `SqlConnection`), всегда оборачивайте в `using var resource = ...;` для гарантированного освобождения памяти.
3. **NullReferenceException:** Включите `<Nullable>enable</Nullable>` в `.csproj`, чтобы компилятор бил по рукам за возможный `null`.

---

# 5. 🔥 Сводная шпаргалка: Одна задача на 4 языках

### 🎯 Задача: 
Взять список чисел, отфильтровать только четные, возвести в квадрат и посчитать их сумму.

### 🐍 Python
```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
total = sum(x**2 for x in numbers if x % 2 == 0)
print(total) # 220
```

### 🦫 Go
```go
package main
import "fmt"

func main() {
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    total := 0
    for _, x := range numbers {
        if x%2 == 0 {
            total += x * x
        }
    }
    fmt.Println(total) // 220
}
```

### 🌐 TypeScript
```typescript
const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const total = numbers
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .reduce((sum, x) => sum + x, 0);

console.log(total); // 220
```

### 🔷 C#
```csharp
using System;
using System.Linq;

var numbers = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var total = numbers
    .Where(x => x % 2 == 0)
    .Select(x => x * x)
    .Sum();

Console.WriteLine(total); // 220
```

---

# 🏆 Золотые Правила Выбора Языка в Проектах:

1. **Пишите на Python**, если нужно: быстро проверить гипотезу, написать парсер/скрипт автоматизации, обучить ML-модель, сделать прототип API на FastAPI.
2. **Пишите на Go**, если нужно: сделать высокопроизводительный сетевой сервис, CLI-утилиту, DevOps/SRE инструмент или микросервис, который потребляет 15 Мб RAM и держит 50 000 RPS.
3. **Пишите на TypeScript**, если нужно: делать веб-интерфейс (React/Vue/Phaser), фуллстек приложение (Next.js), сервер на Node.js или когда фронтенд и бэкенд должны делить общие типы.
4. **Пишите на C#**, если нужно: разработать надежную корпоративную систему, высоконагруженный backend (.NET Core), игру на Unity или десктопное приложение.
