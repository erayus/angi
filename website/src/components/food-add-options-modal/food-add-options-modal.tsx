import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { useHistory } from 'react-router-dom';
import { NavPath } from '../../utils/nav-path';

type Props = {}

const FoodAddOptionsModal = (props: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const history = useHistory();

    const onOptionChosen = () => { }

    return (
        <>
            <Button width="100%" onClick={onOpen}>Add Food</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Food Add Options</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Button w="100%" onClick={() => history.push(`/${NavPath.FoodAdd}`)} >
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