import { MDBBtn, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle } from 'mdb-react-ui-kit';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/root-store';
import FoodList from '../food-list/food-list.component';
import Loader from '../loader/loader';
import styles from "./food-change-modal.module.css";

type IProps = {
  title: string;
  submitBtnLabel: string;
  toggleShowHandler: () => void;
  onSubmitHandler: () => void;
}

const FoodChangeModal: React.FC<IProps> = ({ title, submitBtnLabel, toggleShowHandler, onSubmitHandler }) => {
  const { foodStore } = useStore();
  const [submitBtnDisabled, setChangeBtnDisabled] = useState(true);

  useEffect(() => {
    const shouldChangeBtnDisabled = foodStore.foodAvailableForUpdate.length === 0 || foodStore.newFoodToActionOnId === ""
    setChangeBtnDisabled(shouldChangeBtnDisabled);
  }, [foodStore.foodAvailableForUpdate.length, foodStore.newFoodToActionOnId]);

  const onFoodItemSelectedHandler = (id: string) => {
    foodStore.setNewFoodToActionOnId(id);
  }

  return (
    <MDBModalDialog centered>
      <MDBModalContent>
        <MDBModalHeader className="text-center">
          <MDBModalTitle>{ title }</MDBModalTitle>
          <MDBBtn className='btn-close' color='none' onClick={toggleShowHandler}></MDBBtn>
        </MDBModalHeader>
        <MDBModalBody style={{ maxHeight: '500px', overflowY: 'scroll' }}>
          { foodStore.isFoodAvailableForChangeLoading
            ? <Loader/>
            : <FoodList
              foodList={foodStore.foodAvailableForUpdate}
              enableIngredientChipsDisplay={true}
              onFoodItemSelected={onFoodItemSelectedHandler}
          />}
        </MDBModalBody>

        <MDBModalFooter>
          <MDBBtn color='success' outline onClick={toggleShowHandler}>
            Close
          </MDBBtn>
          <MDBBtn
            className={styles.submitBtn}
            disabled={submitBtnDisabled}
            onClick={() => onSubmitHandler()}
          >{ submitBtnLabel }</MDBBtn>
        </MDBModalFooter>
      </MDBModalContent>
    </MDBModalDialog>
  )
}

export default observer(FoodChangeModal);
