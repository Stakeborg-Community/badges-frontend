import { logger } from "./logger.js";
import React, { useCallback, useEffect, useRef } from 'react';
// @ts-ignore
import { NFTCard, NFTData } from './NFTCard.tsx';
const axios = require('axios');

export interface NFTProps {
  /**
   * The id of the NFT.
   */
  tokenId: string;
  /**
   * The size of the NFT card.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
   /**
   * The status of the NFT ownership
   */
  ownedStatus: Symbol;
  /**
   * The function to call upon minting
   */
  mintingFn: Function;
  /**
   * The base uri to get token info
   */
  baseUri: string;
}

/**
 * Component to fetch and display NFT data
 */
export const NFT = (props: NFTProps) => {
  const _isMounted = useRef(true);
  const [nftData, setNftData] = React.useState<NFTData>();
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const fetchNFTData = useCallback(async () => {
    try {
      
      //const res = await fetch();
      let res = await axios.get(props.baseUri + props.tokenId + ".json")
      if (res.status !== 200) {
        throw Error(
          `Request failed with status: ${res.status}. Make sure the ipfs url is correct.`
        );
      }
      const data = await res.data;
      if (_isMounted.current) {
        setNftData({
          tokenId: props.tokenId,
          image: data.image,
          name: data.name,
          attributes: data.attributes,
          description: data.description,
          ownedStatus: props.ownedStatus
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    logger.log(`Update on NFT ${props.tokenId} triggered. Owned status changed to ${props.ownedStatus.description}`);
    _isMounted.current = true;
    fetchNFTData();
    return () => {
      _isMounted.current = false;
    };
  }, [props, loading, fetchNFTData]);

  return <NFTCard data={nftData} errorMessage={errorMessage} size={props.size} mintingFn={props.mintingFn} loading={loading} setLoading={setLoading}/>;
};
