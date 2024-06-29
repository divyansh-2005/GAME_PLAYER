const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/connection");
const PORT=3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

connection();

app.use( require("./routers/userRouter"));

app.use("/", (req, res) => { 
    res.send("started");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
