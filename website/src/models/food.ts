
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
    Main = 'Món chính',
    Soup = 'Món Súp',
    Sidies = 'Các món phụ'
}

export type IFoodCategory = {
    category: ICategory
    quantity: number
}



