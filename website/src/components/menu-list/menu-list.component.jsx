import React from 'react'
import PropTypes from 'prop-types';
import MenuItem from '../menu-item/menu-item.component'
const MenuList = (props) => {
    return (
      <div>
        {
          props.menuItems.map(menuItem => {
            return (
              <MenuItem
                key={menuItem.itemName} 
                itemImg={menuItem.itemImg}
                itemName={menuItem.itemName}
                itemIngredients={menuItem.itemIngredients}
              />
            )
          })
        }
      </div>
    )
}

MenuList.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({ 
      itemImg: PropTypes.string.isRequired,
      itemName: PropTypes.string.isRequired,
      itemIngredients: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  )
}

export default MenuList
