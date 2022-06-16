const techResolvers = require("./tech");

const rootResolver = {};
const resolvers = [rootResolver, techResolvers];

module.exports = resolvers;
