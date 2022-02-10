import { ethers } from "ethers";
import SeniorityBadge from "./utils/SeniorityBadge.json";
import SeniorityBadgev2 from "./utils/SeniorityBadge-v2.json";
import './App.css';
import { useState, useEffect } from "react";

import { Container, SimpleGrid, Box, Button, Text, Heading, Flex, Spacer } from '@chakra-ui/react';
import { NFT } from "./components/NFT.tsx";
import { Address } from "@web3-ui/components";
import {Owned, Mintable, NonMintable} from "./components/NFTOwnershipStatus";
import getProof from "./whitelisting/merkletree.js";

const CONTRACT_ADDRESS = "0xe541fe43f74c3C2111D2499789Dc16808E355a9C";
const CONTRACT_ADDRESS_V2 = "0x97E4743723570De6aEEd04560DB765CAAc8FD12F";
const TOKEN_IDS = [0,1,2,3,4];

/* Lesson learned the hard way: Change state variables only using their set function */

function App() {
  console.log("MERKLE PROOF", getProof("0x0E1774FD4f836E6Ba2E22d0e11F4c69684ae4EB7", 0));

  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedContract, setConnectedContract] = useState(null);
  const [cardsOwnedStatus, setCardsOwnedStatus] = useState(null);

  // Cards owned by the connected account
  const [ownedCards, setOwnedCards] = useState([]);
  // Cards which are whitelisted for the connected account and can be minted
  const [mintableCards, setMintableCards] = useState([]);
  // Cards which cannot be minted yet
  const [nonMintableCards, setNonMintableCards] = useState([]);

  useEffect( () => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    
    const getCardsOwned = async () => {
      console.log('Contract instance:');
      console.log(connectedContract);
      let ownedstatus = {};
      for (let i=0; i<TOKEN_IDS.length; i++) {
        const id = TOKEN_IDS[i];
  
        try {
          const balance = await connectedContract.balanceOf(currentAccount, id)
          console.log(`Owned token ${id}: ${balance.toString()}`);
          if (balance.toString() !== "0") {
            ownedstatus[id] = Owned;
          } 
          else {
            ownedstatus[id] = NonMintable;
          }
        
        } catch (error) {
          console.error(`Failed to get balance of token ${id} for address ${currentAccount}`);
          return;
        }
      }  
      setCardsOwnedStatus(ownedstatus);    
    }   

    // These functions get called only after connectedContract state var gets updated
    if (connectedContract !== null) {
      getCardsOwned();
    }
  }, [connectedContract])

  useEffect( () => {
    const updateNFTArrays = () => {
      let ownedCardsArray = [];
      let nonMintableCardsArray = [];
      
      // TODO: Create the mintable cards array once whitelisting check is implemented
      let mintableCardsArray = [];
  
      for (let i=0; i<TOKEN_IDS.length; i++) {
        let id = TOKEN_IDS[i];
        if (cardsOwnedStatus[id] === Owned) {
          ownedCardsArray.push(<NFT key={id} tokenId={id} ownedStatus={Owned}></NFT>)
        } else {
          nonMintableCardsArray.push(<NFT key={id} tokenId={id} ownedStatus={NonMintable}></NFT>)
        }
      }
      console.log("Create nft arrays");
      console.log(ownedCardsArray);
      setOwnedCards(ownedCardsArray);
      setNonMintableCards(nonMintableCardsArray);
    }

    if (cardsOwnedStatus !== null) {
      updateNFTArrays();
    }
  }, [cardsOwnedStatus]);  


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
    const contract = new ethers.Contract(CONTRACT_ADDRESS_V2, SeniorityBadgev2.abi, signer);
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
                rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
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
          <SimpleGrid minChildWidth='150px' spacing='30px'>
            {ownedCards}
            {mintableCards}
            {nonMintableCards}
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
      <Heading  className='cirlce pulse' size="2xl" m='50px' color='#0e126e' > Community Achievements </Heading>
      <div >
        {currentAccount === "" ? renderNotConnectedContainer() : renderBadgeContainer()}
      </div>
     
    </div>
  );
}

export default App;
