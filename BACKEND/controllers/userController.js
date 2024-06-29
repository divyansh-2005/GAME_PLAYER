const User = require("../models/user");

const saveUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      telegramId: req.body.telegramId,
    });
    if (existingUser) {
      return res.status(200).send("User already exists");
    }
    const user = new User(req.body);
    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
const fetchUser = async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).send("User not Found");
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  saveUser,
  fetchUser,
};