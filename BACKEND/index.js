const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/connection");
const userRouter = require("./routes/userRoutes"); // Correct path
require("dotenv").config(); 
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

connection();

app.use("/api", userRouter); // Prefix your routes with /api for better structure

app.get("/", (req, res) => {
  res.send("Server started");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
