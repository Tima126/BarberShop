const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const db = require('./dbBarber');
const bcrypt = require('bcryptjs');

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

        return res.json({
            success:true,
            user: {name, phone, points: 0}
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        return res.status(500).json({ message: 'Произошла ошибка при регистрации.' });
    }
});



// Маршрут для входа 
app.post('/Login', async (req, res) => {
    const { phone, password } = req.body;

    try {
       
        const [users] = await db.query('SELECT * FROM client WHERE client_phone = ?', [phone]);

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
                points: user.client_points || 0
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
    console.log(`Сервер запущен на http://192.168.1.7:${port}`);
});