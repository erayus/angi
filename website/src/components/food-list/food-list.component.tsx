import React from 'react'
import FoodItem from './food-item/food-item.component'
import { IFood } from '../../models/food';

export type FoodListOptionalProps = {
  enableIngredientChipsDisplay?: boolean;
  enableViewDetails?: boolean;
  enableFoodChange?: boolean;
  onFoodChangeBtnClicked?: (foodId: number) => void
}

export type ViewDetailsProps = {
  enableViewDetails?: boolean;
}
export type FoodChangeProps = {
  enableFoodChange?: boolean;
  onFoodChangeBtnClicked?: (foodId: number) => void
} 


type IProps = {
  foodList: IFood[];
} & FoodListOptionalProps;

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
                enableViewDetails={props.enableViewDetails}
                enableFoodChange={props.enableFoodChange}
                onFoodChangeBtnClicked={props.onFoodChangeBtnClicked}
                enableIngredientChipsDisplay={props.enableIngredientChipsDisplay}
              />
            )
          })
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
