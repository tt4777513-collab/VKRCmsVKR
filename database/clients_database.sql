-- ===============================================
-- CMS Pro: База данных клиентов
-- Дата создания: 28 мая 2026 г.
-- СУБД: Microsoft SQL Server 2019+
-- ===============================================

-- 1. Создание базы данных
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CMSClients')
BEGIN
    CREATE DATABASE CMSClients
    COLLATE Cyrillic_General_CI_AS;
END
GO

USE CMSClients;
GO

-- 2. Создание таблицы клиентов
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Clients')
BEGIN
    CREATE TABLE Clients (
        ClientID INT PRIMARY KEY IDENTITY(1,1),
        CompanyName NVARCHAR(255) NOT NULL,
        ContactName NVARCHAR(150) NOT NULL,
        ContactTitle NVARCHAR(100),
        Email NVARCHAR(255) UNIQUE,
        Phone NVARCHAR(20),
        MobilePhone NVARCHAR(20),
        Website NVARCHAR(255),
        
        -- Адрес
        Address NVARCHAR(255),
        City NVARCHAR(100),
        Region NVARCHAR(100),
        PostalCode NVARCHAR(20),
        Country NVARCHAR(100),
        
        -- Финансовые данные
        CompanyType NVARCHAR(50),  -- ИП, ООО, АО, и т.д.
        INN NVARCHAR(20),  -- Идентификационный номер налогоплательщика
        KPP NVARCHAR(20),  -- Код причины постановки
        BankAccount NVARCHAR(50),
        BankName NVARCHAR(255),
        
        -- Статус
        Status NVARCHAR(50) DEFAULT 'Active',  -- Active, Inactive, Blocked, Prospect
        ClientCategory NVARCHAR(50),  -- VIP, Regular, Small, Partner
        
        -- Информация
        Description NVARCHAR(MAX),
        Notes NVARCHAR(MAX),
        
        -- Даты
        RegistrationDate DATETIME DEFAULT GETDATE(),
        LastContactDate DATETIME,
        ContractExpiryDate DATETIME,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        
        -- Ответственный менеджер
        ManagerName NVARCHAR(150),
        ManagerEmail NVARCHAR(255)
    );
END
GO

