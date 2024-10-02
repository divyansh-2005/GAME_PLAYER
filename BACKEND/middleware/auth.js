const jwt = require("jsonwebtoken");

// Function to verify the user
const verifyUser = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    const isRenewed = await renewToken(req, res);
    if (isRenewed) {
      return next();
    } else {
      return res.status(401).json({ valid: false, message: "Unauthorized" });
    }
  } else {
    jwt.verify(accessToken, "jwt-access-token-secret-key", (err, decoded) => {
      if (err) {
        return res.json({
          valid: false,
          message: "unauthorized access, invalid access token",
        });
      } else {
        req.email = decoded.email; // Set the email from decoded token
        return next();
      }
    });
  }
};

// Function to renew the token
const renewToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return false;
  }

  return new Promise((resolve) => {
    jwt.verify(refreshToken, "jwt-refresh-token-secret-key", (err, decoded) => {
      if (err) {
        return resolve(false);
      } else {
        const accessToken = jwt.sign(
          { email: decoded.email },
          "jwt-access-token-secret-key",
          { expiresIn: "1m" }
        );

        res.cookie("accessToken", accessToken, { maxAge: 60000 });

        return resolve(true);
      }
    });
  });
};

module.exports = {
  verifyUser,
};
