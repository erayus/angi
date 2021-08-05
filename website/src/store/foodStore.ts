import {makeAutoObservable} from 'mobx';
import { IFoodCategory, IFood, Category } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';
const clone = require("rfdc/default")


export default class FoodStore {
    allFood: IFood[] = [];
    foodThisWeek: IFood[] | null = null;
    availableFoodCategories: IFoodCategory[] = [];
    isFoodThisWeekUpdated = false;
    targetFoodToChangeId : number = 0;
    newFoodToChangeId: number = 0;

    renewDate: string | null = null;
    private renewPeriod: number = 7;

    constructor(){
        makeAutoObservable(this)
    }

    private getFoodCategoryQuantityForCategory = (category: Category): number | null => {  
        return localStorage.getItem(`${category}-quantity`) 
               ? +localStorage.getItem(`${category}-quantity`)! 
               : null;
    }

    private getRenewDate = () : string | null => {
        if (this.renewDate !== null) {
            return this.renewDate;
        }

        if(!localStorage.getItem('renewDate')) {
           return null;
        }
        return localStorage.getItem('renewDate')!;
    }

    private setRenewDate = (renewDate: Date) => {
       const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' } ;
       const todayDateFormat = renewDate.toLocaleDateString('en-AU', options);

       localStorage.setItem('renewDate', todayDateFormat);   
    }

    initializeFoodThisWeek = () => {
        if (this.allFood == null) {
            this.loadFood();
       };

       if (this.isTimeToRenewFood()) {
        this.loadNewFoodThisWeek();
       } else {
           if (this.IsFoodThisWeekLoaded())  {
                this.loadExistingFoodThisWeek();
           } else {
                this.loadNewFoodThisWeek();
           }    
       }
    }

    isTimeToRenewFood = () => {
        const today = new Date();     
        if (!this.getRenewDate()) {
            const renewDateObj = new Date();
            renewDateObj.setDate(today.getDate() + this.renewPeriod);// set renewDate to the next 7 day; 
            this.setRenewDate(renewDateObj);
            return true;
        }
        const renewDateObj = new Date(this.getRenewDate()!);
        if (today > renewDateObj) {
            renewDateObj.setDate(today.getDate() + this.renewPeriod);// set renewDate to the next 7 day; 
            this.setRenewDate(renewDateObj);
            return true;
        } else {
            return false;
        }
    };

    resetIsFoodThisWeek = () => {
        this.isFoodThisWeekUpdated = false;
    }

    loadFood = async () => {
        this.allFood = FoodDirectory;
        this.loadAvailableCategories();
    };

    loadNewFoodThisWeek = async () => {
        if (this.foodThisWeek === null && this.availableFoodCategories.length > 0) {
            this.availableFoodCategories.forEach(foodCategory => {
                const newFood = this.getRandomFoodForCategory(foodCategory.category, foodCategory.quantity);
                this.updateFoodThisWeek(newFood, foodCategory.category);
            })
        }
        this.saveFoodThisWeek();
    }

    loadExistingFoodThisWeek = () => {
        if (this.foodThisWeek === null) {
            this.foodThisWeek = JSON.parse(localStorage.getItem('foodThisWeek')!);
        }
    }

    IsFoodThisWeekLoaded = () => {
        if (localStorage.getItem('foodThisWeek')) {
            return true;
        }
        return false;
    }

    getAllFoodThisWeek = () : IFood[] => {
        return clone(this.allFood);
    }
    getFoodThisWeek = () : IFood[] => {
        return clone(this.foodThisWeek);
    }

    saveFoodThisWeek() {
        localStorage.setItem('foodThisWeek', JSON.stringify(this.foodThisWeek));
    }

    updateFoodThisWeek = (newFood: IFood[], category: Category) => {
        const foodThisWeekWithoutUpdatingFood =  this.foodThisWeek !== null ? this.foodThisWeek!.filter(curFood => curFood.category !== category) : [];
        this.foodThisWeek = [...foodThisWeekWithoutUpdatingFood, ...newFood];
    }

    setQuantityForCategory = (category: Category, quantityToShow: number)  => {
        if (!quantityToShow || quantityToShow < 0 ) {
            return;
        }
        localStorage.setItem(`${category}-quantity`, quantityToShow.toString());
    }

    getFoodForId = (id: number) : IFood | null => {
        return this.allFood.find(item => item.id === id) || null;
    }

    loadAvailableCategories = () => {
        const copyFood = this.allFood.slice();
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
            const copyFood = this.allFood.slice();
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

    setFoodToChangeId = (id: number) => {
        this.newFoodToChangeId = id;
    }

    setTargetFoodIdToChange = (id: number) => {
        this.targetFoodToChangeId = id;
    }

    changeFood() {
        const newFoodThisWeek :IFood[] = this.foodThisWeek!.map(food => {
            if (food.id === this.targetFoodToChangeId) {
                return this.getFoodForId(this.newFoodToChangeId)!;
            }
            return food;
        });
    
        this.foodThisWeek = [...newFoodThisWeek];
        this.isFoodThisWeekUpdated = true;

        //Resetting the foodchange-related values
        this.targetFoodToChangeId = 0;
        this.newFoodToChangeId = 0;
    }
}