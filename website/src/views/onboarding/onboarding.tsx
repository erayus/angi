import React from 'react'
import { Link, Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import MenuCreate from '../menu-create/menu-create';
import FoodStorage from '../food-storage/food-storage';
import FoodAddOptionsModal from '../../components/food-add-options-modal/food-add-options-modal';
import { Box, Button } from '@chakra-ui/react';
import { NavPath } from '../../utils/nav-path';
import { useEffect } from 'react';

type Props = {}

type locationState = {
    fromPath: string
}

const Onboarding = (props: Props) => {
    let { path, url } = useRouteMatch();
    const location = useLocation<locationState>();
    const history = useHistory();

    return (
        <Switch>
            <Route exact path={path} render={props => (
                <Box p={3}>
                    <FoodStorage />
                    <FoodAddOptionsModal />
                    <Link to={`${url}/${NavPath.MenuCreate}`}>
                        <Button mt={5} isFullWidth colorScheme='green'>Next</Button>
                    </Link>
                </Box>
            )} />
            <Route path={`${path}/${NavPath.MenuCreate}`} >
                <MenuCreate />
            </Route>
        </Switch>
    )
}

export default Onboarding