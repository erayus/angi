import { MDBBadge, MDBCheckbox, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from "react";
import { useStore } from '../../store/root-store';
import "./toBuyList.styles.scss";

const ToBuyList: React.FC = () => {
    const { foodStore } = useStore();
    const { toBuyList } = foodStore;

    useEffect(() => {
        foodStore.loadListOfCheckedIngredientIds();
    }, [])

    return (
        <div className="mt-3">
            <MDBListGroup className="mx-auto" style={{ maxWidth: '22rem' }}>
                { toBuyList
                    ? toBuyList.slice().sort((a,b) => a.category.toLowerCase().localeCompare(b.category!.toLowerCase())).map(ingredient => (
                        <MDBListGroupItem
                            style={{ height: '4rem', fontSize: '1.2rem'}}
                            key={ingredient.name }
                            className="d-flex justify-content-between align-items-center"
                            onClick={() => foodStore.toggleIngredientState(ingredient.id)}
                        >
                            <MDBCheckbox style={{width: '1.5rem', height: '1.5rem', padding:'0.2rem'}} label={ingredient.name} checked={ingredient.isChecked} onChange={()=> {}}/>
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
