const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/connection");
const userRouter = require("./routes/userRoutes"); // Correct path
const PORT = 3000;

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
