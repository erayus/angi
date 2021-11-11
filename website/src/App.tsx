import React, { useEffect } from 'react'
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import Menu from './views/menu/menu';
import FoodDetail from './views/food-detail/foodDetail';
import './App.styles.scss';
import ToBuyList from './views/to-buy-list/toBuyList.component';
import { observer } from 'mobx-react-lite';
import NavFooter from './components/nav-footer/nav-footer.component';
import Header from './components/header/header.component';
import { NavPath } from './utils/nav-path';
import Settings from './views/settings/settings.component';
import { useStore } from './store/root-store';
import SignUp from './components/sign-up/sign-up.component';
import Login from './components/log-in/log-in.component';
import Loader from './components/loader/loader';

const App: React.FC = () => {
    const {foodStore, userStore} = useStore();
    const {userLoading, loadAuthenticatedUser, isAuthenticated} = userStore;

    useEffect(() => {
        // userStore.authenticate("Raymond", "123");
        loadAuthenticatedUser();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            foodStore.initializeFoodThisWeek();
        }
    }, [foodStore, isAuthenticated])

        /**
     * Returns a redirect to login page with the current path in its state
     * User will be redirected to current path after loging in
     */
    const getRedirectToLogin = (props: RouteComponentProps) => (
            <Redirect
                push
                to={{
                    pathname: NavPath.Login,
                    state: { fromPathName: props.location.pathname }
                }}
            />
    );


    return !userLoading ? (
        <React.Fragment>
            <Header />
            {/* {appStore.showToBuyListButton
                ? <MDBBtn className="to-buy-btn" size='lg' floating tag='a' onClick={() => history.push('/to-buy-list')}>
                    <MDBIcon fas icon="cart-arrow-down" />
                </MDBBtn>
                : null
            } */}
            <div className="main" >
                <Switch>
                    <Route
                        exact
                        path={'/' + NavPath.Menu}
                        render={ props =>  isAuthenticated ? <Menu/> : getRedirectToLogin(props)}/>
                    <Route path={`/${NavPath.FoodDetails}/:foodId`} component={FoodDetail} />
                    <Route
                        path={`/${NavPath.ToBuyList}`}
                        render={ props =>  isAuthenticated ? <ToBuyList/> : getRedirectToLogin(props)}/>
                    <Route
                        path={`/${NavPath.Settings}`}
                        render={ props =>  isAuthenticated ? <Settings/> : getRedirectToLogin(props)} />
                    <Route exact path={'/' + NavPath.SignUp}  component={SignUp} />
                    <Route exact path={'/' + NavPath.Login} component={Login} />
                <Redirect from="/" to={NavPath.Menu} />
                </Switch>
            </div>
            <NavFooter />
        </React.Fragment>
    ) : <Loader/>
}

export default observer(App)
