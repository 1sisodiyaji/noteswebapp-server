const express = require("express");
const app = express();
const bodyParser = require("body-parser"); 
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const database = require('./config/Database'); 
const userRoutes = require('./routes/user');
const notesRoutes = require('./routes/notes');

const corsOptions = {
  origin: '*', 
  credentials: true,  
  methods: "GET,POST,PUT,DELETE,OPTIONS",  
  allowedHeaders: "Content-Type,Authorization,X-Requested-With"  
};
 
app.use(cors(corsOptions)); 
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.json());
 
database();
 
app.use("/user", userRoutes); 
app.use("/notes", notesRoutes); 

app.get("/", (req, res) => {
  res.json({ message: "Welcome to NotesWebApp server ..." });
});
 
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});