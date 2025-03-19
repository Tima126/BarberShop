use dbbarbershop;

create table client (
    clientid int primary key auto_increment,
    client_name varchar(30) not null,
    client_phone varchar(11) not null,
    client_email varchar(50),
    client_password varchar(100) not null,
    client_bonuses int default 0,
    Role TINYINT(1) default 0
);


-- таблица для хранения информации о парикмахерах
create table hairdresser (
    hairdresserid int primary key auto_increment,
    hairdresser_name varchar(30) not null,
    hairdresser_surname varchar(30) not null,
    hairdresser_expirience int not null,
    hairdresser_phone varchar(11) not null
);

-- таблица для хранения информации о парикмахерской
create table cirulna (
    cirulnaid int primary key auto_increment,
    cirulna_status tinyint(1) not null, -- открыта/закрыта
    cirulna_city varchar(20) not null,
    cirulna_street varchar(20) not null,
    cirulna_buildingnumber int not null,
    cirulna_hairdresser int null,
    constraint fk_cirulna_hairdresser foreign key (cirulna_hairdresser) references hairdresser(hairdresserid)
);

-- таблица для хранения информации о записях клиентов на услуги
create table record (
    recordid int primary key auto_increment,
    clientid int not null,
    hairdresserid int not null,
    cirulnaid int not null,
    recordtime datetime not null,
    constraint fk_record_client foreign key (clientid) references client(clientid),
    constraint fk_record_hairdresser foreign key (hairdresserid) references hairdresser(hairdresserid),
    constraint fk_record_cirulna foreign key (cirulnaid) references cirulna(cirulnaid)
);

-- таблица для хранения информации об услугах, предоставляемых парикмахерской
create table service (
    serviceid int primary key auto_increment,
    service_name varchar(30) not null,
    service_cost decimal(10, 2) not null,
    service_sex tinyint(1) not null, -- 0 женщина, 1 мужчина
    service_age tinyint(1) not null -- 0 дети, 1 взрослые
);

-- таблица-связка цирюльни и клиента
create table cirulna_client (
    clientid int not null,
    cirulnaid int not null,
    primary key (clientid, cirulnaid),
    constraint fk_cirulna_client_client foreign key (clientid) references client(clientid),
    constraint fk_cirulna_client_cirulna foreign key (cirulnaid) references cirulna(cirulnaid)
);

-- таблица для связи между записями и услугами
create table record_service (
    recordid int not null,
    serviceid int not null,
    primary key (recordid, serviceid),
    constraint fk_record_service_record foreign key (recordid) references record(recordid),
    constraint fk_record_service_service foreign key (serviceid) references service(serviceid)
);

-- таблица для хранения отзывов клиентов о парикмахерах
create table review (
    reviewid int primary key auto_increment,
    clientid int not null,
    hairdresserid int not null,
    reviewtext varchar(500) not null,
    reviewrating int not null check (reviewrating between 1 and 5), -- рейтинг от 1 до 5
    reviewdate datetime not null,
    constraint fk_review_client foreign key (clientid) references client(clientid),
    constraint fk_review_hairdresser foreign key (hairdresserid) references hairdresser(hairdresserid)
);

-- таблица для хранения расписания работы парикмахеров
create table hairdresser_schedule (
    scheduleid int primary key auto_increment,
    hairdresserid int not null,
    workdate date not null,
    starttime time not null,
    endtime time not null,
    constraint fk_hairdresser_schedule_hairdresser foreign key (hairdresserid) references hairdresser(hairdresserid)
);


-- таблица для связи между парикмахерскими и услугами
create table cirulna_service (
    cirulnaid int not null,
    serviceid int not null,
    primary key (cirulnaid, serviceid),
    constraint fk_cirulna_service_cirulna foreign key (cirulnaid) references cirulna(cirulnaid),
    constraint fk_cirulna_service_service foreign key (serviceid) references service(serviceid)
);

-- таблица для хранения информации о скидках, предоставляемых парикмахерскими
create table discount (
    discountid int primary key auto_increment,
    discountname varchar(50) not null,
    discountpercent decimal(5, 2) not null,
    startdate date not null,
    enddate date not null,
    cirulnaid int not null,
    constraint fk_discount_cirulna foreign key (cirulnaid) references cirulna(cirulnaid)
);

-- таблица для хранения информации о платежах за услуги
create table payment (
    paymentid int primary key auto_increment,
    recordid int not null,
    paymentamount decimal(10, 2) not null,
    paymentdate datetime not null,
    paymentmethod varchar(20) not null, -- наличные, карта и т.д.
    constraint fk_payment_record foreign key (recordid) references record(recordid)
);
