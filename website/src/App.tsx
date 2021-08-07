import React, { useEffect } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import FoodThisWeek from './views/food-this-week/foodThisWeek';
import { useStore } from './store/rootStore';
import FoodDetail from './views/food-detail/foodDetail';
import './App.styles.scss';
import ToBuyList from './views/to-buy-list/toBuyList.component';
import { observer } from 'mobx-react-lite';
import NavFooter from './components/nav-footer/nav-footer.component';
import Header from './components/header/header.component';
import { NavPath } from './shared/nav-path';

const App: React.FC = () => {
    const { foodStore } = useStore();
    const { appStore } = useStore();
    const { loadFood } = foodStore;
    const history = useHistory();

    useEffect(() => {
        loadFood();
        foodStore.initializeFoodThisWeek();
    }, [foodStore, loadFood]);

    return (
        <React.Fragment>
            <Header/>
            {/* {appStore.showToBuyListButton
                ? <MDBBtn className="to-buy-btn" size='lg' floating tag='a' onClick={() => history.push('/to-buy-list')}>
                    <MDBIcon fas icon="cart-arrow-down" />
                </MDBBtn>
                : null
            } */}
            <div className="main" >
                <Switch>
                    <Route exact path={'/' + NavPath.FoodThisWeek} component={FoodThisWeek} />
                    <Route path={`/${NavPath.FoodDetails}/:foodId`}component={FoodDetail} />
                    <Route path={`/${NavPath.ToBuyList}`} component={ToBuyList} />
                    <Redirect from="/" to={NavPath.FoodThisWeek} />
                </Switch>
            </div>
            <NavFooter />
        </React.Fragment>
    )
}

export default observer(App)
