
export type IFood = {
    food_id: number
    food_name: string
    food_category: ICategory;
    imgUrl: string
    food_ingredients: IFoodIngredient[]
}

export type IFoodIngredient = {
    id: number
    quantity: number
}

export enum ICategory {
    Main = 'Món chính',
    Soup = 'Món súp',
    Sidies = 'Các món phụ'
}

export type IFoodCategory = {
    category: ICategory
    quantity: number
}



