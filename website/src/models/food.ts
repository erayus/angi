
export type IFood = {
    id: number
    name: string
    category: ICategory
    imgUrl: string
    ingredients: IFoodIngredient[]
}

export type IFoodIngredient = {
    id: number
    quantity: number
}

export enum ICategory {
    Main = 'Main',
    Soup = 'Soup',
    Sidies = 'Sidies'
}

export type IFoodCategory = {
    category: ICategory
    quantity: number
}



