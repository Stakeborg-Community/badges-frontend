import "./NFT.css";
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Button,
  Box,
  Image,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {  
  CopyIcon
} from '@chakra-ui/icons';



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
}

export interface NFTData {
  tokenId: string;
  imageUrl?: string;
  name: string | null;
  description: string;
  ownedStatus: Symbol;
}

/**
 * Component to fetch and display NFT data
 */
export const NFT = (props: NFTProps) => {
  const _isMounted = useRef(true);
  const [nftData, setNftData] = React.useState<NFTData>();
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const fetchNFTData = useCallback(async () => {
    try {
      
      const res = await fetch("https://ipfs.io/ipfs/QmbjoafeN3Xr1bjeyP4xEKtr2CAWWXxekq1PCY3rKv3esA/" + props.tokenId + ".json");
          
      if (!res.ok) {
        throw Error(
          `Request failed with status: ${res.status}. Make sure the ipfs url is correct.`
        );
      }
      const data = await res.json();
      if (_isMounted.current) {
        setNftData({
          tokenId: props.tokenId,
          imageUrl: data.image,
          name: data.name,
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
  }, []);

  useEffect(() => {
    console.log(`Update on NFT ${props.tokenId} triggered. Owned status changed to ${props.ownedStatus.description}`);
    _isMounted.current = true;
    fetchNFTData();
    return () => {
      _isMounted.current = false;
    };
  }, [props.ownedStatus]);

  return <NFTCard data={nftData} errorMessage={errorMessage} size={props.size} mintingFn={props.mintingFn} />;
};

/**
 * Private component to display an NFT given the data
 */
export const NFTCard = ({
  data,
  errorMessage = '',
  size = 'lg',
  mintingFn,
}: {
  data: NFTData | undefined | null;
  errorMessage?: string | undefined;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  mintingFn: Function;
}) => {
  const name = data?.name;
  const imageUrl = data?.imageUrl;
  const description = data?.description;
  const ownedStatus = data?.ownedStatus;
  const tokenId = data?.tokenId;
  const displayName = name;

  const mint = () =>
  {
    mintingFn(tokenId);
  }

  if (errorMessage) {
    return (
      <Alert status="error">
        <AlertIcon />
        {errorMessage}
      </Alert>
    );
  }

  let imageClasses = ownedStatus?.description;

  return (
      <Box maxW={size} borderRadius='lg' overflow="hidden" boxShadow='0px 0px 0px yellow' >
        <a href="#"><Image className={imageClasses}  src={imageUrl} borderRadius="lg" w={size} /></a>
        <Button leftIcon={<CopyIcon/>} colorScheme='teal' variant='solid' onClick={mint}>
          Mint
        </Button>
      </Box>

  );
};