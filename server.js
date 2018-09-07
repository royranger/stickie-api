const express = require('express');
const bodyParser = require ('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


const app = express();
app.use(bodyParser.json());

const db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'Joy',
    password : '',
    database : 'stickie'
  }
});









app.listen(3001, () => {
  console.log('Beep boop! Server listening on port 3001!');
});


// Endpoints I need

// REGISTER -- POST
// Request body should have Name, username, password. This function should add user to
// database, encrypt password and send it to the login table. Response should be the
// user object.

// SIGNIN -- POST
// Request body should have username and password. Check against database. If successful,
// response should be user object (including array of user's existing notes)

// NEWNOTE -- POST
// Request body should take userid and the contents of the note. This function should
// create a new entry in the user's notes table. And should respond with the new note.

// DELETENOTE -- DELETE
// Request body should have noteid. Change the trashed property to true

// EDITNOTE -- PUT
//
