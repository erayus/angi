import { ToBuyIngredient } from '../store/food-store';
import { Food, IUserFoodCategoryQuantity } from './Food';

export type Menu = {
    menuId: string;
    food: Food[];
    renewDateTimestamp: number;
    renewPeriod: number;
    foodCategoriesQuantity: IUserFoodCategoryQuantity[];
    checkedIngredientIds: string[];
};
