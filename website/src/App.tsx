import React, { useEffect } from 'react'
import {Route, Switch, useHistory} from 'react-router-dom';
import FoodThisWeek from './views/food-this-week/foodThisWeek';
import { useStore } from './store/rootStore';
import FoodDetail from './views/food-detail/foodDetail';
import './App.styles.scss';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import ToBuyList from './views/to-buy-list/toBuyList.component';
import { observer } from 'mobx-react-lite';

const App: React.FC = () => {
    const {foodStore} = useStore();
    const {appStore} = useStore();
    const {loadFood} = foodStore;
    const {foodThisWeek} = foodStore;
    const history = useHistory();

    useEffect(()=> {
        loadFood();
        foodStore.initializeFoodThisWeek();
    }, []);
    
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

export default observer(App)
