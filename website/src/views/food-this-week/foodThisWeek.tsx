import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from '../../store/root-store';
import './foodThisWeek.styles.scss';
import { IFoodCategory } from '../../models/food';
import { MDBIcon, MDBInput, MDBModal, MDBSpinner } from 'mdb-react-ui-kit';
import FoodChangeModal from '../../components/food-change-modal/food-change-modal.compenent';


const FoodThisWeek = () => {
    const { foodStore } = useStore();
    const { foodThisWeekProjection, loading, error } = foodStore;
    const [foodChangeModalState, setFoodChangeModalState] = useState(false);

    useEffect(() => {
        return () => {
            foodStore.saveFoodThisWeek();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodStore, foodThisWeekProjection]);

    const onQuantityForCategoryChange = (e: React.ChangeEvent<HTMLInputElement>, category: IFoodCategory) => {
        const newQuantity = +e.target.value;
        const minQuantityAllowed = +e.target.min;
        const maxQuantityAllowed = +e.target.max;
        if (newQuantity > maxQuantityAllowed || newQuantity < minQuantityAllowed) {
            //TODO: prevent the user from typing out-of-range value.
            e.preventDefault();
            return;
        };
        foodStore.setQuantityForCategory(category, newQuantity);
        const newFood = foodStore.getRandomFoodForCategory(category, newQuantity);
        foodStore.updateFoodThisWeek(newFood, category);
    }

    window.onbeforeunload = (event) => {
        if (!foodStore.foodThisWeekProjection) {
            foodStore.saveFoodThisWeek(); //TODO await?
        }
    };

    const onFoodChangeBtnClickedHandler = (foodId: number) => {
        foodStore.setTargetFoodIdToChange(foodId);
        toggleFoodChangeModalState();
    }

    const toggleFoodChangeModalState = () => setFoodChangeModalState(!foodChangeModalState);

    const foodToDisplay = foodStore.availableFoodCategories.map(foodCategory => {
        const foodThisWeekUnderCategory = foodThisWeekProjection ? foodThisWeekProjection.filter(food => food.category === foodCategory.category) : [];
        return (
            <div key={foodCategory.category} className="mb-4">
                <div style={{ display: "flex", }}>
                    <h3 className="me-3 my-auto">{foodCategory.category}</h3>
                    <MDBInput label={foodThisWeekUnderCategory.length.toString()} id='formControlSm' type='number' min={1} max={6} size='sm'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuantityForCategoryChange(e, foodCategory.category)} />
                </div>
                {
                    foodThisWeekUnderCategory.length > 0 && foodThisWeekUnderCategory
                        ? <FoodList
                            key={foodCategory.category}
                            foodList={foodThisWeekUnderCategory}
                            enableViewDetails
                            enableFoodChange
                            onFoodChangeBtnClicked={onFoodChangeBtnClickedHandler}
                        />
                        : "Loading"
                }

                <MDBModal
                    staticBackdrop={true}
                    show={foodChangeModalState}
                    getOpenState={(e: any) => setFoodChangeModalState(e)} tabIndex='-1'>
                    <FoodChangeModal
                        // selectedFoodIdToChange={selectedFoodIdToChange!}
                        foodAvailableForChange={foodStore.getFoodAvailableForChange()}
                        toggleShow={toggleFoodChangeModalState}
                    />
                </MDBModal>
            </div>

        )
    }
    )

    const loadingView =
        (
            <div className='d-flex justify-content-center align-items-center' style={{ height: "100vh" }}  >
                <MDBSpinner color='success' style={{ width: '3rem', height: '3rem' }}>
                    <span className='visually-hidden'>Loading...</span>
                </MDBSpinner>
            </div>
        )

    const errorView = (
        <div className='d-flex flex-column align-items-center mt-5 text-center' style={{ height: '100vh' }} >
            <MDBIcon className='my-2' fas icon='exclamation-triangle' size='4x' style={{ color: '#FFA900'}}/>
            <h4>{error}</h4>
        </div>
    )

    return (
        <div className="food-list-container">
            {loading && !error && loadingView}
            {!loading && error && errorView}
            {!loading && !error && foodToDisplay}
        </div>
    )
}

export default observer(FoodThisWeek);
