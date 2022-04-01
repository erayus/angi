import { Box, FormControl, FormLabel, Input } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Redirect } from 'react-router-dom'
import useAddMenu from '../../hooks/menu/useAddMenu'
import useMenu from '../../hooks/menu/useMenu'
import { Food, IUserFoodCategoryQuantity } from '../../models/Food'
import { NavPath } from '../../utils/nav-path'

type Props = {}
type MenuCreationFormValues = {
    food_: Food[]
    renewPeriod_: number
    foodCategoryQuanty_: IUserFoodCategoryQuantity[]
    checkedIngredientIds_: string[]
}

const MenuCreate = (props: Props) => {
    const { register, handleSubmit, getValues, setValue, formState: { errors }, watch } = useForm<MenuCreationFormValues>()
    const { mutate } = useAddMenu();
    const { data: menu, error: errorLoadingMenu, isLoading: isLoadingMenu } = useMenu();

    const onMenuCreationSubmitted = () => {

    }
    const menuCreationForm = (
        <form onSubmit={handleSubmit(onMenuCreationSubmitted)}>
            <FormControl isRequired mt={3}>
                <FormLabel htmlFor='food-name'>Food Name</FormLabel>
                <Input id='food-name' placeholder='Example Food' {...register("renewPeriod_")} />
            </FormControl>
        </form>
    )

    return (
        <Box p={3}>
            {
                menu &&
                <Redirect
                    to={{
                        pathname: `${NavPath.Menu}`,
                    }}
                />
            }
            {menuCreationForm}
        </Box>
    )
}

export default MenuCreate