
export type IFood = {
    id: number,
    name: string
    category: Category
    imgUrl: string
    ingredients: IIngredient[]
}

//TODO: use if necessary
export type IIngredient = {
    name: string
    quantity: number //TODO: may split into two properties if necessary
    unit: IUnit
}

export type IUnit = 'kg' | 'gram' | 'củ' | 'con' |'lon' | 'trái' | 'bó' | 'gói' | 'bịch' | 'chai' | null 

export enum Category {
    Main = 'Main',
    Soup = 'Soup',
    Dessert = 'Desert'
}

export type IFoodCategory = {
    category: Category
    quantity: number
}


