import { MDBBtn, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle } from 'mdb-react-ui-kit';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/root-store';
import FoodList from '../food-list/food-list.component';
import Loader from '../loader/loader';
import styles from "./food-change-modal.module.css";

type IProps = {
  toggleShow: () => void;
}

const FoodChangeModal: React.FC<IProps> = ({ toggleShow }) => {
  const { foodStore } = useStore();
  const [changeBtnDisabled, setChangeBtnDisabled] = useState(true);

  useEffect(() => {
    const shouldChangeBtnDisabled = foodStore.foodAvailableForChange.length === 0 || foodStore.newFoodToChangeId === ""
    setChangeBtnDisabled(shouldChangeBtnDisabled);
  }, [foodStore.foodAvailableForChange.length, foodStore.newFoodToChangeId]);

  const onFoodItemSelectedHandler = (id: string) => {
    foodStore.setNewFoodToChangeId(id);
  }

  const onChangedHandler = () => {
    toggleShow();
    setTimeout(() => {
      foodStore.changeFood(foodStore.targetFoodToBeChangedId, foodStore.newFoodToChangeId!);
    }, 200)
  }

  return (
    <MDBModalDialog centered>
      <MDBModalContent>
        <MDBModalHeader className="text-center">
          <MDBModalTitle >List of Available Food</MDBModalTitle>
          <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
        </MDBModalHeader>
        <MDBModalBody style={{ maxHeight: '500px', overflowY: 'scroll' }}>
          { foodStore.isFoodAvailableForChangeLoading
            ? <Loader/>
            : <FoodList
              foodList={foodStore.foodAvailableForChange}
              enableIngredientChipsDisplay={true}
              onFoodItemSelected={onFoodItemSelectedHandler}
          />}
        </MDBModalBody>

        <MDBModalFooter>
          <MDBBtn color='success' outline onClick={toggleShow}>
            Close
          </MDBBtn>
          <MDBBtn
            className={styles.changeBtn}
            disabled={changeBtnDisabled}
            onClick={() => onChangedHandler()}
          >Change</MDBBtn>
        </MDBModalFooter>
      </MDBModalContent>
    </MDBModalDialog>
  )
}

export default observer(FoodChangeModal);
