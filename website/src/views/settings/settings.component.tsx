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
            {/* <MDBBtn rounded size="lg" className='my-2 w-100' color='warning'
                onClick={() => {
                    localStorage.removeItem(userId!);
                    history.push("/");
                    window.location.reload();
                }}>
                Refresh
            </MDBBtn> */}

            <Button colorScheme={'green'} size="lg" className='my-2 w-100'
                onClick={() => history.replace(NavPath.FoodManage)
                }>
                Manage Food Storage
            </Button>

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
