const jwt = require("jsonwebtoken");
const User = require("../models/user");

const registerUser = async (req, res) => {
  try {
    const { name, email, username, telegramId, password } = req.body;

    if (!telegramId || !name || !username || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).send("User already exists");
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const fetchUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send("email is required");
    }

    const user = await User.findOne({ email });
    if (user) {
      if (user.password === password) {
        const accessToken = jwt.sign(
          { email: email },
          "jwt-access-token-secret-key",
          { expiresIn: "1m" }
        );
        const refreshToken = jwt.sign(
          { email: email },
          "jwt-refresh-token-secret-key",
          { expiresIn: "2h" }
        );

        res.cookie("accessToken", accessToken, { maxAge: 60000 });

        res.cookie("refreshToken", refreshToken, {
          maxAge: 7200000, // 2 hours
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        return res.json({
          login: true,
          message: "login successful",
          user: user,
        });
      } else {
        return res.json({ login: false, message: "Incorrect password" });
      }
    } else {
      return res.status(404).json({ login: false, message: "user not found" });
    }

    // res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const logoutUser = (req, res) => {
  try {
    // Clear the accessToken and refreshToken cookies by setting their expiration dates to the past
    res.cookie("accessToken", "", {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", "", {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const authorizeDashboard = (req, res) => {
  return res.json({ valid: true, message: "authorized" });
};

module.exports = {
  registerUser,
  fetchUser,
  logoutUser,
  authorizeDashboard,
};
