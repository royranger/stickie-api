const handleRegister = (req, res, db, bcrypt) => {

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
};

module.exports = {handleRegister};
