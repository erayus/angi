import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonProps, useDisclosure } from '@chakra-ui/react';
import React from 'react'

type Props = {
    alertHeader: string,
    alertBody: string,
    actionButtonText: string,
    onConfirmedHandler: () => void;
} & ButtonProps;

const AlertDialogButton: React.FC<Props> = ({ alertHeader, alertBody, actionButtonText, onConfirmedHandler, children, ...rest }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<any>()
    const onConfirmed = () => {
        onConfirmedHandler();
        onClose();
    }
    return (
        <>
            <Button {...rest} onClick={onOpen}>
                {children}
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            {alertHeader}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {alertBody}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={onConfirmed} ml={3}>
                                {actionButtonText}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default AlertDialogButton