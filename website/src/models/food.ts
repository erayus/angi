export type Food = {
    id: string;
    foodName: string;
    category: FoodCategory;
    foodImgUrl?: string;
    foodDescription?: string;
    foodIngredients: IFoodIngredient[];
    isPublic: boolean;
};

export type IFoodIngredient = {
    id: string;
    ingredientQuantity: number;
};

export type FoodCategory = 'entree' | 'main' | 'soup' | 'dessert';
export type FoodCusine = 'vietnamese' | 'italian' | 'chinese';

export type IUserFoodCategoryQuantity = {
    category: FoodCategory;
    quantity: number;
};
