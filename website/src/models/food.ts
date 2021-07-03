
export type IFood = {
    id: number,
    name: string,
    category: FoodCategory,
    imgUrl: string,
    ingredients: string[]
}

//TODO: considering this in future
export type IIngredients = {
    name: string,
    quantity: number
}

export enum FoodCategory {
    Main,
    Soup
}


