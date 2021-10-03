import React from 'react'
import FoodItem from './food-item/food-item.component';
import { IFoodProjection } from '../../store/foodStore';

export type FoodListOptionalProps = {
  enableIngredientChipsDisplay?: boolean;
  enableViewDetails?: boolean;
  enableFoodChange?: boolean;
  onFoodItemSelected?: (id: number) => void;
  onFoodChangeBtnClicked?: (foodId: number) => void
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
                    enableFoodChange={props.enableFoodChange}
                    onFoodChangeBtnClicked={props.onFoodChangeBtnClicked}
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
  enableFoodChange: false
}

export default FoodList;
