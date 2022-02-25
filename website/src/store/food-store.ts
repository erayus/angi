import { makeAutoObservable, toJS } from 'mobx';
import {
    Food,
    FoodCategory,
    IFoodIngredient,
    IUserFoodCategoryQuantity,
} from '../models/Food';
import { Ingredient, IIngredientCategory, IUnit } from '../models/Ingredient';
import { ingredientTable } from '../utils/ingredientTable';
import axiosApi from '../utils/axios-api';
import UserStore from './user-store';
import { isTimeToRenewFood, generateRenewDate } from '../utils/renewTime';
import { Menu } from '../models/Menu';
const clone = require('rfdc/default');

export type IFoodProjection = {
    id: string;
    name: string;
    category: FoodCategory;
    imgUrl: string;
    ingredients: {
        id: string;
        category: IIngredientCategory;
        name: string;
        unit: IUnit;
        quantity: number;
    }[];
};

export type ToBuyIngredient = {
    id: string;
    name: string;
    category: IIngredientCategory;
    quantity: number;
    unit: IUnit;
    isChecked: boolean;
};
export default class FoodStore {
    menu: Menu | null = null;
    userStore: UserStore;

    allFood: Food[] | null = null;
    allIngredients: Ingredient[] | null = null;
    // availableFoodCategories: IUserFoodCategoryQuantity[] = [];
    renewPeriod: number = 7; //TODO: let the user configure this value
    newFoodToActionOnId: string = '';
    setNewFoodToActionOnId = (id: string) => {
        this.newFoodToActionOnId = id;
    };
    foodAvailableForUpdate: IFoodProjection[] = [];
    error: any;
    loadingFood: boolean = false;
    isFoodAvailableForChangeLoading = false;

    constructor(userStore: UserStore) {
        makeAutoObservable(this);
        this.userStore = userStore;
    }

    get menuProjection() {
        if (this.menu) {
            return [
                ...this.menu.food!.map((food) =>
                    this.convertFoodToFoodProjection(food)
                ),
            ];
        }
        return [];
    }

    get toBuyList(): ToBuyIngredient[] {
        let allIngredientsThisWeek: IFoodIngredient[] = [];
        this.menu!.food!.forEach((food) => {
            allIngredientsThisWeek = [
                ...allIngredientsThisWeek.slice(),
                ...food.foodIngredients,
            ];
        });

        const aggregateIngredients: ToBuyIngredient[] =
            allIngredientsThisWeek.reduce(
                (accIngredients: ToBuyIngredient[], cur: IFoodIngredient) => {
                    //check if object is already in the acc array.
                    const curIng = this.getIngredientById(cur.ingredientId);

                    if (curIng === undefined) {
                        throw new Error(
                            `Can't find ingredient's details of ${cur.ingredientId}`
                        ); //TODO: log this
                    }

                    const index = accIngredients.findIndex(
                        (x) => x.name === curIng!.ingredientName
                    );
                    if (index === -1) {
                        const toBuyIngredient = {
                            id: cur.ingredientId,
                            name: curIng?.ingredientName || 'No name',
                            category: curIng?.ingredientCategory ?? '',
                            quantity:
                                Math.round(cur.ingredientQuantity * 10) / 10,
                            unit: curIng?.unit || null,
                            isChecked:
                                this.menu!.listOfCheckedIngredientIds!.some(
                                    (checkedIngId) =>
                                        checkedIngId === curIng!.ingredientId
                                ),
                        };
                        accIngredients.push(toBuyIngredient);
                    } else {
                        accIngredients[index]['quantity'] +=
                            Math.round(cur.ingredientQuantity * 10) / 10;
                    }

                    return accIngredients;
                },
                []
            );

        return aggregateIngredients;
    }

    initializeFoodThisWeek = async () => {
        try {
            this.loadingFood = true;
            this.loadIngredients(); //TODO shouldn't need this after all ingredients are added to the database

            if (!this.userHasMenu()) {
                this.loadNewMenu();
                this.loadingFood = false;
                return;
            }

            this.menu = this.getMenu();

            if (isTimeToRenewFood(Date.now(), this.menu!.renewDateTimestamp!)) {
                const newRenewDateTimestamp = generateRenewDate(
                    this.renewPeriod
                );
                this.saveRenewDate(newRenewDateTimestamp);
                this.loadNewMenu();
            } else {
                this.loadExistingMenu();
            }
            this.loadingFood = false;
        } catch (e: any) {
            this.loadingFood = false;
            console.error(e);
            this.error = e.message;
        }
    };

