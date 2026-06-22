# 🗄️ База данных клиентов для CMS Pro

## 📋 Описание

Полная интегрированная система управления данными клиентов в MSSQL с поддержкой:
- Информации о компаниях и контактных лицах
- Контрактов и услуг
- Платежей и счетов
- Истории коммуникаций
- Документов и файлов
- Аналитики и отчетов

## 📊 Структура базы данных

### Таблицы

#### 1. **Clients** - Основная таблица клиентов
```
- ClientID (Primary Key)
- CompanyName, ContactName
- Email, Phone, Website
- Адрес (Address, City, Region, Country)
- Финансовые данные (INN, KPP, BankAccount)
- Status (Active, Inactive, Blocked, Prospect)
- ClientCategory (VIP, Regular, Small, Partner)
- ManagerName - ответственный менеджер
- Даты создания и обновления
```

#### 2. **ClientContacts** - Контактные лица
```
- ContactID (Primary Key)
- ClientID (Foreign Key)
- FullName, Position, Department
- Email, Phone, MobilePhone
- IsMainContact (флаг основного контакта)
```

#### 3. **ClientContracts** - Контракты и соглашения
```
- ContractID (Primary Key)
- ClientID (Foreign Key)
- ContractNumber (уникальный номер)
- ContractDate, StartDate, EndDate
- ContractValue, Currency
- Status (Active, Completed, Terminated)
```

#### 4. **ClientServices** - Услуги для клиентов
```
- ServiceID (Primary Key)
- ClientID (Foreign Key)
- ServiceName, ServiceType
- MonthlyPrice
- Status, StartDate, EndDate
```

#### 5. **Payments** - Платежи и счета
```
- PaymentID (Primary Key)
- ClientID, ContractID (Foreign Keys)
- PaymentAmount, PaymentDate
- PaymentMethod (Bank Transfer, Card, Cash)
- Status (Pending, Completed, Failed)
- TransactionNumber
```

#### 6. **Communications** - История коммуникаций
```
- CommunicationID (Primary Key)
- ClientID (Foreign Key)
- CommunicationType (Email, Phone, Meeting, Message)
- CommunicationDate
- Subject, Description, Result
- EmployeeName
```

#### 7. **ClientDocuments** - Документы
```
- DocumentID (Primary Key)
- ClientID (Foreign Key)
- DocumentName, DocumentType
- FilePath, UploadDate
- Description
```

### Представления (Views)

1. **vw_ActiveClients** - Список активных клиентов
2. **vw_ClientStatistics** - Статистика по клиентам
3. **vw_ClientsWithServices** - Клиенты с активными услугами
4. **vw_OverduePayments** - Просроченные платежи

## 🚀 Как использовать в VS Code

### Способ 1: Выполнение через MSSQL расширение

1. **Откройте VS Code**
   - Убедитесь, что установлено расширение "mssql"

2. **Откройте файл скрипта**
   - `database/clients_database.sql`

3. **Подключитесь к SQL Server**
   - В VS Code: `Ctrl+Shift+P` → "MS SQL: Connect"
   - Выберите нужный сервер

4. **Выполните скрипт**
   - Нажмите `Ctrl+Shift+E` или кликните "Execute Query"
   - Или правой кнопкой → "Execute Query"

### Способ 2: Через SQL Server Management Studio

1. Откройте SQL Server Management Studio
2. Подключитесь к своему SQL Server
3. New Query (Новый запрос)
4. Откройте файл `clients_database.sql`
5. Нажмите Execute (F5)

### Способ 3: Через командную строку

```bash
# Для SQL Server на Windows
sqlcmd -S localhost -U sa -P YourPassword -i database/clients_database.sql

# Для SQL Server на Linux
sqlcmd -S localhost,1433 -U sa -P YourPassword -i database/clients_database.sql
```

## ✅ Что создается после выполнения скрипта

### База данных
- ✅ **CMSClients** - новая база данных

### Таблицы (7 штук)
- ✅ Clients
- ✅ ClientContacts
- ✅ ClientContracts
- ✅ ClientServices
- ✅ Payments
- ✅ Communications
- ✅ ClientDocuments

### Индексы (9 штук)
- ✅ Индексы для быстрого поиска по Email, Status, City
- ✅ Индексы для связей между таблицами

