const logger = require('../../utils/logger');
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../../config/passport")(passport);
const User = require("../models").User;
let refreshTokens = [];

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        properties:
 *          username:
 *            type: string
 *          password:
 *            type: string
 *          role:
 *            type: string
 */

/**
 * @swagger
 * /api/signup:
 *  post:
 *    description: Use to add users
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/User'
 *    responses:
 *      '200':
 *        description: User successfully added
 */

async function Register(req, res) {
    logger.info(req.body);
    if (!req.body.username || !req.body.password) {
      res.status(400).send({ msg: "Please pass username and password." });
    } else {
      User.create({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role || "basic",
        accessToken: jwt.sign(
          { username: req.body.username },
          "nodeauthsecret",
          { expiresIn: 86400 * 30 }
        ),
        refreshToken: jwt.sign(
          { username: req.body.username },
          "nodeauthsecret",
          { expiresIn: 86400 * 365 }
        ),
      })
        .then((user) => {
          refreshTokens.push(user.refreshToken), res.status(201).send(user);
        })
        .catch((error) => {
          logger.error(error);
          res.status(400).send(error);
        });
    }
  }

/**
 * @swagger
 * /api/signin:
 *  post:
 *    description: Use to signin
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/User'
 *    responses:
 *      '200':
 *        description: A successful response
 */

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
            logger.info(err + data);
          });
          jwt.verify(token2, "nodeauthsecret", function (err, data) {
            logger.info(err + data);
          });
          res.json({
            success: true,
            accessToken: "JWT " + token,
            refreshToken: "JWT " + token2,
            role: user.role,
          });
        } else {
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

module.exports = {
  Register, 
  Login,
  ChangePassword
};