    private retrieveAllFood = async (): Promise<Food[]> => {
        try {
            if (this.allFood) {
                return clone(this.allFood);
            }
            const result = await axiosApi.Food.list();
            this.allFood = result.data;
            return clone(this.allFood);
        } catch (e) {
            throw new Error('Failed to get food from the database.');
        }
    };

    private loadIngredients = async () => {
        this.allIngredients = ingredientTable;
    };

    private loadNewMenu = async () => {
        // this.resetListOfCheckedIngredients();

        const menuFood: Food[] = [];
        const defaultFoodCategories = this.getFoodCategoriesQuantities();
        this.allFood = this.allFood ?? (await this.retrieveAllFood());

        defaultFoodCategories.forEach((foodCategory) => {
            const newFood = this.getRandomFoodForCategory(
                this.allFood!,
                foodCategory.category,
                foodCategory.quantity
            );
            console.log(menuFood);
            menuFood.push(...newFood);
            // this.updateFoodUnderCategory(newFood, foodCategory.category);
        });

        this.menu = {
            menuId: this.userStore.userId!,
            food: menuFood,
            foodCategoriesQuantities: defaultFoodCategories,
            renewDateTimestamp: generateRenewDate(this.renewPeriod),
            toBuyList: [],
            listOfCheckedIngredientIds: [],
        };
        this.saveMenu();
    };

    private resetListOfCheckedIngredients = () => {
        this.menu!.listOfCheckedIngredientIds = [];
        this.saveListOfCheckedIngredientIds([]);
    };

    updateFoodUnderCategory = (newFood: Food[], category: FoodCategory) => {
        const foodThisWeekWithoutUpdatingFood =
            this.menu !== null
                ? this.menu!.food!.filter(
                      (curFood) => curFood.foodCategory !== category
                  )
                : [];

        this.menu!.food = [...foodThisWeekWithoutUpdatingFood, ...newFood];
        this.saveMenu();
    };

    setLoadingFoodAvailableForUpdate = (state: boolean) => {
        this.isFoodAvailableForChangeLoading = state;
    };
    loadExistingMenu = () => {
        this.menu = this.getMenu();
    };

    //TODO: need rework after database implementing
    // loadListOfCheckedIngredientIds = () => {
    //     this.menu.listOfCheckedIngredientIds =
    //         this.getListOfCheckedIngredientIds();
    // };

    //TODO
    clonedMenu = (): Food[] => {
        return clone(this.menuProjection);
    };

    loadFoodAvailableForUpdate = async (
        targetFoodToChangeId?: string,
        targetFoodCategory?: FoodCategory
    ): Promise<void> => {
        this.setLoadingFoodAvailableForUpdate(true);

        this.allFood = this.allFood ?? (await this.retrieveAllFood());
        let targetFood: Food | null = null;
        if (targetFoodToChangeId) {
            targetFood = await this.getFoodForId(targetFoodToChangeId!);
        }

        const foodUnderTargetCategory = this.allFood.filter(
            (eachFoodInAllFood) => {
                if (targetFood) {
                    return (
                        eachFoodInAllFood.foodCategory ===
                        targetFood.foodCategory
                    );
                } else {
                    return (
                        eachFoodInAllFood.foodCategory === targetFoodCategory
                    );
                }
            }
        );

        this.foodAvailableForUpdate = foodUnderTargetCategory
            .filter(
                (eachFoodInAllFood) =>
                    !this.menuProjection?.some(
                        (eachFoodInMenu) =>
                            eachFoodInMenu.id === eachFoodInAllFood.foodId
                    )
            )
            .map((food) => this.convertFoodToFoodProjection(food));

        this.setLoadingFoodAvailableForUpdate(false);
    };

    setQuantityForCategory = (
        category: FoodCategory,
        quantityToShow: number
    ) => {
        if (!quantityToShow || quantityToShow < 0) {
            return;
        }
        localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
    };

