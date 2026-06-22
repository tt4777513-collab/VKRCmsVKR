# 🔍 Полезные SQL запросы для БД клиентов

Коллекция готовых SQL запросов для частых операций с базой данных клиентов.

## 📋 Основные SELECT запросы

### 1️⃣ Получить всех клиентов с основной информацией
```sql
SELECT 
    ClientID,
    CompanyName,
    ContactName,
    Email,
    Phone,
    City,
    Status,
    ClientCategory,
    RegistrationDate
FROM Clients
ORDER BY RegistrationDate DESC;
```

### 2️⃣ Получить активных клиентов с количеством контактов
```sql
SELECT 
    c.ClientID,
    c.CompanyName,
    COUNT(cc.ContactID) AS ContactCount,
    c.Email,
    c.Phone,
    c.Status
FROM Clients c
LEFT JOIN ClientContacts cc ON c.ClientID = cc.ClientID
WHERE c.Status = 'Active'
GROUP BY c.ClientID, c.CompanyName, c.Email, c.Phone, c.Status
ORDER BY ContactCount DESC;
```

### 3️⃣ Получить клиентов по городу
```sql
SELECT 
    CompanyName,
    ContactName,
    City,
    Email,
    Phone
FROM Clients
WHERE City = 'Москва'
ORDER BY CompanyName;
```

### 4️⃣ Получить VIP клиентов
```sql
SELECT 
    CompanyName,
    ContactName,
    Email,
    Phone,
    ManagerName,
    RegistrationDate
FROM Clients
WHERE ClientCategory = 'VIP'
ORDER BY RegistrationDate DESC;
```

### 5️⃣ Получить клиентов, не имеющих контактов
```sql
SELECT 
    c.ClientID,
    c.CompanyName,
    c.ContactName,
    c.Email
FROM Clients c
LEFT JOIN ClientContacts cc ON c.ClientID = cc.ClientID
WHERE cc.ContactID IS NULL;
```

## 👥 Запросы о контактных лицах

### 6️⃣ Получить основного контакта для каждого клиента
```sql
SELECT 
    c.CompanyName,
    cc.FullName,
    cc.Position,
    cc.Email,
    cc.Phone
FROM Clients c
INNER JOIN ClientContacts cc ON c.ClientID = cc.ClientID
WHERE cc.IsMainContact = 1;
```

### 7️⃣ Получить все контакты конкретного клиента
```sql
SELECT 
    FullName,
    Position,
    Department,
    Email,
    Phone,
    MobilePhone,
    IsMainContact
FROM ClientContacts
WHERE ClientID = 1
ORDER BY IsMainContact DESC, FullName;
```

### 8️⃣ Найти контакты по должности
```sql
SELECT 
    cc.FullName,
    cc.Position,
    c.CompanyName,
    cc.Email,
    cc.Phone
FROM ClientContacts cc
INNER JOIN Clients c ON cc.ClientID = c.ClientID
WHERE cc.Position LIKE '%Директор%'
ORDER BY c.CompanyName;
```

## 📄 Запросы о контрактах

### 9️⃣ Получить активные контракты
```sql
SELECT 
    cc.ContractID,
    c.CompanyName,
    cc.ContractNumber,
    cc.ContractValue,
    cc.StartDate,
    cc.EndDate,
    DATEDIFF(DAY, GETDATE(), cc.EndDate) AS DaysRemaining
FROM ClientContracts cc
INNER JOIN Clients c ON cc.ClientID = c.ClientID
WHERE cc.Status = 'Active'
ORDER BY cc.EndDate;
```

### 🔟 Контракты, заканчивающиеся через месяц
```sql
SELECT 
    c.CompanyName,
    cc.ContractNumber,
    cc.ContractValue,
    cc.EndDate,
    DATEDIFF(DAY, GETDATE(), cc.EndDate) AS DaysLeft
FROM ClientContracts cc
INNER JOIN Clients c ON cc.ClientID = c.ClientID
WHERE cc.Status = 'Active' 
  AND cc.EndDate BETWEEN GETDATE() AND DATEADD(MONTH, 1, GETDATE())
ORDER BY cc.EndDate;
```

### 1️⃣1️⃣ Получить контрактную стоимость по статусам
```sql
SELECT 
    Status,
    COUNT(*) AS ContractCount,
    SUM(ContractValue) AS TotalValue,
    AVG(ContractValue) AS AvgValue
FROM ClientContracts
GROUP BY Status
ORDER BY TotalValue DESC;
```

