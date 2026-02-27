import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const router = express.Router();

const specPath = path.join(__dirname, "../swagger/openapi.yaml");
const swaggerDocument = YAML.load(specPath);

router.use(
  "/",
  swaggerUi.serve,
  // @ts-ignore - swaggerUi.setup types can be picky in some environments
  swaggerUi.setup(swaggerDocument)
);

export default router;
