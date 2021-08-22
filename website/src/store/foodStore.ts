import { makeAutoObservable } from "mobx";
import { type } from "os";
import {
  IFoodCategory,
  IFood,
  ICategory,
  IFoodIngredient,
} from "../models/food";
import { IIngredient, IIngredientCategory, IUnit } from "../models/ingredient";
import { FoodDirectory } from "../utils/foodTable";
import { ingredientTable } from "../utils/ingredientTable";
import foodThisWeek from "../views/food-this-week/foodThisWeek";
import { UserService } from '../services/user.service';
import { builtinModules } from "module";
const clone = require("rfdc/default");

export type IFoodThisWeekProjection = {
  id: number;
  name: string;
  category: ICategory;
  imgUrl: string;
  ingredients: {
    id: number;
    category: IIngredientCategory;
    name: string;
    unit: IUnit;
    quantity: number;
  }[];
};
export default class FoodStore {
  private foodThisWeek: IFood[] | null = null;

  allFood: IFood[] | null = null;
  allIngredients: IIngredient[] | null = null;
  foodThisWeekProjection: IFoodThisWeekProjection[] | null = null;
  availableFoodCategories: IFoodCategory[] = [];
  isFoodThisWeekUpdated = false;
  targetFoodToChangeId: number = 0;
  newFoodToChangeId: number = 0;

  renewDate: string | null = null;
  private renewPeriod: number = 7;

  constructor() {
    makeAutoObservable(this);
  }

  private getFoodCategoryQuantityForCategory = (
    category: ICategory
  ): number | null => {
    return localStorage.getItem(`${category}-quantity`)
      ? +localStorage.getItem(`${category}-quantity`)!
      : null;
  };

  private getRenewDate = (): string | null => {
    if (this.renewDate !== null) {
      return this.renewDate;
    }

    if (!localStorage.getItem("renewDate")) {
      return null;
    }

    return localStorage.getItem("renewDate")!;
  };

  private setRenewDate = (renewDate: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const todayDateFormat = renewDate.toLocaleDateString("en-AU", options);
    this.renewDate = todayDateFormat;
    localStorage.setItem("renewDate", todayDateFormat);
  };

  initializeFoodThisWeek = () => {
    // console.log(this.allFood);
    if (this.allFood == null) {
      this.loadIngredients();
      this.loadFood();
    }

    if (this.isTimeToRenewFood()) {
      this.loadNewFoodThisWeek();
    } else {
      if (this.IsFoodThisWeekLoaded()) {
        this.loadExistingFoodThisWeek();
      } else {
        this.loadNewFoodThisWeek();
      }
    }
  };

  isTimeToRenewFood = () => {
    const today = new Date();
    if (!this.getRenewDate()) {
      const renewDateObj = new Date();
      renewDateObj.setDate(today.getDate() + this.renewPeriod); // set renewDate to the next 7 day;
      this.setRenewDate(renewDateObj);
      return true;
    }

    this.renewDate = this.getRenewDate()!;
    const renewDateObj = new Date(this.renewDate);

    if (today > renewDateObj) {
      renewDateObj.setDate(today.getDate() + this.renewPeriod); // set renewDate to the next 7 day;
      this.setRenewDate(renewDateObj);
      return true;
    } else {
      return false;
    }
  };

  resetIsFoodThisWeek = () => {
    this.isFoodThisWeekUpdated = false;
  };

  loadFood = async () => {
    //TODO: should be removed after implementing dynamodb
    this.allFood = FoodDirectory; //TODO: should be removed after implementing dynamodb
    this.loadAvailableCategories(); //TODO: query Dynamodb to get distinct value of Category column in the food table
  };

  loadIngredients = async () => {
    this.allIngredients = ingredientTable;
  };

  loadNewFoodThisWeek = async () => {
    if (
      this.foodThisWeekProjection === null &&
      this.availableFoodCategories.length > 0
    ) {

      this.availableFoodCategories.forEach((foodCategory) => {
        const newFood = this.getRandomFoodForCategory(
          foodCategory.category,
          foodCategory.quantity
        );

        this.updateFoodThisWeek(newFood, foodCategory.category);
      });
    }
  };

  updateFoodThisWeek = (newFood: IFood[], category: ICategory) => {
    const foodThisWeekWithoutUpdatingFood =
    this.foodThisWeek !== null
      ? this.foodThisWeek!.filter(
          (curFood) => curFood.category !== category
        )
      : [];

    this.foodThisWeek = [
        ...foodThisWeekWithoutUpdatingFood,
        ...newFood
    ];
    this.updateFoodThisWeekProjection(this.foodThisWeek!);
    this.isFoodThisWeekUpdated = true;
    UserService.SaveFoodThisWeek(this.foodThisWeek);
  }

  loadExistingFoodThisWeek = () => {
    if (this.foodThisWeekProjection === null) {
      this.foodThisWeekProjection = JSON.parse(
        localStorage.getItem("foodThisWeek")!
      );
    }
  };

