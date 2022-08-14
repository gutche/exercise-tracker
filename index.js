const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const { User, Exercise } = require('./database');

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post(
  '/api/users',
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    const { username } = req.body;
    const newUser = new User({ username });
    newUser.save(() => {
      res.json({ username: newUser.username, _id: newUser.id });
    });
  }
);

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) console.log(err);
    res.json(data);
  });
});

app.post(
  '/api/users/:id/exercises',
  bodyParser.urlencoded({ extended: true }),
  (req, res) => {
    const { description } = req.body;
    const duration = parseInt(req.body.duration);
    const date = req.body.date
      ? req.body.date
      : new Date().toISOString().substring(0, 10);
    const { id } = req.params;

    const newExercise = new Exercise({
      description,
      duration,
      date: new Date(date).toDateString(),
    });
    newExercise.save();

    User.findByIdAndUpdate(
      id,
      { $push: { log: newExercise } },
      { new: true },
      (err, updatedUser) => {
        if (err) return res.json({ error: 'Invalid User Id' });
        const { username } = updatedUser;
        const { description, duration, date } = newExercise;
        res.json({ _id: id, username, date, description, duration });
      }
    );
  }
);

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  let fromDate = new Date(0);
  let toDate = new Date();

  if (from) fromDate = new Date(from);
  if (to) toDate = new Date(to);

  User.findOne({ _id }, (err, data) => {
    if (err) console.log(err);
    const { username, log, _id } = data;
    res.json({
      _id,
      username,
      log: log
        .filter((exercise) => {
          let exerciseDate = new Date(exercise.date).getTime();
          return exerciseDate >= fromDate && exerciseDate <= toDate;
        })
        .slice(0, limit),
      count: log.length,
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
