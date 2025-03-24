USE dbbarbershop;

-- Таблица клиентов
CREATE TABLE client (
    clientid INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(30) NOT NULL,
    client_phone VARCHAR(11) NOT NULL,
    client_email VARCHAR(50),
    client_password VARCHAR(100) NOT NULL,
    client_bonuses INT DEFAULT 0,
    Role TINYINT(1) DEFAULT 0, -- 0 - клиент, 1 - администратор
    is_deleted TINYINT(1) DEFAULT 0 
);

-- Таблица парикмахеров
CREATE TABLE hairdresser (
    hairdresserid INT PRIMARY KEY AUTO_INCREMENT,
    hairdresser_name VARCHAR(30) NOT NULL,
    hairdresser_surname VARCHAR(30) NOT NULL,
    hairdresser_experience INT NOT NULL,
    hairdresser_phone VARCHAR(11) NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 
);

-- Таблица парикмахерских
CREATE TABLE cirulna (
    cirulnaid INT PRIMARY KEY AUTO_INCREMENT,
    cirulna_status TINYINT(1) NOT NULL, -- 0 - закрыта, 1 - открыта
    cirulna_city VARCHAR(20) NOT NULL,
    cirulna_street VARCHAR(20) NOT NULL,
    cirulna_buildingnumber INT NOT NULL,
    cirulna_hairdresser INT NULL,
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_cirulna_hairdresser FOREIGN KEY (cirulna_hairdresser) REFERENCES hairdresser(hairdresserid)
);

-- Таблица записей клиентов на услуги
CREATE TABLE record (
    recordid INT PRIMARY KEY AUTO_INCREMENT,
    clientid INT NOT NULL,
    hairdresserid INT NOT NULL,
    cirulnaid INT NOT NULL,
    recordtime DATETIME NOT NULL,
    is_completed TINYINT(1), -- 0 - не завершено, 1 - завершено
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_record_client FOREIGN KEY (clientid) REFERENCES client(clientid),
    CONSTRAINT fk_record_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid),
    CONSTRAINT fk_record_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid)
);

-- Таблица услуг
CREATE TABLE service (
    serviceid INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(30) NOT NULL,
    service_cost DECIMAL(10, 2) NOT NULL,
    service_sex TINYINT(1) NOT NULL, -- 0 - женщина, 1 - мужчина
    service_age TINYINT(1) NOT NULL, -- 0 - дети, 1 - взрослые
    is_deleted TINYINT(1) DEFAULT 0 
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
    is_deleted TINYINT(1) DEFAULT 0, 
    PRIMARY KEY (recordid, serviceid),
    CONSTRAINT fk_record_service_record FOREIGN KEY (recordid) REFERENCES record(recordid),
    CONSTRAINT fk_record_service_service FOREIGN KEY (serviceid) REFERENCES service(serviceid)
);

-- Таблица отзывов клиентов о парикмахерах
CREATE TABLE review (
    reviewid INT PRIMARY KEY AUTO_INCREMENT,
    clientid INT NOT NULL,
    hairdresserid INT NOT NULL,
    reviewtext VARCHAR(500) NOT NULL,
    reviewrating INT NOT NULL CHECK (reviewrating BETWEEN 1 AND 5), -- Рейтинг от 1 до 5
    reviewdate DATETIME NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_review_client FOREIGN KEY (clientid) REFERENCES client(clientid),
    CONSTRAINT fk_review_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid)
);

-- Таблица расписания работы парикмахеров
CREATE TABLE hairdresser_schedule (
    scheduleid INT PRIMARY KEY AUTO_INCREMENT,
    hairdresserid INT NOT NULL,
    workdate DATE NOT NULL,
    starttime TIME NOT NULL,
    endtime TIME NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_hairdresser_schedule_hairdresser FOREIGN KEY (hairdresserid) REFERENCES hairdresser(hairdresserid)
);

-- Таблица связи между парикмахерскими и услугами
CREATE TABLE cirulna_service (
    cirulnaid INT NOT NULL,
    serviceid INT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0, 
    PRIMARY KEY (cirulnaid, serviceid),
    CONSTRAINT fk_cirulna_service_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid),
    CONSTRAINT fk_cirulna_service_service FOREIGN KEY (serviceid) REFERENCES service(serviceid)
);

-- Таблица скидок
CREATE TABLE discount (
    discountid INT PRIMARY KEY AUTO_INCREMENT,
    discountname VARCHAR(50) NOT NULL,
    discountpercent DECIMAL(5, 2) NOT NULL,
    startdate DATE NOT NULL,
    enddate DATE NOT NULL,
    cirulnaid INT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_discount_cirulna FOREIGN KEY (cirulnaid) REFERENCES cirulna(cirulnaid)
);

-- Таблица платежей
CREATE TABLE payment (
    paymentid INT PRIMARY KEY AUTO_INCREMENT,
    recordid INT NOT NULL,
    paymentamount DECIMAL(10, 2) NOT NULL,
    paymentdate DATETIME NOT NULL,
    paymentmethod VARCHAR(20) NOT NULL, -- Наличные, карта и т.д.
    is_deleted TINYINT(1) DEFAULT 0, 
    CONSTRAINT fk_payment_record FOREIGN KEY (recordid) REFERENCES record(recordid)
);