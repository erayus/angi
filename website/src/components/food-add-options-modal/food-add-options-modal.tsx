import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import React from 'react'

type Props = {}

const FoodAddOptionsModal = (props: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const onOptionChosen = () => { }
}
return (
    <>
        <Button onClick={onOpen}>Open Modal</Button>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Food Add Options</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Add Food Manually
                    </Button>
                    {/* <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Add Food From Others
                        </Button> */}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
)
}

export default FoodAddOptionsModal