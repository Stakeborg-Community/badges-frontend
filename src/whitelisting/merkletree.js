import {MerkleTree} from "merkletreejs";
import keccak256 from "keccak256";
import whitelist from "./whitelist.json";

const getProof = (address, tokenId) => {
    const tokenWhitelist = whitelist.tokenId[tokenId];
    console.log(tokenWhitelist);

    const leaves = tokenWhitelist.map(address => keccak256(address));
    const tree = new MerkleTree(leaves, keccak256);

    const leaf = keccak256(address);

    return tree.getProof(leaf)[0].data.toString('hex');
}

export default getProof;