
import './App.css';
import { useState, useEffect } from "react";

import { Container, SimpleGrid, Box, Button, Heading, Flex, Spacer } from '@chakra-ui/react';
import { NFT } from "./components/NFT.tsx";
import { Address } from "@web3-ui/components";
import * as NFTOwnershipStatus from "./enums/NFTOwnershipStatus";
import * as wallet from "./components/wallet.js";
import Merkle from "./components/merkletree.js";

const TOKEN_IDS = [0,1,2,3,4,69420]; // This spits out warnings in log but it's fine, we do not care about the unknwon badges


function App() {
/* Lesson learned the hard way: Change state variables only using their set function */
  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedContract, setConnectedContract] = useState(null);
  const [cardsOwnedStatus, setCardsOwnedStatus] = useState(null);
  const [merkle, setMerkle] = useState(null);

  // Cards owned by the connected account
  const [cards, setCards] = useState([]);


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
      
      switch (tokenId) {
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
      getCardsOwned();
    }
  
}
  
 

  const updateNFTArray = () => {
    let cardsArray = [];
    let sortedCardsStatus = NFTOwnershipStatus.sortCards(cardsOwnedStatus);
    for (let i=0; i<sortedCardsStatus.length; i++) {
      let nftComponent = <NFT key={sortedCardsStatus[i].id} tokenId={sortedCardsStatus[i].id} ownedStatus={sortedCardsStatus[i].status} mintingFn={mint}></NFT>;
      cardsArray.push(nftComponent);
    }
    console.log("Create nft arrays");
    setCards(cardsArray);
  }

  const getCardsOwned = async () => {
    console.groupCollapsed('Contract instance');
    console.log(connectedContract);
    console.groupEnd();
    console.groupCollapsed('Owned tokens');
    let ownedstatus = {};
    for (let i=0; i<TOKEN_IDS.length; i++) {
      const id = TOKEN_IDS[i];
      const whitelisted = merkle.isWhitelisted(currentAccount, id);
      
      try {
        const balance = await connectedContract.balanceOf(currentAccount, id)
        console.log(`${id}: ${balance.toString()}`);
        if (balance.toString() !== "0") {
          ownedstatus[id] = NFTOwnershipStatus.Owned;
        } 
        else if (whitelisted) {
          ownedstatus[id] = NFTOwnershipStatus.Mintable;
        } else {
          ownedstatus[id] = NFTOwnershipStatus.NonMintable;
        }
      
      } catch (error) {
        console.error(`Failed to get balance of token ${id} for address ${currentAccount}`);
        console.error(error);
        console.groupEnd();
        return;
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
      Connect to Wallet
      </Button>
    </Container>
    
  );
  
  // Render this when the wallet is connected
  const renderBadgeContainer = () => (

    <Container maxW='container.xl' className="badge-container">
          <SimpleGrid minChildWidth='220px' spacing='30px'>
            {cards}
          </SimpleGrid>
    </Container>
  );

  const renderAddressContainer = () => (
    <Box alignItems='center' w='200px' p='10px' mr='30px' bg='tomato' color='white' borderRadius='lg' boxShadow='lg' bgGradient="linear(to-l, #3c4bbb, #00003b)" >
        <Address value={currentAccount} shortened copiable></Address> 
    </Box>
  )

  return (
    <div className="App">
      <Flex>
        <Spacer />
        {currentAccount !== "" ? renderAddressContainer() : null}
      </Flex>
      <Heading  className='circle' size="2xl" m='50px' color='#0e126e' > Community Achievements </Heading>
      <div >
        {currentAccount === "" ? renderNotConnectedContainer() : renderBadgeContainer()}
      </div>
     
    </div>
  );
}

export default App;
