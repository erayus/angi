import React from 'react'
import { useContext } from 'react';
import { withRouter } from 'react-router'
import { MDBBadge, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import { RouteComponentProps } from 'react-router-dom';
import { useStore } from '../../store/rootStore';
import { observer } from 'mobx-react-lite';

type IProps = {

} & RouteComponentProps;

type Params = {
    foodId: string
}

const FoodDetail : React.FC<RouteComponentProps<Params>> = ({match}) => {
    // const itemList = useContext(menuContext);
    const {foodStore} = useStore();
    const targetFoodId = +match.params.foodId;
    const targetFood = foodStore.getFoodForId(targetFoodId);

    return (
        <div>
            <h3 className="mb-2 p-2">{targetFood ? targetFood.name : "Can't find food name." } 's Ingredients</h3>

            <MDBListGroup style={{ minWidth: '22rem' }}>
                {targetFood ? targetFood.ingredients.map(ing => (
                    
                    <MDBListGroupItem key={ing} className='d-flex justify-content-between align-items-center'>
                        {ing}
                        <MDBBadge pill>1</MDBBadge>
                    </MDBListGroupItem>
                    )) : "No ingredients found for this food."
                
                }
            </MDBListGroup>
           
        </div>
    )
}

export default withRouter(observer(FoodDetail))
