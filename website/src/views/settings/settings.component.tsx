import { MDBBtn, MDBContainer } from 'mdb-react-ui-kit'
import { useHistory } from 'react-router-dom';
import { useStore } from '../../store/root-store';

const Settings = () => {
    const history = useHistory();
    const {userStore} = useStore();

    return (
        <MDBContainer className="pt-3">
            <MDBBtn rounded size="lg" className='my-2 w-100' color='danger'
                onClick={() => {
                    localStorage.clear();
                    history.push("/");
                    window.location.reload();
                }}>
                Refresh
            </MDBBtn>
        { userStore.isAuthenticated &&
            <MDBBtn rounded size="lg" className='my-2 w-100' color='danger'
                onClick={() => {
                    userStore.logout();
                }}>
                Logout
            </MDBBtn>
        }
        </MDBContainer>
    )
}

export default Settings
