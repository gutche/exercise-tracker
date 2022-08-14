const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.DATABASE_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseSchema],
});

exports.User = mongoose.model('User', userSchema);
exports.Exercise = mongoose.model('Exercise', exerciseSchema);
