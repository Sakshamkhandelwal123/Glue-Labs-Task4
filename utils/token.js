const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

require("../config/passport")(passport);

let refreshTokens = [];

async function Token(req, res) {
  const refreshToken = req.header("x-auth-token");
  
  if (!refreshToken) {
    res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }

  if (!refreshTokens.includes(refreshToken)) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }

  try {
    const user = await jwt.verify(refreshToken, process.env.SECRET_KEY);
    const { email } = user;
    
    const accessToken = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "86400 * 30",
    });
    
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
}

async function getToken(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    
    if (parted.length === 2) {
      return parted[1];
    }
    
    return null;
  }
  
  return null;
}

module.exports = {
  Token,
  getToken,
};
