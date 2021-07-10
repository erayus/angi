import React, { useEffect, useState } from 'react'
import {observer} from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';
import './foodThisWeek.styles.scss';

const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {loadFood, availableCategories} = foodStore;
    const [noOfFoodPerWeek] = useState(4);
    
    const {foodThisWeek} = foodStore;

    useEffect(()=> {
        loadFood();
        if (foodThisWeek.length !== availableCategories.length * noOfFoodPerWeek) {
            foodStore.loadRandomFoodThisWeek(noOfFoodPerWeek);  
        } 
    }, [foodStore, availableCategories.length, foodThisWeek.length, loadFood, noOfFoodPerWeek]);


    return (
        <div className="food-list-container">
            {
                availableCategories.map(category =>  (
                    <div key={category}>
                        <h3>{category}</h3>
                        {foodThisWeek.length > 0 && foodThisWeek !== undefined ? <FoodList foodList={foodThisWeek.filter(food => food.category === category)}/>: "Loading"}
                    </div>
                ))
            }
        </div>
    )
}

export default observer(FoodThisWeek);