### Представления (4 штуки)
- ✅ vw_ActiveClients
- ✅ vw_ClientStatistics
- ✅ vw_ClientsWithServices
- ✅ vw_OverduePayments

### Примеры данных
- ✅ 8 компаний-клиентов
- ✅ 6 контактных лиц
- ✅ 6 контрактов
- ✅ 7 услуг
- ✅ 6 платежей
- ✅ 6 записей коммуникаций
- ✅ 6 документов

## 📝 Примеры запросов

### Получить всех активных клиентов
```sql
SELECT * FROM vw_ActiveClients;
```

### Получить статистику по клиентам
```sql
SELECT * FROM vw_ClientStatistics 
ORDER BY TotalPayments DESC;
```

### Получить клиентов с активными услугами
```sql
SELECT * FROM vw_ClientsWithServices
WHERE MonthlyPrice > 15000;
```

### Найти просроченные платежи
```sql
SELECT * FROM vw_OverduePayments
WHERE DaysOverdue > 30;
```

### Получить контакты конкретного клиента
```sql
SELECT * FROM ClientContacts
WHERE ClientID = 1
ORDER BY IsMainContact DESC;
```

### Получить все платежи клиента
```sql
SELECT p.*, c.CompanyName
FROM Payments p
INNER JOIN Clients c ON p.ClientID = c.ClientID
WHERE c.CompanyName LIKE '%ООО%'
ORDER BY p.PaymentDate DESC;
```

### Получить активные контракты с суммой
```sql
SELECT 
    cc.ContractNumber,
    c.CompanyName,
    cc.ContractValue,
    cc.StartDate,
    cc.EndDate,
    DATEDIFF(DAY, GETDATE(), cc.EndDate) AS DaysLeft
FROM ClientContracts cc
INNER JOIN Clients c ON cc.ClientID = c.ClientID
WHERE cc.Status = 'Active'
ORDER BY cc.EndDate;
```

### Получить месячную выручку по услугам
```sql
SELECT 
    cs.ServiceType,
    COUNT(*) AS ServiceCount,
    SUM(cs.MonthlyPrice) AS TotalMonthlyRevenue
FROM ClientServices cs
WHERE cs.Status = 'Active'
GROUP BY cs.ServiceType
ORDER BY TotalMonthlyRevenue DESC;
```

## 🔧 Модификация скрипта

### Если вы хотите удалить базу данных

```sql
USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'CMSClients')
BEGIN
    ALTER DATABASE CMSClients SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE CMSClients;
END
GO
```

### Если вы хотите очистить только данные

```sql
USE CMSClients;
GO

DELETE FROM ClientDocuments;
DELETE FROM Communications;
DELETE FROM Payments;
DELETE FROM ClientServices;
DELETE FROM ClientContacts;
DELETE FROM ClientContracts;
DELETE FROM Clients;

DBCC CHECKIDENT ('Clients', RESEED, 0);
DBCC CHECKIDENT ('ClientContacts', RESEED, 0);
DBCC CHECKIDENT ('ClientContracts', RESEED, 0);
DBCC CHECKIDENT ('ClientServices', RESEED, 0);
DBCC CHECKIDENT ('Payments', RESEED, 0);
DBCC CHECKIDENT ('Communications', RESEED, 0);
DBCC CHECKIDENT ('ClientDocuments', RESEED, 0);
GO
```

## 📋 Требования

- **Microsoft SQL Server** 2016 или выше
- **SQL Server Management Studio** или расширение mssql для VS Code
- Права на создание базы данных

## 🔍 Проверка созданной базы данных

После выполнения скрипта вы должны увидеть сообщение:
```
========================================
Базовая конфигурация завершена успешно!
========================================
```

## 🆘 Решение проблем

### Ошибка: "Login failed for user 'sa'"
→ Проверьте пароль SQL Server и права доступа

### Ошибка: "CREATE DATABASE permission denied"
→ Убедитесь, что у пользователя есть права на создание БД

### Ошибка: "Invalid object name"
→ Убедитесь, что вы находитесь в базе CMSClients (USE CMSClients;)

## 📞 Поддержка

Для вопросов или проблем обратитесь к документации:
- `/docs/DATABASE.md` - Полное описание схемы БД
- `/docs/ADMIN_GUIDE.md` - Техническое руководство

---

**Версия:** 1.0  
**Дата создания:** 28 мая 2026 г.  
**Статус:** ✅ Готово к использованию
