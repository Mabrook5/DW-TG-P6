const mongoose = require('mongoose');

const saucesShema = mongoose.Schema({
    userId: { type: String, require: true},
    name: { type: String, require: true},
    manufacturer: { type: String, require: true},
    description: { type: String, require: true},
    mainPepper: { type: String, require: true},
    imageUrl: { type: String, require: true},
    heat: { type: Number, require: true},
    like: { type: Number, require: true},
    dislike: { type: Number, require: true},
    usersLiked: { type: Array, require: true},
    usersDisliked: { type: Array, require: true},
});

module.exports = mongoose.model('Sauces',saucesShema);