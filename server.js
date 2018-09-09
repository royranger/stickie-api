const express = require('express');
const bodyParser = require ('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');


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




//REGISTER
app.post('/register', (req, res)=> {
  const {name, username, password} = req.body;

  if (!name || !username || !password) {
    return res.status(400).json('fields empty');
  }

  const hash = bcrypt.hashSync(password);

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      username: username
    })
    .into('login')
    .returning('username')
    .then(newUsername=> {
      return trx('users')
      .returning('*')
      .insert({
        name: name,
        username: newUsername[0],
        joined: new Date()
      })
      .then(newUser=> {
        res.json(newUser[0])
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err=> res.status(400).json('Unable to register'))
});


// SIGN IN
app.post('/signin', (req, res)=> {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json('fields empty');
  }

  db('login').where({username: username})
            .select('username', 'hash')
            .then(data=> {
              const isValid = bcrypt.compareSync(password, data[0].hash);
              if (isValid) {
                return db('users').where({
                  username: username
                }).select('*')
                  .then(user=> {
                    res.json(user[0])
                  })
                  .catch(err=> res.status(400).json('unable to get user'))
              } else {
                res.status(400).json('wrong username and/or password')
              }
            })
            .catch(err=> res.status(400).json('wrong username and/or password'))  

});


// BOARD, GETUSERNOTES
app.post('/board', (req, res)=> {
  const {userid} = req.body;

  db('notes').where({
      userid: userid,
      trashed: false
  }).select('*')
  .then(data => {
    res.json(data);
  })
  .catch(err=> res.status(400).json('Unable to get notes'))
});

// BOARD, CREATE NEWNOTE
app.post('/boardnewstickie', (req, res) => {
  const {newnote, userid, username} = req.body;

  db('notes').insert({
    userid: userid,
    username: username,
    content: newnote,
    created: new Date()
  }).returning('*')
  .then(data => {
    res.json(data[0]);
  })
  .catch(err=> res.status(400).json('Unable to create new note'))

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
