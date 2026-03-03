import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { Express } from "express";

export const setupSwagger = (app: Express) => {
  const filePath = path.join(__dirname, "../openapi.yaml");

  const swaggerDocument = YAML.load(filePath);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};