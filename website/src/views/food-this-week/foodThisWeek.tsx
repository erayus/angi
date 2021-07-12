import React, { useEffect, useState } from 'react'
import {observer} from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';
import './foodThisWeek.styles.scss';
import { FoodCategory, IFood } from '../../models/food';

const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {loadFood, availableCategories} = foodStore;
    const [noOfFoodPerWeek] = useState(4);
    
    const [foodThisWeek, setFoodThisWeek] = useState<IFood[]>([]);

    useEffect(()=> {
        if (foodThisWeek.length === 0) {
            loadFood();
            availableCategories.forEach(category => {
                const foodThisWeekUnderCategory = foodThisWeek.filter(food => food.category === category);

                if (category === FoodCategory.Dessert) {
                    const food = foodStore.getRandomFoodForCategory(4, category, foodThisWeekUnderCategory);
                    setFoodThisWeek((prevState) => [...prevState, ...food]);
                    return;
                }

                const food = foodStore.getRandomFoodForCategory(noOfFoodPerWeek, category, foodThisWeekUnderCategory);
                setFoodThisWeek((prevState) => [...prevState, ...food]);  
            })
        } 
    }, [foodStore,
        availableCategories,
        availableCategories.length,
        foodThisWeek,
        foodThisWeek.length,
        loadFood,
        noOfFoodPerWeek,
        ]);


    const foodToDisplay = availableCategories.map(category =>  {
        console.log('Food this week: ', foodThisWeek);
        const foodThisWeekUnderCategory = foodThisWeek.filter(food => food.category === category);

        return (
            <div key={category}>
                <h3>{category}</h3>
                {
                foodThisWeekUnderCategory.length > 0 && foodThisWeekUnderCategory !== undefined 
                ? <FoodList key={category} foodList={foodThisWeek.filter(food => food.category === category)}/>: "Loading"}
            </div>
        )}    
    )

    return (
        <div className="food-list-container">
            {foodToDisplay}
        </div>
    )
}

export default observer(FoodThisWeek);
