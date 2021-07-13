import React, { useEffect, useState } from 'react'
import {observer} from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';
import './foodThisWeek.styles.scss';
import { Category, IFood } from '../../models/food';
import { MDBInput } from 'mdb-react-ui-kit';


const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {loadFood, availableFoodCategories: availableCategories} = foodStore;
    const [noOfFoodPerWeek] = useState(4);
    
    const [foodThisWeek, setFoodThisWeek] = useState<IFood[]>([]);

    useEffect(()=> {
        if (foodThisWeek.length === 0) {
            loadFood();
            availableCategories.forEach(foodCategory => {
                const foodThisWeekUnderCategory = foodThisWeek.filter(food => food.category === foodCategory.category);

                if (foodCategory.category === Category.Dessert) {
                    const food = foodStore.getRandomFoodForCategory(4, foodCategory, foodThisWeekUnderCategory);
                    setFoodThisWeek((prevState) => [...prevState, ...food]);
                    return;
                }

                const food = foodStore.getRandomFoodForCategory(noOfFoodPerWeek, foodCategory, foodThisWeekUnderCategory);
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


    const foodToDisplay = availableCategories.map(foodCategory =>  {
        console.log('Food this week: ', foodThisWeek);
        const foodThisWeekUnderCategory = foodThisWeek.filter(food => food.category === foodCategory.category);

        return (
            <div key={foodCategory.category}>
                <div style={{display: "flex", }}>
                    <h3 className="me-3 my-auto">{foodCategory.category}</h3>
                    <MDBInput label='Form control sm' id='formControlSm' type='number' size='sm' />
                </div>
                
                {
                    foodThisWeekUnderCategory.length > 0 && foodThisWeekUnderCategory !== undefined 
                    ? <FoodList key={foodCategory.category} foodList={foodThisWeek.filter(food => food.category === foodCategory.category)}/>
                    : "Loading"
                }
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
