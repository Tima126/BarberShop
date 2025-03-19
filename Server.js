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
app.get('/admin-panel', (req,res)=>{

    if(!req.session.isAdmin){
        return res.status(403).json({message:'Доступ запрещен.'});
    }
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Админ-панель</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }

                .container {
                    max-width: 1200px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #fff;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }

                h1 {
                    text-align: center;
                    color: #333;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                th {
                    background-color: #f4f4f4;
                    color: #555;
                }

                .actions button {
                    padding: 8px 12px;
                    margin: 2px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .edit-btn {
                    background-color: #007bff;
                    color: white;
                }

                .complete-btn {
                    background-color: #28a745;
                    color: white;
                }

                .delete-btn {
                    background-color: #dc3545;
                    color: white;
                }

                .loading {
                    text-align: center;
                    font-size: 18px;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Админ-панель</h1>
                <div id="loading" class="loading">Загрузка данных...</div>
                <table id="recordsTable" style="display: none;">
                    <thead>
                        <tr>
                            <th>ID записи</th>
                            <th>Клиент</th>
                            <th>Телефон</th>
                            <th>Парикмахер</th>
                            <th>Парикмахерская</th>
                            <th>Дата и время</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <script src="admin.js"></script>
        </body>
        </html>
    `);
});

app.post('/logout', (req, res) =>{

    req.session.destroy((err)=>{
        if(err){
            console.error('Ошибки при выходе:', err.message);
            return res.status(500).json({message: 'Произошла ошибка при выходе.'});
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




app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


app.listen(port, () => {
    console.log(`Сервер запущен на http://192.168.1.9:${port}`);
});