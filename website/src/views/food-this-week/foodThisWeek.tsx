import React, { useEffect, useState } from 'react'
import {observer} from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from './../../store/rootStore';
import './foodThisWeek.styles.scss';
import { Category, IFood } from '../../models/food';
import { MDBInput } from 'mdb-react-ui-kit';


const FoodThisWeek = () => {
    const {foodStore} = useStore();
    const {loadFood} = foodStore;
    
    const [foodThisWeek, setFoodThisWeek] = useState<IFood[]>([]);

    useEffect(()=> {
        if (foodThisWeek.length === 0) {
             loadFood();
        };
        // if (foodStore.isTimeToRenewFood()) {
            foodStore.availableFoodCategories.forEach(foodCategory => {
                const newFood = foodStore.getRandomFoodForCategory(foodCategory.category, foodCategory.quantity);
                updateFood(newFood, foodCategory.category);
            })
            console.log('food this week: ', foodThisWeek.toString());
        // } else {
        //     setFoodThisWeek(foodStore.getFoodThisWeek());
        // }
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodStore, foodStore.availableFoodCategories ]);

    const onQuantityForCategoryChange = (e: React.ChangeEvent<HTMLInputElement>, category: Category) => {
        const newQuantity = +e.target.value;
        const minQuantityAllowed = +e.target.min;
        const maxQuantityAllowed = +e.target.max;
        if (newQuantity > maxQuantityAllowed || newQuantity < minQuantityAllowed) {
            //TODO: prevent the user from typing out-of-range value.
            e.preventDefault();
            return;
        };
        console.log("heyy");
        foodStore.setQuantityForCategory(category, newQuantity);
        const newFood = foodStore.getRandomFoodForCategory(category, newQuantity);
        updateFood(newFood, category);
    }

    const updateFood = (newFood: IFood[], category: Category) => {
        setFoodThisWeek((currentFood) => {
            const foodWithoutOldFood = currentFood.filter(curFood => curFood.category !== category)
            return [...foodWithoutOldFood, ...newFood]
        }); 
    } 


    const foodToDisplay = foodStore.availableFoodCategories.map(foodCategory =>  {
        const foodThisWeekUnderCategory = foodThisWeek.filter(food => food.category === foodCategory.category);

        return (
            <div key={foodCategory.category}>
                <div style={{display: "flex", }}>
                    <h3 className="me-3 my-auto">{foodCategory.category}</h3>
                    <MDBInput label={foodThisWeekUnderCategory.length.toString()} id='formControlSm' type='number' min={1} max={6} size='sm'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuantityForCategoryChange(e, foodCategory.category)}/>
                </div>
                
                {
                    foodThisWeekUnderCategory.length > 0 && foodThisWeekUnderCategory !== undefined 
                    ? <FoodList key={foodCategory.category} foodList={foodThisWeekUnderCategory}/>
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
