import {makeAutoObservable, toJS} from 'mobx';
import { IFood, IIngredient, IUnit } from '../models/food';
const clone = require("rfdc/default");


export type IngredientState = {
    name: string;
    quantity: number;
    unit: IUnit;
    isChecked: boolean;
};


export default class ToBuyListStore {
    toBuyList: IngredientState[] | null = null;
    isToBuyListExistInTheDb: boolean | null= null;
    constructor(){
        makeAutoObservable(this)
    }

    generateNewToBuyList= (foodThisWeek: IFood[]) => {
        let allIngredientsThisWeek: IIngredient[] = [];
            foodThisWeek.forEach(food => {
                allIngredientsThisWeek = [...allIngredientsThisWeek.slice(), ...food.ingredients]
            });

            const aggregateIngredients: IngredientState[] = allIngredientsThisWeek.reduce((accIngredients: IngredientState[], cur: IIngredient) => {
                //check if object is already in the acc array.
                const index = accIngredients.findIndex(x => x.name === cur.name);
                if (index === -1) {
                    const toBuyIngredient = {
                        name: cur.name,
                        quantity: cur.quantity,
                        unit: cur.unit,
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