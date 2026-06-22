# 📊 ER диаграмма базы данных клиентов CMS Pro

## 🔗 Связи между таблицами

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS (Клиенты)                       │
├─────────────────────────────────────────────────────────────────┤
│ ★ ClientID (PK)                                                 │
│   CompanyName                                                   │
│   ContactName                                                   │
│   Email, Phone, Website                                         │
│   Address, City, Region, PostalCode, Country                    │
│   INN, KPP, BankAccount, BankName                              │
│   Status, ClientCategory                                        │
│   RegistrationDate, LastContactDate                             │
│   ManagerName, ManagerEmail                                     │
└─────────────────────────────────────────────────────────────────┘
         │
         ├─── 1:N ──────────────────┬─────────────────────┬─────────────────┬────────────────┐
         │                          │                     │                 │                │
         │                          ▼                     ▼                 ▼                ▼
         │              ┌──────────────────────┐ ┌──────────────────┐ ┌────────────────┐ ┌──────────────┐
         │              │ ClientContacts       │ │ ClientContracts  │ │ ClientServices │ │ Payments     │
         │              │ (Контакты)          │ │ (Контракты)      │ │ (Услуги)       │ │ (Платежи)    │
         │              ├──────────────────────┤ ├──────────────────┤ ├────────────────┤ ├──────────────┤
         │              │ ★ ContactID (PK)     │ │ ★ ContractID(PK) │ │ ★ ServiceID(PK)│ │★ PaymentID   │
         │              │ ◆ ClientID (FK)      │ │ ◆ ClientID (FK)  │ │ ◆ ClientID(FK) │ │◆ ClientID    │
         │              │ FullName             │ │ ContractNumber   │ │ ServiceName    │ │◆ ContractID  │
         │              │ Position, Email      │ │ ContractDate     │ │ ServiceType    │ │ PaymentAmount│
         │              │ Phone, IsMainContact │ │ StartDate, EndDate│ │ MonthlyPrice  │ │ PaymentDate  │
         │              └──────────────────────┘ │ ContractValue    │ │ Status         │ │ PaymentMethod│
         │                                        │ Status           │ │ StartDate      │ │ Status       │
         │                                        └──────────────────┘ │ EndDate        │ │ Transaction# │
         │                                                             └────────────────┘ └──────────────┘
         │                                                                   ▲
         │                                                                   │ 1:N
         │                                                                   │
         │                                                                   └─── Связь через
         │                                                                        ClientID
         │
         ├─────────────────────────────────┬─────────────────────────┐
         │                                 ▼                         ▼
         │              ┌──────────────────────────┐ ┌──────────────────────────┐
         │              │ Communications           │ │ ClientDocuments          │
         │              │ (Коммуникации)          │ │ (Документы)              │
         │              ├──────────────────────────┤ ├──────────────────────────┤
         │              │ ★ CommunicationID (PK)   │ │ ★ DocumentID (PK)        │
         │              │ ◆ ClientID (FK)         │ │ ◆ ClientID (FK)          │
         │              │ CommunicationType       │ │ DocumentName             │
         │              │ CommunicationDate       │ │ DocumentType             │
         │              │ Subject, Description    │ │ FilePath                 │
         │              │ Result, EmployeeName    │ │ UploadDate               │
         │              └──────────────────────────┘ │ Description              │
         │                                            └──────────────────────────┘
         │
         └─────────────────────────────────────────────────────────────────────────────
                                          │
                                          ▼
                              ┌──────────────────────────┐
                              │ INDEXES (Индексы)       │
                              ├──────────────────────────┤
                              │ ★ Email (для поиска)     │
                              │ ★ Status (фильтр)       │
                              │ ★ City (группировка)    │
                              │ ★ ClientID (FK связи)   │
                              │ ★ PaymentDate           │
                              │ ★ CommunicationDate     │
                              └──────────────────────────┘
```

## 📋 Карданльность связей (Cardinality)

```
Clients (1) ──────────┬────── (N) ClientContacts
                      ├────── (N) ClientContracts
                      ├────── (N) ClientServices
                      ├────── (N) Payments
                      ├────── (N) Communications
                      └────── (N) ClientDocuments

