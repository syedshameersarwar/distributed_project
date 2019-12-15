import { urlencoded, json } from "body-parser";
import cors from "cors";
import rootRouter from "./Routes";

const app = require("express")();
const port = process.env.PORT || 5001;

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());

app.use("/api", rootRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
