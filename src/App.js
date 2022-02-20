import './App.css';
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalOverlay,
  useDisclosure 
} from '@chakra-ui/react'
import { Container, SimpleGrid,AspectRatio, Box, Button, Heading, Flex, Spacer, Stack, ButtonGroup, Link, Text, Image, Center } from '@chakra-ui/react';
import { AttachmentIcon, InfoIcon, ExternalLinkIcon, createIcon  } from '@chakra-ui/icons'
import { NFT } from "./components/NFT.tsx";
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



const Logo = require('./resources/img/sbdao.png')
const TOKEN_IDS = [0,1,2,3,4,9999,9999,9999,9999,9999]; // This spits out warnings in log but it's fine, we do not care about the unknwon badges


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
    new Merkle().then((result) => setMerkle(result));
    checkWalletConnection();
  }, []);


  // Trigget getting of badges owned only when both the contract and merkel instance has been initialised
  useEffect(() => {
    if (connectedContract !== null && merkle !== null && currentAccount != "") {
      getCardsOwned();
    }
  }, [connectedContract, currentAccount, merkle])


  // Trigger the creation of the badges for rendering only after the ownership of the badges has been decided
  useEffect( () => {
    if (cardsOwnedStatus !== null) {
      updateNFTArray();
    }
  }, [cardsOwnedStatus]);   
  

  const mint = async (tokenId, setLoading) => {
    console.log("trying to mint: ", tokenId); 
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
      
			console.log('Minting....', nftTx.hash);
      setLoading(true);
    } catch (error) {
      alert((error.data ? error.data.message : null) ?? error.message ?? "Unsupported error");
      return;
    } 


    try{    
      tx = await nftTx.wait();
      console.log('Minted!', tx);  
      
    } catch (error) {
      console.error(`Failed to mint token ${tokenId} for address ${currentAccount}`);
      alert((error.data ? error.data.message : null) ?? error.message ?? "Unsupported error");
    }
    finally {
      await getCardsOwned();
      window.location.reload();
    }
  
}
  
 

  const updateNFTArray = () => {
    let cardsArray = [];
    let sortedCardsStatus = NFTOwnershipStatus.sortCards(cardsOwnedStatus);
    for (let i=0; i<sortedCardsStatus.length; i++) {
      let nftComponent = <NFT key={sortedCardsStatus[i].id} tokenId={sortedCardsStatus[i].id} ownedStatus={sortedCardsStatus[i].status} mintingFn={mint} baseUri={baseUri}></NFT>;
      cardsArray.push(nftComponent);
    }
    console.log("Create nft arrays");
    console.log(cardsArray);
    setCards(cardsArray);
  }


  

  const getCardsOwned = async () => {
    console.groupCollapsed('Contract instance');
    console.log(connectedContract);
    console.groupEnd();
    console.groupCollapsed('Owned tokens');


    // Pentru a nu apela blockchain-ul in loops si a fi mai eficient, le extragen o singura data
    let copies = []

    try {
      let reqAccounts = Array(TOKEN_IDS.length).fill(currentAccount)
      copies = await connectedContract.balanceOfBatch(reqAccounts, TOKEN_IDS)
      console.log(copies)
      let tokenURI = await connectedContract.uri(0)
      setBaseUri(tokenURI.replace(/{id}.json/, ""))  // reg. expr. pt a extrege baseUrl: de ex. din "ipfs.com/CID/1.json" devine "ipfs.com/CID/"
    } catch (error) {
      console.error(`Failed to get balance of tokens for address ${currentAccount}.`);
      console.error(error);
      console.groupEnd();
      return;
    }


    let ownedstatus = {};
    for (let i=0; i<TOKEN_IDS.length; i++) {
      const id = TOKEN_IDS[i];
      const whitelisted = merkle.isWhitelisted(currentAccount, id);
      
      if (parseInt(copies[i]) !== 0) {
        ownedstatus[id] = NFTOwnershipStatus.Owned;
      } 
      else if (whitelisted) {
        ownedstatus[id] = NFTOwnershipStatus.Mintable;
      } else {
        ownedstatus[id] = NFTOwnershipStatus.NonMintable;
      }       
    }
    console.groupEnd();  
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
          <SimpleGrid minChildWidth='150px' spacing='30px'>
            {cards}
          </SimpleGrid>
    </Container>
  );

  const renderAddressContainer = () => (
    <Box alignItems='center' w='200px' p='10px' mr='30px' bg='tomato' color='white' borderRadius='lg' boxShadow='lg' bgGradient="linear(to-l, #3c4bbb, #00003b)" >
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
              <AspectRatio ratio={4/3}>
                <iframe src={selectedPdf}/>
              </AspectRatio> 
        </ModalContent>
      </Modal>

      <Container maxW='container.xl' pb='3'>
        <Flex flexWrap={'wrap'}>
        <Button mx='2' onClick={() => showPdf(brochure)} colorScheme='blue' leftIcon={<InfoIcon/>} variant={'ghost'}>Brochure</Button>

          <ButtonGroup isAttached variant={'ghost'} colorScheme='blue'>
            <Button onClick={() => showPdf(mvpen)} aria-label="EN Version" fontSize={'lg'} >Mission, Vission and Pillars |&nbsp; <ReactCountryFlag countryCode="GB" svg title='GB'/></Button>
            <Button onClick={() => showPdf(mvpro)} aria-label='RO Version' fontSize={'lg'} ><ReactCountryFlag countryCode="RO" title="RO" svg /></Button>
          </ButtonGroup>
          <Spacer />
          {currentAccount !== "" ? renderAddressContainer() : null}
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
                <Link href={'https://mumbai.polygonscan.com/address/'+wallet.CONTRACT_ADDRESS_V2} isExternal>
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
