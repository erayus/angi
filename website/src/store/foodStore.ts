import {makeAutoObservable} from 'mobx';
import { IFoodCategory, IFood, Category } from "../models/food";
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

      
        this.availableFoodCategories = category.map(category => {
            let quantity: number;
            const defaultQuantity = 5; //TODO
            if (!this.getFoodCategoryQuantityForCategory(category)){
                quantity = this.setQuantityForCategory(category, defaultQuantity);
            } else {
                quantity = this.getFoodCategoryQuantityForCategory(category)!;
            };

            return {
                category: category,
                quantity
            };
        })
    };

    getRandomFoodForCategory = (quantityToShow: number, category: Category): IFood[] => {
            const copyFood = this.foodList.slice();
            let foodUnderGivenCategory = copyFood.filter(food=> food.category === category);

            if (quantityToShow > foodUnderGivenCategory.length) {
                console.log('Number of food required to show is larger than the number of food in the database.');
                quantityToShow = foodUnderGivenCategory.length;
            }

            const foodToReturn: IFood[] = [];
            for (let i = 0; i < quantityToShow; i++) {
                const randomIndex = Math.floor(Math.random() * foodUnderGivenCategory.length);
                const randomFood = foodUnderGivenCategory.splice(randomIndex, 1)[0];
                foodToReturn.push(randomFood);
            }

            return foodToReturn;
    }

    setQuantityForCategory(category: Category, quantityToShow: number) : number {
        console.log('Heyya');
        localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
        return quantityToShow;
    }
    
    getFoodCategoryQuantityForCategory(category: Category): number | null {
        
        return localStorage.getItem(`${category}-quantity`) 
               ? +localStorage.getItem(`${category}-quantity`)! 
               : null;
    }
    

    removeFood = async (key: string) => {
    }
}