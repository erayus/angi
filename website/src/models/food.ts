export type Food = {
    foodId: string;
    foodName: string;
    foodCategory: FoodCategory;
    imgUrl: string;
    foodIngredients: IFoodIngredient[];
    isPublic: boolean;
};

export type IFoodIngredient = {
    ingredientId: string;
    ingredientQuantity: number;
};

export type FoodCategory = 'entree' | 'main' | 'soup' | 'dessert';
export type FoodCusine = 'vietnamese' | 'italian' | 'chinese';

export type IUserFoodCategoryQuantity = {
    category: FoodCategory;
    quantity: number;
};
