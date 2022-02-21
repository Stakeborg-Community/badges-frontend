import {Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverHeader, PopoverTrigger, PopoverContent, IconButton} from '@chakra-ui/react';
import {QuestionIcon} from '@chakra-ui/icons'
import React from 'react';

 
export const HelpPopover = () => {
    return (
      <Popover
        placement='bottom'
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <IconButton icon={<QuestionIcon/>} aria-label='Help' variant='ghost'/>
        </PopoverTrigger>
        <PopoverContent color='white' bg='blue.400' borderColor='blue.400'>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            If you encounter any issues, do not hesitate to contact any of the following people:
            <br/>
            Bogdan I#7371
            <br/>
            andreiv#4775
            <br/>
            eugenPtr#1051
            <br/>

          </PopoverBody>
        </PopoverContent>
      </Popover>
    )
  }