import { resolve } from 'path';
import * as TJS from 'typescript-json-schema';
import * as fs from 'fs';
type TypeRecords = {
    fileName: string;
    typeName: string;
    exportSchemaName: string;
}[];

const generateSchema = async (
    fileName: string,
    typeName: string,
    exportSchemaName: string
) => {
    const settings: TJS.PartialArgs = {
        required: true,
    };
    const basePathToModels = '../website/src/models';
    // optionally pass ts compiler options
    const compilerOptions: TJS.CompilerOptions = {
        strictNullChecks: true,
    };

    const program = TJS.getProgramFromFiles(
        [resolve(basePathToModels, fileName)],
        compilerOptions
    );

    const basePathToSchemasLayer = './src/layers/schemas/nodejs/';
    const schema = await TJS.generateSchema(program, typeName, settings);
    const schemaString = JSON.stringify(schema, null, 2);
    await fs.writeFileSync(
        resolve(basePathToSchemasLayer, `${exportSchemaName}.json`),
        schemaString
    );
};

(async () => {
    const interfaceRecords: TypeRecords = [
        {
            fileName: 'Food.ts',
            typeName: 'Food',
            exportSchemaName: 'foodSchema',
        },
        {
            fileName: 'Ingredient.ts',
            typeName: 'Ingredient',
            exportSchemaName: 'ingredientSchema',
        },
        {
            fileName: 'Menu.ts',
            typeName: 'Menu',
            exportSchemaName: 'menuSchema',
        },
    ];

    for (let record of interfaceRecords) {
        await generateSchema(
            record.fileName,
            record.typeName,
            record.exportSchemaName
        );
    }
    // optionally pass argument to schema generator
})();
