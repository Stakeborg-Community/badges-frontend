import {MerkleTree} from "merkletreejs";
import keccak256 from "keccak256";
import whitelist from "./whitelist.json";

 //TODO: precalculate the merkle trees, do not do it on request, but rather on load
 const tokenWhitelist = (tokenId) => {
    return whitelist.tokenId[tokenId];
}

const getLeaves = (tokenId) => {
    const wl = tokenWhitelist(tokenId);
    return wl.map(address => keccak256(address));
} 

const getTree = (tokenId) => {
    const leaves = getLeaves(tokenId);
    return new MerkleTree(leaves, keccak256, {sort: true});
}

const getRoot = (tokenId) => {
    const tree = getTree(tokenId);
    return tree.getRoot().toString('hex');
}

const buf2hex = x => '0x'+x.toString('hex')

const getProof = (address, tokenId) => {
    const leaf = keccak256(address);
    const tree = getTree(tokenId);
    return tree.getProof(leaf).map(x => buf2hex(x.data))
}

const isWhitelisted = (address, tokenId) => {
    const wl = tokenWhitelist(tokenId).map((str) => str.toLowerCase());
    return wl.includes(address.toLowerCase());
}

export {
    getProof,
    getLeaves,
    tokenWhitelist,
    getTree, 
    getRoot,
    whitelist,
    isWhitelisted
}