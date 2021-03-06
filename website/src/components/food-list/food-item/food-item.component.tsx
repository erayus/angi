/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol, MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBDropdownLink } from 'mdb-react-ui-kit';
import { useHistory } from 'react-router-dom';
import './food-item.styles.scss';
import { FoodListOptionalProps } from '../food-list.component';
import { useStore } from '../../../store/root-store';
import { observer } from 'mobx-react-lite';
import { NavPath } from '../../../utils/nav-path';
import { FoodProjection } from '../../../store/food-store';
import AlertDialogButton from '../../alert-dialog-button/alert-dialog-button';
import { Button, Heading } from '@chakra-ui/react';

type IProps = FoodListOptionalProps & FoodProjection;

const FoodItem: React.FC<IProps> = ({
  id,
  name,
  imgUrl,
  onFoodItemSelected,
  ingredients,
  enableIngredientChipsDisplay,
  enableViewDetails,
  enableFoodRemove,
  enableFoodChange,
  onFoodChangeBtnClicked,
  onFoodRemoveBtnClicked,
}) => {
  const noOfDisplayingIngredientItems = 2;
  const noOfMoreThanTwo = ingredients.length > noOfDisplayingIngredientItems ? ingredients.length - 2 : 0; //TODO: better name?
  const [isSelected, setIsSelected] = useState(false);
  const { foodStore } = useStore();
  const history = useHistory();


  useEffect(() => {
    if (foodStore.newFoodToActionOnId === id) {
      setIsSelected(!isSelected);
    } else {
      setIsSelected(false);
    }
  }, [foodStore.newFoodToActionOnId])

  const displayNoOfExtraIngredients = noOfMoreThanTwo !== 0
    ? (<MDBBtn className="no-of-extra-ingredients-chip m-1" size="sm" rounded>+ {noOfMoreThanTwo}</MDBBtn>)
    : null;

  const displayIngredientsChips = (
    ingredients.slice().splice(0, 2).map(itemIngredient => {
      return (
        <MDBBtn key={itemIngredient.name}
          className="ingredient-chip-btn m-1"
          outline
          rounded
        >
          {itemIngredient.name}
        </MDBBtn>
      )
    })
  );

  const displayViewDetailsBtn = (
    <Button
      className="view-detail-btn px-3"
      colorScheme="green"
      onClick={() => history.push(`/${NavPath.FoodDetails}/${id}`)}>
      Details
    </Button> //TODO: centralize pathname
  );

  const displayFoodChangeBtn = (
    <Button
      className="change-modal-btn mx-1"
      size="md"
      onClick={() => onFoodChangeBtnClicked ? onFoodChangeBtnClicked!(id) : null}
    >
      <MDBIcon fas icon="sync" />
    </Button>
  );
  const displayFoodRemoveBtn = (
    <AlertDialogButton
      className="remove-btn mx-1"
      color="danger"
      size="md"
      alertHeader='Delete Food'
      colorScheme='red'
      alertBody='Are you sure you want to delete this food?'
      actionButtonText='Delete'
      onConfirmedHandler={() => onFoodRemoveBtnClicked ? onFoodRemoveBtnClicked!(id) : null}
    >
      <MDBIcon fas icon="trash-alt" />
    </AlertDialogButton>

  );

  return (
    <MDBCard
      className={["m-2", !isSelected || 'is-selected'].join(' ')}
      onClick={() => onFoodItemSelected ? onFoodItemSelected!(id) : null}
      background={isSelected ? '#00C853' : '#FFF'}>
      <MDBRow className='g-0'>
        <MDBCol size="4" style={{
          backgroundImage: `url(${imgUrl})`,
          backgroundSize: 'cover',
          borderTopLeftRadius: '.5rem',
          borderBottomLeftRadius: '.5rem'
        }}>
        </MDBCol>
        <MDBCol size="8" className='card-body-container'>
          <MDBCardBody className="card-body">
            <Heading mb={4} size="md">{name}</Heading>
            {enableIngredientChipsDisplay && displayIngredientsChips}
            {enableIngredientChipsDisplay && displayNoOfExtraIngredients}
            {enableViewDetails && displayViewDetailsBtn}
            {enableFoodChange && displayFoodChangeBtn}
            {enableFoodRemove && displayFoodRemoveBtn}
          </MDBCardBody>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default observer(FoodItem);