-- 3. Создание таблицы контактных лиц
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientContacts')
BEGIN
    CREATE TABLE ClientContacts (
        ContactID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        FullName NVARCHAR(150) NOT NULL,
        Position NVARCHAR(100),
        Department NVARCHAR(100),
        Email NVARCHAR(255),
        Phone NVARCHAR(20),
        MobilePhone NVARCHAR(20),
        IsMainContact BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 4. Создание таблицы контрактов
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientContracts')
BEGIN
    CREATE TABLE ClientContracts (
        ContractID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        ContractNumber NVARCHAR(50) UNIQUE NOT NULL,
        ContractDate DATETIME NOT NULL,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME,
        ContractValue DECIMAL(12, 2),
        Currency NVARCHAR(10) DEFAULT 'RUB',
        Status NVARCHAR(50),  -- Active, Completed, Terminated, Pending
        Description NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 5. Создание таблицы услуг
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientServices')
BEGIN
    CREATE TABLE ClientServices (
        ServiceID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        ServiceName NVARCHAR(255) NOT NULL,
        ServiceType NVARCHAR(100),  -- Web Design, SEO, Hosting, Support, и т.д.
        Status NVARCHAR(50) DEFAULT 'Active',
        StartDate DATETIME DEFAULT GETDATE(),
        EndDate DATETIME,
        MonthlyPrice DECIMAL(12, 2),
        Description NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 6. Создание таблицы платежей
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payments')
BEGIN
    CREATE TABLE Payments (
        PaymentID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        ContractID INT FOREIGN KEY REFERENCES ClientContracts(ContractID),
        PaymentAmount DECIMAL(12, 2) NOT NULL,
        PaymentDate DATETIME NOT NULL,
        PaymentMethod NVARCHAR(50),  -- Bank Transfer, Card, Cash, и т.д.
        Status NVARCHAR(50) DEFAULT 'Completed',  -- Pending, Completed, Failed, Cancelled
        TransactionNumber NVARCHAR(50),
        Description NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 7. Создание таблицы истории коммуникаций
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Communications')
BEGIN
    CREATE TABLE Communications (
        CommunicationID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        CommunicationType NVARCHAR(50),  -- Email, Phone, Meeting, Message, и т.д.
        CommunicationDate DATETIME NOT NULL,
        Subject NVARCHAR(255),
        Description NVARCHAR(MAX),
        Result NVARCHAR(500),
        EmployeeName NVARCHAR(150),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 8. Создание таблицы документов
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClientDocuments')
BEGIN
    CREATE TABLE ClientDocuments (
        DocumentID INT PRIMARY KEY IDENTITY(1,1),
        ClientID INT NOT NULL FOREIGN KEY REFERENCES Clients(ClientID) ON DELETE CASCADE,
        DocumentName NVARCHAR(255) NOT NULL,
        DocumentType NVARCHAR(100),  -- Contract, Invoice, Specification, и т.д.
        FilePath NVARCHAR(500),
        UploadDate DATETIME DEFAULT GETDATE(),
        Description NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- 9. Создание индексов для оптимизации
CREATE INDEX IDX_Clients_Email ON Clients(Email);
CREATE INDEX IDX_Clients_Status ON Clients(Status);
CREATE INDEX IDX_Clients_City ON Clients(City);
CREATE INDEX IDX_ClientContacts_ClientID ON ClientContacts(ClientID);
CREATE INDEX IDX_ClientContracts_ClientID ON ClientContracts(ClientID);
CREATE INDEX IDX_ClientServices_ClientID ON ClientServices(ClientID);
CREATE INDEX IDX_Payments_ClientID ON Payments(ClientID);
CREATE INDEX IDX_Communications_ClientID ON Communications(ClientID);
CREATE INDEX IDX_ClientDocuments_ClientID ON ClientDocuments(ClientID);
GO

-- 10. Вставка примеров данных клиентов
INSERT INTO Clients (
    CompanyName, ContactName, ContactTitle, Email, Phone, Website,
    Address, City, Region, PostalCode, Country,
    CompanyType, INN, Status, ClientCategory, ManagerName
) VALUES
-- Клиент 1
('ООО Яндекс.Услуги', 'Иван Петров', 'Генеральный директор', 'ivan.petrov@yandex-services.ru', '+7 495 123-45-67', 'https://www.yandex-services.ru',
'ул. Льва Толстого, 16', 'Москва', 'Москва', '119021', 'Россия',
'ООО', '7701234567', 'Active', 'VIP', 'Александр Смиров'),

-- Клиент 2
('ИП Сергеев Николай', 'Николай Сергеев', 'Руководитель', 'nikolay@design-studio.ru', '+7 812 987-65-43', 'https://design-studio.ru',
'пр. Невский, 28', 'Санкт-Петербург', 'Санкт-Петербург', '191186', 'Россия',
'ИП', '7801456789', 'Active', 'Regular', 'Мария Иванова'),

-- Клиент 3
('АО Технологии будущего', 'Анна Волкова', 'Коммерческий директор', 'anna.volkova@future-tech.ru', '+7 383 234-56-78', 'https://future-tech.ru',
'ул. Красный пр., 45', 'Новосибирск', 'Новосибирская', '630003', 'Россия',
'АО', '5405987654', 'Active', 'VIP', 'Александр Смиров'),

-- Клиент 4
('ООО Digital Agency', 'Василий Козлов', 'Директор по продажам', 'vasily@digital-agency.ru', '+7 495 555-55-55', 'https://digital-agency.ru',
'ул. Тверская, 12', 'Москва', 'Москва', '125009', 'Россия',
'ООО', '7702345678', 'Active', 'Regular', 'Петр Краснов'),

-- Клиент 5
('ИП Коллектив Мастеров', 'Елена Соколова', 'Собственник', 'elena@craftsmen.ru', '+7 911 456-78-90', 'https://craftsmen.ru',
'ул. Советская, 89', 'Екатеринбург', 'Свердловская', '620014', 'Россия',
'ИП', '6601234567', 'Active', 'Small', 'Ольга Терентьева'),

-- Клиент 6
('ООО Global Solutions', 'Дмитрий Нестеров', 'Генеральный директор', 'dmitry@global-solutions.ru', '+7 495 111-22-33', 'https://global-solutions.ru',
'ул. Садовая-Кудринская, 18', 'Москва', 'Москва', '121099', 'Россия',
'ООО', '7703456789', 'Inactive', 'VIP', 'Александр Смиров'),

-- Клиент 7
('ИП Веб Студия ProWeb', 'Геннадий Морозов', 'Руководитель', 'gennady@proweb.ru', '+7 921 765-43-21', 'https://proweb.ru',
'пр. Литейный, 34', 'Санкт-Петербург', 'Санкт-Петербург', '191028', 'Россия',
'ИП', '7802345678', 'Active', 'Regular', 'Мария Иванова'),

-- Клиент 8
('ООО StartUp Hub', 'Виктория Романова', 'Главный менеджер', 'victoria@startup-hub.ru', '+7 495 777-88-99', 'https://startup-hub.ru',
'ул. Чистопрудный б-р, 5', 'Москва', 'Москва', '101000', 'Россия',
'ООО', '7704567890', 'Prospect', 'Small', 'Петр Краснов');
GO

-- 11. Вставка контактных лиц
INSERT INTO ClientContacts (ClientID, FullName, Position, Email, Phone, IsMainContact)
VALUES
(1, 'Иван Петров', 'Генеральный директор', 'ivan.petrov@yandex-services.ru', '+7 495 123-45-67', 1),
(1, 'Мария Сидорова', 'Менеджер по развитию', 'maria.sidorova@yandex-services.ru', '+7 495 123-45-68', 0),
(2, 'Николай Сергеев', 'Руководитель', 'nikolay@design-studio.ru', '+7 812 987-65-43', 1),
(3, 'Анна Волкова', 'Коммерческий директор', 'anna.volkova@future-tech.ru', '+7 383 234-56-78', 1),
(4, 'Василий Козлов', 'Директор по продажам', 'vasily@digital-agency.ru', '+7 495 555-55-55', 1),
(5, 'Елена Соколова', 'Собственник', 'elena@craftsmen.ru', '+7 911 456-78-90', 1);
GO

-- 12. Вставка контрактов
INSERT INTO ClientContracts (ClientID, ContractNumber, ContractDate, StartDate, EndDate, ContractValue, Status)
VALUES
(1, 'КД-2026-001', CAST('2026-01-15' AS DATETIME), CAST('2026-01-20' AS DATETIME), CAST('2027-01-19' AS DATETIME), 500000.00, 'Active'),
(1, 'КД-2026-002', CAST('2026-03-01' AS DATETIME), CAST('2026-03-10' AS DATETIME), CAST('2027-03-09' AS DATETIME), 750000.00, 'Active'),
(2, 'КД-2026-003', CAST('2026-02-01' AS DATETIME), CAST('2026-02-15' AS DATETIME), CAST('2026-08-14' AS DATETIME), 150000.00, 'Active'),
(3, 'КД-2026-004', CAST('2025-12-01' AS DATETIME), CAST('2025-12-10' AS DATETIME), CAST('2026-12-09' AS DATETIME), 1000000.00, 'Active'),
(4, 'КД-2026-005', CAST('2026-01-10' AS DATETIME), CAST('2026-01-25' AS DATETIME), CAST('2027-01-24' AS DATETIME), 300000.00, 'Active'),
(5, 'КД-2026-006', CAST('2026-04-01' AS DATETIME), CAST('2026-04-15' AS DATETIME), CAST('2027-04-14' AS DATETIME), 200000.00, 'Pending');
GO

-- 13. Вставка услуг
INSERT INTO ClientServices (ClientID, ServiceName, ServiceType, MonthlyPrice, Status)
VALUES
(1, 'Разработка веб-сайта', 'Web Design', 50000.00, 'Active'),
(1, 'SEO оптимизация', 'SEO', 30000.00, 'Active'),
(2, 'Графический дизайн', 'Design', 20000.00, 'Active'),
(3, 'Облачное хранилище', 'Hosting', 15000.00, 'Active'),
(3, 'Техническая поддержка', 'Support', 25000.00, 'Active'),
(4, 'Поиск и маркетинг', 'Marketing', 40000.00, 'Active'),
(5, 'Дизайн логотипа', 'Design', 10000.00, 'Active');
GO

-- 14. Вставка платежей
INSERT INTO Payments (ClientID, ContractID, PaymentAmount, PaymentDate, PaymentMethod, Status)
VALUES
(1, 1, 500000.00, CAST('2026-01-20' AS DATETIME), 'Bank Transfer', 'Completed'),
(1, 2, 250000.00, CAST('2026-03-10' AS DATETIME), 'Bank Transfer', 'Completed'),
(2, 3, 75000.00, CAST('2026-02-15' AS DATETIME), 'Bank Transfer', 'Completed'),
(3, 4, 500000.00, CAST('2025-12-15' AS DATETIME), 'Bank Transfer', 'Completed'),
(4, 5, 150000.00, CAST('2026-01-25' AS DATETIME), 'Bank Transfer', 'Completed'),
(5, 6, 100000.00, CAST('2026-04-20' AS DATETIME), 'Bank Transfer', 'Pending');
GO

-- 15. Вставка коммуникаций
INSERT INTO Communications (ClientID, CommunicationType, CommunicationDate, Subject, Result, EmployeeName)
VALUES
(1, 'Meeting', CAST('2026-05-20 10:00' AS DATETIME), 'Обсуждение новых возможностей', 'Клиент согласился на расширение услуг', 'Александр Смиров'),
(1, 'Email', CAST('2026-05-22 14:30' AS DATETIME), 'Отправка счета', 'Счет принят', 'Александр Смиров'),
(2, 'Phone', CAST('2026-05-23 09:00' AS DATETIME), 'Проверка статуса проекта', 'Проект на стадии завершения', 'Мария Иванова'),
(3, 'Meeting', CAST('2026-05-24 15:00' AS DATETIME), 'Планирование нового контракта', 'Согласованы основные пункты', 'Александр Смиров'),
(4, 'Email', CAST('2026-05-25 11:00' AS DATETIME), 'Предложение скидки', 'Ждем ответа', 'Петр Краснов'),
(5, 'Phone', CAST('2026-05-26 10:30' AS DATETIME), 'Консультация по услугам', 'Интерес к новым услугам', 'Ольга Терентьева');
GO

-- 16. Вставка документов
INSERT INTO ClientDocuments (ClientID, DocumentName, DocumentType, Description)
VALUES
(1, 'Договор на разработку сайта.pdf', 'Contract', 'Основной контракт на разработку веб-сайта'),
(1, 'Счет-фактура #001.pdf', 'Invoice', 'Счет за услуги разработки'),
(2, 'Техническое задание.docx', 'Specification', 'ТЗ для дизайна логотипа'),
(3, 'Договор об оказании услуг.pdf', 'Contract', 'Контракт на облачное хранилище'),
(4, 'Спецификация проекта.docx', 'Specification', 'Требования к маркетинг-кампании'),
(5, 'Акт выполненных работ.pdf', 'Invoice', 'Акт по завершении проекта');
GO

-- 17. Создание представлений (Views)

-- Представление: Активные клиенты
CREATE VIEW vw_ActiveClients AS
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
WHERE Status = 'Active'
GO

-- Представление: Статистика по клиентам
CREATE VIEW vw_ClientStatistics AS
SELECT 
    c.ClientID,
    c.CompanyName,
    COUNT(DISTINCT cc.ContractID) AS TotalContracts,
    COUNT(DISTINCT cs.ServiceID) AS TotalServices,
    SUM(p.PaymentAmount) AS TotalPayments,
    MAX(c.LastContactDate) AS LastContactDate
FROM Clients c
LEFT JOIN ClientContracts cc ON c.ClientID = cc.ClientID
LEFT JOIN ClientServices cs ON c.ClientID = cs.ClientID
LEFT JOIN Payments p ON c.ClientID = p.ClientID
GROUP BY c.ClientID, c.CompanyName
GO

-- Представление: Клиенты с их активными услугами
CREATE VIEW vw_ClientsWithServices AS
SELECT 
    c.ClientID,
    c.CompanyName,
    c.ContactName,
    c.Email,
    cs.ServiceName,
    cs.ServiceType,
    cs.MonthlyPrice,
    cs.StartDate
FROM Clients c
INNER JOIN ClientServices cs ON c.ClientID = cs.ClientID
WHERE cs.Status = 'Active'
GO

-- Представление: Просроченные платежи
CREATE VIEW vw_OverduePayments AS
SELECT 
    p.PaymentID,
    c.CompanyName,
    c.ContactName,
    p.PaymentAmount,
    p.PaymentDate,
    DATEDIFF(DAY, p.PaymentDate, GETDATE()) AS DaysOverdue
FROM Payments p
INNER JOIN Clients c ON p.ClientID = c.ClientID
WHERE p.Status = 'Pending' AND DATEDIFF(DAY, p.PaymentDate, GETDATE()) > 0
GO

PRINT '========================================';
PRINT 'Базовая конфигурация завершена успешно!';
PRINT '========================================';
PRINT '';
PRINT 'Созданные таблицы:';
PRINT '1. Clients - основная таблица клиентов';
PRINT '2. ClientContacts - контактные лица';
PRINT '3. ClientContracts - контракты';
PRINT '4. ClientServices - услуги';
PRINT '5. Payments - платежи';
PRINT '6. Communications - история коммуникаций';
PRINT '7. ClientDocuments - документы';
PRINT '';
PRINT 'Созданные представления (Views):';
PRINT '1. vw_ActiveClients - активные клиенты';
PRINT '2. vw_ClientStatistics - статистика';
PRINT '3. vw_ClientsWithServices - клиенты с услугами';
PRINT '4. vw_OverduePayments - просроченные платежи';
PRINT '';
PRINT 'Вставлено данных:';
PRINT '- Клиентов: 8';
PRINT '- Контактных лиц: 6';
PRINT '- Контрактов: 6';
PRINT '- Услуг: 7';
PRINT '- Платежей: 6';
PRINT '- Коммуникаций: 6';
PRINT '- Документов: 6';
GO
