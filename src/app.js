var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");
var indexRouter = require("../src/routes/index");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
var cron = require("node-cron");
var nodemailer = require("nodemailer");
const logger = require('../utils/logger');

// let express to use this
var app = express();
var apiRouter = require("../src/routes/api");

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Rest API",
      description: "Rest API Information",
      contact: {
        name: "Saksham",
      },
      servers: [
        {
          api: "http://localhost:3000/",
        },
      ],
    },
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
  },
  // ['.routes/*.js']
  apis: ["./routes/api"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
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
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "example@gmail.com", //put your mail here
    pass: "rbfpflfoohamnpdg", //password here
  },
});
const mailOptions = {
  from: "example@gmail.com", // sender address
  to: "glue@gmail.com", // reciever address
  subject: "Tech List",
  html: "<p>hi your meeting in just 15 min</p>", // plain text body
};

cron.schedule("* * * * 0", function () {
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) 
      logger.error(err);
    else 
      logger.info(info);
  });
});

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
