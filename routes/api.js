const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
require("../config/passport")(passport);
const Tech = require("../models").Tech;
const User = require("../models").User;
const TechValidator = require('../validations/tech');
const UserValidator = require('../validations/user');
const {validate} = require('express-validation');
let refreshTokens = [];

const { roles } = require('../roles');
const JwtStrategy = require("passport-jwt/lib/strategy");
 
const grantAccess = function(action, resource) {
 return async (req, res, next) => {
  try {
   const permission = roles.can(req.user.role)[action](resource);
   if (!permission.granted) {
    return res.status(401).json({
     error: "You don't have enough permission to perform this action"
    });
   }
   next()
  } catch (error) {
   next(error)
  }
 }
}

// Routes
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

router.post("/signup", validate(UserValidator.createOrUpdateUserValidator), function (req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    res.status(400).send({ msg: "Please pass username and password." });
  } else {
    User.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || 'basic',
      accessToken: jwt.sign({ username: req.body.username }, "nodeauthsecret", { expiresIn: 86400 * 30 }),
      refreshToken: jwt.sign({ username: req.body.username }, "nodeauthsecret", { expiresIn: 86400 * 365 }),
    })
      .then((user) => {refreshTokens.push(user.refreshToken), res.status(201).send(user)})
      .catch((error) => {
        console.log(error);
        res.status(400).send(error);
      });
  }
});

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

router.post("/signin", function (req, res) {
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
            console.log(err, data);
          });
          jwt.verify(token2, "nodeauthsecret", function (err, data) {
            console.log(err, data);
          });
          res.json({ success: true, accessToken: "JWT " + token, refreshToken: "JWT " + token2, role: user.role });
        } else {
          res
            .status(401)
            .send({
              success: false,
              msg: "Authentication failed. Wrong password.",
            });
        }
      });
    })
    .catch((error) => res.status(400).send(error));
});

router.post("/changePass", function(req, res) {
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
        if(!err) {
          res.json({ success: true });
        } else {
          res
            .status(401)
            .send({
              success: false,
              msg: "Authentication failed",
            });
        }
      })
    })
    .catch((error) => res.status(400).send(error));
})

router.post("/token", async(req, res) => {
  const refreshToken = req.header("x-auth-token");
  if(!refreshToken) {
    res.status(401).json({
      errors: [
        {
          msg: "Token not found",
        },
      ],
    });
  }
  if(!refreshTokens.includes(refreshToken)) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid refresh token",
        },
      ],
    });
  }
  try {
    const user = await jwt.verify(refreshToken, "nodeauthsecret");
    const {email} = user;
    const accessToken = jwt.sign({email}, "nodeauthsecret", {expiresIn: "86400 * 30"});
    res.json({accessToken});
  } catch(error) {
    res.status(403).json({
      errors: [
        {
          msg: "Invalid token",
        },
      ],
    });
  }
})

/**
 * @swagger
 *  components:
 *    schemas:
 *      Tech: 
 *        type: object
 *        properties: 
 *          title:
 *            type: string
 *          technologies:
 *            type: string
 *          description:
 *            type: string
 *          budget:
 *            type: string
 *          contact_email: 
 *            type: string
 */

/**
 * @swagger
 * /api/tech:
 *  get:
 *    description: Use to get details of all tech\
 *    security:
 *      - jwt: []
 *    responses:
 *      '200': 
 *        description: A successful response
 *        content: 
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#components/schemas/Tech'
 */

router.get(
  "/tech",
  passport.authenticate("jwt", { session: false }), grantAccess('readAny', 'tech'),
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      Tech.findAll()
        .then((techs) => res.status(200).send(techs))
        .catch((error) => {
          res.status(400).send(error);
        });
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

/**
 * @swagger
 * /api/tech:
 *  post:
 *    description: Use to upload tech
 *    requestBody: 
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Tech'
 *    security:
 *      - jwt: []
 *    responses:
 *      '200':
 *        description: Tech is succesfully uploaded
 */

router.post(
  "/tech", validate(TechValidator.createOrUpdateTechValidator),
  passport.authenticate("jwt", { session: false }), grantAccess('createOwn', 'tech'),
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      Tech.create({
        title: req.body.title,
        technologies: req.body.technologies,
        description: req.body.description,
        budget: req.body.budget,
        contact_email: req.body.contact_email,
      })
        .then((tech) => res.status(201).send(tech))
        .catch((error) => res.status(400).send(error));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
); 

/**
 * @swagger
 * /api/tech/{id}:
 *  put:
 *    description: Use to update tech
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Numeric ID required
 *        schema: 
 *          type: integer
 *    requestBody: 
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#components/schemas/Tech'
 *    security:
 *      - jwt: []
 *    responses:
 *      '200':
 *        description: Tech is succesfully updated
 *        content: 
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#components/schemas/Tech'
 */


router.put(
  "/tech/:id",
  passport.authenticate("jwt", { session: false }), grantAccess('updateAny', 'tech'),
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      Tech.update(
        {
          title: req.body.title,
          technologies: req.body.technologies,
          description: req.body.description,
          budget: req.body.budget,
          contact_email: req.body.contact_email,
        },
        { where: { id: req.params.id } }
      )
        .then((data) => {
          res.status(200).json({
            message: "Tech updated successfully",
            tech: data,
          });
        })
        .catch((error) => res.status(400).send(error));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

/**
 * @swagger
 * /api/tech/{id}:
 *  delete:
 *    description: Use to delete tech
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Numeric ID required
 *        schema: 
 *          type: integer
 *    security:
 *      - jwt: []
 *    responses:
 *      '200':
 *        description: Tech is succesfully deleted
 */

router.delete(
  "/tech/:id", 
  passport.authenticate("jwt", { session: false }), grantAccess('deleteAny', 'tech'), 
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      Tech.destroy({ where: { id: req.params.id } })
        .then((data) => {
          res.status(200).json({
            message: "Tech deleted successfully",
            tech: data,
          });
        })
        .catch((error) => res.status(400).send(error));
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);

// function verifyRefreshToken(req, res, next) {
//   const token = req.body.token;
//   if(token == null) {
//     return res.status(401).json({status: false, message: "Invalid request."});
//   }
//   try {
//     const decoded = jwt.verify(token, "nodeauthsecret");
//     req.user = decoded;
//     next();
//   } catch(error) {
//     return res.status(401).json({status: true, message: "your session is not valid", data: error});
//   }
// }

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
module.exports = router;
