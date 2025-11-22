const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes/linkRoutes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
