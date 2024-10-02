const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    if (renewToken(req, res)) {
      return next();
    }
  } else {
    jwt.verify(accessToken, "jwt-access-token-secret-key", (err, decoded) => {
      if (err) {
        return res.json({
          valid: false,
          message: "unauthorized access, invalid access token",
        });
      } else {
        req.email = decoded.email;
        return next();
      }
    });
  }
};

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.json({ valid: false, message: "no refresh token" });
    return false;
  } else {
    jwt.verify(refreshToken, "jwt-refresh-token-secret-key", (err, decoded) => {
      if (err) {
        res.json({
          valid: false,
          message: "unauthorized access, invalid refresh token",
        });
        return false;
      } else {
        const accessToken = jwt.sign(
          { email: decoded.email },
          "jwt-access-token-secret-key",
          { expiresIn: "1m" }
        );

        res.cookie("accessToken", accessToken, { maxAge: 60000 });

        return true;
      }
    });
  }
};

module.exports = {
  verifyUser,
};
