import { MDBCol, MDBIcon, MDBRow } from 'mdb-react-ui-kit';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './nav-footer.styles.scss';
import { NavPath } from '../../utils/nav-path';



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
        <MDBRow id="nav-footer" >
            <MDBCol className="nav-footer-item d-flex align-items-center justify-content-center" onClick={() => history.push('/')}>
                <MDBIcon fas icon="utensils" style={{ color: shouldBeHighlighted(NavPath.FoodThisWeek) ? '#00C853' : 'black' }} />
            </MDBCol>
            <MDBCol className="nav-footer-item  d-flex align-items-center justify-content-center" onClick={() => history.push('/to-buy-list')}>
                <MDBIcon fas icon="list" style={{ color: shouldBeHighlighted(NavPath.ToBuyList) ? '#00C853' : 'black' }} />
            </MDBCol>
            <MDBCol className="nav-footer-item  d-flex align-items-center justify-content-center" onClick={() => history.push('/settings')}>
                <MDBIcon fas icon="cogs" style={{ color: shouldBeHighlighted(NavPath.Settings) ? '#00C853' : 'black' }} />
            </MDBCol>
        </MDBRow>
    )
}

export default NavFooter