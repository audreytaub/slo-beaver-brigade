"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Input,
    Textarea,
    Text,
    Select,
    Switch,
    Stack,
    Spacer,
    Flex,
    FormControl,
    FormLabel,
    Button,
    FormErrorMessage,
    Box,
    
} from '@chakra-ui/react';
import { IUser } from "database/userSchema";
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import beaverLogo from '/docs/images/beaver-logo.png';
import { PencilIcon } from "@heroicons/react/16/solid";
import {EmailAddressResource} from "@clerk/types";

interface ChangeEmailProps {
    userData: IUser | null;
    changeProfileEmail: () => void;

}


function ChangeEmail({userData, changeProfileEmail}: ChangeEmailProps) {

    const { isOpen, onOpen, onClose } = useDisclosure();

    const {user} = useUser();
          
      const [user_email, setEmail] = useState('');
      const [updated_email, setUpdatedEmail] = useState('');
      const [confirmed_updated_email, setConfirmedUpdatedEmail] = useState('');

        const [emailError, setEmailError] = useState(false);
        const [emailErrorMessage, setEmailErrorMessage] = useState('');
        const [pendingVerification, setPendingVerification] =  useState(false);
        const [code, setCode] = useState('');
        const [isVerifying, setIsVerifying] = useState(false);
        const [userCreatedEmail, setUserCreatedEmail] = React.useState<EmailAddressResource | undefined>();
        const [isSubmitted, setIsSubmitted] = useState(false);

        // Update state when userData changes
      useEffect(() => {
        if (userData) {
            setEmail(userData.email || '');

        }
    }, [userData]);

        


      // Update 
    
      const handleUpdatedEmailChange = (e: any) => setUpdatedEmail(e.target.value);
      const handleConfirmedUpdatedEmailChange = (e: any) => setConfirmedUpdatedEmail(e.target.value);

    
          
      function handleClose() {
          setEmail(userData?.email || '');
          setIsSubmitted(false);
          onClose();
      };
    
      async function HandleSubmit() {

        // CHECK IF NEW EMAIL AND CONFIRMATION MATCH
        if (updated_email != confirmed_updated_email) {
            setEmailError(true);
            setEmailErrorMessage("Emails must match");
            return;
        } 

        // Check if Email is not the one currently in use

        if (updated_email === user_email) {
            setEmailError(true);
            setEmailErrorMessage("New email must be entered");
            return;
        }

        setEmailError(false);

        // VERIFY NEW EMAIL

        if (user == null) {
            return;
        }


    
          try {
            // PREPARE VERIFICATION

            const createdEmail = await user.createEmailAddress({
                email: updated_email
            });
    
            if (!createdEmail) {
                return;
            }

            createdEmail.prepareVerification({ strategy: 'email_code'});

            setPendingVerification(true);
            setUserCreatedEmail(createdEmail);
        
           
          } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            let error = err.errors[0];
            setEmailErrorMessage(error.message);
            setEmailError(true);
      }
            
          
        }

        const onVerifyCode = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsVerifying(true);


            try {
                const finishedVerification = await userCreatedEmail?.attemptVerification({
                    code,
                  });

                if (finishedVerification?.verification.status === "verified") {
                    // UPDATE MONGO FOR NEW EMAIL
                    const response = await fetch(`/api/profile/${userData?._id}/email/`, {
                         method: "PATCH",
                        headers: {
                        "Content-Type": "application/json",
                        },
                         body: JSON.stringify(updated_email),
                     });

                     setIsVerifying(false);
                     setPendingVerification(false);
                     handleClose();
                     changeProfileEmail();
                } else {
                    console.error(JSON.stringify(finishedVerification, null, 2))

                }

                  

            } catch (err: any) {

                console.error("An errror has occured", err);
                return;

            }


        }

    return ( <>
        <Button 
        onClick={onOpen} 
        fontFamily={"Lato"} 
        variant={"link"} 
        rightIcon={ <PencilIcon  style = {{ height: '15px', width: '15px'}}/>}
        style = {{ color: 'white', fontWeight: 'bold', padding: '0%', margin: '5px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '17px'}}
        >
        Change Email
        </Button>

        {!pendingVerification && <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
        <ModalOverlay />
        <ModalContent fontFamily="Lato" borderRadius="10px">
            <ModalHeader bg='#337774' color='white' fontWeight='bold' position='relative' borderRadius="10px 10px 0px 0px">
            Change Email
            </ModalHeader>
            <ModalCloseButton color='white' size='l' marginTop='15px' marginRight='5px'/>    

            <ModalBody>
            <Stack spacing={4}>

                <FormControl isInvalid={isSubmitted} mt={2}>
                <FormLabel color='grey' fontWeight='bold'>Old Email</FormLabel>
                <Input placeholder='' fontWeight='bold' value={user_email} readOnly />
                </FormControl>

                <FormControl isInvalid={emailError}> 
                <FormLabel color='grey' fontWeight='bold'>New Email</FormLabel>             
                <Input required={true} placeholder='' type="email" fontWeight='bold' onChange={handleUpdatedEmailChange}/>
                <FormErrorMessage>{emailErrorMessage}</FormErrorMessage>
                </FormControl>

                <Stack spacing={0}>
                <FormControl isInvalid={emailError}>
                    <FormLabel color='grey' fontWeight='bold'>Confirm New Email</FormLabel>
                    <Input required={true} placeholder='' type="email" fontWeight='bold' onChange={handleConfirmedUpdatedEmailChange}/>
                </FormControl>
                </Stack>

            </Stack>
            </ModalBody>

            <ModalFooter display={"flex"} justifyContent={"space-between"}>
            <Button onClick={handleClose}
                >
                Close
            </Button>
            <Button 
                onClick={HandleSubmit}
                colorScheme="yellow"
                fontFamily="Lato"
                >
                Confirm
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>}
        {pendingVerification && (
        <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
        <ModalOverlay>
            <ModalContent fontFamily="Lato" borderRadius="10px" padding="20px 20px 20px 20px">
                <Box mt={8} mb={8}>
                    <Flex
                    textAlign='center'
                    justifyContent='flex-start'
                    flexDirection='column'
                    alignItems='center'
                    >
                    <Image src={beaverLogo} alt='beaver' />
                    <Text
                        mt={12}
                        fontFamily='Lato'
                        fontWeight='600'
                        fontSize={'24px'}
                    >
                        Verification code sent to
                        <br />
                        {updated_email}
                    </Text>
                    </Flex>
                </Box>
                <Box mt={12} fontFamily='Lato'>
                    <FormControl mb={2} isRequired>
                    <FormLabel fontWeight='600'>Email Verification Code</FormLabel>
                    <Input
                        type='text'
                        placeholder='123456'
                        variant='filled'
                        onChange={(e) => setCode(e.target.value)}
                    />
                    </FormControl>
                    <Box display={'flex'} flexDirection={['column', 'row']} justifyContent={['center', 'space-between']} alignItems={['center', 'space-between']}>
                    <Button
                        bg='#e0af48'
                        _hover={{ bg: '#C19137' }}
                        color='black'
                        w='150px'
                        mt={2} mr={0} mb={2} ml={0}
                        onClick={() => {
                        setPendingVerification(false);
                        }}
                    >
                        Back
                    </Button>
                    <FormControl w='150px' mt={2} mr={0} mb={2} ml={0}>
                        <Button
                        loadingText='Verifying'
                        isLoading={!pendingVerification}
                        bg='#e0af48'
                        _hover={{ bg: '#C19137' }}
                        color='black'
                        w='150px'
                        onClick={onVerifyCode}
                        >
                        Verify Email
                        </Button>
                        <FormErrorMessage>
                        Error has occured in server. Please contact email:
                        hack4impact@calpoly.edu
                        </FormErrorMessage>
                    </FormControl>
                    </Box>
                </Box>
            </ModalContent>
          </ModalOverlay>
          </Modal>
        
      )}
  </>);




}

export default ChangeEmail;