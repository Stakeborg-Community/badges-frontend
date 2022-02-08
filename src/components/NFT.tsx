import "./NFT.css";
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Image,
  Flex,
  Tag,
  Text,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

export interface NFTProps {
  /**
   * The id of the NFT.
   */
  tokenId: string;
  /**
   * The size of the NFT card.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface NFTData {
  tokenId: string;
  imageUrl?: string;
  name: string | null;
  description: string;
}

/**
 * Component to fetch and display NFT data
 */
export const NFT = ({ tokenId, size = 'xs' }: NFTProps) => {
  const _isMounted = useRef(true);
  const [nftData, setNftData] = React.useState<NFTData>();
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const fetchNFTData = useCallback(async () => {
    try {
      
      const res = await fetch("https://ipfs.io/ipfs/QmbjoafeN3Xr1bjeyP4xEKtr2CAWWXxekq1PCY3rKv3esA/" + tokenId + ".json");
          
      if (!res.ok) {
        throw Error(
          `Request failed with status: ${res.status}. Make sure the ipfs url is correct.`
        );
      }
      const data = await res.json();
      if (_isMounted.current) {
        setNftData({
          tokenId: tokenId,
          imageUrl: data.image,
          name: data.name,
          description: data.description,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  }, [tokenId]);

  useEffect(() => {
    _isMounted.current = true;
    fetchNFTData();
    return () => {
      _isMounted.current = false;
    };
  }, [tokenId]);

  return <NFTCard data={nftData} errorMessage={errorMessage} size={size} />;
};

/**
 * Private component to display an NFT given the data
 */
export const NFTCard = ({
  data,
  errorMessage = '',
  size,
}: {
  data: NFTData | undefined | null;
  errorMessage?: string | undefined;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}) => {
  const name = data?.name;
  const imageUrl = data?.imageUrl;
  const description = data?.description;
  const tokenId = data?.tokenId;
  const displayName = name;

  if (errorMessage) {
    return (
      <Alert status="error">
        <AlertIcon />
        {errorMessage}
      </Alert>
    );
  }

  return (
      <Box maxW={size} borderRadiu='lg' overflow="hidden"  className="pulse" boxShadow='0px 0px 0px yellow'>
        <Image className="glow" src={imageUrl} alt={displayName} borderRadius="lg" w={size} />
      </Box>

  );
};