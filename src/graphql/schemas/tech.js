const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const GraphQLDate = require("graphql-date");

const Tech = require("../../models").Tech;

const TechType = new GraphQLObjectType({
  name: "Tech",
  description: "This represents a tech",

  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    technologies: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    budget: { type: GraphQLNonNull(GraphQLString) },
    contact_email: { type: GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLNonNull(GraphQLDate) },
    updatedAt: { type: GraphQLNonNull(GraphQLDate) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",

  fields: () => ({
    tech: {
      type: TechType,
      description: "A Single Tech",

      args: {
        id: { type: GraphQLInt },
      },

      resolve: (root, args) => {
        const techDetails = Tech.findByPk(args.id);

        if (!techDetails) {
          throw new Error("Error");
        }

        return techDetails;
      },
    },

    techs: {
      type: new GraphQLList(TechType),
      description: "List of All Techs",

      resolve: () => {
        const techs = Tech.findAll({
          order: [["id"]],
        });

        if (!techs) {
          throw new Error("Error");
        }

        return techs;
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",

  fields: () => ({
    addTech: {
      type: TechType,
      description: "Add a tech",

      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        technologies: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        budget: { type: GraphQLNonNull(GraphQLString) },
        contact_email: { type: GraphQLNonNull(GraphQLString) },
      },

      resolve: (root, args) => {
        const tech = new Tech(args);
        const newTech = tech.save();

        if (!newTech) {
          throw new Error("Error");
        }

        return newTech;
      },
    },

    updateTech: {
      type: TechType,
      description: "Update a tech",

      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        title: { type: GraphQLNonNull(GraphQLString) },
        technologies: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        budget: { type: GraphQLNonNull(GraphQLString) },
        contact_email: { type: GraphQLNonNull(GraphQLString) },
      },

      resolve: async (root, args) => {
        let tech;

        try {
          tech = await Tech.findByPk(args.id);

          if (!tech) {
            throw new Error("Not Found");
          }

          const { title, technologies, description, budget, contact_email } =
            args;

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
      },
    },

    removeTech: {
      type: TechType,
      description: "Delete a tech",

      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },

      resolve: async (root, args) => {
        let tech;

        try {
          tech = await Tech.findByPk(args.id);

          if (!tech) {
            throw new Error("Not Found");
          }

          tech.destroy();
          
          return tech;
        } catch (error) {
          throw new Error(error);
        }
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

module.exports = schema;
