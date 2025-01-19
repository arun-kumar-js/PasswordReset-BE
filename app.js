const express = require("express");
const cors = require("cors");

const morgan = require("morgan");

const authRouter = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use(morgan("dev"));


module.exports = app;
