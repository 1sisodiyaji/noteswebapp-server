const Group = require('../models/Group.model');
const slugify = require('slugify');
const Note = require('../models/Notes.model');
const User = require('../models/User.model');

exports.getGroups =  async (req, res) => {
    try {
      const groups = await Group.find();
      res.status(200).send(groups);
    } catch (err) {
      res.status(500).send(err);
    }
};
exports.GetGroupBySlug = async (req, res) => {
  const { slug } = req.params; 

  try { 
    const group = await Group.findOne({slug:  slug }).populate({
      path: 'notesIds',
      select: 'content createdAt', // Only select the content field from notes
    });

    if (!group) {
      return res.status(404).send({ message: 'Group not found' });
    }
 
console.log(group);
    res.status(200).send({group });
  } catch (err) {
    res.status(500).send({ message: 'Server error', error: err });
  }
};

exports.CreateGroup =  async (req, res) => {
  const {groupName , Color} = req.body;
  const AuthorId = req.userId;
 
  if(!groupName || !Color){
      return res.status(401).json({message: 'please fill the Group name and color code'});
  }
  console.log(groupName + ' ' + Color + ' ' + AuthorId);
  try {
console.log("Entered");
  const slug = slugify(groupName, { lower: true, strict: true });
  const newGroup = new Group({
      groupName,
      Color,
      slug,
      authorId: AuthorId,

  });
  console.log(slug);
  console.log('new group data' + newGroup);
   const CreatedGroup =  await newGroup.save(); 
   if(CreatedGroup){
      res.status(201).send(CreatedGroup);
   }else{
      res.status(400).send(err);
   }
  
  } catch (err) {
    res.status(400).send(err);
  }
}; 
exports.updateGroup = async (req, res) => {
  const groupId = req.params.id;
  const updates = req.body;
  const userId = req.userId;

  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required' });
  }

  try { 
    const group = await Group.findById(projectId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
 
    if (group.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this project' });
    }
 
    const updatedFields = {};

    if (updates.groupName) {
      if (updates.groupName.trim().length < 3 || updates.groupName.trim().length > 1000) {
        return res.status(400).json({ message: 'Group Name must be between 3 and 1000 characters' });
      }
      updatedFields.groupName = updates.groupName; 
      updatedFields.slug = slugify(updates.groupName, { lower: true, strict: true });
    }
    if (updates.Color) {
      if (updates.Color.trim().length < 3 || updates.Color.trim().length > 1000) {
        return res.status(400).json({ message: 'Color must be between 3 and 1000 characters' });
      }
      updatedFields.Color = updates.Color;  
    }

    const updateGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updateGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json(updateGroup);

  } catch (error) {
    console.error('Error updating Group:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
}};
exports.DeleteGroup =  async (req, res) => {
  const groupId = req.params.id;
  const authorId = req.userId;
  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required' });
  }
  if(!authorId){
      return res.status(401).json({message: 'Author id is required'});
  }

  try {
      const groupData = await Group.findById(groupId);
    if (!groupData) {
      return res.status(404).json({ message: 'Group  not found' });
    }
    if (groupData.authorId.toString()!== authorId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this notes' });
    }
    
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({message : 'Not Found'});
    }
    res.status(200).json({message: "Deleted Successfully " , group});
  } catch (err) {
    res.status(500).send(err);
  }
};