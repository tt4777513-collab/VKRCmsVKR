# API Документация CMS Pro

## 🔑 Аутентификация

Все API запросы требуют аутентификацию через JWT токен. Передавайте токен в заголовке:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📝 Коды ответов

- `200` - Успешный запрос
- `201` - Ресурс создан
- `204` - Успешно, нет содержимого
- `400` - Неверный запрос
- `401` - Не аутентифицирован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `500` - Ошибка сервера

## 🔐 Аутентификация

### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@cms.ru",
  "password": "password"
}
```

**Ответ (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@cms.ru",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Выход
```http
POST /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📄 Страницы

### Получить все страницы
```http
GET /api/pages?page=1&limit=10&status=published
Authorization: Bearer YOUR_JWT_TOKEN
```

**Параметры запроса:**
- `page` (int) - Номер страницы
- `limit` (int) - Количество записей на странице
- `status` (string) - Статус: published, draft, archive
- `search` (string) - Поиск по названию

**Ответ (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Главная страница",
        "slug": "glavnaya-stranica",
        "content": "...",
        "status": "published",
        "author": "Administrator",
        "created_at": "2026-05-28T10:00:00Z",
        "updated_at": "2026-05-28T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 24,
      "per_page": 10
    }
  }
}
```

### Получить одну страницу
```http
GET /api/pages/1
Authorization: Bearer YOUR_JWT_TOKEN
```

### Создать страницу
```http
POST /api/pages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Новая страница",
  "slug": "novaya-stranica",
  "content": "Содержание страницы",
  "meta_description": "Описание для SEO",
  "status": "draft",
  "category_id": 1,
  "featured_image": "image-url"
}
```

### Обновить страницу
```http
PUT /api/pages/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Обновленное название",
  "status": "published"
}
```

### Удалить страницу
```http
DELETE /api/pages/1
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎨 Содержание

### Получить все содержание
```http
GET /api/content?type=text&status=active
Authorization: Bearer YOUR_JWT_TOKEN
```

### Создать содержание
```http
POST /api/content
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Заголовок",
  "body": "Основной текст",
  "type": "text",
  "page_id": 1,
  "order": 1,
  "status": "active"
}
```

### Обновить содержание
```http
PUT /api/content/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "body": "Обновленный текст"
}
```

### Удалить содержание
```http
DELETE /api/content/1
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📸 Медиа

### Получить все файлы
```http
GET /api/media?type=image&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

**Параметры:**
- `type` (string) - Тип: image, video, document, audio, archive
- `limit` (int) - Количество файлов
- `search` (string) - Поиск по имени

**Ответ:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "image.jpg",
        "type": "image",
        "size": 2400000,
        "url": "/uploads/images/image.jpg",
        "created_at": "2026-05-28T10:00:00Z"
      }
    ]
  }
}
```

### Загрузить файл
```http
POST /api/media/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

form-data:
  file: <binary>
```

**Ответ (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "name": "image.jpg",
    "url": "/uploads/images/image.jpg",
    "size": 2400000,
    "type": "image"
  }
}
```

### Удалить файл
```http
DELETE /api/media/1
Authorization: Bearer YOUR_JWT_TOKEN
```

## 👥 Пользователи

### Получить всех пользователей
```http
GET /api/users?role=editor&status=active
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

**Параметры:**
- `role` (string) - Роль: admin, editor, author, subscriber
- `status` (string) - Статус: active, inactive
- `search` (string) - Поиск по имени или email

### Создать пользователя
```http
POST /api/users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Ivan Petrov",
  "email": "ivan@example.com",
  "password": "securepassword",
  "role": "editor",
  "status": "active"
}
```

**Требуется роль:** admin

### Обновить пользователя
```http
PUT /api/users/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Ivan Petrov",
  "role": "author"
}
```

### Удалить пользователя
```http
DELETE /api/users/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

## 💾 Резервные копии

### Получить список резервных копий
```http
GET /api/backups?limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

**Ответ:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "filename": "backup_2026_05_28_full.zip",
        "size": 156000000,
        "type": "full",
        "status": "completed",
        "created_at": "2026-05-28T00:00:00Z"
      }
    ]
  }
}
```

### Создать резервную копию
```http
POST /api/backups
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "full",
  "include_media": true
}
```

**Требуется роль:** admin

### Восстановить из резервной копии
```http
POST /api/backups/1/restore
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

⚠️ **Внимание:** Это действие восстановит всю базу данных из резервной копии!

### Скачать резервную копию
```http
GET /api/backups/1/download
Authorization: Bearer YOUR_JWT_TOKEN
```

### Удалить резервную копию
```http
DELETE /api/backups/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

## ⚙️ Параметры и настройки

### Получить настройки
```http
GET /api/settings
Authorization: Bearer YOUR_JWT_TOKEN
```

**Требуется роль:** admin

### Обновить настройки
```http
PUT /api/settings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "site_name": "My CMS Site",
  "site_url": "https://example.com",
  "admin_email": "admin@example.com",
  "timezone": "UTC+03:00",
  "per_page": 10
}
```

**Требуется роль:** admin

## 📊 Аналитика

### Получить статистику
```http
GET /api/analytics/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "total_pages": 24,
    "total_users": 156,
    "total_media": 348,
    "total_views": 12500,
    "last_update": "2026-05-28T10:30:00Z"
  }
}
```

## 🔍 Поиск

### Глобальный поиск
```http
GET /api/search?q=query&type=all
Authorization: Bearer YOUR_JWT_TOKEN
```

**Параметры:**
- `q` (string) - Текст для поиска
- `type` (string) - Тип поиска: all, pages, content, media, users

**Ответ:**
```json
{
  "success": true,
  "data": {
    "pages": [...],
    "content": [...],
    "media": [...],
    "users": [...]
  }
}
```

## 📋 Обработка ошибок

Все ошибки возвращаются в одном формате:

```json
{
  "success": false,
  "message": "Описание ошибки",
  "errors": {
    "email": ["Email должна быть уникальной"],
    "password": ["Пароль должен содержать минимум 8 символов"]
  }
}
```

## 🔄 Пагинация

Для запросов со списками используется пагинация:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48,
      "per_page": 10,
      "has_previous": false,
      "has_next": true
    }
  }
}
```

## 💾 Ограничение скорости

API имеет ограничение 1000 запросов в час на пользователя.

Проверяйте заголовки ответа:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1622308800
```
