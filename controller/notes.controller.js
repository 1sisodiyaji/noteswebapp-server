const Notes = require('../models/Notes.model'); 

exports.getNotes =  async (req, res) => {
    try {
      const notes = await Notes.find();
      res.status(200).send(notes);
    } catch (err) {
      res.status(500).send(err);
    }
};
exports.GetNotesBySlug = async (req, res) => {
  const slug = req.params.slug;
    try {
      const notes = await Notes.find({slug : slug});
      if (!notes) {
        return res.status(404).send();
      }
      res.status(200).send(notes);
    } catch (err) {
      res.status(500).send(err);
    }
};
exports.CreateNotes =  async (req, res) => {
  const {content , GroupId} = req.body;
  const AuthorId = req.userId;
 
  if(!content || !GroupId){
      return res.status(401).json({message: 'please fill the Content and mention the group id'});
  } 
  try {  
  const newNotes = new Notes({
    content,
    GroupId: GroupId,
    userId: AuthorId,

  });  
   const CreatedNotes =  await newNotes.save(); 
   if(CreatedNotes){
      res.status(201).send(CreatedNotes);
   }else{
      res.status(400).send(err);
   }
  
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.updateNotes = async (req, res) => {
    const notesId = req.params.id;
    const updates = req.body;
    const userId = req.userId;
  
    if (!notesId) {
      return res.status(400).json({ message: 'notes ID is required' });
    }
  
    try { 
      const notes = await Notes.findById(projectId);
      if (!notes) {
        return res.status(404).json({ message: 'Notes not found' });
      }
   
      if (notes.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to update this project' });
      }
   
      const updatedFields = {};
  
      if (updates.content) {
        if (updates.content.trim().length < 3 || updates.content.trim().length > 1000) {
          return res.status(400).json({ message: 'content must be between 3 and 1000 characters' });
        }
        updatedFields.content = updates.content; 
      }
  
      const updatedNotes = await Notes.findByIdAndUpdate(
        notesId,
        { $set: updatedFields },
        { new: true, runValidators: true }
      );
  
      if (!updatedNotes) {
        return res.status(404).json({ message: 'Notes not found' });
      }
  
      res.status(200).json(updatedNotes);
  
    } catch (error) {
      console.error('Error updating notes:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
}};

exports.DeleteNotes =  async (req, res) => {
    const notesId = req.params.id;
    const authorId = req.userId;
    if (!notesId) {
      return res.status(400).json({ message: 'Notes ID is required' });
    }
    if(!authorId){
        return res.status(401).json({message: 'Author id is required'});
    }

    try {
        const notesdata = await Notes.findById(notesId);
      if (!notesdata) {
        return res.status(404).json({ message: 'Notes not found' });
      }
      if (notesdata.userId.toString()!== authorId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to delete this notes' });
      }
      
      const notes = await Notes.findByIdAndDelete(notesId);
      if (!notes) {
        return res.status(404).json({message : 'Not Found'});
      }
      res.status(200).json({message: "Deleted Successfully " , notes});
    } catch (err) {
      res.status(500).send(err);
    }
};