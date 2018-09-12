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
  const {newnote, userid} = req.body;

  db('notes').insert({
    userid: userid,
    content: newnote,
    created: new Date()
  }).returning('*')
  .then(data => {
    res.json(data[0]);
  })
  .catch(err=> res.status(400).json('Unable to create new note'))

});

// BOARD, DELETENOTE
app.put('/boarddelete', (req, res) => {
  const {noteid} = req.body;

  db('notes')
  .where('id', '=', noteid)
  .update({
    trashed: true
})
  .returning('*')
  .then(data=> {
    res.json(data[0]);
  })
  .catch(err=> res.status(400).json('Unable to delete note'))
});


// BOARD, EDITNOTE
app.put('/boardedit', (req, res) => {
  const {noteid, newnote} = req.body;

  db('notes')
    .where('id', '=', noteid)
    .update({
      content: newnote
    })
    .returning('*')
    .then(data=> {
      res.json(data[0])
    })
    .catch(err=> res.status(400).json('Unable to edit note'))
});

// UPDATE NOTECOUNT
app.put('/boardnotecount', (req, res) => {
  const {id} = req.body;

  db('users')
    .where('id', '=', id)
    .returning('totalnotes')
    .increment('totalnotes', 1)
    .then(totalnotes => {
      if(totalnotes.length) {
        res.json(totalnotes[0])
      } else {
        res.status(400).json('User not found')
      }
    })
    .catch(err=> res.status(400).json('unable to get note count'))
});



app.listen(3001, () => {
  console.log('Beep boop! Server listening on port 3001!');
});
