# 🔧 Техническое руководство администратора

Полное техническое руководство для настройки и управления CMS Pro

## 📋 Оглавление

1. [Требования к серверу](#требования-к-серверу)
2. [Установка](#установка)
3. [Конфигурация](#конфигурация)
4. [Безопасность](#безопасность)
5. [Мониторинг](#мониторинг)
6. [Оптимизация](#оптимизация)
7. [Отладка](#отладка)
8. [Обновление](#обновление)

## Требования к серверу

### Минимальные требования

```
PHP: 8.0.0+
MySQL: 5.7.22+
Apache: 2.4+
Память: 256 MB
Свободное место: 1 GB
```

### Рекомендуемые требования

```
PHP: 8.1+
MySQL: 8.0+
Nginx: 1.20+
Память: 2 GB
Свободное место: 10 GB
CPU: 2 ядра
Интернет: 100 Mbps+
```

### Проверка требований

```bash
# Проверка версии PHP
php -v

# Проверка установленных модулей
php -m | grep -E "(mysql|pdo|curl|mbstring|fileinfo)"

# Проверка прав доступа
ls -la /var/www/cms-pro/

# Проверка свободного места
df -h

# Проверка памяти
free -h
```

## Установка

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка зависимостей
sudo apt install -y php8.1-cli php8.1-mysql php8.1-curl \
  php8.1-mbstring php8.1-xml php8.1-zip curl git

# Установка Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Установка Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Загрузка проекта

```bash
# Переход в директорию веб-сервера
cd /var/www

# Клонирование репозитория
git clone https://github.com/your-repo/cms-pro.git
cd cms-pro

# Установка прав доступа
sudo chown -R www-data:www-data /var/www/cms-pro
sudo chmod -R 755 /var/www/cms-pro
sudo chmod -R 775 /var/www/cms-pro/storage
sudo chmod -R 775 /var/www/cms-pro/bootstrap/cache
```

### 3. Установка зависимостей

```bash
# PHP зависимости
composer install --optimize-autoloader --no-dev

# Node.js зависимости
npm install
npm run build
```

### 4. Конфигурация приложения

```bash
# Копирование файла конфигурации
cp .env.example .env

# Генерация ключа приложения
php artisan key:generate

# Редактирование .env
nano .env
```

### 5. Настройка базы данных

```bash
# Создание БД
mysql -u root -p -e "CREATE DATABASE cms_pro CHARACTER SET utf8mb4;"
mysql -u root -p -e "CREATE USER 'cms_user'@'localhost' IDENTIFIED BY 'strong_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON cms_pro.* TO 'cms_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Миграция таблиц
php artisan migrate --force

# Заполнение данных
php artisan db:seed
```

### 6. Настройка веб-сервера

#### Apache

```apache
# /etc/apache2/sites-available/cms-pro.conf

<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    DocumentRoot /var/www/cms-pro/public
    
    <Directory /var/www/cms-pro>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/cms-pro/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    LogLevel warn
    ErrorLog ${APACHE_LOG_DIR}/cms-pro-error.log
    CustomLog ${APACHE_LOG_DIR}/cms-pro-access.log combined
</VirtualHost>
```

Активирование:
```bash
sudo a2enmod rewrite
sudo a2ensite cms-pro
sudo systemctl restart apache2
```

#### Nginx

```nginx
# /etc/nginx/sites-available/cms-pro

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/cms-pro/public;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    index index.html index.htm index.php;
    
    charset utf-8;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    
    error_page 404 /index.php;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Активирование:
```bash
sudo ln -s /etc/nginx/sites-available/cms-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Конфигурация

### Основной файл конфигурации (.env)

```bash
# Приложение
APP_NAME="CMS Pro"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# БД
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cms_pro
DB_USERNAME=cms_user
DB_PASSWORD=strong_password

# Email
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=admin@cms-pro.com
MAIL_FROM_NAME="CMS Pro"

# JWT
JWT_SECRET=$(php artisan key:generate --show | cut -d= -f2 | cut -d' ' -f2)

# Backup
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_HOUR=00
BACKUP_RETENTION_DAYS=30
```

### Кэширование

```bash
# Конфигурация кэша
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Сессии
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
```

### Логирование

```bash
# Логи
LOG_CHANNEL=stack
LOG_LEVEL=debug
LOG_DAILY=true
LOG_DAILY_DAYS=14
```

## Безопасность

### SSL/TLS Сертификат

```bash
# Установка Let's Encrypt (бесплатно)
sudo apt install certbot python3-certbot-apache -y

# Получение сертификата
sudo certbot certonly --apache -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

### Брандмауэр

```bash
# Включение UFW
sudo ufw enable

# Разрешение портов
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp

# Проверка правил
sudo ufw status
```

### Защита от атак

```bash
# Установка Fail2ban
sudo apt install fail2ban -y

# Конфигурация
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Статус
sudo fail2ban-client status sshd
```

### Безопасные права доступа

```bash
# Правильные права для хранилища
sudo chown -R www-data:www-data /var/www/cms-pro/storage
sudo chmod -R 755 /var/www/cms-pro/storage

# Запрет доступа к конфиг файлам
sudo chmod 644 /var/www/cms-pro/.env
sudo chmod 644 /var/www/cms-pro/.env.example
```

## Мониторинг

### Логирование

```bash
# Просмотр логов приложения
tail -f /var/www/cms-pro/storage/logs/laravel-*.log

# Просмотр логов веб-сервера
tail -f /var/log/apache2/cms-pro-error.log
tail -f /var/log/apache2/cms-pro-access.log

# Просмотр логов БД
tail -f /var/log/mysql/error.log
```

### Мониторинг системы

```bash
# CPU и память
top
htop

# Дисковое пространство
du -sh /var/www/cms-pro/*
df -h

# Сетевые соединения
netstat -an | grep ESTABLISHED | wc -l
```

### Мониторинг БД

```bash
# Проверка статуса MySQL
mysql -u cms_user -p -e "SHOW STATUS LIKE 'Threads%';"

# Размер БД
mysql -u cms_user -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) FROM information_schema.tables WHERE table_schema = 'cms_pro';"

# Медленные запросы
mysql -u cms_user -p -e "SHOW VARIABLES LIKE 'slow_query_log';"
```

## Оптимизация

### PHP оптимизация

```ini
# /etc/php/8.1/fpm/php.ini

max_execution_time = 30
max_input_time = 60
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M

# Кэширование кода
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
```

### MySQL оптимизация

```sql
-- /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
max_connections = 100
innodb_buffer_pool_size = 256M
innodb_log_file_size = 100M
query_cache_size = 256M
query_cache_type = 1
slow_query_log = 1
long_query_time = 2
```

### Оптимизация Laravel

```bash
# Кэширование конфигурации
php artisan config:cache

# Кэширование маршрутов
php artisan route:cache

# Кэширование представлений
php artisan view:cache

# Оптимизация загрузчика
composer dump-autoload --optimize --no-dev
```

## Отладка

### Включение режима отладки

```bash
# .env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Сброс логов

```bash
# Очистка логов
rm /var/www/cms-pro/storage/logs/laravel-*.log

# Просмотр в реальном времени
tail -f /var/www/cms-pro/storage/logs/laravel-*.log
```

### Исправление распространенных ошибок

```bash
# Ошибка прав доступа
sudo chown -R www-data:www-data /var/www/cms-pro/storage
sudo chmod -R 775 /var/www/cms-pro/storage

# Ошибка БД
php artisan migrate:refresh --seed

# Ошибка кэша
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Ошибка конфигурации
php artisan config:clear
php artisan config:cache
```

## Обновление

### Обновление системы

```bash
# Обновление пакетов Linux
sudo apt update && sudo apt upgrade -y

# Обновление PHP
sudo apt install php8.1-all

# Обновление MySQL
sudo apt install mysql-server
```

### Обновление проекта

```bash
# Загрузка обновлений
git pull origin main

# Обновление зависимостей
composer update
npm update

# Выполнение миграций
php artisan migrate

# Очистка кэша
php artisan cache:clear
php artisan view:clear

# Перезагрузка веб-сервера
sudo systemctl restart apache2  # или nginx
```

## Резервное копирование

### Ручное резервное копирование

```bash
# БД
mysqldump -u cms_user -p cms_pro > /backups/cms_pro_$(date +%Y%m%d).sql

# Файлы
tar -czf /backups/cms_pro_$(date +%Y%m%d).tar.gz /var/www/cms-pro

# Всё вместе
mysqldump -u cms_user -p cms_pro | gzip > /backups/db_$(date +%Y%m%d_%H%M%S).sql.gz
tar -czf /backups/files_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/cms-pro/public/uploads
```

### Автоматическое резервное копирование

```bash
# Планировщик Cron
crontab -e

# Добавить строку
0 0 * * * cd /var/www/cms-pro && php artisan backup:run >> /var/log/cms-backup.log 2>&1
```

## Проверочный список (Checklist)

### Перед запуском в продакшн

- [ ] SSL сертификат установлен
- [ ] Базовая конфигурация выполнена
- [ ] БД создана и заполнена
- [ ] Права доступа установлены правильно
- [ ] Резервное копирование настроено
- [ ] Логирование включено
- [ ] Мониторинг настроен
- [ ] Брандмауэр активирован
- [ ] Регулярные обновления запланированы
- [ ] Персонал обучен

### Регулярное обслуживание

- [ ] Проверка логов (ежедневно)
- [ ] Проверка дискового пространства (еженедельно)
- [ ] Проверка резервных копий (еженедельно)
- [ ] Обновление системы (ежемесячно)
- [ ] Анализ производительности (ежемесячно)
- [ ] Оптимизация БД (ежеквартально)

---

**Версия:** 1.0  
**Последнее обновление:** 28 мая 2026 г.
