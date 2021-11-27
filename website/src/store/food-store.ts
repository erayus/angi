import { makeAutoObservable, toJS } from "mobx";
import {
  IFoodCategoryQuantiy,
  IFood,
  IFoodCategory,
  IFoodIngredient,
} from "../models/food";
import { IIngredient, IIngredientCategory, IUnit } from "../models/ingredient";
import { ingredientTable } from "../utils/ingredientTable";
import axiosApi from "../utils/axios-api";
import UserStore from "./user-store";
const clone = require("rfdc/default");

export type IFoodProjection = {
  id: string;
  name: string;
  category: IFoodCategory;
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
  private menu: IFood[] | null = null;
  private listOfCheckedIngredientIds: string[] = [];

  userStore: UserStore;
  allFood: IFood[] | null = null;
  allIngredients: IIngredient[] | null = null;
  availableFoodCategories: IFoodCategoryQuantiy[] = [];
  targetFoodToChangeId: string = "";
  newFoodToChangeId: string = "";
  error: any;
  loading: boolean = false;

  renewDate: string | null = null;
  private renewPeriod: number = 7;

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
    return []
  }

  get toBuyList() :ToBuyIngredient[] {
    let allIngredientsThisWeek: IFoodIngredient[] = [];
    this.menu?.forEach((food) => {
      allIngredientsThisWeek = [
        ...allIngredientsThisWeek.slice(),
        ...food.food_ingredients,
      ];
    });

    const aggregateIngredients: ToBuyIngredient[] =
      allIngredientsThisWeek.reduce(
        (accIngredients: ToBuyIngredient[], cur: IFoodIngredient) => {
          //check if object is already in the acc array.
          const curIng = this.getIngredientById(cur.id);

          if (curIng === undefined) {
            throw new Error(`Can't find ingredient's details of ${cur.id}`); //TODO: log this
          }

          const index = accIngredients.findIndex(
            (x) => x.name === curIng!.name
          );
          if (index === -1) {
            const toBuyIngredient = {
              id: cur.id,
              name: curIng?.name || "No name",
              category: curIng?.category ?? "",
              quantity: Math.round(cur.quantity * 10) / 10,
              unit: curIng?.unit || null,
              isChecked: this.listOfCheckedIngredientIds?.some(
                (checkedIngId) => checkedIngId === curIng!.id
              ),
            };
            accIngredients.push(toBuyIngredient);
          } else {
            accIngredients[index]["quantity"] += Math.round(cur.quantity * 10) / 10;
          }

          return accIngredients;
        },
        []
      );

    return aggregateIngredients;
  }

  private getRenewDate = (): string | null => {
    if (this.renewDate !== null) {
      return this.renewDate;
    }

    return this.userStore.getRenewDate();
  };

  private setRenewDate = (renewDate: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const todayDateFormat = renewDate.toLocaleDateString("en-AU", options);
    this.renewDate = todayDateFormat;
    this.userStore.saveRenewDate(todayDateFormat);
  };

  initializeFoodThisWeek = async () => {
    try {
      this.loading = true;

      if (this.allFood == null) { //TODO: check if the user has menu yet
        this.loadIngredients();
        this.allFood = await this.retrieveAllFood();
        this.availableFoodCategories = this.getAvailableCategories(); //TODO: query Dynamodb to get distinct value of Category column in the food table
      }

      if (this.isTimeToRenewFood()) {
        this.loadNewMenu();
      } else {
        if (this.userStore.isMenuSaved()) {
          this.loadExistingMenu();
        } else {
          this.loadNewMenu();
        }
      }
      this.loading = false;
    } catch (e: any) {
      this.loading = false;
      this.error = e.message;
    }
  };

  private isTimeToRenewFood = () => {
    const today = new Date();
    const renewDate = this.getRenewDate()
    if (!renewDate) {
      const renewDateObj = new Date();
      renewDateObj.setDate(today.getDate() + this.renewPeriod); // set renewDate to the next 7 day;
      this.setRenewDate(renewDateObj);
      return true;
    }

    this.renewDate = renewDate;
    const renewDateObj = new Date(this.renewDate);
    if (today > renewDateObj) {
      renewDateObj.setDate(today.getDate() + this.renewPeriod); // set renewDate to the next 7 day;
      this.setRenewDate(renewDateObj);
      return true;
    } else {
      return false;
    }
  };

  private retrieveAllFood = async () : Promise<IFood[]>  => {
    try {
      const result = await axiosApi.Food.list();

      return result.data;
    } catch (e) {
      throw new Error("Failed to get food from the database.");
    }
  };

  private loadIngredients = async () => {
    this.allIngredients = ingredientTable;
  };

  private loadNewMenu = async () => {
    this.resetListOfCheckedIngredients();

    this.availableFoodCategories.forEach((foodCategory) => {
      const newFood = this.getRandomFoodForCategory(
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

  updateFoodThisWeek = (newFood: IFood[], category: IFoodCategory) => {
    const foodThisWeekWithoutUpdatingFood =
      this.menu !== null
        ? this.menu!.filter((curFood) => curFood.food_category !== category)
        : [];

    this.menu = [...foodThisWeekWithoutUpdatingFood, ...newFood];
    this.saveFoodThisWeek();
  };

  loadExistingMenu = () => {
    this.menu = this.userStore.getMenu();
  };

  //TODO: need rework after database implementing
  loadListOfCheckedIngredientIds = () => {
    this.listOfCheckedIngredientIds = this.userStore.getListOfCheckedIngredientIds();
  };

  //TODO
  private clonedAllFood = (): IFood[] => {
    return clone(this.allFood);
  };
  //TODO
  clonedMenu = (): IFood[] => {
    return clone(this.menuProjection);
  };

  getFoodAvailableForChange = (): IFoodProjection[] => {
    return this.clonedAllFood()
      .filter(
        (eachFoodInAllFood) =>
          eachFoodInAllFood.food_category ===
          this.getFoodForId(this.targetFoodToChangeId)?.food_category
      )
      .filter(
        (eachFoodInAllFood) =>
          !this.menuProjection?.some(
            (eachFoodInFoodThisWeek) =>
              eachFoodInFoodThisWeek.id === eachFoodInAllFood.food_id
          )
      )
      .map((food) => this.convertFoodToFoodProjection(food));
  };

  saveFoodThisWeek = () => {
    if (!this.menu) {
      return;
    }
    this.userStore.saveMenu(this.menu!);
  };

  setQuantityForCategory = (category: IFoodCategory, quantityToShow: number) => {
    if (!quantityToShow || quantityToShow < 0) {
      return;
    }
    localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
  };

  private getFoodForId = (id: string): IFood | null => {
    return this.allFood?.find((item) => item.food_id === id) || null;
  };

  getFoodProjectionById = (id: string): IFoodProjection | null => {
    const food = this.getFoodForId(id);
    if (!food) {
      return null
    }
    return this.convertFoodToFoodProjection(food!);
  };

  private getAvailableCategories = () => {
    const copyFood = this.allFood!.slice();
    const category = copyFood
      .map((food) => food.food_category)
      .filter((category, index, self) => self.indexOf(category) === index);


    return category.map((category) => {
      let quantity: number;
      const defaultQuantity = 7; //TODO
      if (!this.userStore.getFoodCategoryQuantityForCategory(category)) {
        quantity = defaultQuantity;
        this.userStore.saveFoodCategoryQuantityForCategroy(category, defaultQuantity);
      } else {
        quantity = this.userStore.getFoodCategoryQuantityForCategory(category)!;
      }

      return {
        category: category,
        quantity,
      };
    });
  };

  getRandomFoodForCategory = (
    category: IFoodCategory,
    quantityToShow: number
  ): IFood[] => {
    const copyFood = this.allFood!.slice();
    let foodUnderGivenCategory = copyFood.filter(
      (food) => food.food_category === category
    );

    if (quantityToShow > foodUnderGivenCategory.length) {
      console.log(
        "Number of food required to show is larger than the number of food in the database."
      );
      quantityToShow = foodUnderGivenCategory.length;
    }

    const foodToReturn: IFood[] = [];
    for (let i = 0; i < quantityToShow; i++) {
      const randomIndex = Math.floor(
        Math.random() * foodUnderGivenCategory.length
      );
      const randomFood = foodUnderGivenCategory.splice(randomIndex, 1)[0];
      foodToReturn.push(randomFood);
    }
    return foodToReturn;
  };

  setFoodToChangeId = (id: string) => {
    this.newFoodToChangeId = id;
  };

  setTargetFoodIdToChange = (id: string) => {
    this.targetFoodToChangeId = id;
  };

  changeFood = () => {
    this.menu = this.menu!.map((food) => {
      if (food.food_id === this.targetFoodToChangeId) {
        return this.getFoodForId(this.newFoodToChangeId)!;
      }
      return food;
    });

    //Resetting the foodchange-related values
    this.targetFoodToChangeId = "";
    this.newFoodToChangeId = "";
  };

  getIngredientById = (id: string): IIngredient | undefined => {
    if (!this.allIngredients) {
      throw new Error("No ingredients");
    }
    return this.allIngredients!.slice().find((ing) => ing.id === id);
  };

  convertFoodToFoodProjection = (food: IFood): IFoodProjection => {
    let foodProjection: IFoodProjection = {
      id: food.food_id,
      name: food.food_name,
      category: food.food_category,
      imgUrl: food.img_url,
      ingredients: [],
    };

    food.food_ingredients.forEach((foodIngredient) => {
      const ingredient = this.getIngredientById(foodIngredient.id);
      if (!ingredient) {
        alert(`Can't find the ingredient!${foodIngredient.id}`);
        return;
      }
      foodProjection.ingredients.push({
        id: ingredient!.id,
        name: ingredient!.name,
        category: ingredient!.category,
        quantity: foodIngredient.quantity,
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

    this.userStore.saveListOfCheckedIngredientIds(this.listOfCheckedIngredientIds)
  };
}
