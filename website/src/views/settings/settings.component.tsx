import { Button } from '@chakra-ui/react';
import { MDBBtn, MDBContainer } from 'mdb-react-ui-kit'
import { useHistory } from 'react-router-dom';
import { useStore } from '../../store/root-store';
import { NavPath } from '../../utils/nav-path';

const Settings = () => {
    const history = useHistory();
    const { userStore } = useStore();

    const logOutHandler = async () => {
        await userStore.logout();
        history.replace(NavPath.Login);
    }

    return (
        <MDBContainer className="pt-3">
            {
                userStore.isAuthenticated &&
                <MDBBtn rounded size="lg" className='my-2 w-100' color='danger'
                    onClick={logOutHandler}>
                    Logout
                </MDBBtn>
            }
        </MDBContainer >
    )
}

export default Settings
