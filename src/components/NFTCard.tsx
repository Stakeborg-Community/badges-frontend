import "./NFT.css";
import * as NFTOwnershipStatus from "../enums/NFTOwnershipStatus.js";
import {
  Button,
  Box,
  Image,
  Alert,
  Text,
  AlertIcon,
  ModalCloseButton,
  ModalHeader,
  Progress,
  Container,
  SimpleGrid,
  Grid,
  GridItem,
  ModalFooter,
  Stack,
  VStack,
  StackDivider,
  Heading,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure 
} from '@chakra-ui/react'


export interface NFTData {
    tokenId: string;
    image?: string;
    name?: string;
    attributes: Array<any>;
    description: string;
    ownedStatus: Symbol;
  }
  

/**
 * Private component to display an NFT given the data
 */
 export const NFTCard = ({
    data,
    errorMessage = '',
    size = 'lg',
    mintingFn,
    loading,
    setLoading
  }: {
    data: NFTData | undefined | null;
    errorMessage?: string | undefined;
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
    mintingFn: Function;
    loading: boolean;
    setLoading: Function;
  }) => {
    const name = data?.name;
    const description = data?.description;
    const ownedStatus = data?.ownedStatus;
    const tokenId = data?.tokenId;
    const attributes = data?.attributes;
  
    const { isOpen, onOpen, onClose } = useDisclosure();
    const mint = () =>
    {
      mintingFn(tokenId, setLoading);
    }
  
  
    if (errorMessage) {
      return (
        <Alert status="error">
          <AlertIcon />
          {errorMessage}
        </Alert>
      );
    }
  
    let commonImageClasses = ownedStatus?.description;
    let button;
    if (ownedStatus !== NFTOwnershipStatus.Owned && tokenId != '9999')
    {
      button = <Button color='white' my="3" className="nftButton" boxShadow='md' backgroundColor='#0c8af2' variant='solid'  loadingText='Minting...'  onClick={mint} isLoading={loading} isDisabled={ownedStatus === NFTOwnershipStatus.NonMintable}>
                Mint
              </Button>;
    }
    const image = <Image className={commonImageClasses + ' hoverglow'}  src={data?.image} fallbackSrc='https://via.placeholder.com/150' borderRadius="xl" w={size} loading="lazy" boxShadow='2xl'/>;
    //const imageReflected = <Image className={commonImageClasses  + ' reflection'}  src={data?.image} borderRadius="2xl" w={size} loading="lazy"/>;
  
    const imageModal = <Image  src={data?.image} fallbackSrc='https://via.placeholder.com/150' borderRadius="xl" w={size} loading="lazy" />;
  
  
  
  
    const modal = <Modal isOpen={isOpen} onClose={onClose} size={'3xl'} isCentered motionPreset="scale" scrollBehavior="inside" allowPinchZoom>
          <ModalOverlay bg='blackAlpha.600'
                        backdropFilter='auto'
                        backdropBlur='10px'/>
          <ModalContent>
            <ModalHeader textAlign={'center'} fontWeight='900' lineHeight='tight'> <Heading as='h1' size='xl'>{name}</Heading></ModalHeader>
            <ModalCloseButton />
            <ModalBody mb='3'>
                <Grid templateRows='repeat(1, 1fr)' templateColumns='repeat(2, 1fr)'gap={5}>
                  <GridItem rowSpan={1} colSpan={1}>
                    {imageModal}
                  </GridItem>

                  <GridItem rowSpan={1} colSpan={1}>
                      <Accordion allowToggle allowMultiple defaultIndex={[0]}>
                        <AccordionItem borderStyle='none'>
                            <AccordionButton>
                              <Heading flex='1' size='md'>Description</Heading>
                              <AccordionIcon />
                            </AccordionButton>
                          <AccordionPanel pb={4} textAlign={'center'}>
                          {description}
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem borderStyle='none'>
                            <AccordionButton>
                              <Heading flex='1' size='md'>Attributes</Heading>
                              <AccordionIcon />
                            </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack divider={<StackDivider borderColor='gray.200' />}>
                              {
                                attributes && attributes.map((attribute, i) =>
                                    <Container key={'attribute_'+ tokenId + '_' + i}>              
                                      <Text> {attribute.trait_type}: {attribute.value}</Text>
                                      
                                      {attribute.max_value &&
                                        <Progress colorScheme={'orange'} size='md' borderRadius={'4px'} hasStripe isAnimated value={attribute.value/attribute.max_value*100} /> 
                                      }
                              
                                    </Container>  
                                )
                              }
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                  </GridItem>
                </Grid>
            </ModalBody>
           
          </ModalContent>
        </Modal>
  
    return (
        <Box maxW={size} borderRadius='lg' >
          
          <a href="#" onClick={onOpen}>
            {image}
            {modal}
          </a>
  
          {button}
          
        </Box>
  
    );
  };
  
  