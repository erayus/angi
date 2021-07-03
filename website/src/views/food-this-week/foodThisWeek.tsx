import React from 'react'
import {observer} from 'mobx-react-lite';
import { IFood } from '../../models/food';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';

const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {foodList} = foodStore;
    const noOfFoodPerWeek = 3;
    const foodForThisWeek: IFood[] = [];

    while(foodForThisWeek.length < noOfFoodPerWeek && foodList.length > 0) {
        const food = foodList[Math.floor(Math.random() * foodList.length)];
        
        if (foodForThisWeek.some(existingFood => existingFood.id == food.id)) {
            continue
        }
        foodForThisWeek.push(food);
    }

    return (
        <div>
            <FoodList foodList={foodForThisWeek}/>
        </div>
    )
}

export default observer(FoodThisWeek);
