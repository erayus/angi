import { IFood } from "../models/food";

export abstract class UserService {

  public static SaveMenu(userId: string, menu: IFood[]): void {
    if (localStorage.getItem(userId) == null) {
      const data = {
        menu: menu,
      }
      localStorage.setItem(userId, JSON.stringify(data));
      return;
    }

    const user = JSON.parse(localStorage.getItem(userId)!);
    user['menu'] =  menu;
    localStorage.setItem(userId, JSON.stringify(user));
  }

  public static GetMenu(userId: string): IFood[] | null {
    if (localStorage.getItem(userId) == null) {
      return null;
    }

    const data = JSON.parse(localStorage.getItem(userId)!);
    return data['menu'];
  }

  public static SaveRenewDate(userId: string, renewDate: string): void {
    if (localStorage.getItem(userId) == null) {
      const data = {
        renewDate: renewDate,
      }
      localStorage.setItem(userId, JSON.stringify(data));
      return;
    }

    const data = JSON.parse(localStorage.getItem(userId)!);
    data['renewDate'] =  renewDate;
    localStorage.setItem(userId, JSON.stringify(data));
  }

  public static GetRenewDate(userId: string): string | null {
    if (localStorage.getItem(userId) == null) {
      return null;
    }
    const data = JSON.parse(localStorage.getItem(userId)!);
    return data["renewDate"];
  }

  public static IsMenuSaved(userId: string): boolean {
    if (localStorage.getItem(userId) == null) {
      return false;
    }

    const data = JSON.parse(localStorage.getItem(userId)!);
    return data["menu"] !== undefined || data["menu"] !== null;
  };

}
