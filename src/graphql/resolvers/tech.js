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

    updateTech: async (parent, { updatedTech }) => {
      try {
        let tech = await Tech.findByPk(updatedTech.id);

        if (!tech) {
          throw new Error("Not Found");
        }

        try {
          const { title, technologies, description, budget, contact_email } =
            updatedTech;

          tech.update({
            title: title || tech.title,
            technologies: technologies || tech.technologies,
            description: description || tech.description,
            budget: budget || tech.budget,
            contact_email: contact_email || tech.contact_email,
          });

          return tech;

        } catch (error) {
          throw new Error(error);
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteTech: async (parent, { deletedTech }) => {
      try {
        let tech = await Tech.findByPk(deletedTech.id);

        if (!tech) {
          throw new Error("Not Found");
        }

        try {
          
          tech.destroy();
          return tech;

        } catch (error) {
          throw new Error(error);
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = techResolvers;
