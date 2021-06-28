import React from 'react'
import { useContext } from 'react';
import { useState } from 'react';
import  MenuList  from '../../components/menu-list/menu-list.component';
import { menuContext } from '../../App';
const Home = (props) => {
    const menuItems = useContext(menuContext);

    return (
        <MenuList menuItems={menuItems}/>
    )
}

export default Home
