const passport = require("passport");
require("../../config/passport")(passport);
const Tech = require("../models").Tech;
const logger = require("../../utils/logger");
const client = require("../../utils/redis_connect");
const getToken = require("../../utils/token").getToken;

async function getTechs(req, res) {
  var token = getToken(req.headers);

  if (token) {
    Tech.findAll()
      .then(async (techs) => {
        const reply = await client.get("tech");

        if (reply) {
          logger.info("using cached data");
          // res.status(200).send(techs);
          logger.info(reply);
          res.send(JSON.parse(reply));
          return;
        }

        const saveResult = await client.setEx(
          "tech",
          10,
          JSON.stringify(techs)
        );

        logger.info(`new data cached ${saveResult}`);
        res.status(200).send(techs);
      })

      .catch((error) => {
        res.status(400).send(error);
      });
  } 
  
  else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
}

async function postTechs(req, res) {
  var token = getToken(req.headers);

  if (token) {
    Tech.create({
      title: req.body.title,
      technologies: req.body.technologies,
      description: req.body.description,
      budget: req.body.budget,
      contact_email: req.body.contact_email,
    })
      .then(async (tech) => {
        res.status(201).send(tech);
      })
      .catch((error) => res.status(400).send(error));
  } 
  
  else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
}

async function updateTechs(req, res) {
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
  } 
  
  else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
}

async function deleteTechs(req, res) {
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
  } 
  
  else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
}

module.exports = {
  getTechs,
  postTechs,
  updateTechs,
  deleteTechs,
};
