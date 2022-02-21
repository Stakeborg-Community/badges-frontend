import {MerkleTree} from "merkletreejs";
import keccak256 from "keccak256";
import whitelist from "../json/whitelist.json";

export default class Merkle {

    constructor() {
        this.whitelist = whitelist;
        this.trees = [];

        console.groupCollapsed("Merkle root for all tokens:");
            for (let id in this.whitelist.tokenId)
            {
                const leaves = this.getLeaves(id);
                this.trees[id] = new MerkleTree(leaves, keccak256, {sort: true});
                console.log(id, this.getRoot(id));
            }
        console.groupEnd();      
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