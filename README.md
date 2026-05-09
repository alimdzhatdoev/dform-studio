# DFORM Studio

Корпоративный сайт дизайн-студии с онлайн-заказами и аналитикой.

## Запуск

### Terminal 1 — Backend (Node.js)
```bash
cd backend
node server.js
# → http://localhost:8000
```

### Terminal 2 — Frontend (React)
```bash
cd frontend
npm install
npm start
# → http://localhost:3002 (или 3000 если порт свободен)
```

> **Примечание**: порт фронтенда определяется автоматически.  
> Если 3000 занят — используется следующий свободный (3001, 3002...).

## Структура
```
/project
  /frontend        — React-приложение (React 19, React Router v7)
  /backend
    /api           — PHP эндпоинты (для запуска через PHP)
    /data          — JSON данные (orders.json, analytics.json)
    server.js      — Node.js сервер (альтернатива PHP)
```

## Данные
Все данные хранятся в `/backend/data/`:
- `orders.json` — заказы
- `analytics.json` — аналитика (счётчики по дням)

## Доступ в админ-панель
- URL: `http://localhost:3002/admin`
- Логин: `admin`
- Пароль: `dform2025`

## Стек
- **Frontend**: React 19, React Router v7, CSS Custom Properties, Syne + Inter
- **Backend**: Node.js (http) или PHP 8+
- **Хранилище**: JSON файлы (без БД)
