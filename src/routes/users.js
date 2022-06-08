const logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../../config/passport")(passport);
const User = require("../models").User;
let refreshTokens = [];
const transporter = require("../../utils/sendMail").transporter;
const Queue = require('bull');
require("dotenv").config();

async function Register(req, res) {
  logger.info(JSON.stringify(req.body, null, 3));

  if (!req.body.username || !req.body.password) {
    res.status(400).send({ msg: "Please pass username and password." });
  } 
  
  else {
    User.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || "basic",
      accessToken: jwt.sign({ username: req.body.username }, "nodeauthsecret", {
        expiresIn: 86400 * 30,
      }),
      refreshToken: jwt.sign(
        { username: req.body.username },
        "nodeauthsecret",
        { expiresIn: 86400 * 365 }
      ),
    })
      .then((user) => {
        // Queue
        const sendMailQueue = new Queue('sendMail');

        const data = {
          email: req.body.username
        };

        const options = {
          delay: 60000, // 1 min in ms
          attempts: 2
        };

        sendMailQueue.add(data, options);
        
        sendMailQueue.process(async job => { 
          return await sendMail(job.data.email); 
        });

        refreshTokens.push(user.refreshToken), res.status(201).send(user);
      })
      .catch((error) => {
        logger.error(error);
        res.status(400).send(error);
      });
  }
}

async function Login(req, res) {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(401).send({
          message: "Authentication failed. User not found.",
        });
      }

      user.comparePassword(req.body.password, (err, isMatch) => {
        if (isMatch && !err) {
          var token = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            "nodeauthsecret",
            { expiresIn: 86400 * 30 }
          );

          var token2 = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            "nodeauthsecret",
            { expiresIn: 86400 * 365 }
          );

          jwt.verify(token, "nodeauthsecret", function (err, data) {
            if (err) {
              logger.error(err);
            } else {
              logger.info(JSON.stringify(data, null, 3));
            }
          });

          jwt.verify(token2, "nodeauthsecret", function (err, data) {
            if (err) {
              logger.error(err);
            } else {
              logger.info(JSON.stringify(data, null, 3));
            }
          });

          res.json({
            success: true,
            accessToken: "JWT " + token,
            refreshToken: "JWT " + token2,
            role: user.role,
          });
        } 
        
        else {
          res.status(401).send({
            success: false,
            msg: "Authentication failed. Wrong password.",
          });
        }
      });
    })
    .catch((error) => res.status(400).send(error));
}

async function ChangePassword(req, res) {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(401).send({
          message: "Authentication failed. User not found.",
        });
      }
      
      user.changePassword(req.body.newPassword, (err) => {
        if (!err) {
          res.json({ success: true });
        } else {
          res.status(401).send({
            success: false,
            msg: "Authentication failed",
          });
        }
      });
    })
    .catch((error) => res.status(400).send(error));
}

function sendMail(email) {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome",
      html: "<h1>WELCOME TO BLOG APPLICATION. VISIT OUR SITE TO KNOW MORE.</h1>", 
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.info(JSON.stringify(info, null, 3));
        resolve(info);
      }
    });
  });
}

module.exports = {
  Register,
  Login,
  ChangePassword,
};
