const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models").User;
const logger = require("../../utils/logger");
const sendUserMail = require("../../utils/queue");
require("../../config/passport")(passport);
require("dotenv").config();

let refreshTokens = [];

async function Register(req, res) {
  logger.info(JSON.stringify(req.body, null, 3));

  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).send({ msg: "Please pass username and password." });
  }

  try {
    let user = await User.create({
      username,
      password,
      role: role || "basic",
      
      accessToken: jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: 86400 * 30,
      }),
      
      refreshToken: jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: 86400 * 365,
      }),
    });
    
    sendUserMail(username);

    refreshTokens.push(user.refreshToken), res.status(201).send(user);

  } catch (error) {
    logger.error(error);
    res.status(400).send(error);
  }
}

async function Login(req, res) {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).send({
        message: "Authentication failed. User not found.",
      });
    }

    user.comparePassword(password, (err, isMatch) => {
      if (isMatch && !err) {
        var token = jwt.sign(
          JSON.parse(JSON.stringify(user)),
          process.env.SECRET_KEY,
          { expiresIn: 86400 * 30 }
        );

        var token2 = jwt.sign(
          JSON.parse(JSON.stringify(user)),
          process.env.SECRET_KEY,
          { expiresIn: 86400 * 365 }
        );

        jwt.verify(token, process.env.SECRET_KEY, function (err, data) {
          if (err) {
            logger.error(err);
          } else {
            logger.info(JSON.stringify(data, null, 3));
          }
        });

        jwt.verify(token2, process.env.SECRET_KEY, function (err, data) {
          if (err) {
            logger.error(err);
          } else {
            logger.info(JSON.stringify(data, null, 3));
          }
        });

        return res.json({
          success: true,
          accessToken: "JWT " + token,
          refreshToken: "JWT " + token2,
          role: user.role,
        });
      }
      
      return res.status(401).send({
        success: false,
        msg: "Authentication failed. Wrong password.",
      });

    });
  } catch (error) {
    res.status(400).send(error);
  }
}

async function ChangePassword(req, res) {
  const { username, newPassword } = req.body;

  try {
    let user = await User.findOne({
      where: {
        username,
      },
    });
    
    if (!user) {
      return res.status(401).send({
        message: "Authentication failed. User not found.",
      });
    }

    user.changePassword(newPassword, (err) => {
      if (!err) {
        return res.json({ success: true });
      }
      
      return res.status(401).send({
        success: false,
        msg: "Authentication failed",
      });
    });

  } catch (error) {
    res.status(400).send(error);
  }
}

module.exports = {
  Register,
  Login,
  ChangePassword,
};
