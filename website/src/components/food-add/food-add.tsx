import { ReactNode, useEffect, useState, useRef } from 'react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { FiFile } from 'react-icons/fi';
import { BsFillTrashFill } from 'react-icons/bs';
import { AiOutlineReload } from 'react-icons/ai'
import {
    Button,
    Icon,
    InputGroup,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Image,
    Input,
    Textarea,
    Grid,
    GridItem,
    Box,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Flex,
    Text,
    Badge,
    Select,
} from '@chakra-ui/react'
import { Food, IFoodIngredient, FoodCategory } from '../../models/Food';
import { CreatableSelect, GroupBase, OptionBase } from 'chakra-react-select'
import { ingredientTable } from '../../utils/ingredientTable'
import axiosApi from '../../utils/axios-api';
import { GetPresignedUrlResponse } from '../../models/GetPresignedUrlResponse';
import { AddItemRequestPayload } from '../../models/RequestPayload';
import _ from 'lodash';
import { Ingredient } from '../../models/Ingredient';

type FormFoodIngredient = IFoodIngredient & { ingredientName: string, isNewIngredient: boolean }
type Props = {}
type FormValues = {
    foodName_: string,
    foodCategory_: FoodCategory,
    foodImg_: FileList,
    foodDescription_: string,
    foodIngredients_: FormFoodIngredient[],
}
interface IngredientOption extends OptionBase {
    label: string;
    value: string;
}

