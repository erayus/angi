import React, { useEffect, useState } from 'react';
import { ReactNode, useRef } from 'react'
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { FiFile } from 'react-icons/fi'
import { AiOutlineReload } from 'react-icons/ai'

import {
    Button,
    Icon,
    InputGroup,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Image
} from '@chakra-ui/react'

type Props = {}
type FormValues = {
    file_: FileList
}

const FoodAdd = (props: Props) => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>()
    const [previewImages, setPreviewImages] = useState<string[]>();
    const watchImages = watch("file_", undefined); // you can supply default value as second argument

    useEffect(() => {
        if (!watchImages) {
            // setPreviewImages(undefined)
            return
        }
        console.log(watchImages);
        const previewImgObjUrls: string[] = [];
        for (let img of watchImages) {
            const objectUrl = URL.createObjectURL(img)
            previewImgObjUrls.push(objectUrl);
        }
        setPreviewImages([...previewImgObjUrls])

        // free memory when ever this component is unmounted
        return () => { previewImgObjUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl)) }
    }, [watchImages])


    const validateFiles = (value: FileList) => {
        if (value.length < 1) {
            return 'Files is required'
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

    const onSubmit = (data: any) => {
        console.log('On Submit: ', data)
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl isInvalid={!!errors.file_} isRequired>
                    <FormLabel>{'File input'}</FormLabel>

                    {previewImages && previewImages.map(img => (
                        <Image key={img} src={img} />
                    ))}

                    <FileUpload
                        accept={'image/*'}
                        multiple
                        register={register('file_', { validate: validateFiles })}
                    // handleSelectedImage={onSelectImage}
                    >
                        <Button leftIcon={<Icon as={!previewImages || previewImages.length === 0 ? FiFile : AiOutlineReload} />}>
                            {!previewImages || previewImages.length === 0 ? 'Upload' : 'Select another image'}
                        </Button>
                    </FileUpload>

                    <FormErrorMessage>
                        {errors.file_ && errors?.file_.message}
                    </FormErrorMessage>
                </FormControl>

                <Button type="submit" >Submit</Button>
            </form>
        </>
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