

-- Таблица клиентов
CREATE TABLE client (
    clientid INT PRIMARY KEY IDENTITY(1,1),
    client_name NVARCHAR(30) NOT NULL,
    client_phone NVARCHAR(11) NOT NULL,
    client_email NVARCHAR(50),
    client_password NVARCHAR(100) NOT NULL,
    client_bonuses INT DEFAULT 0,
    Role BIT DEFAULT 0, -- 0 - клиент, 1 - администратор
    is_deleted BIT DEFAULT 0 
);


-- Таблица парикмахеров
CREATE TABLE hairdresser (
    hairdresserid INT PRIMARY KEY IDENTITY(1,1),
    hairdresser_name NVARCHAR(30) NOT NULL,
    hairdresser_surname NVARCHAR(30) NOT NULL,
    hairdresser_experience INT NOT NULL,
    hairdresser_phone NVARCHAR(11) NOT NULL,
    is_deleted BIT DEFAULT 0 
);


-- Таблица парикмахерских
CREATE TABLE cirulna (
    cirulnaid INT PRIMARY KEY IDENTITY(1,1),
    cirulna_status BIT NOT NULL, -- 0 - закрыта, 1 - открыта
    cirulna_city NVARCHAR(20) NOT NULL,
    cirulna_street NVARCHAR(20) NOT NULL,
    cirulna_buildingnumber INT NOT NULL,
    cirulna_hairdresser INT NULL,
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_cirulna_hairdresser FOREIGN KEY (cirulna_hairdresser) REFERENCES hairdresser(hairdresserid)
);


-- Таблица записей клиентов на услуги
CREATE TABLE record (
    recordid INT PRIMARY KEY IDENTITY(1,1),
    clientid INT NOT NULL,
    hairdresserid INT NOT NULL,
    cirulnaid INT NOT NULL,
    recordtime DATETIME NOT NULL,
    is_completed BIT, -- 0 - не завершено, 1 - завершено
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_record_client FOREIGN KEY (clientid) REFERENCES client(clientid),
    CONSTRAINT fk_record_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid),
    CONSTRAINT fk_record_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid)
);


-- Таблица услуг
CREATE TABLE service (
    serviceid INT PRIMARY KEY IDENTITY(1,1),
    service_name NVARCHAR(30) NOT NULL,
    service_cost DECIMAL(10, 2) NOT NULL,
    service_sex BIT NOT NULL, -- 0 - женщина, 1 - мужчина
    service_age BIT NOT NULL, -- 0 - дети, 1 - взрослые
    is_deleted BIT DEFAULT 0 
);


-- Таблица связи цирюльни и клиентов
CREATE TABLE cirulna_client (
    clientid INT NOT NULL,
    cirulnaid INT NOT NULL,
    PRIMARY KEY (clientid, cirulnaid),
    CONSTRAINT fk_cirulna_client_client FOREIGN KEY (clientid) REFERENCES client(clientid),
    CONSTRAINT fk_cirulna_client_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid)
);


-- Таблица связи между записями и услугами
CREATE TABLE record_service (
    recordid INT NOT NULL,
    serviceid INT NOT NULL,
    is_deleted BIT DEFAULT 0, 
    PRIMARY KEY (recordid, serviceid),
    CONSTRAINT fk_record_service_record FOREIGN KEY (recordid) REFERENCES record(recordid),
    CONSTRAINT fk_record_service_service FOREIGN KEY (serviceid) REFERENCES service(serviceid)
);


-- Таблица отзывов клиентов о парикмахерах
CREATE TABLE review (
    reviewid INT PRIMARY KEY IDENTITY(1,1),
    clientid INT NOT NULL,
    hairdresserid INT NOT NULL,
    reviewtext NVARCHAR(500) NOT NULL,
    reviewrating INT NOT NULL CHECK (reviewrating BETWEEN 1 AND 5), -- Рейтинг от 1 до 5
    reviewdate DATETIME NOT NULL,
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_review_client FOREIGN KEY (clientid) REFERENCES client(clientid),
    CONSTRAINT fk_review_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid)
);


-- Таблица расписания работы парикмахеров
CREATE TABLE hairdresser_schedule (
    scheduleid INT PRIMARY KEY IDENTITY(1,1),
    hairdresserid INT NOT NULL,
    workdate DATE NOT NULL,
    starttime TIME NOT NULL,
    endtime TIME NOT NULL,
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_hairdresser_schedule_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid)
);


-- Таблица связи между парикмахерскими и услугами
CREATE TABLE cirulna_service (
    cirulnaid INT NOT NULL,
    serviceid INT NOT NULL,
    is_deleted BIT DEFAULT 0, 
    PRIMARY KEY (cirulnaid, serviceid),
    CONSTRAINT fk_cirulna_service_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid),
    CONSTRAINT fk_cirulna_service_service FOREIGN KEY (serviceid) REFERENCES service(serviceid)
);


-- Таблица скидок
CREATE TABLE discount (
    discountid INT PRIMARY KEY IDENTITY(1,1),
    discountname NVARCHAR(50) NOT NULL,
    discountpercent DECIMAL(5, 2) NOT NULL,
    startdate DATE NOT NULL,
    enddate DATE NOT NULL,
    cirulnaid INT NOT NULL,
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_discount_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid)
);


-- Таблица платежей
CREATE TABLE payment (
    paymentid INT PRIMARY KEY IDENTITY(1,1),
    recordid INT NOT NULL,
    paymentamount DECIMAL(10, 2) NOT NULL,
    paymentdate DATETIME NOT NULL,
    paymentmethod NVARCHAR(20) NOT NULL, -- Наличные, карта и т.д.
    is_deleted BIT DEFAULT 0, 
    CONSTRAINT fk_payment_record FOREIGN KEY (recordid) REFERENCES record(recordid)
);



------ Вставка данных service 
INSERT INTO service (service_name, service_cost, service_sex, service_age, is_deleted)
VALUES 
    ('Стрижка женская', 1500.00, 0, 1, 0), -- Женская стрижка для взрослых
    ('Стрижка мужская', 1200.00, 1, 1, 0), -- Мужская стрижка для взрослых
    ('Детская стрижка', 800.00, 0, 0, 0), -- Стрижка для детей (универсальная)
    ('Окрашивание волос', 3000.00, 0, 1, 0), -- Окрашивание для женщин
    ('Бородатерапия', 1000.00, 1, 1, 0), -- Уход за бородой для мужчин
    ('Укладка волос', 1800.00, 0, 1, 0), -- Укладка для женщин
    ('Коррекция бровей', 600.00, 0, 1, 0), -- Услуга для женщин
    ('Маникюр классический', 1200.00, 0, 1, 0), -- Классический маникюр
    ('Детский маникюр', 700.00, 0, 0, 0), -- Маникюр для детей
    ('SPA-уход для волос', 2500.00, 0, 1, 0); -- SPA-процедура для женщин
-------------------------------------------------------------------------------------------


INSERT INTO cirulna (cirulna_status, cirulna_city, cirulna_street, cirulna_buildingnumber, cirulna_hairdresser, is_deleted)
VALUES 
    (1, 'Москва', 'Ленина', 5, 21, 0),
	(1, 'Москва', 'Ленина', 5, 22, 0), 
	(1, 'Москва', 'Ленина', 5, 23, 0), 
	(1, 'Москва', 'Ленина', 5, 24, 0), 
	(1, 'Москва', 'Ленина', 5, 25, 0)