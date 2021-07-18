import React, { useEffect, useState } from 'react'
import {Route, RouteComponentProps, Switch, useHistory} from 'react-router-dom';
import FoodThisWeek from '../food-this-week/foodThisWeek';
import { useStore } from '../../store/rootStore';
import FoodDetail from '../food-detail/foodDetail';
import './home.styles.scss';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import ToBuyList from '../to-buy-list/toBuyList.component';
type IProps = {

} & RouteComponentProps;

const Home: React.FC<IProps> = ({location}) => {
    const {foodStore} = useStore();
    const {loadFood} = foodStore;
    const [headerTitle, setTitle] = useState('RJ Menu');
    const history = useHistory();

    useEffect(()=> {
        loadFood();
    });
    
    useEffect(()=> {
        if (location.pathname.includes('food-list/')) {
            setTitle('Food Detail')
        } else if (location.pathname.includes('/')) {
            setTitle('Food This Week')
        }
    }, [location.pathname]);

    

    return (
        <React.Fragment>
            <header className="header">
                <h1>{headerTitle}</h1>
            </header>
            <MDBBtn className="to-buy-btn"  size='lg' floating tag='a' onClick={() => history.push('/to-buy-list')}>
                <MDBIcon fas icon="cart-arrow-down"  />
            </MDBBtn>
            <Switch>
                <Route exact path="/" component={FoodThisWeek} />
                <Route path="/food-list/:foodId" component={FoodDetail}/>
                <Route path="/to-buy-list" component={ToBuyList}/>
                
            </Switch>
        </React.Fragment>
    )
}

export default Home
