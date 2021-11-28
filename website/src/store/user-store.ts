import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import { makeAutoObservable } from "mobx";
import config from "../config";
import { IFood, IFoodCategory, IUserFoodCategoryQuantity as IUserFoodCategoriesQuantities } from '../models/food';
import { User } from "../models/User";

export default class UserStore {
  userLoading: boolean = true;
  user: User | null = null;
  userPool = new CognitoUserPool(config.getUserPoolConfig());

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

      const user = (await this.getAuthenticatedUser()) as User;
      this.setUser(user);

      //Check if this is the first time the user login
      if (localStorage.getItem(this.user!.sub) == null) {
        localStorage.setItem(this.user!.sub, JSON.stringify({}));
      }

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
          console.error("onFailure: ", err);
          reject(err);
        },
        newPasswordRequired: (data) => {
          //TODO: what is this for?
          console.log("newPasswordRequired: ", data);
          resolve(data);
        },
      });
    });
  };

  logout = async () => {
    return new Promise((resolve, reject) => {
      if (this.user) {
        this.user.current.signOut(() => {
          this.user = null;
          resolve("Signed out successfully!");
        });
      } else {
        console.error("There is no user.");
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
          async (err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              reject(err.message);
            } else {
              try {
                const attributes: Record<string, string> =
                  await this.getUserAttributes(user);
                resolve({ current: user, session: session!, ...attributes });
              } catch (err) {
                reject(err);
              }
            }
          }
        );
      } else {
        reject("There is no user.");
      }
    });
  };

  getUserAttributes = (user: CognitoUser): Promise<Record<string, string>> => {
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

  // //TODO: considering the need of this
  // private validateUserStatus = () : void => {
  //   if (!this.isAuthenticated) {
  //     throw new Error("You are no longer authenticated"); //TODO: set error state here
  //   };
  //   //TODO: considering the need of this
  //   if (localStorage.getItem(this.userId!) == null) {
  //     throw new Error("No data exist in the table");
  //   };
  // }

  saveMenu = (menu: IFood[]): void => {
    // this.validateUserStatus();

    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        menu: menu,
      };
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user["menu"] = menu;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  };

  getMenu = (): IFood[] | null => {
    // this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["menu"];
  };

  saveRenewDate = (renewDate: string): void => {
    // this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        renewDate: renewDate,
      };
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user["renewDate"] = renewDate;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  };

  getRenewDate = (): string | null => {
    // this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["renewDate"];
  };

  isMenuSaved = (): boolean => {
    // this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["menu"] !== undefined;
  };

  resetListOfCheckedIngredientIds = (): void => {
    // this.validateUserStatus();
    this.saveListOfCheckedIngredientIds([]);
  };

  getListOfCheckedIngredientIds = (): string[] => {
    // this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return [];
    }
    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["listOfCheckedIngredientIds"] ?? [];
  };

  saveListOfCheckedIngredientIds = (
    listOfCheckedIngredientIds: string[]
  ): void => {
    // this.validateUserStatus();

    if (localStorage.getItem(this.userId!) == null) {
      const user = {
        listOfCheckedIngredientIds: listOfCheckedIngredientIds,
      };
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user["listOfCheckedIngredientIds"] = listOfCheckedIngredientIds;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  };

  getFoodCategoriesQuantities = (): IUserFoodCategoriesQuantities[] => {
    const user = JSON.parse(localStorage.getItem(this.userId!)!);

    if (!user["food_categories_quantities"]) { //TODO: constant the key
      const defaultUserFoodCategoryQuantity: IUserFoodCategoriesQuantities[] = [
        {
          category: 'Main',
          quantity: 7
        },
        {
          category: 'Soup',
          quantity: 7,
        },
        {
          category: 'Sidies',
          quantity: 4
        }
      ];
      user["food_categories_quantities"] = defaultUserFoodCategoryQuantity;
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return defaultUserFoodCategoryQuantity;
    }

    return user["food_categories_quantities"]
  };

  saveQuantityForFoodCategory = (
    category: IFoodCategory,
    quantityToShow: number
  ) => {
    if (!quantityToShow || quantityToShow < 0) {
      return;
    }

    let user = JSON.parse(localStorage.getItem(this.userId!)!);

    let categoriesQuantities = user["food_categories_quantities"] as IUserFoodCategoriesQuantities[];
    let newCategoryQuantity = categoriesQuantities.map(item => {
      if (item.category === category) {
          item.quantity = quantityToShow;
      }
      return item
  });

    let newUser = {
      ...user,
      category_quantity: newCategoryQuantity,
    };
    localStorage.setItem(this.userId!, JSON.stringify(newUser));
  };
}
