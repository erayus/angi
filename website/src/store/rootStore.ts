import { createContext, useContext } from "react";
import AppStore from "./appStore";
import FoodStore from "./foodStore";
import ToBuyListStore from "./toBuyListStore";

export interface RootStore {
    foodStore: FoodStore;
    appStore: AppStore;
    toBuyListStore: ToBuyListStore;
}
const foodStore = new FoodStore();
const toBuyListStore = new ToBuyListStore(foodStore);


export const store: RootStore = {
    appStore: new AppStore(),
    foodStore,
    toBuyListStore,
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext)
}