const express = require('express');
const { uploadFile } = require('../Controller/dataController.js');
const multer = require('multer');

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/upload',upload.single('file'),uploadFile)

module.exports = route;