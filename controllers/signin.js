const handleSignin = (req, res, db, bcrypt) => {

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
};

module.exports = {handleSignin};
