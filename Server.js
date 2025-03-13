const express = require('express');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.post('/su', (req, res) => {
    const name = req.body.name; 
    const age = req.body.age; 
  
    if (!name) {
        return res.status(400).send('<h1>Ошибка: Поле "name" не заполнено.</h1>');
    }


    const cryptoName = Buffer.from(name).toString('base64');

    res.redirect(`/discript.html?name=${cryptoName}&age=${age}`);



    console.log(`Данные пришли ${name} ${age}`);


});


app.listen(port, () => {
    console.log(`Сервер запущен на http://192.168.1.9:${port}`);
});