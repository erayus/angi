import { ToBuyIngredient } from '../store/food-store';
import { Food, IUserFoodCategoryQuantity } from './Food';

export type Menu = {
    menuId: string;
    food?: Food[] | null;
    renewDate?: string | null;
    foodCategoriesQuantities?: IUserFoodCategoryQuantity[] | null;
    toBuyList?: ToBuyIngredient[] | null;
};
