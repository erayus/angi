import { useHistory, useLocation } from 'react-router-dom';
import './nav-footer.styles.scss';
import { NavPath } from '../../utils/nav-path';
import { Center, Flex, Icon } from '@chakra-ui/react';
import { MdOutlineFoodBank } from 'react-icons/md';
import { BiFoodMenu } from 'react-icons/bi'
import { AiFillSetting } from 'react-icons/ai'

const NavFooter = () => {
    const history = useHistory();
    const location = useLocation();

    const shouldBeHighlighted = (navPath: NavPath) => {
        if (location.pathname.includes(navPath)) {
            return true
        }
        return false;
    }

    return (
        <Flex id="nav-footer" justifyContent="space-between" alignItems="center">
            <Center className="nav-footer-item" w="30%" onClick={() => history.push('/')}>
                <Icon as={BiFoodMenu} boxSize={6} style={{ color: shouldBeHighlighted(NavPath.Menu) ? '#00C863' : 'black' }} />
            </Center>
            <Center className="nav-footer-item" w="30%" onClick={() => history.push(`/${NavPath.FoodManage}`)}>
                <Icon as={MdOutlineFoodBank} boxSize={6} style={{ color: shouldBeHighlighted(NavPath.FoodManage) ? '#00C863' : 'black' }} />
            </Center>
            <Center className="nav-footer-item" w="30%" onClick={() => history.push(`/${NavPath.Settings}`)}>
                <Icon as={AiFillSetting} boxSize={6} style={{ color: shouldBeHighlighted(NavPath.Settings) ? '#00C863' : 'black' }} />
            </Center>
        </Flex>
    )
}

export default NavFooter