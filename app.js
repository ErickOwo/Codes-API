const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require ('path');
const { v4: uuidv4 } = require('uuid');

const dataRoute = require('./src/routes/data');
const usersRoute = require('./src/routes/users')

const verifyToken = require('./src/routes/validate-token')

const app = express();

// initializing env props
require('dotenv').config();

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.yf2nvqu.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri, {useNewUrlParser: true}).then(res =>{
  console.log('data base connected');
})

// multer configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'src/public/uploads'),
  filename: (req, file, cb) =>{
    cb(null, uuidv4() + path.extname(file.originalname));
  }
})

app.use(multer({storage}).single('media'));

// Midlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', process.env.PORT || 3085);

// routes
app.use('/api/users', usersRoute);
app.use('/api/data', verifyToken, dataRoute);

app.listen(app.get('port'), ()=> {
  console.log('app listen on port ' + app.get('port'));
})