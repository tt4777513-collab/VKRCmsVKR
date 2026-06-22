# 🗄️ Схема базы данных CMS Pro

## Структура таблиц

### 1. `users` - Пользователи системы

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'author', 'subscriber') DEFAULT 'subscriber',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

**Поля:**
- `id` - Уникальный идентификатор
- `name` - ФИО пользователя
- `email` - Email (уникален)
- `password` - Хешированный пароль
- `role` - Роль пользователя
- `status` - Статус аккаунта
- `last_login` - Дата последнего входа
- `created_at` - Дата создания
- `updated_at` - Дата изменения

### 2. `pages` - Страницы сайта

```sql
CREATE TABLE pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  featured_image VARCHAR(255),
  status ENUM('published', 'draft', 'archive') DEFAULT 'draft',
  visibility ENUM('public', 'registered', 'private') DEFAULT 'public',
  show_in_menu BOOLEAN DEFAULT TRUE,
  requires_password BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  allow_comments BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

**Поля:**
- `user_id` - Автор страницы
- `title` - Название страницы
- `slug` - URL-адрес
- `content` - Содержание (HTML/Markdown)
- `meta_*` - SEO метаданные
- `featured_image` - Изображение страницы
- `status` - Статус публикации
- `visibility` - Видимость страницы
- `view_count` - Количество просмотров

### 3. `categories` - Категории

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id INT,
  icon VARCHAR(255),
  order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id),
  INDEX idx_slug (slug),
  INDEX idx_parent_id (parent_id)
);
```

### 4. `page_categories` - Связь страниц и категорий

```sql
CREATE TABLE page_categories (
  page_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (page_id, category_id),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### 5. `content_blocks` - Блоки контента

```sql
CREATE TABLE content_blocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_id INT NOT NULL,
  type ENUM('text', 'image', 'video', 'gallery', 'quote', 'code') DEFAULT 'text',
  content LONGTEXT,
  data JSON,
  order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_page_id (page_id),
  INDEX idx_order (order)
);
```

### 6. `media` - Медиафайлы

```sql
CREATE TABLE media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),
  type ENUM('image', 'video', 'document', 'audio', 'archive') NOT NULL,
  width INT,
  height INT,
  duration INT,
  alt_text TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);
```

### 7. `comments` - Комментарии

```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_id INT NOT NULL,
  user_id INT,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'spam', 'trash') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_page_id (page_id),
  INDEX idx_status (status)
);
```

### 8. `settings` - Глобальные настройки

```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value LONGTEXT,
  type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (key)
);
```

**Ключи настроек:**
- `site_name` - Название сайта
- `site_url` - URL сайта
- `site_logo` - Логотип
- `admin_email` - Email администратора
- `timezone` - Часовой пояс
- `language` - Язык по умолчанию
- `posts_per_page` - Записей на странице
- `enable_comments` - Разрешить комментарии
- `auto_backup_enabled` - Автоматические резервные копии
- `backup_hour` - Час создания резервной копии

### 9. `backups` - Резервные копии

```sql
CREATE TABLE backups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL UNIQUE,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  type ENUM('full', 'database', 'media') DEFAULT 'full',
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 10. `activity_logs` - Логи активности

```sql
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_entity (entity_type, entity_id)
);
```

### 11. `seo_metadata` - SEO метаданные

```sql
CREATE TABLE seo_metadata (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_id INT NOT NULL,
  meta_title VARCHAR(255),
  meta_description VARCHAR(255),
  meta_keywords VARCHAR(255),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(255),
  twitter_card VARCHAR(100),
  twitter_creator VARCHAR(100),
  canonical_url VARCHAR(255),
  schema_markup JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  INDEX idx_page_id (page_id)
);
```

## Индексы и производительность

### Основные индексы
- `users.email` - для быстрого поиска пользователей по email
- `pages.slug` - для маршрутизации URL
- `pages.status` - для фильтрации по статусу
- `media.type` - для фильтрации медиа по типу
- `activity_logs.created_at` - для сортировки логов по дате

### Сложные индексы
```sql
CREATE INDEX idx_page_status_user 
  ON pages(status, user_id, created_at);

CREATE INDEX idx_media_type_user 
  ON media(type, user_id, created_at);

CREATE INDEX idx_activity_user_action 
  ON activity_logs(user_id, action, created_at);
```

## Связи между таблицами

```
users
├── pages (1:N)
├── media (1:N)
├── comments (1:N)
└── activity_logs (1:N)

pages
├── content_blocks (1:N)
├── comments (1:N)
├── seo_metadata (1:1)
└── page_categories (N:N)

categories
└── page_categories (1:N)

media (файлы)

backups (резервные копии)
```

## Партиционирование (для больших объемов данных)

Для оптимизации производительности на больших объемах данных можно использовать партиционирование:

```sql
ALTER TABLE activity_logs 
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

## Миграция и обновление

Для управления версиями схемы используются миграции Laravel:

```bash
php artisan make:migration create_users_table
php artisan migrate
php artisan migrate:rollback
php artisan migrate:refresh
```

## Резервное копирование

Полное резервное копирование базы данных:

```bash
mysqldump -u username -p database_name > backup.sql
```

Восстановление из резервной копии:

```bash
mysql -u username -p database_name < backup.sql
```
