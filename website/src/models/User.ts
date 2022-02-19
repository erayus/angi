import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { IFood, IUserFoodCategoryQuantity } from './food';
import { ToBuyIngredient } from '../store/food-store';

export type AuthUser = {
    email: string;
    sub: string;
    email_verified: boolean;
    session: CognitoUserSession;
    current: CognitoUser;
};

export type User = {
    pk: string;
    menu?: IFood[] | null;
    renewDateTimestamp?: number | null;
    food_categories_quantities?: IUserFoodCategoryQuantity[] | null;
    to_buy_list?: ToBuyIngredient[] | null;
} & AuthUser;
