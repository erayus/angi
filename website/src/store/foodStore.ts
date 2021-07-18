import {makeAutoObservable} from 'mobx';
import { IFoodCategory, IFood, Category } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

type DateFormat = `${number}${number} ${string}${string}${string}${string} ${number}${number}${number}${number}`;

export default class FoodStore {
    foodList: IFood[] = [];
    availableFoodCategories: IFoodCategory[] = [];
    dateToRenew: Date | null = null;
    renewPeriod: number = 7;

    constructor(){
        makeAutoObservable(this)
    }

    private getFoodCategoryQuantityForCategory = (category: Category): number | null => {  
        return localStorage.getItem(`${category}-quantity`) 
               ? +localStorage.getItem(`${category}-quantity`)! 
               : null;
    }

    isTimeToRenewFood = () => {
        const today = new Date();     
        if (!this.getRenewDate()) {
            this.setRenewDate(today);
            return true;
        }
        const renewDate = new Date(this.getRenewDate()!);

        if (today > renewDate) {
            renewDate.setDate(today.getDate() + this.renewPeriod);// set renewDate to the next 7 day; 
            this.setRenewDate(renewDate);
            return true;
        } else {
            return false;
        }
    };

    private getRenewDate = () : DateFormat | null => {
         if(!localStorage.getItem('renewDate')) {
            return null;
         }
         return localStorage.getItem('renewDate')! as DateFormat;
    }

    private setRenewDate = (renewDate: Date) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' } ;
        const todayDateFormat = renewDate.toLocaleDateString('en-AU', options);
        
        localStorage.setItem('renewDate', todayDateFormat);   
    }

    setQuantityForCategory = (category: Category, quantityToShow: number)  => {
        if (!quantityToShow || quantityToShow < 0 ) {
            return;
        }
        localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
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
                quantity = defaultQuantity;
                this.setQuantityForCategory(category, defaultQuantity);
            } else {
                quantity = this.getFoodCategoryQuantityForCategory(category)!;
            };

            return {
                category: category,
                quantity
            };
        })
    };

    getRandomFoodForCategory = (category: Category, quantityToShow: number): IFood[] => {
            const copyFood = this.foodList.slice();
            let foodUnderGivenCategory = copyFood.filter(food=> food.category === category);

            if (quantityToShow > foodUnderGivenCategory.length) {
                console.log('Number of food required to show is larger than the number of food in the database.');
                // console.log('quantityToShow: ',quantityToShow );
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
}