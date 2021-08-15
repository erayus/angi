import { MDBIcon } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import './header.styles.scss';
import { NavPath } from '../../shared/nav-path';
import { useStore } from '../../store/rootStore';
import { observer } from 'mobx-react-lite';
const Header = () => {
    const [headerTitle, setHeaderTitle] = useState<string>();
    const [displayBackBtn, setDisplayBackBtn] = useState(false);
    const {foodStore} = useStore();
    const location = useLocation();
    const history = useHistory();


    useEffect(() => {
        let backBtnFlag = false;
        
        if (location.pathname.includes(NavPath.FoodThisWeek)) {
            setHeaderTitle('Menu This Week')
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
            <p>Renew date: {foodStore.renewDate}</p>
        </header>
    )
}

export default observer(Header)
