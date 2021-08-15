/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
// import img from '../../assets/spaghetti.jpg';
import { IFood } from '../../../models/food';
import { RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import './food-item.styles.scss';
import { FoodListOptionalProps } from '../food-list.component';
import { useStore } from '../../../store/rootStore';
import { observer } from 'mobx-react-lite';
import { NavPath } from '../../../shared/nav-path';

type IProps = FoodListOptionalProps & IFood;


const FoodItem: React.FC<IProps> = ({
  id,
  name,
  imgUrl,
  onFoodItemSelected,
  ingredients,
  enableIngredientChipsDisplay,
  enableViewDetails,
  enableFoodChange,
  onFoodChangeBtnClicked }) => {
  const noOfDisplayingIngredientItems = 2;
  const noOfMoreThanTwo = ingredients.length > noOfDisplayingIngredientItems ? ingredients.length - 2 : 0; //TODO: better name?
  const [isSelected, setIsSelected] = useState(false);
  const { foodStore } = useStore();
  const history = useHistory();


  useEffect(() => {
    if (foodStore.newFoodToChangeId === id) {
      setIsSelected(!isSelected);
    } else {
      setIsSelected(false);
    }
  }, [foodStore.newFoodToChangeId])

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

  const displayViewDetailsBtn =  (
      <MDBBtn
        className="view-detail-btn"
        color="success"
        rounded
        onClick={() => history.push(`/${NavPath.FoodDetails}/${id}`)}>  
        View details
      </MDBBtn> //TODO: centralize pathname
    );

    const displayFoodChangeBtn = (
      <MDBBtn
        className="change-modal-btn mx-1"
        floating
        size="md"
        rounded
        onClick={() => onFoodChangeBtnClicked ? onFoodChangeBtnClicked!(id) : null}
      >
        <MDBIcon fas icon="sync" />
      </MDBBtn>
    );

  return (
    <MDBCard
      className={["m-2", isSelected ? 'text-white' : 'text-black'].join(' ')}
      onClick={() => onFoodItemSelected ? onFoodItemSelected!(id) : null}
      background={isSelected ? 'info' : '#FFF'}>
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
            <MDBCardTitle>{name}</MDBCardTitle>
            {enableIngredientChipsDisplay && displayIngredientsChips}
            {enableIngredientChipsDisplay && displayNoOfExtraIngredients}
            {enableViewDetails && displayViewDetailsBtn}
            {enableFoodChange && displayFoodChangeBtn}
          </MDBCardBody>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default observer(FoodItem);
