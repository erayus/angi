import React from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
// import img from '../../assets/spaghetti.jpg';
import { IFood } from '../../../models/food';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import './food-item.styles.scss';



type IProps = {onFoodChangeBtnClicked: (foodId: number) => void} & IFood & RouteComponentProps;

const FoodItem: React.FC<IProps> = ({ id, name, imgUrl, ingredients, history, onFoodChangeBtnClicked}) => {
  const noOfDisplayingIngredientItems = 2;
  const noOfMoreThanTwo = ingredients.length > noOfDisplayingIngredientItems ? ingredients.length - 2 : 0; //TODO: better name?

  const displayNoOfExtraIngredients = noOfMoreThanTwo !== 0
    ? (<MDBBtn className="m-1" size="sm" rounded style={{ fontSize: '10px', padding: '4px 8px' }}>+ {noOfMoreThanTwo}</MDBBtn>)
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
          <MDBCardBody className="card-body" onClick={() => history.push(`/food-list/${id}`)}>
            <MDBCardTitle>{name}</MDBCardTitle>
            {
                      ingredients.slice().splice(0,2).map(itemIngredient => {
                          return (
                              <MDBBtn key={itemIngredient.name} 
                                className="m-1" 
                                size="sm" outline 
                                rounded 
                                style={{fontSize: '8px', padding:'4px 8px'}}
                                >
                                  {itemIngredient.name}
                              </MDBBtn>
                          )}
                  )}
                  {displayNoOfExtraIngredients}
          </MDBCardBody>
          <MDBBtn
              className="change-btn m-1 px-2 py-1"
              size="md"
              rounded
              onClick={() => onFoodChangeBtnClicked(id)}
            >
              <MDBIcon fas icon="sync" />
            </MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default withRouter(FoodItem);
