const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
require("../../config/passport")(passport);
const users = require("../routes/users");
const techs = require("../routes/techs");
const { validate } = require("express-validation");
const UserValidator = require("../validations/user");
const TechValidator = require("../validations/tech");
const grantAccess = require("../../utils/role_access");
const token = require("../../utils/token");

//Routes
router.post(
  "/signup",
  validate(UserValidator.createOrUpdateUserValidator),
  users.Register
);

router.post("/signin", users.Login);

router.post("/changePass", users.ChangePassword);

router.get(
  "/tech",
  passport.authenticate("jwt", { session: false }),
  grantAccess("readAny", "tech"),
  techs.getTechs
);

router.post(
  "/tech",
  validate(TechValidator.createOrUpdateTechValidator),
  passport.authenticate("jwt", { session: false }),
  grantAccess("createOwn", "tech"),
  techs.postTechs
);

router.put(
  "/tech/:id",
  passport.authenticate("jwt", { session: false }),
  grantAccess("updateAny", "tech"),
  techs.updateTechs
);

router.delete(
  "/tech/:id",
  passport.authenticate("jwt", { session: false }),
  grantAccess("deleteAny", "tech"),
  techs.deleteTechs
);

router.post("/token", token.Token);

module.exports = router;
