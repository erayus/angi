import { Box, Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import FoodManage from '../../components/food-manage/food-manage';


type Props = {}

const FoodStorage: React.FC<Props> = (props: Props) => {
    return (
        <FoodManage/>
    )
}

export default FoodStorage