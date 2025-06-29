# Express + TypeScript + MongoDB с Docker

## Требования
- Docker & Docker Compose
- Node.js & npm (для локальной разработки)

## 🚀 Как запустить

### 1. Клонировать репозиторий
```sh
git clone https://github.com/Hirexpie/shanyraq-api.git
cd shanyraq-api
```

### 2. Собрать и запустить контейнеры
```sh
docker-compose up --build -d
```

Это выполнит:
- Сборку и запуск сервера Express.js (TypeScript)
- Запуск MongoDB

### 3. Проверить запущенные контейнеры
```sh
docker ps
```

### 4. Остановить и удалить контейнеры
```sh
docker-compose down
```

## Переменные окружения
Создайте файл `.env` и добавьте:
```
MONGO_URI=mongodb://mongo:27017/mydatabase
PORT=3000
JWT_ACCESS_SECRET=JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES=3600
JWT_REFRESH_EXPIRES=604800

```

