import React, { useEffect, useState } from 'react'
import {Route, RouteComponentProps, Switch} from 'react-router-dom';
import FoodThisWeek from '../food-this-week/foodThisWeek';
import { useStore } from '../../store/rootStore';
import FoodDetail from '../food-detail/foodDetail';
import './home.styles.scss';
type IProps = {

} & RouteComponentProps;

const Home: React.FC<IProps> = ({location}) => {
    const {foodStore} = useStore();
    const {loadFood} = foodStore;
    const [headerTitle, setTitle] = useState('RJ Menu');

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
            
            <Switch>
                <Route exact path="/" component={FoodThisWeek} />
                <Route path="/food-list/:foodId" component={FoodDetail}/>
            </Switch>
        </React.Fragment>
    )
}

export default Home
