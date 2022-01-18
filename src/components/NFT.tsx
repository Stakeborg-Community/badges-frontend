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
      
      const res = await fetch("https://ipfs.io/ipfs/QmcY2t2RsQQMddHHvbdtyRxcdRBPtYjvdGLa9ymP9v7wdK/" + tokenId + ".json")
          
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
    <Skeleton isLoaded={!!data} maxW={size} h="md">
      <Box maxW={size} borderRadius="lg" borderWidth="1px" overflow="hidden">
        
        <Image src={imageUrl} alt={displayName} borderRadius="lg" w={size} />
        
        <Box p="6">
          <Flex alignItems="center" justifyContent="space-between" pb="2">
            <Heading as="h3" size="sm" style={{ overflowWrap: 'anywhere' }}>
              {displayName}
            </Heading>
             <Tag size="sm">Badges</Tag>
          </Flex>
          <Text fontSize="xs">
            {description} #{tokenId}
          </Text>
        </Box>
      </Box>
    </Skeleton>
  );
};