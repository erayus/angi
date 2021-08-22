import { IFood } from "../models/food";

export abstract class UserService {
  public static myProp = "Hello";

  public static SaveFoodThisWeek(foodThisWeek: IFood[]): void {
    localStorage.setItem("foodThisWeek", JSON.stringify(foodThisWeek));
  }
}
