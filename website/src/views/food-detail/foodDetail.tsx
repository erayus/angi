import React, { useEffect } from 'react'
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

const FoodDetail: React.FC<RouteComponentProps<Params>> = ({ match }) => {
    const { foodStore } = useStore();
    const targetFoodId = +match.params.foodId;
    const targetFood = foodStore.getFoodForId(targetFoodId);
    const { appStore } = useStore();

    useEffect(() => {
        appStore.setupHeader(`Food's ingredients`)

    }, [])
    return (
        <div className="p-3">
            <h3 className="text-center">{targetFood?.name}'s ingredients</h3>
            <img
                src={targetFood?.imgUrl ? targetFood?.imgUrl : 'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/chorizo-mozarella-gnocchi-bake-cropped-9ab73a3.jpg?quality=90&resize=768,574'}
                className='figure-img img-fluid rounded shadow-3 mb-3'
                alt='Pic of Food'
            />
            <MDBListGroup>
                {targetFood ? targetFood.ingredients.map(ing => (
                    <MDBListGroupItem key={ing.name} className='d-flex justify-content-between align-items-center'>
                        {ing.name}
                        <MDBBadge pill>{ing.quantity} {ing.unit}</MDBBadge>
                    </MDBListGroupItem>
                )) : "No ingredients found for this food."

                }
            </MDBListGroup>
        </div>
    )
}

export default withRouter(observer(FoodDetail))
