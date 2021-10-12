import { MDBBtn, MDBContainer } from 'mdb-react-ui-kit'
import React from 'react'
import { useHistory } from 'react-router-dom';

const Settings = () => {
    const history = useHistory();
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
        </MDBContainer>
    )
}

export default Settings
