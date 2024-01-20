//MongoDB

import { MongoClient } from "mongodb";

let dbConnection;

export const connectToDb = async(cb) => {
    try{
        const client = await MongoClient.connect('mongodb://localhost:27017/StarGaze');
        dbConnection = client.db();
        return cb();
    }catch(err){
        console.error(err);
        return cb(err);
    }
}

export const getDb = () => dbConnection;

// MySQL

import mysql from "mysql";

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'martha@0804',
  database: 'test',
});

const connectdb = () => {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ' + err.message);
      return;
    }
    console.log('Connected to the database');
  });
};

const disconnectdb = () => {
  connection.end((err) => {
    if (err) {
      console.error('Error closing the database connection: ' + err.message);
    } else {
      console.log('Database connection closed');
    }
  });
};

const createTableSQL = `
    CREATE TABLE IF NOT EXISTS userdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    f_name VARCHAR(255) NOT NULL,
    l_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL
  )
`;

const updateUserInfo = `
    UPDATE userdata
    SET username =  
  )
`

export { connection, createTableSQL, connectdb, disconnectdb };
