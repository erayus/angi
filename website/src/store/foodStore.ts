import { get, makeAutoObservable } from "mobx";
import {
  IFoodCategory,
  IFood,
  ICategory,
  IFoodIngredient,
} from "../models/food";
import { IIngredient, IIngredientCategory, IUnit } from "../models/ingredient";
import { FoodDirectory } from "../utils/foodTable";
import { ingredientTable } from "../utils/ingredientTable";
import { UserService } from "../services/user.service";
const clone = require("rfdc/default");

export type IFoodProjection = {
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

export type ToBuyIngredient = {
  id: number;
  name: string;
  quantity: number;
  unit: IUnit;
  isChecked: boolean;
};
export default class FoodStore {
  private foodThisWeek: IFood[] | null = null;
  private listOfCheckedIngredientIds: number[] = [];

  allFood: IFood[] | null = null;
  allIngredients: IIngredient[] | null = null;
  //   foodThisWeekProjection: IFoodProjection[] | null = null;
  availableFoodCategories: IFoodCategory[] = [];
  targetFoodToChangeId: number = 0;
  newFoodToChangeId: number = 0;

  renewDate: string | null = null;
  private renewPeriod: number = 7;

  constructor() {
    makeAutoObservable(this);
  }

  get foodThisWeekProjection() {
    if (this.foodThisWeek) {
      return [
        ...this.foodThisWeek!.map((food) =>
          this.convertFoodToFoodProjection(food)
        ),
      ];
    }
  }

  get toBuyList() {
    let allIngredientsThisWeek: IFoodIngredient[] = [];
    this.foodThisWeek?.forEach((food) => {
      allIngredientsThisWeek = [
        ...allIngredientsThisWeek.slice(),
        ...food.ingredients,
      ];
    });

    const aggregateIngredients: ToBuyIngredient[] =
      allIngredientsThisWeek.reduce(
        (accIngredients: ToBuyIngredient[], cur: IFoodIngredient) => {
          //check if object is already in the acc array.
          const curIng = this.getIngredientById(cur.id);

          if (curIng == undefined) {
            alert(`Can't find ingredient's details of ${cur.id}`); //TODO: log this
          }

          const index = accIngredients.findIndex(
            (x) => x.name === curIng!.name
          );
          if (index === -1) {
            const toBuyIngredient = {
              id: cur.id,
              name: curIng?.name || "No name",
              quantity: cur.quantity,
              unit: curIng?.unit || null,
              isChecked: this.listOfCheckedIngredientIds?.some(
                (checkedIngId) => checkedIngId == curIng!.id
              ),
            };
            accIngredients.push(toBuyIngredient);
          } else {
            accIngredients[index]["quantity"] += cur.quantity;
          }

          return accIngredients;
        },
        []
      );

    return aggregateIngredients;
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

  private isTimeToRenewFood = () => {
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

  private loadFood = async () => {
    //TODO: should be removed after implementing dynamodb
    this.allFood = FoodDirectory; //TODO: should be removed after implementing dynamodb
    this.loadAvailableCategories(); //TODO: query Dynamodb to get distinct value of Category column in the food table
  };

  private loadIngredients = async () => {
    this.allIngredients = ingredientTable;
  };

  private loadNewFoodThisWeek = async () => {
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
    localStorage.removeItem("listOfCheckedIngredientIds");
  };

  updateFoodThisWeek = (newFood: IFood[], category: ICategory) => {
    const foodThisWeekWithoutUpdatingFood =
      this.foodThisWeek !== null
        ? this.foodThisWeek!.filter((curFood) => curFood.category !== category)
        : [];

    this.foodThisWeek = [...foodThisWeekWithoutUpdatingFood, ...newFood];
    this.saveFoodThisWeek();
  };

  loadExistingFoodThisWeek = () => {
    this.foodThisWeek = JSON.parse(localStorage.getItem("foodThisWeek")!);
  };

  //TODO: need rework after database implementing
  loadListOfCheckedIngredientIds = () => {
    if (!localStorage.getItem("listOfCheckedIngredientIds")) {
      this.listOfCheckedIngredientIds = [];
    }
    const listOfCheckedIngredientIds = JSON.parse(
      localStorage.getItem("listOfCheckedIngredientIds")!
    );
    this.listOfCheckedIngredientIds = listOfCheckedIngredientIds || [];
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

  getFoodAvailableForChange = (): IFoodProjection[] => {
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

  saveFoodThisWeek = () => {
    if (!this.foodThisWeek) {
      alert("No food this week");
      return;
    }
    UserService.SaveFoodThisWeekToDb(this.foodThisWeek!);
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

  getFoodProjectionById = (id: number): IFoodProjection | null => {
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
    this.foodThisWeek = this.foodThisWeek!.map((food) => {
      if (food.id === this.targetFoodToChangeId) {
        return this.getFoodForId(this.newFoodToChangeId)!;
      }
      return food;
    });

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

  convertFoodToFoodProjection = (food: IFood): IFoodProjection => {
    let foodProjection: IFoodProjection = {
      id: food.id,
      name: food.name,
      category: food.category,
      imgUrl: food.imgUrl,
      ingredients: [],
    };

    food.ingredients.forEach((foodIngredient) => {
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

  toggleIngredientState = (ingredientId: number) => {
    const index = this.listOfCheckedIngredientIds.indexOf(ingredientId);
    if (index >= 0) {
      this.listOfCheckedIngredientIds.splice(index, 1);
    } else {
      this.listOfCheckedIngredientIds.push(ingredientId);
    }
    localStorage.setItem(
      "listOfCheckedIngredientIds",
      JSON.stringify(this.listOfCheckedIngredientIds)
    ); //TODO: rework after database
  };
}
