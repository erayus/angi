import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession, ISignUpResult } from 'amazon-cognito-identity-js';
import { makeAutoObservable, toJS } from 'mobx';
import config from '../config';
import { IFood, IFoodCategory } from '../models/food';
import { User } from '../models/User';



export default class UserStore {
  userLoading: boolean = true;
  user: User | null = null;
  userPool = new CognitoUserPool(config.getUserPoolConfig())
  private cognitoUser: CognitoUser | null = null;

  get isAuthenticated() : boolean {
    return this.user !== null;
  }

  get userId() : string | undefined {
    return this.user?.sub;
  }

  constructor() {
    makeAutoObservable(this);
  }

  loadAuthenticatedUser = async () => {
    this.userLoading = true;
    await this.getAuthenticatedUser()
      .then((user) => {
        console.log(user);
        this.user = user as User;
      })
      .catch(err => console.log(err))
      .then(() => {
        this.userLoading = false;
      });
  }

  authenticate = async (username: string, password: string) => {
    if (username.length <= 0 && password.length <=0 ) {
      return; //TODO: set error state here
    }

    return await new Promise((resolve, reject) => {
      const user = new CognitoUser({
        Username: username,
        Pool: this.userPool
      });

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      });

      user.authenticateUser(authDetails, {
        onSuccess: async (data) => {
          await this.loadAuthenticatedUser();
          if(localStorage.getItem(this.user!.sub) == null ) {
            localStorage.setItem(this.user!.sub, JSON.stringify({}));
          }
          console.log("onSuccess: ", data);
          resolve(data);
        },
        onFailure: (err) => {
          console.error("onFailure: ", err);
          reject(err);
        },
        newPasswordRequired: (data) => {
          //TODO
          console.log("newPasswordRequired: ", data);
          resolve(data);
        },
      });
    });
  }

  logout = () => {
    if (this.user) {
      console.log(toJS(this.user));
      this.user.current.signOut(() => {
        this.user = null;
      });
    }
    //TODO: throw error to appStore
  };

  getAuthenticatedUser = async ()  => {
    return await new Promise((resolve, reject) => {
      const user = this.userPool.getCurrentUser();
      if (user) {
        user.getSession(async (err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            reject();
          } else {
            const attributes : Record<string, string> = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err);
                } else {
                  let results: Record<string, string> = {};

                  for (let attribute of attributes!) {
                    const { Name, Value } = attribute;
                    results = {...results, [Name]: Value}
                  }

                  resolve(results);
                }
              });
            });

            resolve({ current: user , ...session, ...attributes });
          }
        });
      } else {
        reject();
      }
    });
  };

  register = async (email: string, password: string) : Promise<ISignUpResult | undefined | Error> => {
    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, [], [], (err, data) => {
        if (err) {
          reject(err);
        }
       resolve(data);
      });
    })
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
      }
      localStorage.setItem(this.userId!, JSON.stringify(user));
      return;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    user['menu'] =  menu;
    localStorage.setItem(this.userId!, JSON.stringify(user));
  }

  getMenu = (): IFood[] | null => {
    // this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user['menu'];
  }

  saveRenewDate = (renewDate: string): void  => {
    // this.validateUserStatus();
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
    // this.validateUserStatus();

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["renewDate"];
  }

  isMenuSaved = (): boolean => {
    // this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return false;
    }

    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["menu"] !== undefined;
  };

  resetListOfCheckedIngredientIds = () : void => {
    // this.validateUserStatus();
    this.saveListOfCheckedIngredientIds([])
  }

  getListOfCheckedIngredientIds = () : number[] => {
    // this.validateUserStatus();
    if (localStorage.getItem(this.userId!) == null) {
      return [];
    }
    const user = JSON.parse(localStorage.getItem(this.userId!)!);
    return user["listOfCheckedIngredientIds"] ?? [];
  }

  saveListOfCheckedIngredientIds = (listOfCheckedIngredientIds: number[] ) : void  => {
    // this.validateUserStatus();

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
    // this.validateUserStatus();
    const user =  JSON.parse(localStorage.getItem(this.userId!)!);
    return user["category_quantity"] ?  +user["category_quantity"][category] : null;
  }

  saveFoodCategoryQuantityForCategroy = (category: IFoodCategory, quantityToShow: number) => {
    // this.validateUserStatus();
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