### 1️⃣2️⃣ Контракты, истекшие давно
```sql
SELECT 
    c.CompanyName,
    cc.ContractNumber,
    cc.ContractValue,
    cc.EndDate,
    DATEDIFF(DAY, cc.EndDate, GETDATE()) AS DaysExpired
FROM ClientContracts cc
INNER JOIN Clients c ON cc.ClientID = c.ClientID
WHERE cc.Status = 'Completed' 
  AND cc.EndDate < DATEADD(MONTH, -6, GETDATE())
ORDER BY cc.EndDate DESC;
```

## 💰 Запросы о платежах

### 1️⃣3️⃣ Получить финансовую статистику по клиентам
```sql
SELECT 
    c.CompanyName,
    COUNT(DISTINCT cc.ContractID) AS TotalContracts,
    SUM(cc.ContractValue) AS TotalContractValue,
    SUM(ISNULL(p.PaymentAmount, 0)) AS TotalPaid,
    SUM(cc.ContractValue) - SUM(ISNULL(p.PaymentAmount, 0)) AS Remaining
FROM Clients c
LEFT JOIN ClientContracts cc ON c.ClientID = cc.ClientID
LEFT JOIN Payments p ON cc.ContractID = p.ContractID
GROUP BY c.ClientID, c.CompanyName
ORDER BY Remaining DESC;
```

### 1️⃣4️⃣ Получить просроченные платежи
```sql
SELECT 
    c.CompanyName,
    p.PaymentAmount,
    p.PaymentDate,
    DATEDIFF(DAY, p.PaymentDate, GETDATE()) AS DaysOverdue
FROM Payments p
INNER JOIN Clients c ON p.ClientID = c.ClientID
WHERE p.Status = 'Pending' 
  AND DATEDIFF(DAY, p.PaymentDate, GETDATE()) > 0
ORDER BY DaysOverdue DESC;
```

### 1️⃣5️⃣ Месячная выручка от платежей
```sql
SELECT 
    DATEPART(YEAR, PaymentDate) AS Year,
    DATEPART(MONTH, PaymentDate) AS Month,
    COUNT(*) AS PaymentCount,
    SUM(PaymentAmount) AS MonthlyRevenue
FROM Payments
WHERE Status = 'Completed'
GROUP BY DATEPART(YEAR, PaymentDate), DATEPART(MONTH, PaymentDate)
ORDER BY Year DESC, Month DESC;
```

### 1️⃣6️⃣ Способы платежа и их использование
```sql
SELECT 
    PaymentMethod,
    COUNT(*) AS UsageCount,
    SUM(PaymentAmount) AS TotalAmount,
    AVG(PaymentAmount) AS AvgAmount
FROM Payments
GROUP BY PaymentMethod
ORDER BY TotalAmount DESC;
```

### 1️⃣7️⃣ Неполные платежи (требующие внимания)
```sql
SELECT 
    c.CompanyName,
    cc.ContractNumber,
    cc.ContractValue,
    SUM(ISNULL(p.PaymentAmount, 0)) AS PaidAmount,
    cc.ContractValue - SUM(ISNULL(p.PaymentAmount, 0)) AS RemainingAmount,
    CAST((SUM(ISNULL(p.PaymentAmount, 0)) / cc.ContractValue * 100) AS DECIMAL(5,2)) AS PaymentPercent
FROM Clients c
INNER JOIN ClientContracts cc ON c.ClientID = cc.ClientID
LEFT JOIN Payments p ON cc.ContractID = p.ContractID
WHERE cc.Status = 'Active'
GROUP BY c.ClientID, c.CompanyName, cc.ContractID, cc.ContractNumber, cc.ContractValue
HAVING cc.ContractValue - SUM(ISNULL(p.PaymentAmount, 0)) > 0
ORDER BY RemainingAmount DESC;
```

## 🛠️ Запросы об услугах

### 1️⃣8️⃣ Активные услуги с доходом
```sql
SELECT 
    c.CompanyName,
    cs.ServiceName,
    cs.ServiceType,
    cs.MonthlyPrice,
    DATEDIFF(MONTH, cs.StartDate, ISNULL(cs.EndDate, GETDATE())) AS ActiveMonths,
    (cs.MonthlyPrice * DATEDIFF(MONTH, cs.StartDate, ISNULL(cs.EndDate, GETDATE()))) AS TotalIncome
FROM Clients c
INNER JOIN ClientServices cs ON c.ClientID = cs.ClientID
WHERE cs.Status = 'Active'
ORDER BY TotalIncome DESC;
```

### 1️⃣9️⃣ Типы услуг и их популярность
```sql
SELECT 
    ServiceType,
    COUNT(*) AS ServiceCount,
    SUM(MonthlyPrice) AS TotalMonthlyRevenue,
    AVG(MonthlyPrice) AS AvgPrice
FROM ClientServices
WHERE Status = 'Active'
GROUP BY ServiceType
ORDER BY TotalMonthlyRevenue DESC;
```

