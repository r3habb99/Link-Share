const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    //openapi: "3.0.0",
    info: {
      title: "File-Share-Services API",
      version: "1.0.0",
      description: "API documentation for File-Share-Services",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./swag-jsdoc.js"],
};

module.exports = swaggerJsdoc(options);
