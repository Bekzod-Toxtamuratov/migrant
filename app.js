const express = require("express");
const config = require("config");
const mainRouter = require("./router/index.routes");
const cookieParser = require("cookie-parser");

const error_handing_middleware = require("./middleware/error_handing_middleware");

const { expressWinstonErrorLogger } = require("./middleware/loggerMiddleware");

const PORT = config.get("port");

const app = express();
app.use(express.json());

app.use(cookieParser()); // frontend kelyatgan cookie parse qiladi;

app.use("/api", mainRouter);

app.use(expressWinstonErrorLogger);
app.use(error_handing_middleware);

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {}
}

start();
