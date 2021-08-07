import { MDBBadge, MDBCheckbox, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from "react";
import { useStore } from '../../store/rootStore';

interface IProps {

}

const ToBuyList: React.FC<IProps> = () => {
    const { foodStore } = useStore();
    const { toBuyListStore } = useStore();
    const { aggregateIngredients } = toBuyListStore;
        
    useEffect(() => {
        const clonedFoodThisWeek = foodStore.getFoodThisWeek();

        if (clonedFoodThisWeek !== null ) {
            if (toBuyListStore.aggregateIngredients == null && !toBuyListStore.checkIfToBuyListExistInTheDb() 
                || foodStore.isFoodThisWeekUpdated) {
                toBuyListStore.generateNewToBuyList(clonedFoodThisWeek);
            } else {
                toBuyListStore.loadToBuyList();
            }
        }
        

        return () => {
            foodStore.resetIsFoodThisWeek();
        }
    }, [foodStore.foodThisWeek]);

    const onToggleIngredientState = (ingredientName: string) => {
        toBuyListStore.toggleIngredientState(ingredientName);
    }

    window.onbeforeunload = (event) => {
        if (toBuyListStore.aggregateIngredients !== null && toBuyListStore.aggregateIngredients.length !== 0) {
            toBuyListStore.saveToBuyList();
        }
    };

    return (
        <div className="mt-3">
            <MDBListGroup className="mx-auto" style={{ maxWidth: '22rem' }}>
                { aggregateIngredients 
                    ? aggregateIngredients.map(ingredient => (
                        <MDBListGroupItem  key={ingredient.name } 
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => onToggleIngredientState(ingredient.name)}
                            
                            >
                            <MDBCheckbox label={ingredient.name} checked={ingredient.isChecked} onChange={()=> {}}/>
                            <MDBBadge pill>{ingredient.quantity} {ingredient.unit}</MDBBadge>
                        </MDBListGroupItem>
                    ))
                    : "No food generated for this week yet."
                    
                }

            </MDBListGroup>
        </div>
    )
}
export default observer(ToBuyList);
