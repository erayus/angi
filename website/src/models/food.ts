
export type IFood = {
    id: number,
    name: string,
    category: Category,
    imgUrl: string,
    ingredients: string[]
}

//TODO: use if necessary
export type IIngredient = {
    name: string,
    quantityUnit: string //TODO: may split into two properties if necessary
}

export enum Category {
    Main = 'Main',
    Soup = 'Soup',
    Dessert = 'Desert'
}

export type IFoodCategory = {
    category: Category;
    quantity: number;
}


