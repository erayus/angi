import {makeAutoObservable} from 'mobx';
import { IIngredient } from '../models/food';

export default class ToBuyListStore {
    // aggregateIngredients: IIngredient[] = [];

    constructor(){
        makeAutoObservable(this)
    }

   
}