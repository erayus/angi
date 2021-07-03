import React from 'react'
import { MDBCard, MDBCardTitle, MDBBtn, MDBCardBody, MDBRow, MDBCol } from 'mdb-react-ui-kit';
// import img from '../../assets/spaghetti.jpg';
import { IFood } from '../../models/food';

type IProps = {
  onFoodSelected: (id: number) => void;
} & IFood;

const FoodItem: React.FC<IProps> = ({id, name, imgUrl, ingredients, onFoodSelected}) => {
    const noOfDisplayingIngredientItems  = 2;
    const noOfMoreThanTwo = ingredients.length > noOfDisplayingIngredientItems ? ingredients.length - 2 : 0; //TODO: better name?
    
     const displayNoOfExtraIngredients = noOfMoreThanTwo !== 0 
     ? (<MDBBtn className="m-1" size="sm"  rounded style={{fontSize: '10px', padding:'4px 8px'}}>+ {noOfMoreThanTwo}</MDBBtn>)
     : null;
    return (
      <MDBCard className="m-2" onClick={() => onFoodSelected(id)}>
          <MDBRow className='g-0'>
            <MDBCol size="4" style={{ 
              backgroundImage: `url(${imgUrl})`, 
              backgroundSize: 'cover', 
              borderTopLeftRadius: '.5rem',
              borderBottomLeftRadius: '.5rem'
              }}>
            </MDBCol>
            <MDBCol size="8">
              <MDBCardBody style={{padding: '10px'}}>
                <MDBCardTitle>{name}</MDBCardTitle>
                {
                    ingredients.slice().splice(0,2).map(itemIngredient => {
                        return (
                            <MDBBtn key={itemIngredient} 
                              className="m-1" 
                              size="sm" outline 
                              rounded 
                              style={{fontSize: '8px', padding:'4px 8px'}}
                              >{itemIngredient}
                            </MDBBtn>
                        )}
                )}
                {displayNoOfExtraIngredients}
                
              </MDBCardBody>
            </MDBCol>
          </MDBRow>
      </MDBCard>        
    )
}

export default FoodItem;