### 2️⃣0️⃣ Услуги, которые заканчиваются
```sql
SELECT 
    c.CompanyName,
    cs.ServiceName,
    cs.ServiceType,
    cs.MonthlyPrice,
    cs.EndDate,
    DATEDIFF(DAY, GETDATE(), cs.EndDate) AS DaysLeft
FROM Clients c
INNER JOIN ClientServices cs ON c.ClientID = cs.ClientID
WHERE cs.Status = 'Active' 
  AND cs.EndDate IS NOT NULL
  AND cs.EndDate <= DATEADD(MONTH, 1, GETDATE())
ORDER BY cs.EndDate;
```

## 📞 Запросы о коммуникациях

### 2️⃣1️⃣ Последние коммуникации с клиентами
```sql
SELECT 
    c.CompanyName,
    com.CommunicationType,
    com.Subject,
    com.CommunicationDate,
    com.Result,
    com.EmployeeName
FROM Communications com
INNER JOIN Clients c ON com.ClientID = c.ClientID
ORDER BY com.CommunicationDate DESC;
```

### 2️⃣2️⃣ Клиенты без коммуникаций за последний месяц
```sql
SELECT 
    c.ClientID,
    c.CompanyName,
    c.LastContactDate,
    DATEDIFF(DAY, ISNULL(c.LastContactDate, c.RegistrationDate), GETDATE()) AS DaysSinceContact
FROM Clients c
WHERE c.Status = 'Active'
  AND (c.LastContactDate IS NULL OR c.LastContactDate < DATEADD(MONTH, -1, GETDATE()))
ORDER BY DaysSinceContact DESC;
```

### 2️⃣3️⃣ Коммуникации по типам
```sql
SELECT 
    CommunicationType,
    COUNT(*) AS CommunicationCount,
    COUNT(DISTINCT ClientID) AS UniqueClients
FROM Communications
WHERE CommunicationDate >= DATEADD(MONTH, -3, GETDATE())
GROUP BY CommunicationType
ORDER BY CommunicationCount DESC;
```

### 2️⃣4️⃣ Активность по менеджерам
```sql
SELECT 
    com.EmployeeName,
    COUNT(*) AS TotalCommunications,
    COUNT(DISTINCT com.ClientID) AS ClientsContacted,
    MAX(com.CommunicationDate) AS LastActivity
FROM Communications com
GROUP BY com.EmployeeName
ORDER BY TotalCommunications DESC;
```

## 📊 Аналитические запросы

### 2️⃣5️⃣ Топ-10 клиентов по выручке
```sql
SELECT TOP 10
    c.CompanyName,
    c.ClientCategory,
    COUNT(DISTINCT cs.ServiceID) AS ActiveServices,
    SUM(cs.MonthlyPrice) AS MonthlyRevenue,
    (SUM(cs.MonthlyPrice) * 12) AS AnnualRevenue
FROM Clients c
LEFT JOIN ClientServices cs ON c.ClientID = cs.ClientID
WHERE cs.Status = 'Active'
GROUP BY c.ClientID, c.CompanyName, c.ClientCategory
ORDER BY AnnualRevenue DESC;
```

### 2️⃣6️⃣ Анализ клиентской базы по категориям
```sql
SELECT 
    ClientCategory,
    COUNT(*) AS ClientCount,
    COUNT(CASE WHEN Status = 'Active' THEN 1 END) AS ActiveCount,
    COUNT(CASE WHEN Status = 'Inactive' THEN 1 END) AS InactiveCount,
    AVG(DATEDIFF(DAY, RegistrationDate, GETDATE())) AS AvgClientAgeDays
FROM Clients
GROUP BY ClientCategory
ORDER BY ClientCount DESC;
```

### 2️⃣7️⃣ Прибыльность по менеджерам
```sql
SELECT 
    ManagerName,
    COUNT(DISTINCT ClientID) AS ManagedClients,
    SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS ActiveClients,
    SUM(ISNULL(
        (SELECT SUM(MonthlyPrice) FROM ClientServices 
         WHERE ClientID IN (SELECT ClientID FROM Clients WHERE ManagerName = c.ManagerName)
         AND Status = 'Active'), 0)) AS MonthlyRevenue
FROM Clients c
GROUP BY ManagerName
ORDER BY MonthlyRevenue DESC;
```

