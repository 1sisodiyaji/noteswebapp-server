const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    GroupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    }
}, {
    timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
