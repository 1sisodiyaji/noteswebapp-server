const mongoose = require('mongoose');
const { Schema } = mongoose;

const GroupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true, 
    },
    slug:{
      type: String,
      required: true,
      trim: true,
    },
    Color: {
      type: String,
      trim: true, 
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notesIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    userID: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
