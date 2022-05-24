import { ethers } from "ethers";
import detectEthereumProvider from '@metamask/detect-provider';
import { logger } from "./logger.js";
import SeniorityBadgev2 from "../json/SeniorityBadge-v2.json";
export const CONTRACT_ADDRESS_V2 = "0x9c2F34E25f18e4109597572a4999f7EEa0a24F84";


export const checkIfWalletIsConnected = async (currentAccountSetter, connectedContractSetter) => {
    const ethereum = await detectEthereumProvider();

    if (ethereum) {
        logger.log('Ethereum successfully detected!');
      } else {
        logger.log('Please install MetaMask!');
      }
    
    // Check if metamask is connected to Mumbai. Trigger network switch if not
    await switchNetwork();

    // Connect to contract
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_V2, SeniorityBadgev2.abi, signer);
    await connectedContractSetter(contract);

    const accounts = await provider.send("eth_requestAccounts", []);

    if (accounts.length !== 0) {
        const account = accounts[0];
        ethereum.on("accountsChanged", () => { window.location.reload() }); // reload page if account changes
        ethereum.on('chainChanged', (_chainId) => window.location.reload()); // reload page if chain changed

        logger.log("Found authorized account:", account);
        await currentAccountSetter(account);
    }    
}

const switchNetwork = async () => {
    try {
        await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
        });
    } catch (error) {
        if (error.code === 4902) {
        try {
            await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                rpcUrls: [`https://polygon-mainnet.g.alchemy.com/v2/P2_1kHV1lvnksl-qhxEEBG8dZShoRmG1`],
                nativeCurrency: {
                    name: "Matic",
                    symbol: "MATIC",
                    decimals: 18,
                },
                blockExplorerUrls: ["https://polygonscan.com/"],
                },
            ],
            });
        } catch (error) {
            alert(error.message);
        }
        }
    }
}