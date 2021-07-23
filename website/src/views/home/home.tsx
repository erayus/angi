import React, { useEffect, useState } from 'react'
import {Route, RouteComponentProps, Switch, useHistory} from 'react-router-dom';
import FoodThisWeek from '../food-this-week/foodThisWeek';
import { useStore } from '../../store/rootStore';
import FoodDetail from '../food-detail/foodDetail';
import './home.styles.scss';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import ToBuyList from '../to-buy-list/toBuyList.component';
import { observer } from 'mobx-react-lite';
type IProps = {

} & RouteComponentProps;

const Home: React.FC<IProps> = ({location}) => {
    const {foodStore} = useStore();
    const {appStore} = useStore();
    const {loadFood} = foodStore;
    const {foodThisWeek} = foodStore;
    const [isOnToBuyListView, setIsOnToBuyListView] = useState<boolean>(false);
    const [headerTitle, setTitle] = useState('RJ Menu');
    const history = useHistory();

    useEffect(()=> {
        loadFood();
    });

    useEffect(()=> {
        if (foodStore.foodList.length === 0) {
             loadFood();
        };

        if (foodStore.isTimeToRenewFood()) {
            foodStore.loadNewFoodThisWeek();
        } else {
            if (foodStore.IsFoodThisWeekLoaded())  {
                foodStore.loadExistingFoodThisWeek();
            } else {
                foodStore.loadNewFoodThisWeek();
            }    
        }
        return () => {
            foodStore.saveFoodThisWeek();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foodStore, foodThisWeek]);

    

    return (
        <React.Fragment>
            <header className="header">
                <h1>{appStore.headerTitle}</h1>
            </header>
            
            {appStore.showToBuyListButton 
            ? <MDBBtn className="to-buy-btn"  size='lg' floating tag='a' onClick={() => history.push('/to-buy-list')}>
                <MDBIcon fas icon="cart-arrow-down"  />
            </MDBBtn>
            : null}
            <Switch>
                <Route exact path="/" component={FoodThisWeek} />
                <Route path="/food-list/:foodId" component={FoodDetail}/>
                <Route path="/to-buy-list" component={ToBuyList}/>
                
            </Switch>
        </React.Fragment>
    )
}

export default observer(Home)
