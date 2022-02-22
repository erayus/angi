```ts
MySchema = {
    version: '0.1.0',
    format: 'onetable:1.0.0',
    indexes: {
        primary: {
            hash: 'pk',
            sort: 'sk',
        },
        gs1: {
            hash: 'gs1pk',
            sort: 'gs1sk',
        },
    },
    models: {
        Menu: {
            pk: { value: 'menu#${userId}' },
            sk: { value: 'menu#' },

            menu: { type: String },
        },
        Food: {
            pk: { value: 'food#${userId}' },
            sk: { value: 'food#${foodId}' },

            foodName: { type: String },
            foodCategory: { type: String },
            imgUrl: { type: String },
            foodIngredients: { type: String },
            isPublic: { type: BOOL },
        },
        Ingtedient: {
            pk: { value: 'ingredient#${ingredientId}' },
            sk: { value: 'ingredient#${}' },

            foodName: { type: String },
            foodCategory: { type: String },
            imgUrl: { type: String },
            foodIngredients: { type: String },
        },
    },
};
```
