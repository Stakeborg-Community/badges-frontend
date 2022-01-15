import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";

import { Container, SimpleGrid, Box, Button, Text, Heading } from '@chakra-ui/react'
import { NFT } from "@web3-ui/components";

const contractAddress = "0x25ed58c027921e14d86380ea2646e3a1b5c55a8b";

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
  
    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
  
    await switchNetworkMumbai();
    const accounts = await ethereum.request({method: 'eth_accounts'});
  
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found authorized account:", account);
      setCurrentAccount(account);
    }
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
  
  const renderBadgeContainer = () => (
    <Container maxW='container.xl' className="badge-container">
          <SimpleGrid minChildWidth='180px' spacing='40px'>
            <NFT contractAddress={contractAddress} tokenId={2525}></NFT>
            <NFT contractAddress={contractAddress} tokenId={5670}></NFT>
            <NFT contractAddress={contractAddress} tokenId={6546}></NFT>
            <NFT contractAddress={contractAddress} tokenId={7690}></NFT>
            <NFT contractAddress={contractAddress} tokenId={3934}></NFT>
          </SimpleGrid>
    </Container>
  );

  return (
    <div className="App">
      <Heading size="2xl" className="page-title rainbow-text"> Community Achievements </Heading>
      <div>
        {currentAccount === "" ? renderNotConnectedContainer() : renderBadgeContainer()}
      </div>
     
    </div>
  );
}

export default App;
