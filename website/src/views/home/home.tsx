import React, { useEffect } from 'react'
import {Redirect, Route, RouteComponentProps, Switch} from 'react-router-dom';
import FoodThisWeek from '../food-this-week/foodThisWeek';
import { useStore } from '../../store/rootStore';

type IProps = {

} & RouteComponentProps;

const Home: React.FC<IProps> = ({history}) => {
    const {foodStore} = useStore();
    const {loadFood} = foodStore;

    useEffect(()=> {
        loadFood();
    }, [loadFood]);

    return (
        <React.Fragment>
            <header className="App-header" style={{height: '10px'}}></header>
            <Switch>
                <Route exact path="/food-this-week" component={FoodThisWeek} />
                <Redirect from="/" to="food-this-week"/>
            </Switch>
        </React.Fragment>
    )
}

export default Home
