# Расширенная система тестирования API

Данный проект представляет собой комплексную систему тестирования REST API для проекта Animals Location, настроенную с использованием Jest и современных плагинов для улучшения качества тестирования.

## 🚀 Установка и настройка

### Предварительные требования
- Node.js 16+ 
- Docker и Docker Compose
- API сервер должен быть запущен

### Установка зависимостей
```bash
# В корневой директории проекта
cd tests/
npm install
```

### Настройка окружения
Скопируйте файл `.env.example` в `.env` и настройте параметры:
```bash
cp .env.example .env
```

Редактируйте `.env` файл:
```env
TEST_BASE_URL=http://localhost:3000
TEST_USERNAME=admin@mail.com
TEST_PASSWORD=admin
```

### Запуск инфраструктуры
```bash
# В корне проекта (не в tests/)
docker-compose up -d
```

## 🧪 Доступные команды тестирования

### Основные команды
```bash
# Запуск всех тестов
npm test

# Запуск с проверкой окружения
npm run test:with-check

# Тесты в watch режиме
npm run test:watch

# Тесты с покрытием кода
npm run test:coverage

# Подробный вывод
npm run test:verbose

# Отладочный режим
npm run test:debug
```

### Специализированные команды
```bash
# Генерация отчетов
npm run test:report

# Тесты по типам
npm run test:unit      # unit тесты
npm run test:integration # интеграционные тесты
npm run test:e2e       # end-to-end тесты

# Стресс-тестирование
npm run test:stress

# Проверка окружения
npm run pre-test-check
```

## 📊 Плагины и расширения

### Установленные плагины

1. **jest-extended** - расширенные матчеры
   - `.toBeArray()`, `.toBeArrayOfSize()`
   - `.toBeString()`, `.toBeEmail()`, `.toBeISODate()`
   - `.toBeWithin()`, `.toBeOneOf()`
   - `.toInclude()`, `.toStartWith()`

2. **jest-html-reporters** - HTML отчеты
   - Автоматическая генерация красивых отчетов
   - Сохранение в `test-reports/test-report.html`

3. **jest-sonar-reporter** - интеграция с SonarQube
   - Генерация отчетов для анализа качества кода

### Расширенные возможности

#### Расширенные матчеры
```typescript
// Проверка диапазона
expect(value).toBeWithin(1, 10);

// Проверка массива
expect(array).toBeArrayOfSize(5);

// Проверка email
expect(email).toBeEmail();

// Проверка даты ISO
expect(dateString).toBeISODate();
```

#### Повторные попытки при ошибках
```typescript
const result = await TestHelpers.executeWithRetry(
  () => apiClient.getAccount(1),
  3, // макс. попыток
  1000 // задержка между попытками
);
```

#### Валидация структур данных
```typescript
TestHelpers.validateUserStructure(user);
TestHelpers.validateAnimalStructure(animal);
TestHelpers.validateApiResponseStructure(response, ['id', 'name']);
```

## 🏗️ Архитектура тестов

### Структура файлов
```
src/
├── accounts/           # Тесты аккаунтов
├── animals/           # Тесты животных
├── animal-types/      # Тесты типов животных
├── locations/         # Тесты локаций
├── visited-locations/ # Тесты посещенных локаций
├── authorization/     # Тесты авторизации
├── registration/      # Тесты регистрации
├── utils/             # Утилиты
│   ├── api-client.ts          # Клиент API
│   ├── validation-helpers.ts  # Хелперы валидации
│   ├── test-helpers.ts        # Расширенные утилиты
│   └── server-check.ts        # Проверка сервера
├── examples/          # Примеры использования
└── setup.ts          # Настройка тестовой среды
```

### Ключевые компоненты

#### ApiClient
Централизованный клиент для работы с API с обработкой ошибок и авторизацией.

#### ValidationHelpers
Расширенная библиотека проверок с поддержкой jest-extended.

#### TestHelpers
Дополнительные утилиты для управления тестовыми данными, повторных попыток и валидации.

## ⚙️ Конфигурация

### Jest Configuration (`jest.config.js`)
```javascript
{
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  reporters: ['default', 'jest-html-reporters'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Coverage Settings
Требования к покрытию кода:
- Ветви: 70%
- Функции: 70%
- Строки: 70%
- Утверждения: 70%

## 🔧 Настройка окружения разработки

### Visual Studio Code
Рекомендуемые расширения:
- Jest Runner
- REST Client (для api-tests.http)

### Отладка
```bash
npm run test:debug
```
Затем в VS Code: Debug → Attach to Node Process

## 📈 Мониторинг и отчетность

### Генерация отчетов
```bash
npm run test:report
```

Отчеты сохраняются в:
- `coverage/` - отчеты покрытия
- `test-reports/` - HTML отчеты

### Интеграция с CI/CD
Пример конфигурации GitHub Actions:
```yaml
- name: Run Tests
  run: |
    cd tests
    npm run test:with-check
    npm run test:report
```

## 🐛 Решение проблем

### Сервер недоступен
```bash
# Проверить статус сервера
npm run pre-test-check

# Перезапустить сервер
docker-compose restart webapi
```

### Ошибки авторизации
- Проверить `TEST_USERNAME` и `TEST_PASSWORD` в `.env`
- Убедиться что пользователь существует в базе данных

### Проблемы с TypeScript
```bash
# Пересобрать проект
npm run build

# Проверить типы
npx tsc --noEmit
```

## 🤝 Вклад в проект

### Добавление новых тестов
1. Создайте файл в соответствующей директории
2. Используйте существующие утилиты
3. Добавьте расширенные проверки
4. Протестируйте локально

### Стандарты кода
- Используйте TypeScript
- Следуйте существующей структуре
- Добавляйте документацию
- Тестируйте edge cases

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте лог ошибок
2. Запустите проверку окружения
3. Сверите настройки с README
4. Создайте issue с деталями проблемы

---
*Система тестирования обновлена и настроена для работы с современными инструментами качества кода.*
