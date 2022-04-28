import { Food, IUserFoodCategoryQuantity } from './Food';

export type Menu = {
    id: string;
    food: Food[];
    renewDateTimestamp: number;
    renewPeriod: number;
    foodCategoriesQuantity: IUserFoodCategoryQuantity[];
    checkedIngredientIds: string[];
};
