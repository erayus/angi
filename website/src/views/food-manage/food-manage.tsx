import { Box } from '@chakra-ui/react';
import React from 'react'
import FoodAdd from '../../components/food-add/food-add';

type Props = {}

const FoodManage: React.FC<Props> = (props: Props) => {
    return (
        <Box p={4}>
            <FoodAdd />
        </Box>
    )
}

export default FoodManage