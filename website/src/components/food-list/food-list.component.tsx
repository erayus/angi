import React from 'react'
import FoodItem from '../food-item/food-item.component'
import { IFood } from '../../models/food';

type IProps = {
  foodList: IFood[]
}

const FoodList: React.FC<IProps> = (props) => {


    return (
      <div>
        {
          props.foodList.map(food => {
            return (
              <FoodItem
                key={food.id}
                id={food.id}
                name={food.name}
                category={food.category}
                imgUrl={food.imgUrl}
                ingredients={food.ingredients}
              />
            )
          })
        }
      </div>
    )
}

export default FoodList;
