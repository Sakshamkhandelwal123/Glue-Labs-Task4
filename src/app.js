const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const graphqlResolver = require("./graphql/resolvers");
const swaggerUi = require("swagger-ui-express");

const swaggerDocs = require("../config/swagger");
var indexRouter = require("../src/routes/index");

// const schema = require("./graphql/schema/tech");

var app = express();
var apiRouter = require("./routes/api");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api", apiRouter);

const schema = makeExecutableSchema({
  typeDefs: loadSchemaSync("src/**/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  }),
  
  resolvers: graphqlResolver,
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    rootValue: global,
    graphiql: true,
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

require("../utils/cronScheduler")();

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