    private getFoodForId = async (id: string): Promise<Food> => {
        if (!this.allFood) {
            this.allFood = await this.retrieveAllFood();
        }
        const result = this.allFood.find((item) => item.foodId === id);

        if (!result) {
            throw new Error(`Can't find food for id: ${id}`);
        }
        return result;
    };

    getFoodProjectionById = async (
        id: string
    ): Promise<IFoodProjection | null> => {
        try {
            this.loadingFood = true;

            const food = await this.getFoodForId(id);
            if (!food) {
                this.loadingFood = false;
                return null;
            }
            this.loadingFood = false;
            return this.convertFoodToFoodProjection(food!);
        } catch (e) {
            this.error = e;
            this.loadingFood = false;
            return null;
        }
    };

    // private getAvailableCategories = () => {
    // const copyFood = this.allFood!.slice();
    // const category = copyFood
    //   .map((food) => food.food_category)
    //   .filter((category, index, self) => self.indexOf(category) === index);

    // return category.map((category) => {
    //   let quantity: number;
    //   const defaultQuantity = 7; //TODO
    //   if (!this.userStore.getFoodCategoryQuantityForCategory(category)) {
    //     quantity = defaultQuantity;
    //     this.userStore.saveFoodCategoryQuantityForCategroy(category, defaultQuantity);
    //   } else {
    //     quantity = this.userStore.getFoodCategoryQuantityForCategory(category)!;
    //   }

    //   return {
    //     category: category,
    //     quantity,
    //     };
    //   });
    // };

    getRandomFoodForCategory = (
        allFood: Food[],
        category: FoodCategory,
        quantityToShow: number
    ): Food[] => {
        let foodUnderGivenCategory = allFood.filter(
            (food) => food.foodCategory === category
        );

        if (quantityToShow > foodUnderGivenCategory.length) {
            console.log(
                'Number of food required to show is larger than the number of food in the database.'
            );
            quantityToShow = foodUnderGivenCategory.length;
        }

        const foodToReturn: Food[] = [];
        for (let i = 0; i < quantityToShow; i++) {
            const randomIndex = Math.floor(
                Math.random() * foodUnderGivenCategory.length
            );
            const randomFood = foodUnderGivenCategory.splice(randomIndex, 1)[0];
            foodToReturn.push(randomFood);
        }
        return foodToReturn;
    };

    // setTargetFoodIdToChange = (id: string) => {
    //   this.targetFoodToChangeId = id;
    // };

    changeFood = async (foodIdToBeChanged: string, foodIdToChange: string) => {
        this.menu!.food = await Promise.all(
            this.menu!.food!.map(async (food) => {
                if (food.foodId === foodIdToBeChanged) {
                    const food = await this.getFoodForId(foodIdToChange)!;

                    return food;
                }
                return food;
            })
        );

        //Resetting the foodchange-related values
        this.newFoodToActionOnId = '';
    };

    addFood = async (foodToAddId: string) => {
        const foodToAdd = await this.getFoodForId(foodToAddId);

        if (!foodToAdd) {
            throw new Error('Can not find food to add');
        }
        this.menu!.food! = [...this.menu!.food!, foodToAdd];
        this.newFoodToActionOnId = '';
    };

    getIngredientById = (id: string): Ingredient | undefined => {
        if (!this.allIngredients) {
            throw new Error('No ingredients');
        }
        return this.allIngredients!.slice().find(
            (ing) => ing.ingredientId === id
        );
    };

    //TODO: error handling this method
    convertFoodToFoodProjection = (food: Food): IFoodProjection => {
        let foodProjection: IFoodProjection = {
            id: food.foodId,
            name: food.foodName,
            category: food.foodCategory,
            imgUrl: food.imgUrl,
            ingredients: [],
        };

        food.foodIngredients.forEach((foodIngredient) => {
            const ingredient = this.getIngredientById(
                foodIngredient.ingredientId
            );
            if (!ingredient) {
                alert(
                    `Can't find the ingredient!${foodIngredient.ingredientId}`
                );
                return;
            }
            foodProjection.ingredients.push({
                id: ingredient!.ingredientId,
                name: ingredient!.ingredientName,
                category: ingredient!.ingredientCategory,
                quantity: foodIngredient.ingredientQuantity,
                unit: ingredient!.unit,
            });
        });
        return foodProjection;
    };