ClientContracts (1) ──────── (N) Payments
```

## 🔑 Первичные и внешние ключи

### Первичные ключи (Primary Keys - PK)
```
Clients.ClientID           → Auto Identity (1, 1)
ClientContacts.ContactID   → Auto Identity (1, 1)
ClientContracts.ContractID → Auto Identity (1, 1)
ClientServices.ServiceID   → Auto Identity (1, 1)
Payments.PaymentID         → Auto Identity (1, 1)
Communications.CommunicationID → Auto Identity (1, 1)
ClientDocuments.DocumentID → Auto Identity (1, 1)
```

### Внешние ключи (Foreign Keys - FK)
```
ClientContacts.ClientID      → REFERENCES Clients(ClientID)
ClientContracts.ClientID     → REFERENCES Clients(ClientID)
ClientServices.ClientID      → REFERENCES Clients(ClientID)
Payments.ClientID            → REFERENCES Clients(ClientID)
Payments.ContractID          → REFERENCES ClientContracts(ContractID)
Communications.ClientID      → REFERENCES Clients(ClientID)
ClientDocuments.ClientID     → REFERENCES Clients(ClientID)
```

## 📊 Таблица типов данных

```
┌─────────────────┬──────────────────┬─────────────────────────┐
│ Тип данных      │ Использование    │ Примеры полей           │
├─────────────────┼──────────────────┼─────────────────────────┤
│ INT             │ Числовые ID      │ ClientID, ContactID     │
│ IDENTITY(1,1)   │ Автоинкремент    │ Все PK ключи            │
│ NVARCHAR(255)   │ Текст (до 255)   │ CompanyName, Email      │
│ NVARCHAR(MAX)   │ Длинный текст    │ Description, Notes      │
│ DECIMAL(12, 2)  │ Деньги/цены      │ ContractValue, Price    │
│ DATETIME        │ Дата и время     │ CreatedAt, PaymentDate  │
│ BIT             │ Булево (0/1)     │ IsMainContact           │
│ UNIQUE          │ Уникальные       │ Email, ContractNumber   │
└─────────────────┴──────────────────┴─────────────────────────┘
```

## 🔍 Индексы и производительность

### Созданные индексы

```sql
IDX_Clients_Email           -- Для быстрого поиска по Email
IDX_Clients_Status          -- Для фильтрации по статусу
IDX_Clients_City            -- Для группировки по городам
IDX_ClientContacts_ClientID -- Для соединения таблиц
IDX_ClientContracts_ClientID
IDX_ClientServices_ClientID
IDX_Payments_ClientID
IDX_Communications_ClientID
IDX_ClientDocuments_ClientID
```

## 📈 Примеры запросов с JOIN

### Получить клиента с его контактами
```sql
SELECT 
    c.CompanyName,
    c.ContactName,
    cc.FullName AS ContactPerson,
    cc.Position,
    cc.Email
FROM Clients c
LEFT JOIN ClientContacts cc ON c.ClientID = cc.ClientID
WHERE c.ClientID = 1
```

### Получить клиента с его контрактами и платежами
```sql
SELECT 
    c.CompanyName,
    con.ContractNumber,
    con.ContractValue,
    p.PaymentAmount,
    p.PaymentDate,
    (con.ContractValue - SUM(p.PaymentAmount)) AS Remaining
FROM Clients c
INNER JOIN ClientContracts con ON c.ClientID = con.ClientID
LEFT JOIN Payments p ON con.ContractID = p.ContractID
GROUP BY c.ClientID, c.CompanyName, con.ContractID, con.ContractNumber,
         con.ContractValue, p.PaymentAmount, p.PaymentDate
```

### Получить список услуг клиента с доходом
```sql
SELECT 
    c.CompanyName,
    cs.ServiceName,
    cs.ServiceType,
    cs.MonthlyPrice,
    DATEDIFF(MONTH, cs.StartDate, ISNULL(cs.EndDate, GETDATE())) AS Months,
    (cs.MonthlyPrice * DATEDIFF(MONTH, cs.StartDate, ISNULL(cs.EndDate, GETDATE()))) AS TotalRevenue
FROM Clients c
INNER JOIN ClientServices cs ON c.ClientID = cs.ClientID
WHERE cs.Status = 'Active'
ORDER BY TotalRevenue DESC
```

## 🎯 Нормализация БД

База данных нормализована до **3-й нормальной формы (3NF)**:

```
✓ 1NF (Первая нормальная форма)
  - Все значения атомарны
  - Нет повторяющихся групп

✓ 2NF (Вторая нормальная форма)
  - Удовлетворяет 1NF
  - Нет частичных зависимостей от ключа

✓ 3NF (Третья нормальная форма)
  - Удовлетворяет 2NF
  - Нет транзитивных зависимостей
  - Все атрибуты зависят только от ключа
```

## 🔒 Ограничения целостности

### Каскадные удаления
```sql
FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) 
ON DELETE CASCADE
```
При удалении клиента все его контракты, услуги, платежи и коммуникации удаляются автоматически.

### Уникальные ограничения
```sql
Email NVARCHAR(255) UNIQUE     -- Каждый email уникален
ContractNumber NVARCHAR(50) UNIQUE -- Номер контракта уникален
```

## 📊 Статистика

```
Таблиц: 7
Представлений: 4
Индексов: 9+
Первичных ключей: 7
Внешних ключей: 7
Уникальных ограничений: 2
```

## 🔄 Примеры транзакций

### Добавление нового клиента с контрактом

```sql
BEGIN TRANSACTION

BEGIN TRY
    -- 1. Добавляем клиента
    INSERT INTO Clients (CompanyName, ContactName, Email, Status)
    VALUES ('Новая Компания', 'Иван Сидоров', 'ivan@newcompany.ru', 'Active')
    
    DECLARE @ClientID INT = SCOPE_IDENTITY()
    
    -- 2. Добавляем контракт
    INSERT INTO ClientContracts (ClientID, ContractNumber, ContractDate, StartDate, ContractValue)
    VALUES (@ClientID, 'KD-2026-100', GETDATE(), GETDATE(), 500000.00)
    
    -- 3. Добавляем услугу
    INSERT INTO ClientServices (ClientID, ServiceName, MonthlyPrice, Status)
    VALUES (@ClientID, 'Веб-дизайн', 50000.00, 'Active')
    
    COMMIT TRANSACTION
    PRINT 'Клиент успешно добавлен!'
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION
    PRINT 'Ошибка при добавлении клиента: ' + ERROR_MESSAGE()
END CATCH
```

---

**Версия:** 1.0  
**Дата создания:** 28 мая 2026 г.  
**СУБД:** Microsoft SQL Server 2016+
