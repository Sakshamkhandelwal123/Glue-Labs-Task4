const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
require("../config/passport")(passport);
const Tech = require("../models").Tech;
const User = require("../models").User;

router.post("/signup", function (req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    res.status(400).send({ msg: "Please pass username and password." });
  } else {
    User.create({
      username: req.body.username,
      password: req.body.password,
    })
      .then((user) => res.status(201).send(user))
      .catch((error) => {
        console.log(error);
        res.status(400).send(error);
      });
  }
});

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
          jwt.verify(token, "nodeauthsecret", function (err, data) {
            console.log(err, data);
          });
          res.json({ success: true, token: "JWT " + token });
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

router.get(
  "/tech",
  passport.authenticate("jwt", { session: false }),
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

router.post(
  "/tech",
  passport.authenticate("jwt", { session: false }),
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

router.put(
  "/tech/:id",
  passport.authenticate("jwt", { session: false }),
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

router.delete(
  "/tech/:id",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    var token = getToken(req.headers);
    if (token) {
      Tech.destroy(req.params.id)
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
