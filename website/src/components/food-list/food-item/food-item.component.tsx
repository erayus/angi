import React from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
// import img from '../../assets/spaghetti.jpg';
import { IFood } from '../../../models/food';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import './food-item.styles.scss';
import { FoodChangeProps, FoodListOptionalProps, ViewDetailsProps } from '../food-list.component';

type IProps = FoodListOptionalProps & IFood & RouteComponentProps;

const FoodItem: React.FC<IProps> = ({ id, name, imgUrl, ingredients, history, enableIngredientChipsDisplay, enableViewDetails, enableFoodChange, onFoodChangeBtnClicked }) => {
  const noOfDisplayingIngredientItems = 2;
  const noOfMoreThanTwo = ingredients.length > noOfDisplayingIngredientItems ? ingredients.length - 2 : 0; //TODO: better name?

  const displayNoOfExtraIngredients = noOfMoreThanTwo !== 0
    ? (<MDBBtn className="m-1" size="sm" rounded style={{ fontSize: '10px', padding: '4px 8px' }}>+ {noOfMoreThanTwo}</MDBBtn>)
    : null;

  const displayIngredientsChips = (
    ingredients.slice().splice(0, 2).map(itemIngredient => {
      return (
        <MDBBtn key={itemIngredient.name}
          className="m-1"
          outline
          rounded
          style={{ fontSize: '8px', padding: '4px 8px' }}
        >
          {itemIngredient.name}
        </MDBBtn>
      )
    })
  );

  const displayFoodChangeBtn =  (
      <MDBBtn
        className="change-btn"
        floating
        size="md"
        rounded
        color="info"
        onClick={() => onFoodChangeBtnClicked!(id)}
      >
        <MDBIcon fas icon="sync" />
      </MDBBtn>
    );

  const displayViewDetailsBtn = enableViewDetails
    ? (
      <MDBBtn
        className="view-detail-btn"
        color="success"
        rounded
        onClick={() => history.push(`/food-list/${id}`)}>
        View details
      </MDBBtn>
    )
    : null;

  return (
    <MDBCard className="m-2">
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
            {displayViewDetailsBtn}
          </MDBCardBody>
          {enableFoodChange && displayFoodChangeBtn}
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default withRouter(FoodItem);
