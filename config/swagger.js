const swaggerJsDoc = require("swagger-jsdoc");

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
  apis: ["src/routes/api.js"],
};

module.exports = swaggerJsDoc(swaggerOptions);