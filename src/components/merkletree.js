import {MerkleTree} from "merkletreejs";
import keccak256 from "keccak256";
//import whitelist from "./whitelist.json";

export default class Merkle {

    constructor(whitelist) {
        this.whitelist = whitelist;
        this.trees = [];
        return (async () => {
            try {      
                const res = await fetch("https://ipfs.io/ipfs/QmRMnnU2gu8eVpo8UT6h6sPcih1nAAXQVyh7DyhzTxaxAs?filename=whitelist.json");
                    
                if (!res.ok) {
                  throw Error(
                    `Request failed with status: ${res.status}. Make sure the ipfs url is correct.`
                  );
                }
                const data = await res.json();
                
                console.log("Whitelist received", data);
                this.whitelist = data;
            } catch (error) {
                console.error(error);
            }
            console.groupCollapsed("Merkle root for all tokens:");
            for (let id in this.whitelist.tokenId)
            {
                const leaves = this.getLeaves(id);
                this.trees[id] = new MerkleTree(leaves, keccak256, {sort: true});
                console.log(id, this.getRoot(id));
            }
            console.groupEnd();

            return this;
        })();       
    }

    tokenWhitelist(tokenId) {
        return this.whitelist.tokenId[tokenId] ?? [];
    }

    getLeaves(tokenId) {
        const wl = this.tokenWhitelist(tokenId);
        return wl.map(address => keccak256(address));
    } 

    getTree(tokenId) {
        return this.trees[tokenId];
    }

    getRoot(tokenId) {
        const tree = this.getTree(tokenId);
        return tree.getRoot().toString('hex');
    }

    getHexProof(address, tokenId) {
        const leaf = keccak256(address);
        const tree = this.getTree(tokenId);
        return tree.getHexProof(leaf)
    }

    isWhitelisted(address, tokenId) {
        const wl = this.tokenWhitelist(tokenId).map((str) => str.toLowerCase());
        return wl.includes(address.toLowerCase());
    }
}