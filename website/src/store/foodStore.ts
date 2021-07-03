import {makeAutoObservable} from 'mobx';
import { IFood } from "../models/food";
import { FoodDirectory } from '../shared/foodDirectory';

export default class FoodStore {
    foodList: IFood[] = [];
    constructor(){
        makeAutoObservable(this)
    }

    loadFood =  () => {
       this.foodList = FoodDirectory;
    };

    addSchool = async (newFood: IFood) => {
    }
    removeFood = async (key: string) => {
    }
}