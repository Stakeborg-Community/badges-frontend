import {Image} from '@chakra-ui/react';

export const PlaceholderNFT = (commonImageClasses: string, size: string) => {
return <Image className={commonImageClasses + ' hoverglow'}  src="https://via.placeholder.com/200x150.png" borderRadius="xl" w={size} loading="lazy" boxShadow='2xl'/>
    
}
