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
    Select,
    Switch,
    Stack,
    Spacer,
    Flex,
    FormControl,
    FormLabel
  } from '@chakra-ui/react'
import { IUser } from '@database/userSchema';
import { Button } from '@styles/Button'
import React, {useState, useEffect} from 'react';

const EditProfile = ({userData}: {userData: IUser}) => {   
    
    const { isOpen, onOpen, onClose } = useDisclosure(); // button open/close
        
    const [user_firstName, setFirstName] = useState(userData?.firstName);
    const [user_lastName, setLastName] = useState(userData?.lastName);
    const [user_email, setEmail] = useState(userData?.email);
    const [user_phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber);
    const [user_receiveNewsletter, setReceiveNewsletter] = useState(userData?.recieveNewsletter); // Corrected variable name
    //const [user_zipcode, setZipcode] = useState(userData.zipcode); 
    // Zipcode data not yet enabled on mongo

    const handleFirstNameChange = (e: any) => setFirstName(e.target.value);
    const handleLastNameChange = (e: any) => setLastName(e.target.value);
    const handleEmailChange = (e: any) => setEmail(e.target.value);
    const handlePhoneNumberChange = (e: any) => setPhoneNumber(e.target.value);
    //const handleZipcodeChange = (e: any) => setZipcode(e.target.value);
    
    const handleReceiveNewsletter = (e: any) => {
      const selectedOption = e.target.value;
      const receiveNewsletter = selectedOption === 'yes' ? true : false;
      setReceiveNewsletter(receiveNewsletter);
    };      


    const [isSubmitted, setIsSubmitted] = useState(false);
    
    function handleClose() {
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setEmail(userData.email);
        setPhoneNumber(userData.phoneNumber);
        setReceiveNewsletter(userData.recieveNewsletter);
        //setZipcode(userData.zipcode);

        setIsSubmitted(false);
        onClose();
    };

    async function HandleSubmit() {
        const updatedUserData = {
          firstName: user_firstName,
          lastName: user_lastName,
          email: user_email,
          phoneNumber: user_phoneNumber,
          receiveNewsletter: user_receiveNewsletter
        };
    
        console.log("New User Data:", updatedUserData);
        try {
          const response = await fetch(`/api/profile/${userData._id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUserData),
          });
          if (response.ok) {
            setIsSubmitted(true);
            handleClose();
            // Refresh the page after OK response 
            window.location.reload();
          } else {
     
            console.error("Failed to update user data");
          }
        } catch (error) {
          console.log("Error editing user:", error);
        }
      }

    return(
        <>
          <Button onClick={onOpen} style = {{border: 'none', color: 'white', fontWeight: 'normal', padding: '0%', margin: '5px',
                                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '16px'}}>
            Edit Details
          </Button>
    
          <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader bg='#006d75' color='white' fontWeight='bold' position='relative'>
                Edit Profile
              </ModalHeader>
              <ModalCloseButton color='white' size='l' marginTop='15px' marginRight='5px'/>    
    
              <ModalBody>
                <Stack spacing={4}>
    
                  <FormControl isInvalid={user_firstName === '' && isSubmitted}>
                    <FormLabel color='grey' fontWeight='bold'>First Name</FormLabel>
                    <Input placeholder='' fontWeight='bold' value={user_firstName} onChange={handleFirstNameChange}/>
                  </FormControl>
    
                  <FormControl isInvalid={user_lastName === '' && isSubmitted}> 
                    <FormLabel color='grey' fontWeight='bold'>Last Name</FormLabel>             
                    <Input placeholder='' fontWeight='bold' value={user_lastName} onChange={handleLastNameChange}/>
                  </FormControl>

                  <Stack spacing={0}>
                    <FormControl isInvalid={user_phoneNumber === '' && isSubmitted}>
                      <FormLabel color='grey' fontWeight='bold'>Phone Number</FormLabel>
                      <Input placeholder='' fontWeight='bold' value={user_phoneNumber} onChange={handlePhoneNumberChange}/>
                    </FormControl>
                  </Stack>
                  {/*}
                  <Stack spacing={0}>
                    <FormControl isInvalid={user_email === '' && isSubmitted}>
                        <FormLabel color='grey' fontWeight='bold'>Email Address</FormLabel>
                      <Input fontWeight='bold' value={user_email} onChange={handleEmailChange}/>
                    </FormControl>
                  </Stack>
                */}
                
                  <Stack spacing={0}>
                    <FormControl isInvalid={user_receiveNewsletter && isSubmitted}>
                      <FormLabel color='grey' fontWeight='bold'>Receive Newsletter Email</FormLabel>
                      <Select
                        placeholder='Select option'
                        color='grey'
                        value={user_receiveNewsletter ? 'yes' : 'no'}
                        onChange={handleReceiveNewsletter}
                      >
                        <option value='yes'>Yes</option>
                        <option value='no'>No</option>
                      </Select>
                    </FormControl>
                  </Stack>
    
                </Stack>
              </ModalBody>
    
              <ModalFooter>
                <Button onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={HandleSubmit}>
                    Confirm
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>      
      )
    
};

export default EditProfile;