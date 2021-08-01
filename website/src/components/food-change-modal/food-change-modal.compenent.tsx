import { MDBBtn, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import { IFood } from '../../models/food';

type IProps = {
  selectedFoodToChange: number;
  toggleShow: () => void;
}

const FoodChangeModal: React.FC<IProps> = ({ selectedFoodToChange, toggleShow}) => {



    return (
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{selectedFoodToChange}</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>...</MDBModalBody>
  
            <MDBModalFooter>
              <MDBBtn color='secondary' onClick={toggleShow}>
                Close
              </MDBBtn>
              <MDBBtn>Save changes</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
    )
}

export default FoodChangeModal;
