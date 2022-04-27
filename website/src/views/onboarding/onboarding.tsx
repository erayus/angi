import React from 'react'
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import MenuCreate from '../menu-create/menu-create';
import FoodManage from '../food-manage/food-manage';
import FoodAddOptionsModal from '../../components/food-add-options-modal/food-add-options-modal';
import { Box, Button } from '@chakra-ui/react';
import { NavPath } from '../../utils/nav-path';

type Props = {}

const Onboarding = (props: Props) => {
    let { path, url } = useRouteMatch();

    return (
        <Switch>
            <Route exact path={path} render={props => (
                <Box p={3}>
                    <FoodManage />
                    <FoodAddOptionsModal />
                    <Link to={`${url}/${NavPath.MenuCreate}`}>
                        <Button mt={5} isFullWidth colorScheme='green'>Next</Button>
                    </Link>
                </Box>
            )} />
            <Route path={`${path}/${NavPath.MenuCreate}`} >
                <MenuCreate/>
            </Route>
        </Switch>
    )
}

export default Onboarding