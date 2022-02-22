import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    CognitoUserSession,
    ISignUpResult,
} from 'amazon-cognito-identity-js';
import { makeAutoObservable } from 'mobx';
import config from '../config';
import { Food, FoodCategory, IUserFoodCategoryQuantity } from '../models/Food';
import { Menu } from '../models/Menu';
import { AuthUser } from '../models/User';

export default class UserStore {
    userLoading: boolean = true;
    auth: AuthUser | null = null;
    user: User | null = null;
    userPool = new CognitoUserPool(config.getUserPoolConfig());
    renewPeriod: number = 7; //TODO: let the user configure this value

    get isAuthenticated(): boolean {
        return this.user !== null;
    }

    get userId(): string | undefined {
        return this.user?.sub;
    }

    constructor() {
        makeAutoObservable(this);
    }

    setUserLoading = (value: boolean) => {
        this.userLoading = value;
    };

    setUser = (user: User) => {
        this.user = user;
    };

    loadAuthenticatedUser = async () => {
        try {
            this.setUserLoading(true);

            this.auth = (await this.getAuthenticatedUser()) as AuthUser;
            const userDataStr = localStorage.getItem(this.auth.sub);
            //Check if this is the first time the user login
            if (localStorage.getItem(this.user!.sub) == null) {
                const user: Menu = {
                    menuId: this.user!.sub,
                    food: [],
                    renewDate: null,
                    foodCategoriesQuantities: null,
                    toBuyList: null,
                };
                localStorage.setItem(this.user.pk, JSON.stringify(this.user));
                this.setUserLoading(false);
                return;
            }
            this.user = {
                ...this.auth,
                ...JSON.parse(userDataStr),
            };
            this.setUserLoading(false);
        } catch (e: any) {
            console.trace(e);
            this.setUserLoading(false);
        }
    };

    authenticate = async (username: string, password: string) => {
        if (username.length <= 0 && password.length <= 0) {
            return; //TODO: set error state here
        }

        return await new Promise((resolve, reject) => {
            const user = new CognitoUser({
                Username: username,
                Pool: this.userPool,
            });

            const authDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
            });

            user.authenticateUser(authDetails, {
                onSuccess: async (data) => {
                    await this.loadAuthenticatedUser();
                    resolve(data);
                },
                onFailure: (err) => {
                    console.error('onFailure: ', err);
                    reject(err);
                },
                newPasswordRequired: (data) => {
                    //TODO: what is this for?
                    console.log('newPasswordRequired: ', data);
                    resolve(data);
                },
            });
        });
    };

    logout = async () => {
        return new Promise((resolve, reject) => {
            if (this.auth) {
                this.auth.current.signOut(() => {
                    this.user = null;
                    resolve('Signed out successfully!');
                });
            } else {
                console.error('There is no user.');
                reject();
            }
        });

        //TODO: throw error to appStore
    };

    getAuthenticatedUser = async () => {
        return new Promise((resolve, reject) => {
            const user = this.userPool.getCurrentUser();
            if (user) {
                user.getSession(
                    async (
                        err: Error | null,
                        session: CognitoUserSession | null
                    ) => {
                        if (err) {
                            reject(err.message);
                        } else {
                            try {
                                const attributes: Record<string, string> =
                                    await this.getUserAttributes(user);
                                resolve({
                                    current: user,
                                    session: session!,
                                    ...attributes,
                                });
                            } catch (err) {
                                reject(err);
                            }
                        }
                    }
                );
            } else {
                reject('There is no user.');
            }
        });
    };

    getUserAttributes = (
        user: CognitoUser
    ): Promise<Record<string, string>> => {
        return new Promise((resolve, reject) => {
            user.getUserAttributes((err, attributes) => {
                if (err) {
                    reject(err);
                } else {
                    let results: Record<string, string> = {};

                    for (let attribute of attributes!) {
                        const { Name, Value } = attribute;
                        results = { ...results, [Name]: Value };
                    }
                    resolve(results);
                }
            });
        });
    };

    register = async (
        email: string,
        password: string
    ): Promise<ISignUpResult | undefined | Error> => {
        return new Promise((resolve, reject) => {
            this.userPool.signUp(email, password, [], [], (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };

    saveMenu = (menu: Food[]): void => {
        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        user['menu'] = menu;
        localStorage.setItem(this.userId!, JSON.stringify(user));
    };

    getMenu = (): Food[] | null => {
        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        return user['menu'];
    };

    saveRenewDate = (renewDateTimestamp: number): void => {
        this.user!.renewDateTimestamp = renewDateTimestamp;
        if (localStorage.getItem(this.userId!) == null) {
            const user = {
                renewDate: renewDateTimestamp,
            };
            localStorage.setItem(this.userId!, JSON.stringify(user));
            return;
        }

        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        user['renewDate'] = renewDateTimestamp;
        localStorage.setItem(this.userId!, JSON.stringify(user));
    };

    isMenuSaved = (): boolean => {
        if (localStorage.getItem(this.userId!) == null) {
            return false;
        }

        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        return user['menu'] !== undefined;
    };

    resetListOfCheckedIngredientIds = (): void => {
        this.saveListOfCheckedIngredientIds([]);
    };

    getListOfCheckedIngredientIds = (): string[] => {
        if (localStorage.getItem(this.userId!) == null) {
            return [];
        }
        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        return user['listOfCheckedIngredientIds'] ?? [];
    };

    saveListOfCheckedIngredientIds = (
        listOfCheckedIngredientIds: string[]
    ): void => {
        if (localStorage.getItem(this.userId!) == null) {
            const user = {
                listOfCheckedIngredientIds: listOfCheckedIngredientIds,
            };
            localStorage.setItem(this.userId!, JSON.stringify(user));
            return;
        }

        const user = JSON.parse(localStorage.getItem(this.userId!)!);
        user['listOfCheckedIngredientIds'] = listOfCheckedIngredientIds;
        localStorage.setItem(this.userId!, JSON.stringify(user));
    };

    getFoodCategoriesQuantities = (): IUserFoodCategoryQuantity[] => {
        const user = JSON.parse(localStorage.getItem(this.userId!)!);

        if (!user['food_categories_quantities']) {
            //TODO: constant the key
            const defaultUserFoodCategoryQuantity: IUserFoodCategoryQuantity[] =
                [
                    {
                        category: 'main',
                        quantity: 7,
                    },
                    {
                        category: 'soup',
                        quantity: 7,
                    },
                    {
                        category: 'dessert',
                        quantity: 4,
                    },
                ];
            user['food_categories_quantities'] =
                defaultUserFoodCategoryQuantity;
            localStorage.setItem(this.userId!, JSON.stringify(user));
            return defaultUserFoodCategoryQuantity;
        }

        return user['food_categories_quantities'];
    };

    saveQuantityForFoodCategory = (
        category: FoodCategory,
        quantityToShow: number
    ) => {
        if (!quantityToShow || quantityToShow < 0) {
            return;
        }

        let user = JSON.parse(localStorage.getItem(this.userId!)!);

        let categoriesQuantities = user[
            'food_categories_quantities'
        ] as IUserFoodCategoryQuantity[];
        let newCategoryQuantity = categoriesQuantities.map((item) => {
            if (item.category === category) {
                item.quantity = quantityToShow;
            }
            return item;
        });

        let newUser = {
            ...user,
            category_quantity: newCategoryQuantity,
        };
        localStorage.setItem(this.userId!, JSON.stringify(newUser));
    };
}
