import React from 'react'
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
} from '@chakra-ui/react'

type Props = {}

const FoodAdd = (props: Props) => {
    return (
        <FormControl>
            <FormLabel htmlFor='email'>Email address</FormLabel>
            <Input id='email' type='email' />
            <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
    )
}

export default FoodAdd