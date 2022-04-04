import './App.css';
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure 
} from '@chakra-ui/react'
import { Container, SimpleGrid,AspectRatio, Box, Button, Heading, Flex, Spacer, Stack, Link, Text, Image, Center, IconButton } from '@chakra-ui/react';
import { InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { NFT } from "./components/NFT.tsx";
import { HelpPopover } from './components/HelpPopover.tsx';
import { Address } from "@web3-ui/components";
import * as NFTOwnershipStatus from "./enums/NFTOwnershipStatus";
import * as wallet from "./components/wallet.js";
import Merkle from "./components/merkletree.js";
import brochure from "./resources/pdf/Brochure2.pdf"
import mvpen from "./resources/pdf/MVP_EN.pdf"
import mvpro from "./resources/pdf/MVP_RO.pdf"
import ReactCountryFlag from "react-country-flag"
import metamaskIcon from "./resources/img/metamask.svg"
import polygonIcon from "./resources/img/polygon.svg"
import githubIcon from "./resources/img/github.svg"
import tokens from "./json/tokens.json";
import { logger } from "./components/logger.js";

function App() {
/* Lesson learned the hard way: Change state variables only using their set function */
  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedContract, setConnectedContract] = useState(null);
  const [cardsOwnedStatus, setCardsOwnedStatus] = useState(null);
  const [merkle, setMerkle] = useState(null);
  const [baseUri, setBaseUri] = useState(null);
  // Cards owned by the connected account
  const [cards, setCards] = useState([]);


  const [selectedPdf, setSelectedPdf] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure();


  // Helper middleware function
  const checkWalletConnection = async () =>
  {
    await wallet.checkIfWalletIsConnected(setCurrentAccount,setConnectedContract);
  }

  // Initialise merkle trees and do wallet connection
  useEffect( () => {
    setMerkle(new Merkle());
    checkWalletConnection();
  }, []);


  // Trigget getting of badges owned only when both the contract and merkel instance has been initialised
  useEffect(() => {
    if (connectedContract !== null && merkle !== null && currentAccount !== "") {
      getCardsOwned();
    }
    // eslint-disable-next-line
  }, [connectedContract, currentAccount, merkle])


  // Trigger the creation of the badges for rendering only after the ownership of the badges has been decided
  useEffect( () => {
    if (cardsOwnedStatus !== null) {
      updateNFTArray();
    }
    // eslint-disable-next-line
  }, [cardsOwnedStatus]);   
  

  const mint = async (tokenId, setLoading) => {
    logger.log("trying to mint: ", tokenId); 
    await checkWalletConnection();
    let nftTx;
    let tx;

    try {
      const proof = merkle.getHexProof(currentAccount, tokenId);
      
      switch (parseInt(tokenId)) {
        case 0:
          nftTx = await connectedContract.mintBootstrapper(proof);
          break;
        case 1:
          nftTx = await connectedContract.mintVeteran(proof);
          break;
        case 2:
          nftTx = await connectedContract.mintAdopter(proof);
          break;
        case 3:
          nftTx = await connectedContract.mintSustainer(proof);
          break;
        case 4:
          nftTx = await connectedContract.mintBeliever(proof);
          break;
        default:
          alert("You are trying to mint a non-existent token.");
      }
      
			logger.log('Minting....', nftTx.hash);
      setLoading(true);
    } catch (error) {
      alert((error.data ? error.data.message : null) ?? error.message ?? "Unsupported error");
      return;
    } 


    try{    
      tx = await nftTx.wait();
      logger.log('Minted!', tx);  
      
    } catch (error) {
      logger.error(`Failed to mint token ${tokenId} for address ${currentAccount}`);
      alert((error.data ? error.data.message : null) ?? error.message ?? "Unsupported error");
    }
    finally {
      await getCardsOwned();
      window.location.reload();
    }
  
}
  
 

  const updateNFTArray = () => {
    let collection = [];

    let sortedCardsStatus = NFTOwnershipStatus.sortCards(cardsOwnedStatus);
    for (let key in sortedCardsStatus) {
      let value = sortedCardsStatus[key]
      let cardsArray = []
      for (let i=0; i<value.length; i++) {
        let nftComponent = <NFT key={"nft_"+value[i].id+"_"+i} tokenId={value[i].id} ownedStatus={value[i].status} mintingFn={mint} baseUri={baseUri}></NFT>
        cardsArray.push(nftComponent);
      }
      collection.push(<Heading as='h4' size="lg" mt='30px' mb='2' textAlign='left' color='white' isTruncated key={"collection_name_"+key}>{key}</Heading>)      
      collection.push(<SimpleGrid key={"collection_"+key} minChildWidth='120px' spacing='100px'>{cardsArray}</SimpleGrid>)
      setCards(collection);
    }
    
    logger.log("Create nft arrays");
    logger.log(collection);
    setCards(collection);
  }


  

  const getCardsOwned = async () => {
    logger.groupCollapsed('Contract instance');
    logger.log(connectedContract);
    logger.groupEnd();
    logger.groupCollapsed('Owned tokens');


    // Do batch balance checking for each collection to be displayed
    let copies = {}

    for (let name in tokens.collectionName) {
      let TOKEN_IDS = tokens.collectionName[name];
      try {
        let reqAccounts = Array(TOKEN_IDS.length).fill(currentAccount)
        copies[name] = await connectedContract.balanceOfBatch(reqAccounts, TOKEN_IDS)
        logger.log(copies)
        if (baseUri === null) {
          let tokenURI = await connectedContract.uri(0)
          setBaseUri(tokenURI.replace(/{id}.json/, ""))  // extract baseUrl: from "ipfs.com/CID/1.json"  to  "ipfs.com/CID/"
        }
      } catch (error) {
        logger.error(`Failed to get balance of tokens for address ${currentAccount}.`);
        logger.error(error);
        logger.groupEnd();
        return;
      }
    }
    


    let ownedstatus = {};
    for (let name in tokens.collectionName) {
      let TOKEN_IDS = tokens.collectionName[name];
      ownedstatus[name] = ownedstatus[name] ?? [];
      
        
      
      for (let i=0; i<TOKEN_IDS.length; i++) {
        const id = TOKEN_IDS[i];
        const whitelisted = merkle.isWhitelisted(currentAccount, id);
        
        let status = {};
        status['id'] = id;
        if (parseInt(copies[name][i]) !== 0) {
          
          status['status'] = NFTOwnershipStatus.Owned
        } 
        else if (whitelisted) {
          status['status'] = NFTOwnershipStatus.Mintable;
        } else {
          status['status'] = NFTOwnershipStatus.NonMintable;
        }   
        
        ownedstatus[name].push(status)
      }
    }
    logger.groupEnd();  
    setCardsOwnedStatus(ownedstatus);    
  }    


  // Render this when the wallet is not connected
  const renderNotConnectedContainer = () => (
    <Container>
      <Button
        onClick={checkWalletConnection}
        size='md'
        height='48px'
        width='200px'
        border='2px'
      >
        <Image src={metamaskIcon} w='10' mr='2'></Image>
      Connect Wallet
      </Button>
    </Container>
    
  );
  
  // Render this when the wallet is connected
  const renderBadgeContainer = () => (

    <Container maxW='container.xl' className="badge-container">
          {cards}
    </Container>
  );

  const renderAddressContainer = () => (
    
    <Box alignItems='center' w='200px' p='8px' bg='tomato' color='white' borderRadius='lg' boxShadow='lg' bgGradient="linear(to-l, #3c4bbb, #00003b)" >
        <Address value={currentAccount} shortened copiable></Address> 
    </Box>
  )

 

  const showPdf = (pdf) =>
  {
    setSelectedPdf(pdf);
    onOpen();
  }

  return (
    <div className="App">
      <Modal isOpen={isOpen} onClose={onClose} min-height='200px' min-width='300px' size='4xl' isCentered motionPreset="scale" scrollBehavior="outside" allowPinchZoom>
        <ModalOverlay bg='blackAlpha.600'
                        backdropFilter='auto'
                        backdropBlur='20px'/>
        <ModalContent>
              <AspectRatio ratio={1}>
                <iframe title="Pdf" src={selectedPdf}/>
              </AspectRatio> 
        </ModalContent>
      </Modal>

      <Container maxW='container.xl' pb='3'>
        <Flex flexWrap={'wrap'}>
          <HelpPopover/> 
          <Button mx='2' onClick={() => showPdf(brochure)} colorScheme='blue' leftIcon={<InfoIcon/>} variant={'ghost'}>Brochure</Button>

          <Button variant={'ghost'} colorScheme='blue' onClick={() => showPdf(mvpen)} aria-label="EN Vision" fontSize={'lg'} ><ReactCountryFlag countryCode="GB" svg title='GB'/>&nbsp;Vision</Button>
          <Button variant={'ghost'} colorScheme='blue' onClick={() => showPdf(mvpro)} aria-label='RO Viziune' fontSize={'lg'} ><ReactCountryFlag countryCode="RO" title="RO" svg />&nbsp;Viziune</Button>
          <Spacer />         
          {currentAccount !== "" ? renderAddressContainer() : null}
          {currentAccount !== "" ? <IconButton size='md' colorScheme='red' variant='ghost' icon={<ExternalLinkIcon/>} onClick={()=>setCurrentAccount("")}/> : null}

        </Flex>
        <Heading size="xl" m='30px' color='#0e126e' isTruncated >  Stakeborg Community Achievements </Heading>
        <Heading size="lg" mb='30px' color='gray.700' fontStyle='italic' isTruncated >"One for All and All for DAO" </Heading>
        <div >
          {currentAccount === "" ? renderNotConnectedContainer() : renderBadgeContainer()}
        </div>
      </Container>

      <Container as="footer" role="contentinfo" pt={{ base: '12', md: '15vh' }}>
        <Stack spacing={{ base: '4', md: '2' }}>
          <Center>
              <Text fontSize="sm" color="purple.300" isTruncated >
                <Image w='5' src={polygonIcon} float='left'/> &nbsp;
                <Link href={'https://polygonscan.com/address/'+wallet.CONTRACT_ADDRESS_V2} isExternal>
                  {wallet.CONTRACT_ADDRESS_V2}
                </Link>
              </Text>
          </Center>
          <Center>
              <Text fontSize="sm" isTruncated >
                <Image w='5' src={githubIcon} float='left'/> &nbsp;
                <Link href='https://github.com/Stakeborg-Community/badges-frontend' isExternal> Badges Frontend </Link>
              </Text>
          </Center>
              
          <Text fontSize="sm" color="subtle" isTruncated>
            &copy; {new Date().getFullYear()} Stakeborg DAO - Bring Web3.
          </Text>
        </Stack>
      </Container>
    </div>
  );
}

export default App;
