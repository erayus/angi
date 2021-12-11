import React from 'react'
import FoodItem from './food-item/food-item.component';
import { IFoodProjection } from '../../store/food-store';

export type FoodListOptionalProps = {
  enableIngredientChipsDisplay?: boolean
  enableViewDetails?: boolean
  enableFoodAction?: boolean
  onFoodItemSelected?: (id: string) => void
  onFoodChangeBtnClicked?: (foodId: string) => void
  onFoodRemoveBtnClicked?: (foodId: string) => void
}


type IProps = {
  foodList: IFoodProjection[];
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
                    enableFoodAction={props.enableFoodAction}
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
  enableFoodAction: false
}

export default FoodList;
