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
    private menu: Food[] | null = null;
    private listOfCheckedIngredientIds: string[] = [];

    userStore: UserStore;
    allFood: Food[] | null = null;
    allIngredients: Ingredient[] | null = null;
    availableFoodCategories: IUserFoodCategoryQuantity[] = [];
    newFoodToActionOnId: string = '';
    setNewFoodToActionOnId = (id: string) => {
        this.newFoodToActionOnId = id;
    };
    foodAvailableForUpdate: IFoodProjection[] = [];
    error: any;
    loadingFood: boolean = false;
    isFoodAvailableForChangeLoading = false;

    constructor(user: UserStore) {
        makeAutoObservable(this);
        this.userStore = user;
    }

    get menuProjection() {
        if (this.menu) {
            return [
                ...this.menu!.map((food) =>
                    this.convertFoodToFoodProjection(food)
                ),
            ];
        }
        return [];
    }

    get toBuyList(): ToBuyIngredient[] {
        let allIngredientsThisWeek: IFoodIngredient[] = [];
        this.menu?.forEach((food) => {
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
                            isChecked: this.listOfCheckedIngredientIds?.some(
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
            const renewDateTimestamp = this.userStore.getRenewDate();

            // if (this.allFood == null) { //TODO: check if the user has menu yet
            this.loadIngredients();
            // this.allFood = await this.retrieveAllFood();
            this.availableFoodCategories =
                this.userStore.getFoodCategoriesQuantities(); //TODO: query Dynamodb to get distinct value of Category column in the food table
            // }

            if (isTimeToRenewFood(Date.now(), renewDateTimestamp)) {
                const newRenewDateTimestamp = generateRenewDate(
                    this.userStore.renewPeriod
                );
                this.userStore.saveRenewDate(newRenewDateTimestamp);
                this.loadNewMenu();
            } else {
                if (this.userStore.isMenuSaved()) {
                    this.loadExistingMenu();
                } else {
                    this.loadNewMenu();
                }
            }
            this.loadingFood = false;
        } catch (e: any) {
            this.loadingFood = false;
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
        this.resetListOfCheckedIngredients();

        this.availableFoodCategories.forEach(async (foodCategory) => {
            const newFood = await this.getRandomFoodForCategory(
                foodCategory.category,
                foodCategory.quantity
            );
            this.updateFoodThisWeek(newFood, foodCategory.category);
        });
    };

    private resetListOfCheckedIngredients = () => {
        this.listOfCheckedIngredientIds = [];
        this.userStore.resetListOfCheckedIngredientIds();
    };

    updateFoodThisWeek = (newFood: Food[], category: FoodCategory) => {
        const foodThisWeekWithoutUpdatingFood =
            this.menu !== null
                ? this.menu!.filter(
                      (curFood) => curFood.foodCategory !== category
                  )
                : [];

        this.menu = [...foodThisWeekWithoutUpdatingFood, ...newFood];
        this.saveFoodThisWeek();
    };

    setLoadingFoodAvailableForUpdate = (state: boolean) => {
        this.isFoodAvailableForChangeLoading = state;
    };
    loadExistingMenu = () => {
        this.menu = this.userStore.getMenu();
    };

    //TODO: need rework after database implementing
    loadListOfCheckedIngredientIds = () => {
        this.listOfCheckedIngredientIds =
            this.userStore.getListOfCheckedIngredientIds();
    };

    //TODO
    clonedMenu = (): Food[] => {
        return clone(this.menuProjection);
    };

    loadFoodAvailableForUpdate = async (
        targetFoodToChangeId?: string,
        targetFoodCategory?: FoodCategory
    ): Promise<void> => {
        this.setLoadingFoodAvailableForUpdate(true);

        let allFood = await this.retrieveAllFood();
        let targetFood: Food | null = null;
        if (targetFoodToChangeId) {
            targetFood = await this.getFoodForId(targetFoodToChangeId!);
        }

        const foodUnderTargetCategory = allFood.filter((eachFoodInAllFood) => {
            if (targetFood) {
                return (
                    eachFoodInAllFood.foodCategory === targetFood.foodCategory
                );
            } else {
                return eachFoodInAllFood.foodCategory === targetFoodCategory;
            }
        });

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

    saveFoodThisWeek = () => {
        if (!this.menu) {
            return;
        }
        this.userStore.saveMenu(this.menu!);
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

    getRandomFoodForCategory = async (
        category: FoodCategory,
        quantityToShow: number
    ): Promise<Food[]> => {
        const allFood = await this.retrieveAllFood();
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
        this.menu = await Promise.all(
            this.menu!.map(async (food) => {
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
        this.menu = [...this.menu!, foodToAdd];
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

    convertFoodToFoodProjection = (food: Food): IFoodProjection => {
        let foodProjection: IFoodProjection = {
            id: food.foodId,
            name: food.foodName,
            category: food.foodCategory,
            imgUrl: food.imgUrl,
            ingredients: [],
        };
        console.log(toJS(food));
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
        const index = this.listOfCheckedIngredientIds.indexOf(ingredientId);
        if (index >= 0) {
            this.listOfCheckedIngredientIds.splice(index, 1);
        } else {
            this.listOfCheckedIngredientIds.push(ingredientId);
        }

        this.userStore.saveListOfCheckedIngredientIds(
            this.listOfCheckedIngredientIds
        );
    };

    removeFood = (foodId: string) => {
        this.menu = this.menu!.filter((food) => food.foodId !== foodId);
    };
}
