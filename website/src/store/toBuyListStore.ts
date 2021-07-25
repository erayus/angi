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
    aggregateIngredients: IngredientState[] | null = null;
    isToBuyListExistInTheDb: boolean | null= null;
    constructor(){
        makeAutoObservable(this)
    }

    generateNewToBuyList= (foodThisWeek: IFood[]) => {
        let allIngredients: IIngredient[] = [];
            foodThisWeek.forEach(food => {
                allIngredients = [...allIngredients.slice(), ...food.ingredients]
            });
            const aggregateIngredients: IngredientState[] = allIngredients.reduce((accIngredients: IngredientState[], cur: IIngredient) => {
                //check if object is already in the acc array.
                const index = accIngredients.findIndex(x => x.name === cur.name);
                if (index === -1) {
                    const ingredientState = {
                        name: cur.name,
                        quantity: cur.quantity,
                        unit: cur.unit,
                        isChecked: false
                    }
                    accIngredients.push(ingredientState);
                } else {
                    accIngredients[index]['quantity'] += cur.quantity;
                }
                //if yes, increase the quantity
                //if no, add object to the acc array.
                return accIngredients
            }, []);
            this.aggregateIngredients = aggregateIngredients;
            console.log('heyyyy: ', toJS(this.aggregateIngredients));
            this.saveToBuyList();
    }

    toggleIngredientState = (ingredientName: string) => {
        const index = this.aggregateIngredients!.findIndex(x => x.name === ingredientName);
        this.aggregateIngredients![index].isChecked = !this.aggregateIngredients![index].isChecked;
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
        if (this.aggregateIngredients == null) {
            this.aggregateIngredients = JSON.parse(localStorage.getItem('toBuyList')!);
            console.log('yess:' , this.aggregateIngredients);
        }
    }

    saveToBuyList = () => {
        // this.aggregateIngredients = aggregateIngredients;
        localStorage.setItem('toBuyList', JSON.stringify(this.aggregateIngredients));
    }

   
}