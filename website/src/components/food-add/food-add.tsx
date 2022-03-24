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
	Box,
	Flex,
	Text,
	Badge,
	Select,
} from '@chakra-ui/react'
import { Food, IFoodIngredient, FoodCategory } from '../../models/Food';
import { OptionBase } from 'chakra-react-select'
import axiosApi from '../../utils/axios-api';
import { GetPresignedUrlResponse } from '../../models/GetPresignedUrlResponse';
import { AddItemRequestPayload } from '../../models/RequestPayload';
import _ from 'lodash';
import { Ingredient } from '../../models/Ingredient';
import AddIngredientModal from '../add-ingredient-modal/add-ingredient-modal';

export type FormFoodIngredient = IFoodIngredient & Ingredient & { isNewIngredient: boolean }
export interface IngredientOption extends OptionBase {
	label: string;
	value: string;
}
type Props = {}
type FormValues = {
	foodName_: string,
	foodCategory_: FoodCategory,
	foodImg_: FileList,
	foodDescription_: string,
	foodIngredients_: FormFoodIngredient[],
}


const FoodAdd = (props: Props) => {
	const { register, handleSubmit, getValues, setValue, formState: { errors }, watch } = useForm<FormValues>()
	const [previewImages, setPreviewImages] = useState<string[]>();
	const watchImages = watch("foodImg_", undefined); // you can supply default value as second argument

	const watchAddedIngredients = watch("foodIngredients_", []); // you can supply default value as second argument

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
			const img = data.foodImg_[0];
			const res = await axiosApi.FoodImageUploader.getImgUploadUrl();
			const { uploadURL, imageUrl } = res.data as GetPresignedUrlResponse;
			await axiosApi.FoodImageUploader.uploadImage(img, uploadURL);


			const newIngredients: Ingredient[] = data.foodIngredients_.filter(ing => ing.isNewIngredient).map(ing => {
				return {
					id: ing.id,
					ingredientName: ing.ingredientName,
					ingredientCategory: '', //TODO
				} as Ingredient
			});
			if (newIngredients.length > 0) {
				const addIngredientRequestPayload: AddItemRequestPayload<Ingredient> = {
					payloadType: 'ingredient',
					payloadBody: newIngredients
				};
				await axiosApi.Ingredient.add(addIngredientRequestPayload);
			}

			const foodIngredients: IFoodIngredient[] = data.foodIngredients_.map(formFoodIng => {
				return {
					id: formFoodIng.id,
					ingredientQuantity: formFoodIng.ingredientQuantity
				}
			});
			const addItemRequestPayload: AddItemRequestPayload<Food> = {
				payloadType: 'food',
				payloadBody: [{
					id: _.toString(Math.round(Math.random() * 100000000000)),
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

	const onAddedIngredientHandler = (formFoodIngredient: FormFoodIngredient) => {
		const currentSelectedIngredients = getValues("foodIngredients_") ?? [];
		console.log({ formFoodIngredient });
		setValue("foodIngredients_", [...currentSelectedIngredients, formFoodIngredient])
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
				{watchAddedIngredients ?
					watchAddedIngredients.map(ing => (
						<Box key={ing.id} as={Flex} borderWidth='1.5px' borderRadius='lg' p={2} my={1} justifyContent="space-between">
							<Text>{ing.ingredientName}</Text>
							<Box>
								<Badge mr={2} px={2} borderRadius='md' colorScheme='green'>{ing.ingredientQuantity}</Badge>
								<Icon as={BsFillTrashFill} color='red.500' onClick={() => removeAddedIngredient(ing.id)} />
							</Box>
						</Box>
					))
					: 'Please use the form below to add ingredients for your new food'}
				<AddIngredientModal
					currentAddedIngredientIds={watchAddedIngredients?.map(ing => ing.id)}
					onAddedIngredient={onAddedIngredientHandler}
				/>
				<Button mt={5} type="submit" width="100%" colorScheme="green" >Submit</Button>
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