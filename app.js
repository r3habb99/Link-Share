const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const mongoose = require("./utils/mongoose");
const fileRoutes = require("./routes/fileRoutes");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swaggerDefination");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(bodyParser.json());

// console.log("global path", path.join(__dirname));
// app.use("/static", express.static(path.join(__dirname)));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/users", userRoutes);
app.use("/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
