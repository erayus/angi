import React, { useEffect, useState } from 'react'
import {observer} from 'mobx-react-lite';
import { FoodCategory, IFood } from '../../models/food';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';
import './foodThisWeek.styles.scss';

const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {foodList} = foodStore;
    const noOfFoodPerWeek = 3;
    const availableCategories = foodStore.getAvailableCategories(); 
    
    const foodForThisWeek: IFood[] = [];
    availableCategories.forEach(foodCategory => {
        const food = foodStore.getFoodForCategory(foodCategory);
        foodForThisWeek.push(food);
    });   

    return (
        <div className="food-list-container">
            {
                availableCategories.map(category =>  (
                    <div>
                        <h3>{category}</h3>
                        {<FoodList foodList={foodForThisWeek.filter(food => food.category === category)}/>}
                    </div>
                
                ))
            }
        </div>
    )
}

export default observer(FoodThisWeek);
