const getUserNotes = (req, res, db) => {
  const {userid} = req.body;

  db('notes').where({
      userid: userid,
      trashed: false
  }).select('*')
  .then(data => {
    res.json(data);
  })
  .catch(err=> res.status(400).json('Unable to get notes'))
};


const createNewNote = (req, res, db) => {
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
};


const deleteNote = (req, res, db) => {
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
};


const editNote = (req, res, db) => {
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
};


const updateNoteCount = (req, res, db) => {
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
};

module.exports = {getUserNotes,
                  createNewNote,
                  deleteNote,
                  editNote,
                  updateNoteCount};
