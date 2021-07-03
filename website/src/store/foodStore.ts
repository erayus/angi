import {makeAutoObservable} from 'mobx';
import { FoodCategory, IFood } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

export default class FoodStore {
    foodList: IFood[] = [];
    constructor(){
        makeAutoObservable(this)
    }

    loadFood =  () => {
       this.foodList = FoodDirectory;
    };

    getFoodForId = (id: number) : IFood | undefined => {
        return this.foodList.find(item => item.id === id);
    }

    getAvailableCategories = () : FoodCategory[] => {
        const copyFood = this.foodList.slice();
        const availableCategories : FoodCategory[]= copyFood.map(food => food.category).filter((category, index, self) => self.indexOf(category) === index);
        return availableCategories;
    };

    getFoodForCategory = (category: FoodCategory): IFood => {
        const copyFood = this.foodList.slice();
        const foodUnderGivenCategory = copyFood.filter(food=> food.category === category);
        return foodUnderGivenCategory[Math.floor(Math.random() * foodUnderGivenCategory.length)];
    }

    addSchool = async (newFood: IFood) => {
    }
    removeFood = async (key: string) => {
    }
}