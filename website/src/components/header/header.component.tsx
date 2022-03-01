import { MDBIcon } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import './header.styles.scss';
import { NavPath } from '../../utils/nav-path';
import { useStore } from '../../store/root-store';
import { observer } from 'mobx-react-lite';
import { generateStringFormatDate } from '../../utils/renewTime'

const Header = () => {
    const [headerTitle, setHeaderTitle] = useState<string>();
    const [displayBackBtn, setDisplayBackBtn] = useState(false);
    const { userStore, foodStore } = useStore();
    const { isAuthenticated } = userStore;
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        let backBtnFlag = false;

        if (location.pathname.includes(NavPath.Menu)) {
            setHeaderTitle('Menu')
        } else if (location.pathname.includes(NavPath.FoodDetails)) {
            backBtnFlag = true;
            setHeaderTitle('Food Details')
        } else if (location.pathname.includes(NavPath.ToBuyList)) {
            setHeaderTitle('To Buy List')
        }
        else {
            setHeaderTitle('Smart Menu')
        }

        setDisplayBackBtn(backBtnFlag)
        return () => {

        }
    }, [location])

    const renewDate = isAuthenticated && (<p>Renew date: {foodStore.menu?.renewDateTimestamp ? generateStringFormatDate(foodStore.menu?.renewDateTimestamp!) : null}</p>);

    return (
        <header className="header pt-2">
            {
                displayBackBtn
                    ? <MDBIcon
                        className="back-btn"
                        fas
                        icon="arrow-left"
                        size='2x'
                        onClick={() => history.goBack()}
                    />
                    : null
            }
            <h1>{headerTitle}</h1>
            {renewDate}

        </header>
    )
}

export default observer(Header)
