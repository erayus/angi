/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol, MDBIcon, MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from 'mdb-react-ui-kit';
import { useHistory } from 'react-router-dom';
import './food-item.styles.scss';
import { FoodListOptionalProps } from '../food-list.component';
import { useStore } from '../../../store/root-store';
import { observer } from 'mobx-react-lite';
import { NavPath } from '../../../utils/nav-path';
import { IFoodProjection } from '../../../store/food-store';

type IProps = FoodListOptionalProps & IFoodProjection;

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
        // floating
        // rounded
        onClick={() => onFoodChangeBtnClicked ? onFoodChangeBtnClicked!(id) : null}
      >
        <MDBIcon className="mx-2" fas icon="sync" />
        Change Food
      </MDBBtn>
    );
    const displayFoodRemoveBtn = (
      <MDBBtn
        className="remove-btn mx-1"
        color="danger"
        floating
        size="md"
        rounded
        onClick={() => onFoodChangeBtnClicked ? onFoodChangeBtnClicked!(id) : null}
      >
        <MDBIcon fas icon="times" />
      </MDBBtn>
    );

    const displaySettingsBtn = (
      <MDBDropdown>
        <MDBDropdownToggle>
          <MDBIcon fas icon="ellipsis-h" />
        </MDBDropdownToggle>
        <MDBDropdownMenu>
          <MDBDropdownItem style={{opacity: '0'}}>
             {displayFoodChangeBtn}
          </MDBDropdownItem>
        </MDBDropdownMenu>
      </MDBDropdown>
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
            <MDBCardTitle>{name}</MDBCardTitle>
            {enableIngredientChipsDisplay && displayIngredientsChips}
            {enableIngredientChipsDisplay && displayNoOfExtraIngredients}
            {enableViewDetails && displayViewDetailsBtn}
            {enableFoodChange && displaySettingsBtn}
          </MDBCardBody>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default observer(FoodItem);
