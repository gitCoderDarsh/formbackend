//import

import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { connectToDb, getDb } from "./db.js";
import { connection, createTableSQL, connectdb, disconnectdb } from './db.js';
import path from "path";
import bodyParser from "body-parser";

//creating table

connection.query(createTableSQL, (err, results) => {
    if (err) {
      console.error('Error creating table: ' + err.message);
    } else {
      console.log('Table created successfully kabka');
    }
  });

//initialisation and configuration

const __dirName = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirName, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

//database connection setup

let db;

connectToDb((err) => {
    if (!err) {
        db = getDb();
        // console.log('Database connected:', db);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } else {
        console.error('error connecting to the database', err);
    }
})

//routes

//--home and static pages

app.get(['/', '/home'], (req, res) => {
    res.sendFile(__dirName + "/views/index.html");
});

app.get('/login', (req, res) => {
    res.sendFile(__dirName + "/views/login.html");
});

app.get('/register', (req, res) => {
    res.sendFile(__dirName + "/views/form.html");
});

//--user-related routes
//--insert data

app.post('/user', async (req, res) => {
    const { f_name, l_name, email, phoneNumber } = req.body;

    const user = {
        f_name,
        l_name,
        email,
        phoneNumber
    };

    try {
        // Insert user data into MongoDB
        const resultMongo = await db.collection('StarGaze').insertOne(user);
        console.log('Inserted user data into MongoDB:', resultMongo.ops);

        // Insert user data into MySQL
        const insertUser = "INSERT INTO userdata (f_name, l_name, email, phoneNumber) VALUES (?, ?, ?, ?)";
        const values = [f_name, l_name, email, phoneNumber];

        connection.query(insertUser, values, (err, results) => {
            if (err) {
                console.error("Error inserting user into MySQL: " + err.message);
                return res.status(500).json({ error: "An error occurred" });
            }

            console.log('Inserted user data into MySQL:', results);
            res.redirect(`/user?phoneNumber=${encodeURIComponent(user.phoneNumber)}`);
        });
    } catch (error) {
        console.error("Error inserting user into MongoDB: " + error.message);
        res.status(500).json({ error: "An error occurred" });
    }
});

    //--read after registering

    app.get('/user', (req, res) => {

        const userPhoneNumber = req.query["phoneNumber"];

        console.log('User Phone Number:', userPhoneNumber);

        db.collection('StarGaze').findOne({ phoneNumber: userPhoneNumber })
            .then(user => {
                console.log('Retrieved user data:', user);
                if (user) {
                    res.render('user', { user });
                } else {
                    res.status(404).send('user not found');
                }
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                res.status(500).send('Internal Server Error');
            });
    });

    //--read after login

    app.post(('/registered'), (req, res) => {
        const { phoneNumber } = req.body;

        db.collection('StarGaze').findOne({ phoneNumber })
            .then(user => {
                console.log('Retrieved user data:', user);
                if (user) {
                    res.redirect(`/user?phoneNumber=${encodeURIComponent(phoneNumber)}`)
                } else {
                    res.status(404).send('user not found');
                }
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                res.status(500).send('Internal Server Error');
            });
    });

    //--delete-user

    app.get('/cancel-registration', (req, res) => {

        const userPhoneNumber = req.query["phoneNumber"];
        if (!userPhoneNumber) {
            return res.status(400).send('Phone number is missing');
        }

        db.collection('StarGaze').deleteOne({ phoneNumber: userPhoneNumber })
            .then(result => {
                const deleteUser = `DELETE FROM userdata WHERE phoneNumber = ${userPhoneNumber}`
                connection.query(deleteUser)

                console.log('Deleted user data:', result);
                res.redirect('/?success=true');
            })
            .catch(err => {
                console.error('Error deleting user data:', err);
                res.redirect('/?success=true');
            });
    });

    //--update info

    app.get('/edit', (req, res) => {
        const phone = req.query["phoneNumber"];
        if (!phone) {
            return res.status(400).send('Phone number is missing');
        }

        db.collection('StarGaze').findOne({ phoneNumber: phone })
            .then(user => {
                if (user) {

                    res.render('edit', { user });
                }
                else {
                    res.status(404).send('user not find');
                }
            })
            .catch(err => {
                console.error('Error fetching user data:', err);
                res.status(500).send('Internal Server Error');
            });
    });

    app.post('/update-user', (req, res) => {
        const { f_name, l_name, email, phoneNumber } = req.body;

        const updatedUser = {
            f_name,
            l_name,
            email,
            phoneNumber
        };

        db.collection('StarGaze').updateOne(
            { phoneNumber: phoneNumber },
            { $set: updatedUser }
        )
            .then(result => {

                const updateUser = `UPDATE userdata SET f_name = (?), l_name = (?),email = (?), phoneNumber = (?) WHERE phoneNumber = ${phoneNumber}`;
                const values = [f_name, l_name, email, phoneNumber];

                connection.query(updateUser, values);

                console.log('Updated user data:', result);
                res.redirect(`/user?phoneNumber=${encodeURIComponent(phoneNumber)}`);
            })
            .catch(err => {
                console.error('Error updating user data:', err);
                res.status(500).send('Internal Server Error');
            });
    });

    //--show all users mongo-db

    app.get('/all-users', (req, res) => {

        db.collection('StarGaze').find({}).toArray()
            .then(users => {
                res.json(users);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    });