  IsFoodThisWeekLoaded = () => {
    if (localStorage.getItem("foodThisWeek")) {
      return true;
    }
    return false;
  };

  //TODO
  getAllFood = (): IFood[] => {
    return clone(this.allFood);
  };
  //TODO
  getFoodThisWeek = (): IFood[] => {
    return clone(this.foodThisWeekProjection);
  };

  getFoodAvailableForChange = (): IFoodThisWeekProjection[] => {
    return this.getAllFood()
      .filter(
        (eachFoodInAllFood) =>
          eachFoodInAllFood.category ===
          this.getFoodForId(this.targetFoodToChangeId)?.category
      )
      .filter(
        (eachFoodInAllFood) =>
          !this.foodThisWeekProjection?.some(
            (eachFoodInFoodThisWeek) =>
              eachFoodInFoodThisWeek.id === eachFoodInAllFood.id
          )
      )
      .map((food) => this.convertFoodToFoodProjection(food));
  };

  saveFoodThisWeek() {
    localStorage.setItem(
      "foodThisWeek",
      JSON.stringify(this.foodThisWeekProjection)
    );
  }

  updateFoodThisWeekProjection = (newFood: IFood[]) => {
    this.foodThisWeekProjection = [...newFood.map((food) =>
        this.convertFoodToFoodProjection(food)
      )];
  };

  setQuantityForCategory = (category: ICategory, quantityToShow: number) => {
    if (!quantityToShow || quantityToShow < 0) {
      return;
    }
    localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
  };

  private getFoodForId = (id: number): IFood | null => {
    return this.allFood!.find((item) => item.id === id) || null;
  };

  getFoodProjectionById = (id: number): IFoodThisWeekProjection | null => {
    const food = this.getFoodForId(id);
    if (!food) {
      alert("Cant find food");
    }
    return this.convertFoodToFoodProjection(food!);
  };

  loadAvailableCategories = () => {
    const copyFood = this.allFood!.slice();
    const category = copyFood
      .map((food) => food.category)
      .filter((category, index, self) => self.indexOf(category) === index);

    this.availableFoodCategories = category.map((category) => {
      let quantity: number;
      const defaultQuantity = 5; //TODO
      if (!this.getFoodCategoryQuantityForCategory(category)) {
        quantity = defaultQuantity;
        this.setQuantityForCategory(category, defaultQuantity);
      } else {
        quantity = this.getFoodCategoryQuantityForCategory(category)!;
      }

      return {
        category: category,
        quantity,
      };
    });
  };

  getRandomFoodForCategory = (
    category: ICategory,
    quantityToShow: number
  ): IFood[] => {
    const copyFood = this.allFood!.slice();
    let foodUnderGivenCategory = copyFood.filter(
      (food) => food.category === category
    );

    if (quantityToShow > foodUnderGivenCategory.length) {
      console.log(
        "Number of food required to show is larger than the number of food in the database."
      );
      // console.log('quantityToShow: ',quantityToShow );
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

  setFoodToChangeId = (id: number) => {
    this.newFoodToChangeId = id;
  };

  setTargetFoodIdToChange = (id: number) => {
    this.targetFoodToChangeId = id;
  };

  changeFood = () => {
    const newFoodThisWeek: IFoodThisWeekProjection[] =
      this.foodThisWeekProjection!.map((foodProjection) => {
        if (foodProjection.id === this.targetFoodToChangeId) {
          const food = this.getFoodForId(this.newFoodToChangeId)!;
          foodProjection = this.convertFoodToFoodProjection(food);
        }
        return foodProjection;
      });

    this.foodThisWeekProjection = [...newFoodThisWeek];
    this.isFoodThisWeekUpdated = true;

    //Resetting the foodchange-related values
    this.targetFoodToChangeId = 0;
    this.newFoodToChangeId = 0;
  };

  getIngredientById = (id: number): IIngredient | undefined => {
    if (!this.allIngredients) {
      alert("No ingredients");
    }
    return this.allIngredients!.slice().find((ing) => ing.id == id);
  };

  convertFoodToFoodProjection = (food: IFood): IFoodThisWeekProjection => {
    let foodThisWeekProjection: IFoodThisWeekProjection = {
      id: food.id,
      name: food.name,
      category: food.category,
      imgUrl: food.imgUrl,
      ingredients: [],
    };

    food.ingredients.forEach((foodIngredient) => {
      const ingredient = this.getIngredientById(foodIngredient.id);
      if (!ingredient) {
        alert(`Çant find the ingredient!${foodIngredient.id}`);
        return;
      }
      foodThisWeekProjection.ingredients.push({
        id: ingredient!.id,
        name: ingredient!.name,
        category: ingredient!.category,
        quantity: foodIngredient.quantity,
        unit: ingredient!.unit,
      });
    });
    return foodThisWeekProjection;
  };
}
