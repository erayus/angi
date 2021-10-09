export type IFood = {
    food_id: number
    food_name: string
    food_category: IFoodCategory;
    img_url: string
    food_ingredients: IFoodIngredient[]
}

export type IFoodIngredient = {
    id: number
    quantity: number
}

export type IFoodCategory = "Món chính" | "Món súp" | "Các món phụ";

export type IFoodCategoryQuantiy = {
    category: IFoodCategory
    quantity: number
}



