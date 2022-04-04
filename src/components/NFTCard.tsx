import "./NFT.css";
import * as NFTOwnershipStatus from "../enums/NFTOwnershipStatus.js";
import {
  Button,
  Box,
  Image,
  Alert,
  Text,
  AlertIcon,
  Progress,
  Container,
  Grid,
  GridItem,
  VStack,
  StackDivider,
  Heading,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import {
  Modal,  
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure 
} from '@chakra-ui/react'
import { useState } from "react";
// @ts-ignore
import { PlaceholderNFT } from "./PlaceholdeNFT.tsx";


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
    const descriptionLines = data?.description?.split("\n");
    const ownedStatus = data?.ownedStatus;
    const tokenId = data?.tokenId;
    const attributes = data?.attributes;
  
    const [imageLoaded, setImageLoaded] = useState(false);
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
  
    let commonImageClasses = ownedStatus?.description ?? "";
    let button;

    if (ownedStatus === NFTOwnershipStatus.Mintable)
    {
      button = <Button color='white' my="3" className="nftButton" boxShadow='md' backgroundColor='#0c8af2' variant='solid'  loadingText='Minting...'  onClick={mint} isLoading={loading} isDisabled={ownedStatus === NFTOwnershipStatus.NonMintable}>
                Mint
              </Button>;
    }

    let palceholder = PlaceholderNFT(commonImageClasses, size);

    const image = <Image className={commonImageClasses + ' hoverglow'}  src={data?.image} fallback={palceholder} onLoad={()=>setImageLoaded(true)} borderRadius="xl" w={size} loading="lazy" boxShadow='2xl'/>;
    //const imageReflected = <Skeleton><Image className={commonImageClasses  + ' reflection'}  src={data?.image} borderRadius="2xl" w={size} loading="lazy"/>;
    const imageModal = <Image  src={data?.image} px='10px' pb='5px' borderRadius="xl" fallback={palceholder} w={size} loading="lazy" />;
  
  
  
  
    const modal = <Modal isOpen={isOpen} onClose={onClose} size={'3xl'} isCentered motionPreset="scale" scrollBehavior="inside" allowPinchZoom>
          <ModalOverlay bg='blackAlpha.600'
                        backdropFilter='auto'
                        backdropBlur='10px'/>
          <ModalContent>
            <ModalHeader py='2' textAlign={'center'} fontWeight='900' lineHeight='tight'> <Heading as='h1' size='lg' >{name} </Heading><Divider w='50%' mx='25%' pt='2' /></ModalHeader>
              
            <ModalCloseButton />
            <ModalBody>
                <Grid templateRows='repeat(1, 1fr)' templateColumns='repeat(5, 1fr)'gap={5}>
                  <GridItem rowSpan={1} colSpan={2}>
                    {imageModal}
                  </GridItem>

                  <GridItem rowSpan={1} colSpan={3}>
                      <Accordion allowToggle allowMultiple defaultIndex={[0,1]}>
                        <AccordionItem borderStyle='none'>
                            <AccordionButton>
                              <Heading flex='1' size='md'>Description</Heading>
                              <AccordionIcon />
                            </AccordionButton>
                          <AccordionPanel pb={4} textAlign={'center'}>
                          {descriptionLines && descriptionLines.map((line, i) =>
                            {return <Text key={line+'_'+ tokenId + '_' + i}>{line} <br/></Text>}
                          )}
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
  // eslint-disable-next-line
    return (
      <Skeleton isLoaded={imageLoaded}>
        <Box maxW={size} borderRadius='lg' >
          
          <a href="#p" onClick={onOpen}>
            {image}
            {modal}
          </a>
  
          {button}
          
        </Box>
        </Skeleton>
    );
  };
  
  