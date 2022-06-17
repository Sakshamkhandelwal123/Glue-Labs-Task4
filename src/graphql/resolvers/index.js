const techResolvers = require("./tech");
const userResolvers = require("./user");

const rootResolver = {};
const resolvers = [rootResolver, techResolvers, userResolvers];

module.exports = resolvers;
