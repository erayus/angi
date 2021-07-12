import {makeAutoObservable} from 'mobx';
import { FoodCategory, IFood } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

export default class FoodStore {
    foodList: IFood[] = [];
    availableCategories: FoodCategory[] = [];
    constructor(){
        makeAutoObservable(this)
    }

    loadFood = async () => {
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

    getRandomFoodForCategory = (quantityToShow: number, category: FoodCategory, currentFoodThisWeekUnderTheSameCategory: IFood[]): IFood[] => {
            const copyFood = this.foodList.slice();
            let foodUnderGivenCategory = copyFood.filter(food=> food.category === category);

            if (currentFoodThisWeekUnderTheSameCategory.length > 0) {
                foodUnderGivenCategory = foodUnderGivenCategory.filter(food => !currentFoodThisWeekUnderTheSameCategory
                    .some((eachFoodThisWeek) => eachFoodThisWeek.id === food.id));
            }
            
            if (quantityToShow > foodUnderGivenCategory.length) {
                console.log('Number of food required to show is larger than the number of food in the database.');
                quantityToShow = quantityToShow - foodUnderGivenCategory.length;
            }

            const foodToReturn: IFood[] = [];
            for (let i = 0; i < quantityToShow; i++) {
                const randomIndex = Math.floor(Math.random() * foodUnderGivenCategory.length);
                const randomFood = foodUnderGivenCategory.splice(randomIndex, 1)[0];
                foodToReturn.push(randomFood);
            }

            return foodToReturn;
    }

    removeFood = async (key: string) => {
    }
}