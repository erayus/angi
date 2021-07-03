import React from 'react'
import { useContext } from 'react';
import { withRouter } from 'react-router'
import { menuContext } from '../../App';
import { MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';


const ItemDetail = ({match}) => {
    // const itemList = useContext(menuContext);
    // const targetItemId = +match.params.itemId;
    // const targetItem = itemList.filter(item => item.id === targetItemId)[0];
    // console.log(targetItem);
    return (
        <div>
            {/* <h3 className="mb-2 p-2">{targetItem.name} 's Ingredients</h3>
            */}
        </div>
    )
}

export default withRouter(ItemDetail)
