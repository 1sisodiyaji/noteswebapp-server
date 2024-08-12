const express = require("express");
const router = express.Router(); 
const { CreateGroup, GetGroupBySlug, getGroups, updateGroup, DeleteGroup } = require('../controller/group.controller');
const authenticateToken = require('../middleware/auth');
const { getNotes, GetNotesBySlug, CreateNotes, updateNotes, DeleteNotes, getNotesByGroup, GetNotesByAuthor } = require("../controller/notes.controller");


router.get('/groups' , getGroups);
router.get('/getGroupData/:slug', GetGroupBySlug);
router.post("/getGroupsByAuthor",authenticateToken , CreateGroup );
router.post("/createGroup",authenticateToken , CreateGroup );
router.put('/updateGroup/:id',authenticateToken, updateGroup);
router.delete('/deleteGroup/:id',authenticateToken, DeleteGroup);

router.get('/notes' , getNotes);
router.get('/notes/:groupId' , getNotesByGroup);
router.get('/getNotesData/:slug', GetNotesBySlug);
router.post("/getNotesByAuthor",authenticateToken , GetNotesByAuthor );
router.post("/createNotes",authenticateToken , CreateNotes );
router.put('/updateNotes/:id',authenticateToken, updateNotes);
router.delete('/deleteNotes/:id',authenticateToken, DeleteNotes);


module.exports = router;