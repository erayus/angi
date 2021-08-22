import {makeAutoObservable, toJS} from 'mobx';
import { IFood, IFoodIngredient } from '../models/food';
import { IIngredient, IUnit } from '../models/ingredient';
import { RootStore } from './rootStore';
import FoodStore from './foodStore';
const clone = require("rfdc/default");


export type ToBuyIngredient = {
    name: string;
    quantity: number;
    unit: IUnit;
    isChecked: boolean;
};


export default class ToBuyListStore {
    toBuyList: ToBuyIngredient[] | null = null;
    isToBuyListExistInTheDb: boolean | null= null;
    private _foodStore: FoodStore;
    constructor(foodStore: FoodStore){
        this._foodStore = foodStore;
        makeAutoObservable(this)
    }

    generateNewToBuyList= (foodThisWeek: IFood[]) => {
        let allIngredientsThisWeek: IFoodIngredient[] = [];
            foodThisWeek.forEach(food => {
                allIngredientsThisWeek = [...allIngredientsThisWeek.slice(), ...food.ingredients]
            });

            const aggregateIngredients: ToBuyIngredient[] = allIngredientsThisWeek.reduce((accIngredients: ToBuyIngredient[], cur: IFoodIngredient) => {
                //check if object is already in the acc array.
                const curIng = this._foodStore.getIngredientById(cur.id);
                
                if (!curIng) {
                    alert("Can't find some ingredients")
                } 

                const index = accIngredients.findIndex(x => x.name === curIng!.name);
                if (index === -1) {
                    const toBuyIngredient = {
                        name: curIng!.name,
                        quantity: cur.quantity,
                        unit: curIng!.unit,
                        isChecked: false
                    }
                    accIngredients.push(toBuyIngredient);
                } else {
                    accIngredients[index]['quantity'] += cur.quantity;
                }

                return accIngredients
            }, []);
            this.toBuyList = aggregateIngredients;
            this.saveToBuyList();
    }

    toggleIngredientState = (ingredientName: string) => {
        const index = this.toBuyList!.findIndex(x => x.name === ingredientName);
        this.toBuyList![index].isChecked = !this.toBuyList![index].isChecked;
    }

    checkIfToBuyListExistInTheDb = () => {
        if (this.isToBuyListExistInTheDb !== null) {
            return this.isToBuyListExistInTheDb;
        }

        if (!localStorage.getItem('toBuyList')) {
            this.isToBuyListExistInTheDb = false;
            return this.isToBuyListExistInTheDb;
        }

      
        this.isToBuyListExistInTheDb = true;
        return this.isToBuyListExistInTheDb;
    }

    loadToBuyList = () => {
        if (this.toBuyList == null) {
            this.toBuyList = JSON.parse(localStorage.getItem('toBuyList')!);
        }
    }

    saveToBuyList = () => {
        // this.aggregateIngredients = aggregateIngredients;
        localStorage.setItem('toBuyList', JSON.stringify(this.toBuyList));
    }

   
}