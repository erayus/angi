import React from 'react'
import FoodItem from './food-item/food-item.component'
import { IFood } from '../../models/food';

type IProps = {
  foodList: IFood[];
  onFoodChangeBtnClicked: (foodId: number) => void
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
                onFoodChangeBtnClicked={props.onFoodChangeBtnClicked}
              />
            )
          })
        }
      </div>
    )
}

export default FoodList;
