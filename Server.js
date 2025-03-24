const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./dbBarber');
const bcrypt = require('bcryptjs');

const session = require('express-session');

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

        const [existingUser] = await db.query('SELECT * FROM client WHERE client_phone = ?', [phone]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким номером телефона уже зарегистрирован.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        await db.query(
            'INSERT INTO client (client_name, client_phone, client_email, client_password) VALUES (?, ?, ?, ?)',
            [name, phone, email || null, hashedPassword]
        );

        console.log(`Новый пользователь зарегистрирован: ${name}, телефон: ${phone}`);

        const [NewUser] = await db.query('SELECT client_name, client_phone, client_email, client_password, client_bonuses FROM client WHERE client_phone = ?', [phone]);

        const User = NewUser[0];

        return res.json({
            success: true,
            user: {
                name: User.client_name,
                phone: User.client_phone,
                points: User.client_bonuses || 0

            }
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
});

//Маршрут для Входа Администратора
app.post('/loginAdmin', async (req, res) => {
    const { login, password } = req.body;

    try {

        const [Admin] = await db.query('SELECT * FROM client WHERE client_name = ? AND Role = ?', [login, '1']);
        if (Admin.length === 0) {
            console.log(`Попытка входа: Пользователь с логином "${login}" не найден.`);
            return res.status(400).json({ message: 'Неверный логин или пароль.' });
        }

        const admin = Admin[0];


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

//Защищённый маршрут для админ панель
app.get('/admin-panel/records', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel', 'records.html'));
});

// выход для Админа
app.post('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибки при выходе:', err.message);
            return res.status(500).json({ message: 'Произошла ошибка при выходе.' });
        }
        res.json({ success: true, message: 'Вы успешно вышли.' });
    });
});

// Маршрут для входа 
app.post('/Login', async (req, res) => {
    const { phone, password } = req.body;

    try {

        const [users] = await db.query('SELECT client_name, client_phone, client_email, client_password, client_bonuses FROM client WHERE client_phone = ?', [phone]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Пользователь с таким номером телефона не найден.' });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.client_password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Неверный пароль.' });
        }

        console.log(`пользователь вошел, телефон: ${phone}`);
        return res.json({
            success: true,
            user: {
                name: user.client_name,
                phone: user.client_phone,
                points: user.client_bonuses || 0
            }
        });
    } catch (error) {
        console.error('Ошибка при входе:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при входе.' });
    }
});

app.get('/admin/get-records', async (req, res) => {
    try {
        const [records] = await db.query(`
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

        res.json(records);
    } catch (error) {
        console.error('Ошибка при получении записей:', error.message);
        res.status(500).json({ message: 'Произошла ошибка при получении записей.' });
    }
});

app.put('/admin/complete-record/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const [recordClient] = await db.query('SELECT clientid FROM record WHERE recordid = ? ', [id]);
        if (recordClient.length === 0) {
            return res.status(404).json({ message: 'Запись не найдена.' });
        }

        const clientId = recordClient[0].clientid;



        // обнавление статуса записи
        await db.query('UPDATE record SET is_completed = 1 WHERE recordid = ?', [id]);

        // обнавление баланса баллов клиента за приём
        await db.query('UPDATE client SET client_bonuses = client_bonuses + 10 WHERE clientid = ?', [clientId]);

        res.json({ success: true, message: 'Приём успешно завершён.' });




    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error.message);
        res.status(500).json({ message: 'Произошла ошибка при обновлении статуса.' });
    }
});


app.delete('/admin/delete-record/:id', async (req, res) => {
    const { id } = req.params;

    try {

        await db.query('UPDATE record SET is_deleted = 1 WHERE recordid = ?', [id]);


        await db.query('UPDATE record_service SET is_deleted = 1 WHERE recordid = ?', [id]);


        await db.query('UPDATE payment SET is_deleted = 1 WHERE recordid = ?', [id]);

        console.log(`Запись с ID: ${id} помечена как удалённая.`);

        res.json({ success: true, message: 'Запись успешно помечена как удалённая.' });
    } catch (error) {

        console.error('Ошибка при пометке записи как удалённой:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
});


// ---------------------------------------------------------------------------
//  Маршруты для назначение работников админом
// ---------------------------------------------------------------------------

// выгрузка парикмахеров
app.get('/api/hairdressers', async (req, res) => {
    try {
        const [hairdresser] = await db.query('SELECT * FROM hairdresser');
        res.json(hairdresser);


    } catch (error) {
        console.error('Ошибка при получении парикмахеров:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }
})


// выгрузка расписание парикмахеров
app.get('/api/schedule', async (req, res) => {

    try {
        const [schedule] = await db.query(
            `SELECT 
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
                hs.workdate ASC, hs.starttime ASC`);

        res.json(schedule);


    } catch (error) {
        console.error('Ошибка при получении парикмахеров:', error.message);
        res.status(500).json({ message: 'Произошла ошибка.' });
    }


});








app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://192.168.1.9:${port}`);
});