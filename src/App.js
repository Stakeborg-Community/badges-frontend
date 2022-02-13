import { ethers } from "ethers";
import SeniorityBadgev2 from "./json/SeniorityBadge-v2.json";
import './App.css';
import { useState, useEffect } from "react";

import { Container, SimpleGrid, Box, Button, Heading, Flex, Spacer } from '@chakra-ui/react';
import { NFT } from "./components/NFT.tsx";
import { Address } from "@web3-ui/components";
import * as NFTOwnershipStatus from "./enums/NFTOwnershipStatus";
import Merkle from "./components/merkletree.js";

const CONTRACT_ADDRESS_V2 = "0x97E4743723570De6aEEd04560DB765CAAc8FD12F";
const TOKEN_IDS = [0,1,2,3,4,69420]; // This spits out warnings in log but it's fine, we do not care about the unknwon badges


function App() {
/* Lesson learned the hard way: Change state variables only using their set function */
  const [currentAccount, setCurrentAccount] = useState("");
  const [connectedContract, setConnectedContract] = useState(null);
  const [cardsOwnedStatus, setCardsOwnedStatus] = useState(null);
  const [merkle, setMerkle] = useState(null);

  // Cards owned by the connected account
  const [ownedCards, setOwnedCards] = useState([]);
  // Cards which are whitelisted for the connected account and can be minted
  const [mintableCards, setMintableCards] = useState([]);
  // Cards which cannot be minted yet
  const [nonMintableCards, setNonMintableCards] = useState([]);

  const mint = async (tokenId, setLoading) => {
    console.log("trying to mint: ", tokenId); 
    checkIfWalletIsConnected();
    let nftTx;
    let tx;

    try {
      const proof = merkle.getProof(currentAccount, tokenId);
      
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

  useEffect( () => {
    new Merkle().then((result) => setMerkle(result));
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (connectedContract !== null && merkle !== null) {
      getCardsOwned();
    }
  }, [connectedContract, merkle])

  useEffect( () => {
    if (cardsOwnedStatus !== null) {
      updateNFTArrays();
    }
  }, [cardsOwnedStatus]);  

  const updateNFTArrays = () => {
    let ownedCardsArray = [];
    let nonMintableCardsArray = [];
    let mintableCardsArray = [];

    for (let i=0; i<TOKEN_IDS.length; i++) {
      let id = TOKEN_IDS[i];
      let nftComponent = <NFT key={id} tokenId={id} ownedStatus={cardsOwnedStatus[id]} mintingFn={mint}></NFT>;
      switch (cardsOwnedStatus[id]) {
        case NFTOwnershipStatus.Owned:
          ownedCardsArray.push(nftComponent);
          break;

        case NFTOwnershipStatus.Mintable:
          mintableCardsArray.push(nftComponent);
          break;
          
        case NFTOwnershipStatus.NonMintable:
          nonMintableCardsArray.push(nftComponent);
          break;
        
        default:
          break;
      }
    }
    console.log("Create nft arrays");
    setOwnedCards(ownedCardsArray);
    setMintableCards(mintableCardsArray);
    setNonMintableCards(nonMintableCardsArray);
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
          <SimpleGrid minChildWidth='220px' spacing='30px'>
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
