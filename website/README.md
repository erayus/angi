# Smart Menu

## Database

### Food table

- IFood[]

## Ingredient table

- IIngredient[]

## User table

- userId: number

- foodThisWeekList: nunber[]

- renewDate: string
  
- {category}-quantiy: number

- toBuyList : ToBuyIngredient[]

## Test plan

### Food This Week

- Food This Week should display three categories.

### To Buy List

- Each ingredient should be checked when clicked on.
  
- On page reload when user is viewing the ToBuyList page, the state of to-buy-list ingredients should be remained the same.

- After ticking the ToBuyList ingredients and the user navigate to different views, on page reload => the state of to-buy-list ingredients should be remained the same.

- When the the user modifies the FoodThisWeek list => refresh the page => go to ToBuyList view => a new ToBuyList should be generated.

## Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

- Ensure you have aws credential to the erayus account.
- Deploy `npm run deploy`
### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
