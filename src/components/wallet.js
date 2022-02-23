import { ethers } from "ethers";
import SeniorityBadgev2 from "../json/SeniorityBadge-v2.json";

export const CONTRACT_ADDRESS_V2 = "0xAa42054F9Dd68d8e490022675Ff952c2892acB45";

export const checkIfWalletIsConnected = async (currentAccountSetter, connectedContractSetter) => {
    const {ethereum} = window;  
    if (!ethereum) {
        console.log("Make sure you have metamask");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }
    // Check if metamask is connected to Mumbai. Trigger network switch if not
    await switchNetworkMumbai();

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

        console.log("Found authorized account:", account);
        await currentAccountSetter(account);
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
}