import { MDBBadge, MDBCheckbox, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from "react";
import { IIngredient } from '../../models/food';
import { useStore } from '../../store/rootStore';

interface IProps {

}

const ToBuyList: React.FC<IProps> = () => {
    const { foodStore } = useStore();
    const { foodThisWeek } = foodStore;
    
    const { appStore } = useStore();
    const [aggregateIngredients, setAggregateIngredients] = useState<IIngredient[]>([]); //TODO: has it own store?
    
    useEffect(() => {
        appStore.headerTitle = "To Buy List";
        appStore.showToBuyListButton = false;

        let allIngredients: IIngredient[] = [];
        const copyOfFoodThisWeek = foodStore.getFoodThisWeek();
        copyOfFoodThisWeek.forEach(food => {
            allIngredients = [...allIngredients.slice(), ...food.ingredients.slice()]
        });
        console.log('All ingredients: ', allIngredients);
        const aggregateIngredients: IIngredient[] = allIngredients.reduce((accIngredients: IIngredient[], cur: IIngredient) => {
            //check if object is already in the acc array.
            const index = accIngredients.findIndex(x => x.name === cur.name);
            if (index === -1) {
                console.log('Push: ',  cur.name,  "-"  , cur.quantity)
                accIngredients.push(cur);
            } else {
                console.log( accIngredients[index]['quantity']);
                accIngredients[index]['quantity'] += cur.quantity;
            }
            console.log('Heyy: ', accIngredients)
            //if yes, increase the quantity
            //if no, add object to the acc array.
            return accIngredients
        }, []);


        setAggregateIngredients(aggregateIngredients);

        return () => {
            appStore.showToBuyListButton = true;
            setAggregateIngredients([]);
        }
    }, [foodThisWeek]);

    return (
        <div className="mt-3">
            <MDBListGroup className="mx-auto" style={{ maxWidth: '22rem' }}>
                { aggregateIngredients 
                    ? aggregateIngredients.map(ingredient => (
                        <MDBListGroupItem  key={ingredient.name } 
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => console.log('Hello')}>
                            <MDBCheckbox label={ingredient.name}/>
                            <MDBBadge pill>{ingredient.quantity} {ingredient.unit}</MDBBadge>
                        </MDBListGroupItem>
                    ))
                    : "No food generated for this week yet."
                    
                }

            </MDBListGroup>
        </div>
    )
}
export default ToBuyList;
