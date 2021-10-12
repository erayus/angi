import { createContext, useContext } from "react";
import AppStore from "./app-store";
import FoodStore from "./food-store";

export interface RootStore {
    foodStore: FoodStore;
    appStore: AppStore;
}
const foodStore = new FoodStore();

export const store: RootStore = {
    appStore: new AppStore(),
    foodStore,
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext)
}