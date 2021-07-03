import { createContext, useContext } from "react";
import FoodStore from "./foodStore";

interface Store {
    foodStore: FoodStore
}

export const store: Store = {
    foodStore: new FoodStore()
}

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext)
}