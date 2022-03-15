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
} from '@chakra-ui/react'
import { IFoodIngredient } from '../../models/Food'
import { CreatableSelect, GroupBase, OptionBase } from 'chakra-react-select'
import { ingredientTable } from '../../utils/ingredientTable'
import axiosApi from '../../utils/axios-api';
import { GetPresignedUrlResponse } from '../../models/GetPresignedUrlResponse';


type FormFoodIngredient = IFoodIngredient & { isNewIngredient: boolean }
type Props = {}
type FormValues = {
    foodName_: string,
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
    const ingQuantityInputRef = useRef<any>();

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
        console.log('FormData: ', { data })
        // Get img
        const img = data.foodImg_[0];
        // Get upload url
        const res = await axiosApi.FoodImageUploader.getImgUploadUrl();
        const { uploadURL, imageUrl } = res.data as GetPresignedUrlResponse;
        // // Upload to S3
        // const s3Response = await axiosApi.FoodImageUploader.uploadImage(img, uploadURL);
        // console.log(s3Response);
    }
    register('foodIngredients_', { required: true })

    const onAddedIngredient = () => {
        if (!selectedIngredientOption) {
            console.log('Error');
            return; //TODO: display error message at the ingredient adding form
        }
        const newIngredient: FormFoodIngredient = {
            id: selectedIngredientOption.value,
            ingredientQuantity: selectedIngQuantity,
            isNewIngredient: selectedIngredientOption.__isNew__ ?? false
        }
        const currentSelectedIngredients = getValues("foodIngredients_") ?? [];
        setValue("foodIngredients_", [...currentSelectedIngredients, newIngredient])

        //Reset values
        setSelectedIngredientOption(null);
        setSelectedIngQuantity(1)
    }
    const getIngredientName = (id: string): string => {
        return ingredientTable.find(ing => ing.id === id)!.ingredientName;
    }
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
                    <FormLabel>Food Image</FormLabel>
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

                <FormControl mt={3}>
                    <FormLabel htmlFor='food-desc'>Food Description</FormLabel>
                    <Textarea id='food-desc' placeholder='This is how to cook my food' {...register("foodDescription_")} />
                </FormControl>

                <FormLabel mt={3}>Food Ingredients: </FormLabel>
                {watchSelectedIngredients ?
                    watchSelectedIngredients.map(ing => (
                        <Box key={ing.id} as={Flex} borderWidth='1.5px' borderRadius='lg' p={2} justifyContent="space-between">
                            <Text>{getIngredientName(ing.id)}</Text>
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