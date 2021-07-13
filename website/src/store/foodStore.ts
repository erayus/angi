import {makeAutoObservable} from 'mobx';
import { IFoodCategory, IFood } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

export default class FoodStore {
    foodList: IFood[] = [];
    availableFoodCategories: IFoodCategory[] = [];
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
        const category = copyFood.map(food => food.category).filter((category, index, self) => self.indexOf(category) === index);

        const defaultQuantity = 5; //TODO
        this.availableFoodCategories = category.map(category => {
            const quantity: number = localStorage.getItem(`${category}-quantity`) 
                                     ? +localStorage.getItem(`${category}-quantity`)! 
                                     : defaultQuantity;

            return {
                category: category,
                quantity
            };
        })
    };

    getRandomFoodForCategory = (quantityToShow: number, foodCategory: IFoodCategory, currentFoodThisWeekUnderTheSameCategory: IFood[]): IFood[] => {
            const copyFood = this.foodList.slice();
            let foodUnderGivenCategory = copyFood.filter(food=> food.category === foodCategory.category);

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