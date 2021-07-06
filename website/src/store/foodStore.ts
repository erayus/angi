import {makeAutoObservable} from 'mobx';
import { FoodCategory, IFood } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

export default class FoodStore {
    foodList: IFood[] = [];
    foodThisWeek: IFood[] = [];
    availableCategories: FoodCategory[] = [];
    constructor(){
        makeAutoObservable(this)
    }

    loadFood =  () => {
       this.foodList = FoodDirectory;
       this.loadAvailableCategories();
    };

    getFoodForId = (id: number) : IFood | undefined => {
        return this.foodList.find(item => item.id === id);
    }

    loadAvailableCategories = () => {
        const copyFood = this.foodList.slice();
        this.availableCategories = copyFood.map(food => food.category).filter((category, index, self) => self.indexOf(category) === index);
    };

    loadRandomFoodThisWeek = (quantityToShow: number): void => {
        this.availableCategories.forEach(foodCategory => {
            const copyFood = this.foodList.slice();
            let foodUnderGivenCategory = copyFood.filter(food=> food.category === foodCategory);

            // if (this.foodThisWeek.length > 0) {
            //     foodUnderGivenCategory = foodUnderGivenCategory.filter(food => !this.foodThisWeek
            //         .some((eachFoodThisWeek) => eachFoodThisWeek.id === food.id));
            // }
            
            for (let i = 0; i < quantityToShow; i++) {
                const randomIndex = Math.floor(Math.random() * foodUnderGivenCategory.length);
                const randomFood = foodUnderGivenCategory.splice(randomIndex, 1)[0];
                this.foodThisWeek.push(randomFood);
            }
        });
    }

    addSchool = async (newFood: IFood) => {
    }
    removeFood = async (key: string) => {
    }
}