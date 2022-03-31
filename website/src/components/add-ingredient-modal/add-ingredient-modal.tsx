import { Box, Button, FormControl, FormLabel, Grid, GridItem, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useDisclosure } from '@chakra-ui/react';
import { CreatableSelect, GroupBase } from 'chakra-react-select';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
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
  const [selectedIngredient, setSelectedIngredient] = useState<FormFoodIngredient>();
  const { isLoading, error, data: ingredients } = useQuery<Ingredient[]>("ingredients", async () => (await axiosApi.Ingredient.list()));

  if (isLoading) {
    console.log('loading')
  }

  if (error) {
    console.log((error as Error).message)
  }
  useEffect(() => {
    if (!ingredients) {
      return;
    }
    const ingOptions = ingredients.map(ing => {
      return {
        label: ing.ingredientName,
        value: ing.id
      }
    });
    setIngredientOptions(ingOptions);
  }, [ingredients])

  const onIngredientSelected = (opt: any) => {
    const selectedIngredientId = opt.value as string;
    const isNewIngredient = opt.__isNew__ ?? false;
    setSelectedIngredient({
      id: isNewIngredient ? _.toString(Math.round(Math.random() * 100000000000)) : selectedIngredientId,
      ingredientQuantity: 1,
      ingredientName: opt.label as string,
      category: isNewIngredient ? '' : getIngredientById(selectedIngredientId)?.category ?? '',
      ingredientUnit: isNewIngredient ? '' : getIngredientById(selectedIngredientId)?.ingredientUnit,
      isNewIngredient: isNewIngredient
    });
  }

  const getIngredientById = (id: string): Ingredient | undefined => {
    return ingredients!.find(ing => ing.id === id);
  }

  const addIngredient = () => {
    props.onAddedIngredient(selectedIngredient!);
    setSelectedIngredient(undefined);
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
            <FormControl mb={3} isRequired>
              <FormLabel htmlFor='food-ingredients'>Ingredient Name:</FormLabel>
              <CreatableSelect<
                IngredientOption,
                true,
                GroupBase<IngredientOption>
              >
                onChange={opt => onIngredientSelected(opt)}
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
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>

              {selectedIngredient &&
                <FormControl as={GridItem} isRequired>
                  <FormLabel htmlFor='food-ingredients'>Quantity:</FormLabel>
                  <NumberInput min={1}
                    value={selectedIngredient?.ingredientQuantity ?? 1}
                    onChange={e => setSelectedIngredient({ ...selectedIngredient, ingredientQuantity: +e })}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper> </NumberInput>
                </FormControl>
              }

              {/* Not Supported For Now */}
              {/* {selectedIngredient &&
                <FormControl as={GridItem}>
                  <FormLabel htmlFor='ingredient-category'>Ingredient Category:</FormLabel>
                  <Input id='ingredient-category' placeholder='vetgetable' value={selectedIngredient.category} onChange={e => setSelectedIngredient({ ...selectedIngredient, category: e.currentTarget.value })} />
                </FormControl>
              } */}

              {selectedIngredient &&
                <FormControl as={GridItem} isRequired={selectedIngredient.isNewIngredient}>
                  <FormLabel htmlFor='ingredient-unit'>Unit:</FormLabel>
                  <Input id='ingredient-unit' placeholder='ex: gram'
                    value={selectedIngredient.ingredientUnit}
                    isDisabled={!selectedIngredient.isNewIngredient}
                    onChange={e => setSelectedIngredient({ ...selectedIngredient, ingredientUnit: e.currentTarget.value })} />
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
              isDisabled={!selectedIngredient}
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
