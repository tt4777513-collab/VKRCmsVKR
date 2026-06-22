# Руководство по установке CMS Pro

## 📋 Требования

- PHP 8.0+
- MySQL 5.7+
- Composer
- Node.js (для обработки ассетов)
- Apache с поддержкой mod_rewrite

## 🚀 Установка

### 1. Клонирование проекта
```bash
git clone https://github.com/your-repo/cms-pro.git
cd cms-pro
```

### 2. Установка зависимостей
```bash
composer install
npm install
```

### 3. Конфигурация
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Настройка базы данных

Откройте файл `.env` и установите параметры подключения:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cms_pro
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Миграция и заполнение БД
```bash
php artisan migrate
php artisan db:seed
```

### 6. Генерация ассетов
```bash
npm run dev
```

## 🔐 Доступ к панели администратора

После установки, панель администратора доступна по адресу:
```
http://localhost:8000/admin
```

**Учетные данные по умолчанию:**
- Email: `admin@cms.ru`
- Пароль: `password`

## 📁 Структура проекта

```
cms-pro/
├── app/                    # Основной код приложения
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Requests/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── views/
│   ├── css/
│   └── js/
├── routes/
│   ├── web.php
│   └── api.php
├── storage/
│   ├── app/
│   ├── backups/
│   └── logs/
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/
└── config/
```

## 🛠️ API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/logout` - Выход

### Страницы
- `GET /api/pages` - Список страниц
- `GET /api/pages/{id}` - Получить страницу
- `POST /api/pages` - Создать страницу
- `PUT /api/pages/{id}` - Обновить страницу
- `DELETE /api/pages/{id}` - Удалить страницу

### Содержание
- `GET /api/content` - Список контента
- `GET /api/content/{id}` - Получить контент
- `POST /api/content` - Создать контент
- `PUT /api/content/{id}` - Обновить контент
- `DELETE /api/content/{id}` - Удалить контент

### Медиа
- `GET /api/media` - Список файлов
- `POST /api/media/upload` - Загрузить файл
- `DELETE /api/media/{id}` - Удалить файл

### Пользователи
- `GET /api/users` - Список пользователей
- `GET /api/users/{id}` - Получить пользователя
- `POST /api/users` - Создать пользователя
- `PUT /api/users/{id}` - Обновить пользователя
- `DELETE /api/users/{id}` - Удалить пользователя

### Резервные копии
- `GET /api/backups` - Список резервных копий
- `POST /api/backups` - Создать резервную копию
- `POST /api/backups/{id}/restore` - Восстановить из копии
- `DELETE /api/backups/{id}` - Удалить резервную копию

## 🔄 Автоматическое резервное копирование

Система CMS Pro автоматически создает ежедневные резервные копии в 00:00 UTC. Для настройки расписания используйте задачу Artisan:

```bash
php artisan schedule:run
```

Добавьте эту команду в Cron таб вашего сервера:
```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

## 🔒 Безопасность

- Все пароли хранятся в зашифрованном виде
- CSRF защита включена по умолчанию
- SQL injection защита через Eloquent ORM
- XSS защита через Blade шаблоны
- Двухфакторная аутентификация поддерживается

## 📊 SEO Оптимизация

CMS Pro имеет встроенную поддержку SEO:
- Управление метатегами
- Генерация Sitemap
- Управление robots.txt
- Оптимизация изображений

## 🐛 Отладка

Для включения режима отладки установите в `.env`:
```
APP_DEBUG=true
```

Логи находятся в папке `storage/logs/`.

## 📞 Поддержка

Для получения помощи посетите нашу документацию или свяжитесь с поддержкой на support@cms-pro.ru

## 📄 Лицензия

MIT License - см. файл LICENSE
