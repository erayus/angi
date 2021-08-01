import { MDBBtn, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import { IFood } from '../../models/food';
import FoodList from '../food-list/food-list.component';

type IProps = {
  allFood: IFood[];
  toggleShow: () => void;
}

const FoodChangeModal: React.FC<IProps> = ({ toggleShow, allFood }) => {

  return (
      <MDBModalDialog centered>
        <MDBModalContent>
          <MDBModalHeader className="text-center">
            <MDBModalTitle >List of Available Food</MDBModalTitle>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody style={{maxHeight: '500px', overflowY: 'scroll' }}>
            <FoodList
                foodList={allFood}
                enableIngredientChipsDisplay={true}
              />
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={toggleShow}>
              Close
            </MDBBtn>
            <MDBBtn>Save changes</MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
  )
}

export default FoodChangeModal;
