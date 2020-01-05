import { urlencoded, json } from "body-parser";
import cors from "cors";
import rootRouter from "./Routes";

const express = require("express")
const port = process.env.PORT || 5001;
const inProduction = process.env.NODE_ENV === "production";

const app = express();

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());

if (inProduction) {
  // express will serve up production assets
  app.use(express.static(`../distributed-ui/build`));

  // express will serve up the front-end index.html file if it doesn't recognize the route
  app.get("*", (req, res) =>
    res.sendFile(resolve(`../distributed-ui/build/index.html`))
  );
}

app.use("/api", rootRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
