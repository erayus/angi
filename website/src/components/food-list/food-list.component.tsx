import React from 'react'
import FoodItem from './food-item/food-item.component';
import { FoodProjection } from '../../store/food-store';

export type FoodListOptionalProps = {
  enableIngredientChipsDisplay?: boolean
  enableViewDetails?: boolean
  enableFoodRemove?: boolean
  enableFoodChange?: boolean
  onFoodItemSelected?: (id: string) => void
  onFoodChangeBtnClicked?: (foodId: string) => void
  onFoodRemoveBtnClicked?: (foodId: string) => void
}


type IProps = {
  foodList: FoodProjection[];
} & FoodListOptionalProps;

const FoodList: React.FC<IProps> = (props) => {
  return (
    <div>
      {
        props.foodList.length > 0 ?
          props.foodList.map(food => {
            return (
              <div
                className="my-3"
                key={food.id}>
                <FoodItem
                  id={food.id}
                  name={food.name}
                  category={food.category}
                  imgUrl={food.imgUrl}
                  ingredients={food.ingredients}
                  enableViewDetails={props.enableViewDetails}
                  onFoodItemSelected={props.onFoodItemSelected}
                  enableFoodRemove={props.enableFoodRemove}
                  enableFoodChange={props.enableFoodChange}
                  onFoodChangeBtnClicked={props.onFoodChangeBtnClicked}
                  onFoodRemoveBtnClicked={props.onFoodRemoveBtnClicked}
                  enableIngredientChipsDisplay={props.enableIngredientChipsDisplay}
                />
              </div>

            )
          })
          : "No food to display."
      }
    </div>
  )
}

FoodList.defaultProps = {
  enableIngredientChipsDisplay: false,
  enableViewDetails: false,
  enableFoodRemove: false,
  enableFoodChange: false
}

export default FoodList;
