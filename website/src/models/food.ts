export type IFood = {
    food_id: string
    food_name: string
    food_category: IFoodCategory;
    img_url: string
    food_ingredients: IFoodIngredient[]
}

export type IFoodIngredient = {
    id: string
    quantity: number
}

export type IFoodCategory = "Main" | "Soup" | "Sidies";

export type IUserFoodCategoryQuantity = {
    category: IFoodCategory
    quantity: number
}
