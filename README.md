## Animals Location API

Node.js/TypeScript API для управления аккаунтами, животными, типами животных, точками локаций и историей перемещений.

### **Технологии**
- **Node.js + Express**
- **PostgreSQL**
- **Prisma** (ORM + миграции)

### **Подготовка окружения**
1. Установите PostgreSQL и создайте базу:
   - имя базы: `animals_location`
2. Отредактируйте файл `.env`:
   - `DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/animals_location?schema=public"`
   - `API_KEY="your-api-key"` — задайте произвольный API-ключ, который будет использоваться клиентами.

### **Миграции**

Для создания и применения миграций используйте Prisma:

```bash
# Создать миграцию на основе схемы
npx prisma migrate dev --name init

# Применить существующие миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate
```

### **Команды npm**

- **Установка зависимостей**:

```bash
npm install
```

- **Запуск в dev-режиме**:

```bash
npm run dev
```

- **Сборка и прод-запуск**:

```bash
npm run build
npm start
```

### **Авторизация**

Все защищённые эндпойнты требуют заголовок:

```text
X-API-Key: <значение из переменной окружения API_KEY>
```

### **Основные эндпойнты**

- **Аутентификация**
  - `POST /api/auth/register` — регистрация аккаунта

- **Account**
  - `GET /api/accounts?email=...` — поиск
  - `GET /api/accounts/:id` — просмотр по id
  - `PUT /api/accounts/:id` — изменение
  - `DELETE /api/accounts/:id` — удаление

- **Animal**
  - `GET /api/animals/:id` — просмотр животного
  - `GET /api/animals?chipNumber=...&name=...` — поиск
  - `POST /api/animals` — создание
  - `PUT /api/animals/:id` — изменение
  - `DELETE /api/animals/:id` — удаление
  - `POST /api/animals/:id/types` — добавить тип животного
  - `DELETE /api/animals/:id/types/:typeId` — удалить тип у животного

- **Animal Type**
  - `GET /api/animal-types/:id` — просмотр
  - `POST /api/animal-types` — создание
  - `PUT /api/animal-types/:id` — изменение
  - `DELETE /api/animal-types/:id` — удаление

- **Location Point**
  - `GET /api/locations/:id` — просмотр
  - `POST /api/locations` — создание
  - `PUT /api/locations/:id` — изменение
  - `DELETE /api/locations/:id` — удаление

- **Animal Visited Location**
  - `GET /api/visited-locations/animal/:animalId` — список перемещений животного
  - `POST /api/visited-locations/animal/:animalId` — добавить перемещение
  - `PUT /api/visited-locations/:id` — изменить перемещение
  - `DELETE /api/visited-locations/:id` — удалить перемещение

