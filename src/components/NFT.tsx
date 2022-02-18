import "./NFT.css";
import * as NFTOwnershipStatus from "../enums/NFTOwnershipStatus.js";
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Button,
  Box,
  Image,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure 
} from '@chakra-ui/react'


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
  image?: string;
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
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const fetchNFTData = useCallback(async () => {
    try {
      
      const res = await fetch("https://ipfs.io/ipfs/QmUn1h9BxgA7vshmuC6VGdq9mjLAbvctJNVAcXUWsaxuww/" + props.tokenId + ".json");
          
      if (!res.ok) {
        throw Error(
          `Request failed with status: ${res.status}. Make sure the ipfs url is correct.`
        );
      }
      const data = await res.json();
      if (_isMounted.current) {
        setNftData({
          tokenId: props.tokenId,
          image: data.image,
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
  }, [props.ownedStatus, loading]);

  return <NFTCard data={nftData} errorMessage={errorMessage} size={props.size} mintingFn={props.mintingFn} loading={loading} setLoading={setLoading}/>;
};

/**
 * Private component to display an NFT given the data
 */
export const NFTCard = ({
  data,
  errorMessage = '',
  size = 'lg',
  mintingFn,
  loading,
  setLoading
}: {
  data: NFTData | undefined | null;
  errorMessage?: string | undefined;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  mintingFn: Function;
  loading: boolean;
  setLoading: Function;
}) => {
  const name = data?.name;
  const description = data?.description;
  const ownedStatus = data?.ownedStatus;
  const tokenId = data?.tokenId;
  const displayName = name;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const mint = () =>
  {
    mintingFn(tokenId, setLoading);
  }


  if (errorMessage) {
    return (
      <Alert status="error">
        <AlertIcon />
        {errorMessage}
      </Alert>
    );
  }

  let commonImageClasses = ownedStatus?.description;
  let button;
  if (ownedStatus !== NFTOwnershipStatus.Owned && tokenId != '69420')
  {
    button = <Button color='white' my="3" className="nftButton" boxShadow='md' backgroundColor='#0c8af2' variant='solid'  loadingText='Minting...'  onClick={mint} isLoading={loading} isDisabled={ownedStatus === NFTOwnershipStatus.NonMintable}>
              Mint
            </Button>;
  }
  const image = <Image className={commonImageClasses  + ' hoverglow'}  src={data?.image} borderRadius="2xl" w={size} loading="lazy" boxShadow='2xl'/>;
  //const imageReflected = <Image className={commonImageClasses  + ' reflection'}  src={data?.image} borderRadius="2xl" w={size} loading="lazy"/>;

  const imageModal = <Image className={commonImageClasses}  src={data?.image} borderRadius="2xl" w={size} loading="lazy" boxShadow='2xl' />;




  const modal = <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered motionPreset="scale" allowPinchZoom>
        <ModalOverlay/>
        <ModalContent>
          <ModalBody>
            {imageModal}
          </ModalBody>
        </ModalContent>
      </Modal>

  return (
      <Box maxW={size} borderRadius='lg' >
        
        <a href="#" onClick={onOpen}>
          {image}
          {modal}
        </a>

        {button}
        
      </Box>

  );
};