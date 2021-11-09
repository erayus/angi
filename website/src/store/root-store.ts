import { createContext, useContext } from "react";
import AppStore from "./app-store";
import FoodStore from "./food-store";
import UserStore from './user-store';

export interface RootStore {
    userStore: UserStore;
    foodStore: FoodStore;
    appStore: AppStore;
}
const userStore = new UserStore();
const foodStore = new FoodStore(userStore);

export const store: RootStore = {
    appStore: new AppStore(),
    foodStore,
    userStore
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext)
}