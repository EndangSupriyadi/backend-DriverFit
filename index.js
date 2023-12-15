const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
 destination: './public/uploads/',
 filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
 }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: '',
 database: 'driverfit'
});

db.connect((err) => {
 if (err) throw err;
 console.log('MySql Connected...');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/register', upload.single('image'), async (req, res) => {
    const { name, email, no_hp, password } = req.body;
    const image = req.file.path;
    let hashedPassword = bcrypt.hashSync(password, 8);

    try {
        let sql = 'SELECT * FROM users WHERE email = ?';
        let results = await db.query(sql, [email]);

        if (results.length > 0) {
            throw new Error('Email already exists...');
        }

        let sql2 = `INSERT INTO users SET ?`;
        let values = {
            name: name,
            email: email,
            no_hp: no_hp,
            image: image,
            password: hashedPassword
        };

        let result = await db.query(sql2, values);
        res.send('Registration Succesful...');

    } catch (error) {
        res.status(400).send(error.message);
    }
});
app.post('/login', (req, res) => {
 const { email, password } = req.body;

 let sql = `SELECT * FROM users WHERE email = '${email}'`;
 let query = db.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let hashedPassword = result[0].password;
      if (bcrypt.compareSync(password, hashedPassword)) {
        res.send('Login Succesful...');
      } else {
        res.send('Wrong Email or Password');
      }
    } else {
      res.send('Wrong Email and Password');
    }
 });
});

app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});