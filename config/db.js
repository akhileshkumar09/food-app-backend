require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.DB_URL;


const connection = mongoose.connect(uri).then(() => {
    console.log("connected to data base ");
})

module.exports = connection;
