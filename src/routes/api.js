const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const router = express.Router();
const { validate } = require("express-validation");
require("dotenv").config();

const users = require("../routes/users");
const techs = require("../routes/techs");
const UserValidator = require("../validations/user");
const TechValidator = require("../validations/tech");
const authRole = require("../../utils/role_access");
const Role = require("../roles/roles");
const token = require("../../utils/token");
const rateLimiter = require("../../utils/rateLimiter");
require("../../config/passport")(passport);

//Routes
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

router.post(
  "/signup",
  validate(UserValidator.createOrUpdateUserValidator),
  users.Register
);

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

router.post("/signin", users.Login);

router.post("/changePass", users.ChangePassword);

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
  passport.authenticate("jwt", { session: false }),
  rateLimiter({
    secondsWindow: process.env.SECONDS_WINDOW,
    allowedHits: process.env.ALLOWED_HITS,
  }),
  techs.getTechs
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
  "/tech",
  validate(TechValidator.createOrUpdateTechValidator),
  passport.authenticate("jwt", { session: false }),
  authRole(Role.ADMIN),
  techs.postTechs
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
  passport.authenticate("jwt", { session: false }),
  authRole(Role.ADMIN),
  techs.updateTechs
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
  passport.authenticate("jwt", { session: false }),
  authRole(Role.ADMIN),
  techs.deleteTechs
);

router.post("/token", token.Token);

module.exports = router;
