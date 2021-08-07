import { MDBCol, MDBIcon, MDBRow } from 'mdb-react-ui-kit'
import React from 'react'
import { useHistory } from 'react-router-dom';
import './nav-footer.styles.scss';
const NavFooter = () => {
    const history = useHistory();

    return (
        <MDBRow id="nav-footer" >
            <MDBCol className="nav-footer-item d-flex align-items-center justify-content-center" onClick={() => history.push('/')}>
                <MDBIcon fas icon="utensils" />
            </MDBCol>
            <MDBCol className="nav-footer-item  d-flex align-items-center justify-content-center" onClick={() => history.push('/to-buy-list')}>
                <MDBIcon fas icon="list" />            
            </MDBCol>
        </MDBRow>
    )
}

export default NavFooter