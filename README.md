
# Smart Menu

## Database

### **Food table**

- IFood[]

### **Ingredient table**

- IIngredient[]

### **User table**

- user_id: string

- menu: IFood

```ts
    food_id: string,
    food_name: string,
    food_category: IFoodCategory,
    img_url: string,
    food_ingredients: {
      id: number,
      category: IIngredientCategory,
      name: string,
      unit: IUnit,
    }

```

- renew_date: string

- category_quantity:

  ```ts
    category1: number,
    category2: number,
    category3: number
  ```

- to_buy_list : ToBuyIngredient[]

## Test plan

### Food This Week

- Food This Week should display three categories.

### To Buy List

- Each ingredient should be checked when clicked on.

- On page reload when user is viewing the ToBuyList page, the state of to-buy-list ingredients should be remained the same.

- After ticking the ToBuyList ingredients and the user navigate to different views, on page reload => the state of to-buy-list ingredients should be remained the same.

- When the the user modifies the Menu list => refresh the page => go to ToBuyList view => a new ToBuyList should be generated.

## Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

- Ensure you have aws credential to the erayus account.
- Deploy `npm run deploy`
### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
