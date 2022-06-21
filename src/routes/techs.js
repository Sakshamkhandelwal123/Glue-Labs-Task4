const passport = require("passport");

const Tech = require("../models").Tech;
const logger = require("../../utils/logger");
const client = require("../../utils/redis_connect");
const getToken = require("../../utils/token").getToken;
require("../../config/passport")(passport);

async function getTechs(req, res) {
  var token = getToken(req.headers);

  if (token) {
    let techs;

    try {
      techs = await Tech.findAll();
      
      const reply = await client.get("tech");

      if (reply) {
        logger.info("using cached data");
        // res.status(200).send(techs);
        logger.info(reply);
        res.send(JSON.parse(reply));
        return;
      }

      const saveResult = await client.setEx("tech", 10, JSON.stringify(techs));

      logger.info(`new data cached ${saveResult}`);

      return res.status(200).send(techs);
    } catch (error) {
      return (res.status(400).send(error));
    }
  }

  return res.status(403).send({ success: false, msg: "Unauthorized." });
}

async function postTechs(req, res) {
  var token = getToken(req.headers);
  const { title, technologies, description, budget, contact_email } = req.body;

  if (token) {
    let tech;

    try {
      tech = await Tech.create({
        title,
        technologies,
        description,
        budget,
        contact_email,
      });

      return res.status(201).send(tech);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  return res.status(403).send({ success: false, msg: "Unauthorized." });
}

async function updateTechs(req, res) {
  var token = getToken(req.headers);

  const { title, technologies, description, budget, contact_email } = req.body;

  if (token) {
    let data;

    try {
      data = await Tech.update(
        {
          title,
          technologies,
          description,
          budget,
          contact_email,
        },

        { where: { id: req.params.id } }
      );

      if(!data) {
        return res.status(400).send("Something went wrong!!!");
      }

      return res.status(200).json({
        message: "Tech updated successfully",
        tech: data,
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  return res.status(403).send({ success: false, msg: "Unauthorized." });
}

async function deleteTechs(req, res) {
  var token = getToken(req.headers);

  if (token) {
    let data;

    try {
      data = await Tech.destroy({ where: { id: req.params.id } });

      if(!data) {
        return res.status(400).send("Something went wrong!!!");
      }

      return res.status(200).json({
        message: "Tech deleted successfully",
        tech: data,
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  return res.status(403).send({ success: false, msg: "Unauthorized." });
}

module.exports = {
  getTechs,
  postTechs,
  updateTechs,
  deleteTechs,
};
