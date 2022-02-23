import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite';
import FoodList from '../../components/food-list/food-list.component';
import { useStore } from '../../store/root-store';
import './menu.styles.scss';
import { FoodCategory } from '../../models/Food';
import { MDBIcon, MDBInput, MDBModal, MDBBtn } from 'mdb-react-ui-kit';
import FoodActionModal from '../../components/food-change-modal/food-change-modal.compenent';
import Loader from '../../components/loader/loader';


const Menu = () => {
    const { foodStore } = useStore();
    const { menuProjection, loadingFood: loading, error } = foodStore;
    const [foodChangeModalState, setFoodChangeModalState] = useState(false);
    const [foodAddModalState, setFoodAddModalState] = useState(false);
    const [foodToBeChangedId, setTargetFoodToBeChangedId] = useState('');
    useEffect(() => {
        return () => {
            foodStore.saveMenu();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodStore, menuProjection]);


    // const onQuantityForCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>, category: FoodCategory) => {
    //     const newQuantity = +e.target.value;
    //     const minQuantityAllowed = +e.target.min;
    //     const maxQuantityAllowed = +e.target.max;
    //     if (newQuantity > maxQuantityAllowed || newQuantity < minQuantityAllowed) {
    //         //TODO: prevent the user from typing out-of-range value.
    //         e.preventDefault();
    //         return;
    //     };
    //     foodStore.saveQuantityForFoodCategory(category, newQuantity);
    //     const allFood = foodStore.allFood ?? foodS;
    //     const newFood = await foodStore.getRandomFoodForCategory(allFood, category, newQuantity);
    //     foodStore.updateFoodUnderCategory(newFood, category);
    // }

    window.onbeforeunload = (event) => {
        if (!foodStore.menuProjection) {
            foodStore.saveMenu(); //TODO await?
        }
    };

    const onFoodChangeBtnClickedHandler = async (foodId: string) => {
        await foodStore.loadFoodAvailableForUpdate(foodId);
        setTargetFoodToBeChangedId(foodId);
        setFoodChangeModalState(true);
    }

    const onFoodChangedHandler = () => {
        setFoodChangeModalState(false);
        foodStore.changeFood(foodToBeChangedId, foodStore.newFoodToActionOnId!);
        setTargetFoodToBeChangedId(''); //Reset
    }


    const onFoodAddModalOpenHandler = async (targetFoodCategory: FoodCategory) => {
        await foodStore.loadFoodAvailableForUpdate(undefined, targetFoodCategory);
        setFoodAddModalState(true);
    }

    const onFoodAddedHandler = () => {
        setFoodAddModalState(false);
        foodStore.addFood(foodStore.newFoodToActionOnId!);
    }

    const onFoodRemoveBtnClickedHandler = async (foodId: string) => {
        const deletingFood = await foodStore.getFoodProjectionById(foodId);

        if (window.confirm(`Are you sure you want to delete ${deletingFood?.name}?`)) {
            foodStore.removeFood(foodId);
        }
    }

    const foodToDisplay = !loading && foodStore.menu?.foodCategoriesQuantities?.map(foodCategory => {
        const foodThisWeekUnderCategory = menuProjection ? menuProjection.filter(food => food.category === foodCategory.category) : [];
        return (
            <div key={foodCategory.category} className="mb-4">
                <div style={{ display: "flex", }}>
                    <h3 className="me-3 my-auto">{foodCategory.category}</h3>
                    {/* <MDBInput label={foodThisWeekUnderCategory.length.toString()} id='formControlSm' type='number' min={1} max={6} size='sm'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuantityForCategoryChange(e, foodCategory.category)} /> */}
                </div>
                {
                    foodThisWeekUnderCategory.length > 0 && foodThisWeekUnderCategory
                        ? <FoodList
                            key={foodCategory.category}
                            foodList={foodThisWeekUnderCategory}
                            enableViewDetails
                            enableFoodAction
                            onFoodChangeBtnClicked={onFoodChangeBtnClickedHandler}
                            onFoodRemoveBtnClicked={onFoodRemoveBtnClickedHandler}
                        />
                        : "Loading"
                }
                <MDBBtn
                    className="btn-block btn btn-success"
                    onClick={() => onFoodAddModalOpenHandler(foodCategory.category)}
                >
                    <MDBIcon
                        fas
                        icon="plus"
                        className="mx-2"
                    />
                    Add
                </MDBBtn>
            </div>
        )
    }
    )

    const errorView = (
        <div className='d-flex flex-column align-items-center mt-5 text-center' style={{ height: '100vh' }} >
            <MDBIcon className='my-2' fas icon='exclamation-triangle' size='4x' style={{ color: '#FFA900' }} />
            <h4>{error}</h4>
        </div>
    )

    return (
        <div className="food-list-container">
            {loading && !error && <Loader />}
            {!loading && error && errorView}
            {!loading && !error && foodToDisplay}
            <MDBModal
                staticBackdrop={true}
                show={foodChangeModalState}>
                <FoodActionModal
                    title="List Of Available Food"
                    submitBtnLabel="Change"
                    onClosedHandler={() => setFoodChangeModalState(false)}
                    onSubmitHandler={onFoodChangedHandler}
                />
            </MDBModal>

            <MDBModal
                staticBackdrop={true}
                show={foodAddModalState}
            >
                <FoodActionModal
                    title="Food To Add List"
                    submitBtnLabel="Add"
                    onClosedHandler={() => setFoodAddModalState(false)}
                    onSubmitHandler={onFoodAddedHandler}
                />
            </MDBModal>
        </div>
    )
}

export default observer(Menu);
