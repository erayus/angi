import { useHistory, useLocation } from 'react-router-dom';
import './nav-footer.styles.scss';
import { NavPath } from '../../utils/nav-path';
import { Center, Flex, Icon } from '@chakra-ui/react';
import { GiKnifeFork } from 'react-icons/gi';
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
                <Icon as={BiFoodMenu} style={{ color: shouldBeHighlighted(NavPath.Menu) ? '#00C853' : 'black' }} />
            </Center>
            <Center className="nav-footer-item" w="30%" onClick={() => history.push(`/${NavPath.FoodManage}`)}>
                <Icon as={GiKnifeFork} style={{ color: shouldBeHighlighted(NavPath.FoodManage) ? '#00C853' : 'black' }} />
            </Center>
            <Center className="nav-footer-item" w="30%" onClick={() => history.push(`/${NavPath.Settings}`)}>
                <Icon as={AiFillSetting} style={{ color: shouldBeHighlighted(NavPath.Settings) ? '#00C853' : 'black' }} />
            </Center>
        </Flex>
    )
}

export default NavFooter