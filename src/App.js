import { ethers } from "ethers";
import SeniorityBadge from "./utils/SeniorityBadge.json"
import './App.css';
import { useState, useEffect } from "react";

import { Container, SimpleGrid, Box, Button, Text, Heading, Flex, Spacer } from '@chakra-ui/react'
import { NFT } from "./components/NFT.tsx";
import { Address } from "@web3-ui/components"

const CONTRACT_ADDRESS = "0xe541fe43f74c3C2111D2499789Dc16808E355a9C";
const TOKEN_IDS = [0,1,2,3,4];

const CARD_OWNED_STATUS = {
  Owned: 'OWNED',
  Mintable: 'MINTABLE',
  NonMintable: 'NON_MINTABLE'
}
let cardOwnedStatus = {}


/* Lesson learned the hard way: Change state variables only using their set function */

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedContract, setConnectedContract] = useState(null);

  // Cards owned by the connected account
  const [ownedCards, setOwnedCards] = useState([]);
  // Cards which are whitelisted for the connected account and can be minted
  const [mintableCards, setMintableCards] = useState([]);
  // Cards which cannot be minted yet
  const [nonMintableCards, setNonMintableCards] = useState([]);
  

  useEffect( () => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(async () => {
    
    const setCardsOwnedStatus = async () => {
      console.log('Contract instance:');
      console.log(connectedContract);
      for (let i=0; i<TOKEN_IDS.length; i++) {
        const id = TOKEN_IDS[i];
  
        try {
          const balance = await connectedContract.balanceOf(currentAccount, id)
          console.log(`Owned token ${id}: ${balance.toString()}`);
          if (balance.toString() !== "0") {
            cardOwnedStatus[id] = CARD_OWNED_STATUS.Owned;
          } 
          else {
            cardOwnedStatus[id] = CARD_OWNED_STATUS.NonMintable;
          }
        
        } catch (error) {
          console.error(`Failed to get balance of token ${id} for address ${currentAccount}`);
          return;
        }
      }
      
    }

    const createNFTArrays = () => {
      let ownedCardsArray = [];
      let nonMintableCardsArray = [];
      
      // TODO: Create the mintable cards array once whitelisting check is implemented
      let mintableCardsArray = [];
  
      for (let i=0; i<TOKEN_IDS.length; i++) {
        let id = TOKEN_IDS[i];
        if (cardOwnedStatus[id] === CARD_OWNED_STATUS.Owned) {
          ownedCardsArray.push(<NFT tokenId={id} ownedStatus={CARD_OWNED_STATUS.Owned}></NFT>)
        } else {
          nonMintableCardsArray.push(<NFT tokenId={id} ownedStatus={CARD_OWNED_STATUS.NonMintable}></NFT>)
        }
      }
    
      setOwnedCards(ownedCardsArray);
      setNonMintableCards(nonMintableCardsArray);
    }

    // These functions get called only after connectedContract state var gets updated
    if (connectedContract !== null)
    { 
      await setCardsOwnedStatus();
      createNFTArrays();
    }
  }, [connectedContract])

  


  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
  
    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  
    // Check if metamask is connected to Mumbai. Trigger network switch if not
    await switchNetworkMumbai();
    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found authorized account:", account);
      setCurrentAccount(account);
    }

    // Connect to contract
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SeniorityBadge.abi, signer);
    setConnectedContract(contract);
  }
 
  


  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if ( !ethereum ) {
        alert("Get Metamask!");
        return;
      }

      await switchNetworkMumbai();

      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const switchNetworkMumbai = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "Mumbai",
                rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
                nativeCurrency: {
                  name: "Matic",
                  symbol: "Matic",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
              },
            ],
          });
        } catch (error) {
          alert(error.message);
        }
      }
    }
  };

  // Render this when the wallet is not connected
  const renderNotConnectedContainer = () => (
    <Container>
      <Button
        onClick={connectWallet}
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
          <SimpleGrid minChildWidth='180px' spacing='40px'>
            {ownedCards}
            {mintableCards}
            {nonMintableCards}
          </SimpleGrid>
    </Container>
  );

  const renderAddressContainer = () => (
    <Box alignItems='center' w='150px' p='10px' mr='30px' bg='tomato' color='white' borderRadius='lg' boxShadow='lg' bgGradient="linear(to-l, #3c4bbb, #00003b)" >
        <Address value={currentAccount} shortened copiable></Address> 
    </Box>
  )

  return (
    <div className="App">
      <Flex>
        <Spacer />
        {currentAccount !== "" ? renderAddressContainer() : null}
      </Flex>
      <Heading  className='cirlce pulse' size="2xl" m='50px' color='#0e126e' > Community Achievements </Heading>
      <div >
        {currentAccount === "" ? renderNotConnectedContainer() : renderBadgeContainer()}
      </div>
     
    </div>
  );
}

export default App;
