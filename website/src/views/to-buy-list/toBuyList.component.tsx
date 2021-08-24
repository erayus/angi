import { MDBBadge, MDBCheckbox, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from "react";
import { useStore } from '../../store/rootStore';
import "./toBuyList.styles.scss"
import { ToBuyIngredient } from '../../store/foodStore';
interface IProps {

}

const ToBuyList: React.FC<IProps> = () => {
    const { foodStore } = useStore();
    const { toBuyList } = foodStore;
    
    return (
        <div className="mt-3">
            <MDBListGroup className="mx-auto" style={{ maxWidth: '22rem' }}>
                { toBuyList 
                    ? toBuyList.slice().sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(ingredient => (
                        <MDBListGroupItem  key={ingredient.name } 
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => foodStore.toggleIngredientState(ingredient.id)}
                            >
                            <MDBCheckbox label={ingredient.name} checked={ingredient.isChecked} onChange={()=> {}}/>
                            <MDBBadge pill className="quantityUnit" >{ingredient.quantity} {ingredient.unit}</MDBBadge>
                        </MDBListGroupItem>
                    ))
                    : "No food generated for this week yet."
                }
            </MDBListGroup>
        </div>
    )
}
export default observer(ToBuyList);
