import { resolve } from "path";
import * as TJS from "typescript-json-schema";
import * as fs from "fs";

(async () => {
  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    required: true,
  };

  // optionally pass ts compiler options
  const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
  };

  // as this function is called by package.json, the path is relative to infrastructure folder
  const basePathToModels = "../shared/models";

  const program = TJS.getProgramFromFiles(
    [resolve(basePathToModels, "food.ts")],
    compilerOptions
  );

  const foodSchema = await TJS.generateSchema(program, "IFood", settings);
  const foodSchemaString = JSON.stringify(foodSchema, null, 2);
  await fs.writeFileSync("./src/layers/schemas/nodejs/foodSchema.json", foodSchemaString);
})();
