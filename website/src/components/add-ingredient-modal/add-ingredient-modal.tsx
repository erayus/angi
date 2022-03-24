import { Box, Button, FormControl, FormLabel, Grid, GridItem, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useDisclosure } from '@chakra-ui/react';
import { CreatableSelect, GroupBase } from 'chakra-react-select';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';

import { FormFoodIngredient, IngredientOption } from '../food-add/food-add';
import { useQuery } from 'react-query';
import { Ingredient } from '../../models/Ingredient';
import axiosApi from '../../utils/axios-api';

type IProps = {
  currentAddedIngredientIds: string[],
  onAddedIngredient: (addedIngredient: FormFoodIngredient) => void;
}

const AddIngredientModal: React.FC<IProps> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>();
  const [selectedIngredientOption, setSelectedIngredientOption] = useState<any>();
  const [selectedIngQuantity, setSelectedIngQuantity] = useState<number>(1);
  const selectedIngCategoryRef = useRef<any>();
  const selectedIngUnitRef = useRef<any>();
  const { isLoading, error, data } = useQuery<Ingredient[]>("ingredient", async () => (await axiosApi.Ingredient.list()));

  if (isLoading) {
    console.log('loading')
  }

  if (error) {
    console.log((error as Error).message)
  }
  useEffect(() => {
    console.log({ data });
    if (!data) {
      return;
    }
    const ingOptions = data.map(ing => {
      return {
        label: ing.ingredientName,
        value: ing.id
      }
    });
    setIngredientOptions(ingOptions);
  }, [data])

  const addIngredient = () => {
    var selectedIngCategory = selectedIngCategoryRef?.current?.value ?? '';
    var selectedIngUnit = selectedIngUnitRef?.current?.value ?? '';
    const isNewIngredient = selectedIngredientOption.__isNew__ ?? false;

    const addedIngredient: FormFoodIngredient = {
      id: isNewIngredient ? _.toString(Math.round(Math.random() * 100000000000)) : selectedIngredientOption.value,
      ingredientQuantity: selectedIngQuantity,
      ingredientName: selectedIngredientOption.label,
      ingredientCategory: selectedIngCategory,
      ingredientUnit: selectedIngUnit,
      isNewIngredient: isNewIngredient
    }

    // TODO: Create an object (addedIngredient) that contains all properties of an Ingredient
    props.onAddedIngredient(addedIngredient);

    if (selectedIngCategory || selectedIngUnit) {
      selectedIngCategoryRef!.current.value = '';
      selectedIngUnitRef!.current.value = '';
    }
    setSelectedIngredientOption(null);
    setSelectedIngQuantity(1);
    onClose();
  }
  return (
    <>
      <Button mt={2}
        py={1}
        onClick={onOpen}
        width='100%'>
        Add Ingredient
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Ingredient</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              <FormControl as={GridItem} isRequired>
                <FormLabel htmlFor='food-ingredients'>Ingredient Name:</FormLabel>
                <CreatableSelect<
                  IngredientOption,
                  true,
                  GroupBase<IngredientOption>
                >
                  onChange={opt => setSelectedIngredientOption(opt)}
                  value={selectedIngredientOption}
                  name="food-ing"
                  options={ingredientOptions}
                  placeholder="Ingredient"
                  closeMenuOnSelect={true}
                  filterOption={(opt, inputValue) => {
                    if (!inputValue) {
                      return true && !props.currentAddedIngredientIds.includes(opt.value);
                    }
                    return opt.label.includes(inputValue) && !props.currentAddedIngredientIds.includes(opt.value);
                  }}
                />
              </FormControl>

              <FormControl as={GridItem} isRequired>
                <FormLabel htmlFor='food-ingredients'>Ingredient Quantity:</FormLabel>
                <NumberInput min={1} onChange={e => setSelectedIngQuantity(+e)} value={selectedIngQuantity}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper> </NumberInput>
              </FormControl>

              {selectedIngredientOption?.__isNew__ &&
                <FormControl as={GridItem}>
                  <FormLabel htmlFor='ingredient-category'>Ingredient Category:</FormLabel>
                  <Input id='ingredient-category' placeholder='vetgetable' ref={selectedIngCategoryRef} />
                </FormControl>
              }

              {selectedIngredientOption?.__isNew__ &&
                <FormControl as={GridItem}>
                  <FormLabel htmlFor='ingredient-unit'>Ingredient Unit:</FormLabel>
                  <Input id='ingredient-unit' placeholder='gram' ref={selectedIngUnitRef} />
                </FormControl>
              }

              <Box
                as={GridItem}
                colSpan={2}
              >

              </Box>

            </Grid>
          </ModalBody>

          <ModalFooter>

            <Button
              variant='solid'
              colorScheme='green'
              isDisabled={!selectedIngredientOption}
              onClick={addIngredient}
              width="100%"
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default observer(AddIngredientModal);
