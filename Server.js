const express = require('express');
const path = require('path');
const sql = require('mssql'); // Библиотека для работы с MSSQL
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { error } = require('console');

const app = express();
const port = 3000;

// Конфигурация подключения к базе данных
const dbConfig = {
    user: 'tim22qq_Barbershop',
    password: 'Tima2006',
    server: 'sql.bsite.net\\MSSQL2016',
    database: 'tim22qq_Barbershop',
    options: {
        trustServerCertificate: true
    }
};

app.use(session({
    secret: 'Admin-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Для HTTPS установить secure: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin-panel', express.static(path.join(__dirname, 'admin-panel')));

function isAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещен.' });
    }
    next();
}

// Маршрут для регистрации
app.post('/register', async (req, res) => {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
        return res.status(400).json({ message: 'Заполните все обязательные поля.' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Проверяем, существует ли пользователь с таким номером телефона
        const existingUser = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .query('SELECT * FROM client WHERE client_phone = @phone');

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким номером телефона уже зарегистрирован.' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Добавляем нового пользователя в базу данных
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('phone', sql.NVarChar, phone)
            .input('email', sql.NVarChar, email || null)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO client (client_name, client_phone, client_email, client_password)
                VALUES (@name, @phone, @email, @password)
            `);

        console.log(`Новый пользователь зарегистрирован: ${name}, телефон: ${phone}`);

        // Получаем данные нового пользователя
        const newUser = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .query('SELECT client_name, client_phone, client_bonuses FROM client WHERE client_phone = @phone');

        const user = newUser.recordset[0];

        return res.json({
            success: true,
            user: {
                name: user.client_name,
                phone: user.client_phone,
                points: user.client_bonuses || 0
            }
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
});



// Маршрут для входа
app.post('/Login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Телефон и пароль обязательны.' });
    }

    try {

        const pool = await sql.connect(dbConfig);


        const result = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .query('SELECT * FROM client WHERE client_phone = @phone');

        const users = result.recordset;

        if (users.length === 0) {
            console.log(`Попытка входа: Пользователь с телефоном "${phone}" не найден.`);
            return res.status(400).json({ message: 'Пользователь с таким номером телефона не найден.' });
        }

        const user = users[0];


        const isPasswordValid = await bcrypt.compare(password, user.client_password);
        if (!isPasswordValid) {
            console.log(`Попытка входа: Неверный пароль для пользователя "${user.client_name}".`);
            return res.status(400).json({ message: 'Неверный пароль.' });
        }


        console.log(`Пользователь вошел, телефон: ${phone}`);


        return res.json({
            success: true,
            user: {
                name: user.client_name,
                phone: user.client_phone,
                points: user.client_points || 0
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при входе.' });
    }
});
// Маршрут для входа администратора
app.post('/loginAdmin', async (req, res) => {
    const { login, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        const adminResult = await pool.request()
            .input('login', sql.NVarChar, login)
            .query('SELECT * FROM client WHERE client_name = @login AND Role = 1');

        if (adminResult.recordset.length === 0) {
            console.log(`Попытка входа: Пользователь с логином "${login}" не найден.`);
            return res.status(400).json({ message: 'Неверный логин или пароль.' });
        }

        const admin = adminResult.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, admin.client_password);

        if (!isPasswordValid) {
            console.log(`Попытка входа: Неверный пароль для пользователя "${admin.client_name}".`);
            return res.status(400).json({ message: 'Неверный логин или пароль.' });
        }

        req.session.isAdmin = true;
        req.session.adminName = admin.client_name;

        console.log(`Администратор ${admin.client_name} успешно вошел.`);

        return res.json({
            success: true,
            name: admin.client_name
        });

    } catch (error) {
        console.error('Ошибка при входе:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при входе.' });
    }
});

// Защищенный маршрут для админ-панели
app.get('/admin-panel/records', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel', 'records.html'));
});

// Выход для администратора
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибки при выходе:', err.message);
            return res.status(500).json({ message: 'Произошла ошибка при выходе.' });
        }
        res.json({ success: true, message: 'Вы успешно вышли.' });
    });
});

// Получение записей
app.get('/admin/get-records', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const records = await pool.request().query(`
            SELECT 
                r.recordid AS id,
                c.client_name AS clientName,
                c.client_phone AS clientPhone,
                h.hairdresser_name AS hairdresserName,
                h.hairdresser_surname AS hairdresserSurname,
                cir.cirulna_city AS city,
                cir.cirulna_street AS street,
                cir.cirulna_buildingnumber AS buildingNumber,
                r.recordtime AS recordTime,
                r.is_completed AS isCompleted
            FROM 
                record r
            JOIN 
                client c ON r.clientid = c.clientid 
            JOIN 
                hairdresser h ON r.hairdresserid = h.hairdresserid
            JOIN 
                cirulna cir ON r.cirulnaid = cir.cirulnaid 
            WHERE 
                r.is_deleted = 0; 
        `);

        res.json(records.recordset);

    } catch (error) {
        console.error('Ошибка при получении записей:', error.message);
        res.status(500).json({ message: 'Произошла ошибка при получении записей.' });
    }
});

// Завершение записи
app.put('/admin/complete-record/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        const recordClient = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT clientid FROM record WHERE recordid = @id');

        if (recordClient.recordset.length === 0) {
            return res.status(404).json({ message: 'Запись не найдена.' });
        }

        const clientId = recordClient.recordset[0].clientid;

        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE record SET is_completed = 1 WHERE recordid = @id');

        await pool.request()
            .input('clientId', sql.Int, clientId)
            .query('UPDATE client SET client_bonuses = client_bonuses + 10 WHERE clientid = @clientId');

        res.json({ success: true, message: 'Приём успешно завершён.' });

    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error.message);
        res.status(500).json({ message: 'Произошла ошибка при обновлении статуса.' });
    }
});

// Удаление записи
app.delete('/admin/delete-record/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE record SET is_deleted = 1 WHERE recordid = @id');

        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE record_service SET is_deleted = 1 WHERE recordid = @id');

        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE payment SET is_deleted = 1 WHERE recordid = @id');

        console.log(`Запись с ID: ${id} помечена как удалённая.`);

        res.json({ success: true, message: 'Запись успешно помечена как удалённая.' });

    } catch (error) {
        console.error('Ошибка при пометке записи как удалённой:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
});

// Получение списка парикмахеров
app.get('/api/hairdressers', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const hairdressers = await pool.request().query(`
            select hairdresser.hairdresserid, cirulna_status, cirulna_city, cirulna_street, cirulna_buildingnumber, hairdresser.hairdresser_name, hairdresser.hairdresser_surname
            from cirulna 
            left join hairdresser  ON cirulna.cirulna_hairdresser = hairdresser.hairdresserid
            where cirulna.cirulna_city = 'Москва' and cirulna.cirulna_street = 'Ленина'`);
        res.json(hairdressers.recordset);

    } catch (error) {
        console.error('Ошибка при получении парикмахеров:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
});

app.post('/api/slotHair', async (req, res) => {
    const { hairdresserId, date, startTime, endTime } = req.body;

    if (!hairdresserId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Все поля обязательны.' });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Проверка на существование записи
        const duplicateCheckResult = await pool.request()
            .input('hairdresserId', sql.Int, hairdresserId)
            .input('date', sql.Date, date)
            .input('startTime', sql.NVarChar, startTime)
            .input('endTime', sql.NVarChar, endTime)
            .query(`
                SELECT COUNT(*) AS count
                FROM hairdresser_schedule
                WHERE hairdresserid = @hairdresserId
                  AND workdate = @date
                  AND starttime = @startTime
                  AND endtime = @endTime
            `);

        const duplicateCount = duplicateCheckResult.recordset[0].count;

        if (duplicateCount > 0) {
            return res.status(400).json({ error: 'Данный слот уже существует.' });
        }

        // Вставка новой записи
        await pool.request()
            .input('hairdresserId', sql.Int, hairdresserId)
            .input('date', sql.Date, date)
            .input('startTime', sql.NVarChar, startTime)
            .input('endTime', sql.NVarChar, endTime)
            .query(`
                INSERT INTO hairdresser_schedule (hairdresserid, workdate, starttime, endtime)
                VALUES (@hairdresserId, @date, @startTime, @endTime)
            `);

        res.status(200).json({ message: 'Слот успешно добавлен.' });

    } catch (error) {
        console.error('Ошибка SQL:', error.message);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});


// Получение расписания парикмахеров
app.get('/api/schedule', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const schedule = await pool.request().query(`
            SELECT 
                hs.scheduleid,
                hs.hairdresserid,
                hs.workdate,
                hs.starttime,
                hs.endtime,
                h.hairdresser_name,
                h.hairdresser_surname
            FROM 
                hairdresser_schedule hs
            JOIN 
                hairdresser h ON hs.hairdresserid = h.hairdresserid
            ORDER BY 
                hs.workdate ASC, hs.starttime ASC
        `);

        res.json(schedule.recordset);

    } catch (error) {
        console.error('Ошибка при получении расписания:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
});



app.get('/Zapis/hairdresser', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const hairdressers = await pool.request().query(`
            SELECT 
                hairdresser_schedule.scheduleid, 
                hairdresser.hairdresserid, 
                hairdresser.hairdresser_name, 
                hairdresser.hairdresser_surname
            FROM hairdresser_schedule 
            LEFT JOIN hairdresser  
            ON hairdresser_schedule.hairdresserid = hairdresser.hairdresserid
        `);

        
        console.log('Данные, полученные из базы данных:', hairdressers.recordset);

        
        res.json(hairdressers.recordset);
    } catch (error) {
        console.error('Ошибка при получении парикмахеров:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
});


app.get('/Zapis/slots', async (req, res) => {
    const { hairdresserId, date } = req.query;

    if (!hairdresserId || !date) {
        return res.status(400).json({ error: 'ID парикмахера и дата обязательны.' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('hairdresserId', sql.Int, hairdresserId)
            .input('date', sql.Date, date)
            .query(`
                SELECT scheduleid, hairdresserid, workdate, starttime, endtime, is_deleted
                FROM hairdresser_schedule
                WHERE hairdresserid = @hairdresserId 
                AND workdate = @date 
                AND is_deleted = 0
            `);

        // Форматируем данные
        const formattedSlots = result.recordset.map(slot => ({
            scheduleid: slot.scheduleid,
            hairdresserid: slot.hairdresserid,
            workdate: slot.workdate.toISOString().split('T')[0], // Только дата (YYYY-MM-DD)
            starttime: slot.starttime.toISOString().split('T')[1].substring(0, 5), // Только время (HH:mm)
            endtime: slot.endtime.toISOString().split('T')[1].substring(0, 5), // Только время (HH:mm)
            is_deleted: slot.is_deleted
        }));

        res.json(formattedSlots); // Отправляем отформатированные данные
    } catch (error) {
        console.error('Ошибка при получении слотов:', error.message);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});






app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://172.17.229.240:${port}`);
});