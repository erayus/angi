import { makeAutoObservable } from 'mobx';
import { IFood, IFoodCategory } from '../models/food';

export default class UserStore {
  userId: string | null = null;

  get isAuthenticated(): boolean  {
    return this.userId !== null;
  };

  constructor() {
    makeAutoObservable(this);
  }

  authenticate = (username: string, password: string) => {
    if (username.length <= 0 && password.length <=0 ) {
      return; //TODO: set error state here
    }
    this.userId = username;
    if(localStorage.getItem(username) == null ) {
      localStorage.setItem(username, JSON.stringify({}));
    }
  }

  //TODO: considering the need of this
  private validateUserStatus = () : void => {
    if (!this.isAuthenticated) {
      throw new Error("You are no longer authenticated"); //TODO: set error state here
    };
    //TODO: considering the need of this
    if (localStorage.getItem(this.userId!) == null) {
      throw new Error("No data exist in the table");
    };
  }

  saveMenu = (menu: IFood[]): void => {
    this.validateUserStatus();

    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        menu: menu,
      }
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user['menu'] =  menu;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  }

  getMenu = (): IFood[] | null => {
    this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user['menu'];
  }

  saveRenewDate = (renewDate: string): void  => {
    this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        renewDate: renewDate,
      }
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user['renewDate'] =  renewDate;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  }

  getRenewDate = (): string | null => {
    this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["renewDate"];
  }

  isMenuSaved = (): boolean => {
    this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["menu"] !== undefined || user["menu"] !== null;
  };

  resetListOfCheckedIngredientIds = () : void => {
    this.validateUserStatus();
    this.saveListOfCheckedIngredientIds([])
  }

  getListOfCheckedIngredientIds = () : number[] => {
    this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return [];
    }
    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["listOfCheckedIngredientIds"] ?? [];
  }

  saveListOfCheckedIngredientIds = (listOfCheckedIngredientIds: number[] ) : void  => {
    this.validateUserStatus();

    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        listOfCheckedIngredientIds: listOfCheckedIngredientIds,
      }
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user['listOfCheckedIngredientIds'] =  listOfCheckedIngredientIds;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  }

  getFoodCategoryQuantityForCategory = (category: IFoodCategory): number | null  => {
    this.validateUserStatus();

    const user =  JSON.parse(localStorage.getItem(this.userId!)!);

    return user["category_quantity"] ?  +user["category_quantity"][category] : null;
  }

  saveFoodCategoryQuantityForCategroy = (category: IFoodCategory, quantityToShow: number) => {
    this.validateUserStatus();
    if (!quantityToShow || quantityToShow < 0) {
      return;
    }

    let user = JSON.parse(localStorage.getItem(this.userId!)!);
    let categoryQuantity = user["category_quantity"];
    let newCategoryQuantity = {
      ...categoryQuantity,
      [category]: quantityToShow
    }

    let newUser = {
      ...user,
      category_quantity: newCategoryQuantity
    }
    localStorage.setItem(this.userId!, JSON.stringify(newUser));
  }

}