const FoodAdd = (props: Props) => {
    const { register, handleSubmit, getValues, setValue, formState: { errors }, watch } = useForm<FormValues>()
    const [previewImages, setPreviewImages] = useState<string[]>();
    const watchImages = watch("foodImg_", undefined); // you can supply default value as second argument

    const [selectedIngQuantity, setSelectedIngQuantity] = useState<number>(1);
    const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>();
    const watchSelectedIngredients = watch("foodIngredients_", []); // you can supply default value as second argument
    const [selectedIngredientOption, setSelectedIngredientOption] = useState<any>();

    useEffect(() => {
        if (!watchImages) {
            // setPreviewImages(undefined)
            return
        }
        const previewImgObjUrls: string[] = [];
        for (let img of watchImages) {
            const objectUrl = URL.createObjectURL(img)
            previewImgObjUrls.push(objectUrl);
        }
        setPreviewImages([...previewImgObjUrls])

        // free memory when ever this component is unmounted
        return () => { previewImgObjUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl)) }
    }, [watchImages])

    useEffect(() => {
        const ingOptions = ingredientTable.map(ing => {
            return {
                label: ing.ingredientName,
                value: ing.id
            }
        });
        setIngredientOptions(ingOptions);
    }, [])


    const validateFoodImage = (value: FileList) => {
        if (value.length < 1) {
            return 'Food Image Is Required'
        }
        for (const file of Array.from(value)) {
            const fsMb = file.size / (1024 * 1024)
            const MAX_FILE_SIZE = 10
            if (fsMb > MAX_FILE_SIZE) {
                return 'Max file size 10mb'
            }
        }
        return true
    }

    const onSubmit = async (data: FormValues) => {
        try {
            // Get img
            const img = data.foodImg_[0];
            // Get upload url
            const res = await axiosApi.FoodImageUploader.getImgUploadUrl();
            const { uploadURL, imageUrl } = res.data as GetPresignedUrlResponse;
            // // Upload to S3
            await axiosApi.FoodImageUploader.uploadImage(img, uploadURL);

            // Construct AddItemRequestPayload to save to dynamodb
            const randomID = Math.round(Math.random() * 100000000000);
            //TODO: loop through data.foodIngredients_ to check for and create new food ingredients
            const newIngredients: Ingredient[] = data.foodIngredients_.filter(ing => ing.isNewIngredient).map(ing => {
                return {
                    id: ing.id,
                    ingredientName: ing.ingredientName,
                    ingredientCategory: '', //TODO
                } as Ingredient
            });
            const addIngredientRequestPayload: AddItemRequestPayload<Ingredient> = {
                payloadType: 'ingredient',
                payloadBody: newIngredients
            };
            await axiosApi.Ingredient.add(addIngredientRequestPayload);

            const foodIngredients: IFoodIngredient[] = data.foodIngredients_.map(formFoodIng => {
                return {
                    id: formFoodIng.id,
                    ingredientQuantity: formFoodIng.ingredientQuantity
                }
            });
            const addItemRequestPayload: AddItemRequestPayload<Food> = {
                payloadType: 'food',
                payloadBody: [{
                    id: _.toString(randomID),
                    foodName: data.foodName_,
                    foodCategory: data.foodCategory_,
                    foodDescription: data.foodDescription_,
                    foodIngredients: foodIngredients,
                    foodImgUrl: imageUrl,
                    isPublic: true
                }]
            }
            await axiosApi.Food.add(addItemRequestPayload);
            console.log('success')
        } catch (e) {
            console.error({ e });
        }
    }
    register('foodIngredients_', { required: true })

    const onAddedIngredient = () => {
        if (!selectedIngredientOption) {
            console.log('Error');
            return; //TODO: display error message at the ingredient adding form
        }
        const isNewIngredient = selectedIngredientOption.__isNew__ ?? false;
        const addedIngredient: FormFoodIngredient = {
            id: isNewIngredient ? _.toString(Math.round(Math.random() * 100000000000)) : selectedIngredientOption.value,
            ingredientQuantity: selectedIngQuantity,
            ingredientName: selectedIngredientOption.label,
            isNewIngredient: isNewIngredient
        }
        console.log({ newIngredient: addedIngredient })
        const currentSelectedIngredients = getValues("foodIngredients_") ?? [];
        setValue("foodIngredients_", [...currentSelectedIngredients, addedIngredient])

        //Reset values
        setSelectedIngredientOption(null);
        setSelectedIngQuantity(1)
    }
    // const getIngredientName = (id: string): string => {
    //     return ingredientTable.find(ing => ing.id === id)!.ingredientName;
    // }
    const removeAddedIngredient = (id: string): void => {
        const currentAddedIngredients = getValues("foodIngredients_") ?? [];
        const newAddedIngredients = currentAddedIngredients.filter(ing => ing.id !== id);
        setValue("foodIngredients_", [...newAddedIngredients]);
    }

    return (
        <Box>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl isRequired mt={3}>
                    <FormLabel htmlFor='food-name'>Food Name</FormLabel>
                    <Input id='food-name' placeholder='Example Food' {...register("foodName_")} />
                </FormControl>

                <FormControl isInvalid={!!errors.foodImg_} isRequired mt={3}>
                    <FormLabel>Food Image:</FormLabel>
                    {previewImages && previewImages.map(img => (
                        <Image key={img} src={img} />
                    ))}
                    <FileUpload
                        accept={'image/*'}
                        multiple
                        register={register('foodImg_', { validate: validateFoodImage })}
                    >
                        <Button leftIcon={<Icon as={!previewImages || previewImages.length === 0 ? FiFile : AiOutlineReload} />}>
                            {!previewImages || previewImages.length === 0 ? 'Upload' : 'Select another image'}
                        </Button>
                    </FileUpload>

                    <FormErrorMessage>
                        {errors.foodImg_ && errors?.foodImg_.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl isRequired mt={3}>
                    <FormLabel>Food Category: </FormLabel>
                    <Select placeholder='Select food category' {...register("foodCategory_")}>
                        <option value="entree">Entree</option>
                        <option value="main">Main</option>
                        <option value="soup">Soup</option>
                        <option value="dessert">Dessert</option>
                    </Select>
                </FormControl>

                <FormControl mt={3}>
                    <FormLabel htmlFor='food-desc'>Food Description</FormLabel>
                    <Textarea id='food-desc' placeholder='This is how to cook my food' {...register("foodDescription_")} />
                </FormControl>

                <FormLabel mt={3}>Food Ingredients: </FormLabel>
                {watchSelectedIngredients ?
                    watchSelectedIngredients.map(ing => (
                        <Box key={ing.id} as={Flex} borderWidth='1.5px' borderRadius='lg' p={2} my={2} justifyContent="space-between">
                            <Text>{ing.ingredientName}</Text>
                            <Box>
                                <Badge mr={2} px={2} borderRadius='md' colorScheme='green'>{ing.ingredientQuantity}</Badge>
                                <Icon as={BsFillTrashFill} color='red.500' onClick={() => removeAddedIngredient(ing.id)} />
                            </Box>
                        </Box>
                    ))
                    : 'Please use the form below to add ingredients for your new food'}
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <FormControl as={GridItem}>
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
                                const currentAddedIngredientIds = getValues("foodIngredients_")?.map(ing => ing.id) ?? []; //TODO: consider initializing this outside for better performance
                                if (!inputValue) {
                                    return true && !currentAddedIngredientIds.includes(opt.value);
                                }
                                return opt.label.includes(inputValue) && !currentAddedIngredientIds.includes(opt.value);
                            }}
                        />
                    </FormControl>
                    <FormControl as={GridItem} >
                        <FormLabel htmlFor='food-ingredients'>Ingredient Quantity:</FormLabel>
                        <NumberInput min={1} onChange={e => setSelectedIngQuantity(+e)} value={selectedIngQuantity}>
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper> </NumberInput>
                    </FormControl>
                    <Box
                        as={GridItem}
                        colSpan={2}
                    >
                        <Button
                            width="100%"
                            colorScheme='green'
                            isDisabled={!selectedIngredientOption}
                            variant="solid"
                            onClick={onAddedIngredient}>
                            Add Ingredient
                        </Button>
                    </Box>

                </Grid>
                <Button type="submit" >Submit</Button>
            </form>
        </Box>
    )
}


type FileUploadProps = {
    register: UseFormRegisterReturn
    accept?: string
    multiple?: boolean
    children?: ReactNode,
}

const FileUpload = (props: FileUploadProps) => {
    const { register, accept, multiple, children } = props
    const inputRef = useRef<HTMLInputElement | null>(null)
    const { ref, ...rest } = register as { ref: (instance: HTMLInputElement | null) => void }

    const handleClick = () => inputRef.current?.click()
    return (
        <InputGroup onClick={handleClick}>
            <input
                type={'file'}
                multiple={multiple || false}
                hidden
                accept={accept}
                {...rest}
                ref={(e) => {
                    ref(e)
                    inputRef.current = e
                }}
            />
            <>
                {children}
            </>
        </InputGroup>
    )
}

export default FoodAdd