const express = require('express');
const bodyParser = require ('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const board = require('./controllers/board');


const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'Joy',
    password : '',
    database : 'stickie'
  }
});


app.post('/register', (req, res)=> {
  register.handleRegister(req, res, db, bcrypt);
});

app.post('/signin', (req, res)=> {
  signin.handleSignin(req, res, db, bcrypt);
});

app.post('/board', (req, res)=> {
  board.getUserNotes(req, res, db);
});

app.post('/boardnewstickie', (req, res) => {
  board.createNewNote(req, res, db);
});

app.put('/boarddelete', (req, res) => {
  board.deleteNote(req, res, db);
});

app.put('/boardedit', (req, res) => {
  board.editNote(req, res, db);
});

app.put('/boardnotecount', (req, res) => {
  board.updateNoteCount(req, res, db);
});



app.listen(3001, () => {
  console.log('Beep boop! Server listening on port 3001!');
});
