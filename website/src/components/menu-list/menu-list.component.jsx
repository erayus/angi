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
                key={menuItem.id}
                id={menuItem.id}
                name={menuItem.name}
                imgUrl={menuItem.imgUrl}
                ingredients={menuItem.ingredients}
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
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      imgUrl: PropTypes.string.isRequired,
      ingredients: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  )
}

export default MenuList
