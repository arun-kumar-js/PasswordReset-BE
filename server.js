const app = require("./app");
const mongoose = require("mongoose");
const { MONGODB_URI, PORT } = require("./utils/config");
const cors = require("cors");
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to the database");
    app.listen(PORT, () => {
      console.log("server running localhost: ", PORT);
    });
  })
  .catch((error) => {
    console.log("failed to connect database");
  });
