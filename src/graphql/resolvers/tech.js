const Tech = require("../../models").Tech;

const techResolvers = {
  Query: {
    techs: () => {
      const techs = Tech.findAll({
        order: [["id"]],
      });
      if (!techs) {
        throw new Error("Error");
      }
      return techs;
    },
    tech: (parent, { id }) => {
      const techDetails = Tech.findByPk(id);
      if (!techDetails) {
        throw new Error("Error");
      }
      return techDetails;
    },
  },
  Mutation: {
    createTech: (parent, { newTech }) => {
      const tech = new Tech(newTech);
      const newTechs = tech.save();
      if (!newTechs) {
        throw new Error("Error");
      }
      return newTechs;
    },
    updateTech: (parent, { updatedTech }) => {
      return Tech.findByPk(updatedTech.id)
        .then((tech) => {
          if (!tech) {
            throw new Error("Not Found");
          }
          return tech
            .update({
              title: updatedTech.title || tech.title,
              technologies: updatedTech.technologies || tech.technologies,
              description: updatedTech.description || tech.description,
              budget: updatedTech.budget || tech.budget,
              contact_email: updatedTech.contact_email || tech.contact_email,
            })
            .then(() => {
              return tech;
            })
            .catch((error) => {
              throw new Error(error);
            });
        })
        .catch((error) => {
          throw new Error(error);
        });
    },
    deleteTech: (parent, { deletedTech }) => {
      return Tech.findByPk(deletedTech.id)
        .then((tech) => {
          if (!tech) {
            throw new Error("Not Found");
          }
          return tech
            .destroy()
            .then(() => {
              return tech;
            })
            .catch((error) => {
              throw new Error(error);
            });
        })
        .catch((error) => {
          throw new Error(error);
        });
    },
  },
};

module.exports = techResolvers;
