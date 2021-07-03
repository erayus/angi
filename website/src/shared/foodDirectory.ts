import { FoodCategory, IFood } from '../models/food';

export const FoodDirectory: IFood[] = [
      {
        id: 1,
        name: 'Braised Pork with Shrimp paste',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Shallot', 'Spring onions', 'Garlic', 'Chilli', 'Shrimp paste', 'Lemongrass'],
      },
      {
        id: 2, 
        name: 'BBQ Pork',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly'],
      }, 
      {
        id: 3, 
        name: 'Braised Pork with Pineapple',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Pineapple', 'Shallot', 'Garlic'],
      },
      {
        id: 4, 
        name: 'Kho quet',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Pork belly', 'Shallot', 'Garlic'],
      },
      {
        id: 5, 
        name: 'Pork and Egg steamed cake/loaf ',
        category: FoodCategory.Main,
        imgUrl: '',
        ingredients: ['Mince pork', 'Eggs', 'Mushroom', 'Onion'],
      }
]