    toggleIngredientState = (ingredientId: string) => {
        const index =
            this.menu!.listOfCheckedIngredientIds!.indexOf(ingredientId);
        if (index >= 0) {
            this.menu!.listOfCheckedIngredientIds!.splice(index, 1);
        } else {
            this.menu!.listOfCheckedIngredientIds!.push(ingredientId);
        }

        this.saveListOfCheckedIngredientIds(
            this.menu!.listOfCheckedIngredientIds!
        );
    };

    removeFood = (foodId: string) => {
        this.menu!.food = this.menu!.food!.filter(
            (food) => food.foodId !== foodId
        );
    };

    saveMenu = (): void => {
        if (!this.menu) {
            console.error('empty menu');
            return;
        }
        let userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );
        userMenu = this.menu;
        localStorage.setItem(this.userStore.userId!, JSON.stringify(userMenu));
    };

    getMenu = (): Menu | null => {
        const userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );
        return userMenu;
    };

    saveRenewDate = (renewDateTimestamp: number): void => {
        this.menu!.renewDateTimestamp = renewDateTimestamp;
        if (localStorage.getItem(this.userStore.userId!) == null) {
            const user = {
                renewDate: renewDateTimestamp,
            };
            localStorage.setItem(this.userStore.userId!, JSON.stringify(user));
            return;
        }

        const userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );
        userMenu['renewDate'] = renewDateTimestamp;
        localStorage.setItem(this.userStore.userId!, JSON.stringify(userMenu));
    };

    userHasMenu = (): boolean => {
        if (localStorage.getItem(this.userStore.userId!) == null) {
            return false;
        }

        const userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );
        return userMenu !== undefined;
    };

    getListOfCheckedIngredientIds = (): string[] => {
        if (localStorage.getItem(this.userStore.userId!) == null) {
            return [];
        }
        const user = JSON.parse(localStorage.getItem(this.userStore.userId!)!);
        return user['listOfCheckedIngredientIds'] ?? [];
    };

    saveListOfCheckedIngredientIds = (
        listOfCheckedIngredientIds: string[]
    ): void => {
        if (localStorage.getItem(this.userStore.userId!) == null) {
            const userMenu = {
                listOfCheckedIngredientIds: listOfCheckedIngredientIds,
            };
            localStorage.setItem(
                this.userStore.userId!,
                JSON.stringify(userMenu)
            );
            return;
        }

        const user = JSON.parse(localStorage.getItem(this.userStore.userId!)!);
        user['listOfCheckedIngredientIds'] = listOfCheckedIngredientIds;
        localStorage.setItem(this.userStore.userId!, JSON.stringify(user));
    };

    getFoodCategoriesQuantities = (): IUserFoodCategoryQuantity[] => {
        const userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );

        if (!userMenu || !userMenu['food_categories_quantities']) {
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
            // userMenu['food_categories_quantities'] =
            //     defaultUserFoodCategoryQuantity;
            // localStorage.setItem(
            //     this.userStore.userId!,
            //     JSON.stringify(userMenu)
            // );
            return defaultUserFoodCategoryQuantity;
        }

        return userMenu['food_categories_quantities'];
    };

    saveQuantityForFoodCategory = (
        category: FoodCategory,
        quantityToShow: number
    ) => {
        if (!quantityToShow || quantityToShow < 0) {
            return;
        }

        let userMenu = JSON.parse(
            localStorage.getItem(this.userStore.userId!)!
        );

        let categoriesQuantities = userMenu[
            'food_categories_quantities'
        ] as IUserFoodCategoryQuantity[];

        let newCategoryQuantity = categoriesQuantities.map((item) => {
            if (item.category === category) {
                item.quantity = quantityToShow;
            }
            return item;
        });

        let updatedUserMenu = {
            ...userMenu,
            category_quantity: newCategoryQuantity,
        };
        localStorage.setItem(
            this.userStore.userId!,
            JSON.stringify(updatedUserMenu)
        );
    };
}
