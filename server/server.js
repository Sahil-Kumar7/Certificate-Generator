const express = require('express');
const mongoose = require('mongoose');
const route = require('./Routes/dataRoute.js');
const connectToDb = require('./connectToDB.js');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 7171;
const url = process.env.MONGO_URL;

connectToDb(url);
app.use('/',route)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})