### 2️⃣8️⃣ Сравнение периодов (этот месяц vs прошлый месяц)
```sql
WITH CurrentMonth AS (
    SELECT 
        c.CompanyName,
        SUM(p.PaymentAmount) AS CurrentMonthPayments
    FROM Clients c
    LEFT JOIN Payments p ON c.ClientID = p.ClientID
    WHERE MONTH(p.PaymentDate) = MONTH(GETDATE())
      AND YEAR(p.PaymentDate) = YEAR(GETDATE())
    GROUP BY c.ClientID, c.CompanyName
),
PreviousMonth AS (
    SELECT 
        c.CompanyName,
        SUM(p.PaymentAmount) AS PreviousMonthPayments
    FROM Clients c
    LEFT JOIN Payments p ON c.ClientID = p.ClientID
    WHERE MONTH(p.PaymentDate) = MONTH(DATEADD(MONTH, -1, GETDATE()))
      AND YEAR(p.PaymentDate) = YEAR(DATEADD(MONTH, -1, GETDATE()))
    GROUP BY c.ClientID, c.CompanyName
)
SELECT 
    ISNULL(cm.CompanyName, pm.CompanyName) AS CompanyName,
    ISNULL(cm.CurrentMonthPayments, 0) AS CurrentMonth,
    ISNULL(pm.PreviousMonthPayments, 0) AS PreviousMonth,
    ISNULL(cm.CurrentMonthPayments, 0) - ISNULL(pm.PreviousMonthPayments, 0) AS Difference
FROM CurrentMonth cm
FULL OUTER JOIN PreviousMonth pm ON cm.CompanyName = pm.CompanyName
ORDER BY Difference DESC;
```

## 🗑️ DELETE и UPDATE запросы

⚠️ **ОСТОРОЖНО**: Эти запросы изменяют данные!

### 2️⃣9️⃣ Пометить неактивного клиента
```sql
UPDATE Clients
SET Status = 'Inactive'
WHERE CompanyName = 'Название компании'
  AND LastContactDate < DATEADD(YEAR, -1, GETDATE());
```

### 3️⃣0️⃣ Обновить менеджера для группы клиентов
```sql
UPDATE Clients
SET ManagerName = 'Новое имя менеджера'
WHERE ClientCategory = 'VIP';
```

### 3️⃣1️⃣ Завершить услугу
```sql
UPDATE ClientServices
SET Status = 'Completed', EndDate = GETDATE()
WHERE ServiceID = 1;
```

### 3️⃣2️⃣ Удалить старые коммуникации (старше 2 лет)
```sql
DELETE FROM Communications
WHERE CommunicationDate < DATEADD(YEAR, -2, GETDATE());
```

## 📤 Экспорт данных

### 3️⃣3️⃣ Выгрузить клиентов в CSV формат
```sql
SELECT 
    CompanyName,
    ContactName,
    Email,
    Phone,
    Address,
    City,
    Region,
    Country,
    Status,
    ClientCategory
FROM Clients
ORDER BY CompanyName;
```

### 3️⃣4️⃣ Выгрузить финансовый отчет
```sql
SELECT 
    c.CompanyName,
    COUNT(cc.ContractID) AS Contracts,
    SUM(cc.ContractValue) AS TotalValue,
    SUM(ISNULL(p.PaymentAmount, 0)) AS Paid,
    SUM(cc.ContractValue) - SUM(ISNULL(p.PaymentAmount, 0)) AS Remaining
FROM Clients c
LEFT JOIN ClientContracts cc ON c.ClientID = cc.ClientID
LEFT JOIN Payments p ON cc.ContractID = p.ContractID
GROUP BY c.ClientID, c.CompanyName
ORDER BY TotalValue DESC;
```

## 🔧 Вспомогательные запросы

### 3️⃣5️⃣ Получить информацию о размере БД
```sql
EXEC sp_helpdb CMSClients;
```

### 3️⃣6️⃣ Получить статистику по таблицам
```sql
SELECT 
    t.name AS TableName,
    i.rowcnt AS RowCount
FROM sys.tables t
LEFT JOIN sys.sysindexes i ON t.object_id = i.id AND i.indid < 2
WHERE t.name IN ('Clients', 'ClientContacts', 'ClientContracts', 
                 'ClientServices', 'Payments', 'Communications', 'ClientDocuments')
ORDER BY i.rowcnt DESC;
```

### 3️⃣7️⃣ Проверить целостность данных
```sql
-- Поиск сирот (контакты без клиентов)
SELECT * FROM ClientContacts 
WHERE ClientID NOT IN (SELECT ClientID FROM Clients);

-- Поиск незаполненных обязательных полей
SELECT ClientID, CompanyName FROM Clients WHERE Email IS NULL;
```

---

**Версия:** 1.0  
**Дата создания:** 28 мая 2026 г.  
**Статус:** ✅ Готово к использованию
