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
    
    const [foodThisWeek, setFoodThisWeek] = useState<IFood[]>([]);

    useEffect(()=> {
        if (foodThisWeek.length === 0) {
             loadFood();
        };
        availableCategories.forEach(foodCategory => {
            //TODO: better way to customize quantity to show for the Dessert category
            if (foodCategory.category === Category.Dessert) {
                const newFood = foodStore.getRandomFoodForCategory(1, foodCategory.category);
                setFoodThisWeek((currentFood) => {
                    const foodWithoutOldFood = currentFood.filter(curFood => curFood.category !== foodCategory.category)
                    return [...foodWithoutOldFood, ...newFood]
                });
                return;
            }

            const newFood = foodStore.getRandomFoodForCategory(foodCategory.quantity, foodCategory.category);
            setFoodThisWeek((currentFood) => {
                const foodWithoutOldFood = currentFood.filter(curFood => curFood.category !== foodCategory.category)
                return [...foodWithoutOldFood, ...newFood]
            }); 
        })
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodStore, availableCategories]);


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
