import React, { useEffect, useState } from "react";
import {
  Modal,
  ChakraProvider,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Text,
  Stack,
  IconButton,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  Tooltip,
} from "@chakra-ui/react";

import {
  ChannelInner,
  CreateChannel,
  MessagingSidebar,
  MessagingThreadHeader,
  SendButton
} from 'features/chatapp/components';

import { Channel, Chat } from 'stream-chat-react';
import styled from "styled-components";
import { getChannelListOptions } from "features/chatapp/channelListOptions";
import { useChecklist, useConnectUser, useMobileView, useTheme, useUpdateAppHeightOnResize } from "features/chatapp/hooks";
import { StreamChatGenerics } from "features/chatapp/types";
import { GiphyContextProvider } from "features/chatapp/context";
import { ChatIcon } from "@chakra-ui/icons";
import { isMobile } from "util/device";


const ChatModal = ({ currentUserToConnect, chatUser, otherUser, hideOpenButton,showRemoveFilterButton, IsOpenOutSide, OnCloseOutSide }) => {
 
  const { isOpen,onOpen, onClose } = useDisclosure({ defaultIsOpen: hideOpenButton });
  const [isCreating, setIsCreating] = useState(false);

  let user:string=chatUser.id;
  //if(otherUser?.id)
  //  user=otherUser.getStream_id

  const _channelListOptions=getChannelListOptions(chatUser.getStream_id,otherUser?.getStream_id);
  const [channelListOptions,setChannelListOption]= useState<any>(_channelListOptions);
  const chatClient = useConnectUser<StreamChatGenerics>(process.env.NEXT_PUBLIC_STREAM_KEY, currentUserToConnect, chatUser.token);
  const toggleMobile = useMobileView();
  const theme = useTheme(process.env.NEXT_PUBLIC_STREAM_TARGET_ORIGIN);
  useChecklist(chatClient, process.env.NEXT_PUBLIC_STREAM_TARGET_ORIGIN);
  useUpdateAppHeightOnResize();

  if (!chatClient) {
    return null;
  }

  const openModal = async () => {
    let user:string=chatUser.getStream_id;
    //if(otherUser?.id)
    //  user=otherUser.getStream_id
  
      const _channelListOptions=getChannelListOptions(chatUser.getStream_id,otherUser.getStream_id);
      setChannelListOption(_channelListOptions);
    onOpen();
  }

  const removeFilter = async () => {
    let user:string=chatUser.getStream_id;  
    const _channelListOptions=getChannelListOptions(user,null);
    setChannelListOption(_channelListOptions);
  }
 
  const closeModal = async () => {
    if(hideOpenButton)
      OnCloseOutSide();
    else
      onClose();
  }

  return (
    <ChakraProvider>
      <>
       {!hideOpenButton && (
          <><Tooltip id="tooltipOpeChat" label='Start conversation' fontSize='md'>
            <IconButton id="OpenChatModalButton"
            aria-label="Start conversation"
            icon={<ChatIcon />}
            onClick={openModal}
            variant="outline"
            colorScheme="whiteAlpha" />
            </Tooltip>
          </>
       )}
      </>
      <Modal
        id="ChatModal"
        blockScrollOnMount={isMobile() ? true : false}
        size={ isMobile() ? 'full' : 'xl'}
        isOpen={IsOpenOutSide ?? isOpen}
        onClose={closeModal}
        closeOnOverlayClick={true}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <ModalContent>
        <ModalCloseButton />
        <ModalBody>
            <div style={{display:'flex', backgroundColor: '#212326'}}>

            <Chat client={chatClient} theme={`messaging ${theme}`}>
        <MessagingSidebar
          channelListOptions={channelListOptions}
          onClick={toggleMobile}
          onCreateChannel={() => setIsCreating(!isCreating)}
          onPreviewSelect={() => setIsCreating(false)}
          onRemoveFilter={() => removeFilter()}
          showRemoveFilterButton={showRemoveFilterButton}
          theme={theme}
        />
          {isCreating && (
            <CreateChannel toggleMobile={toggleMobile} onClose={() => setIsCreating(false)} />
          )}        <Channel
          maxNumberOfFiles={10}
          multipleUploads={true}
          SendButton={SendButton}
          ThreadHeader={MessagingThreadHeader}
          TypingIndicator={() => null}
        >
          <GiphyContextProvider>
            <ChannelInner theme={theme} toggleMobile={toggleMobile} />
          </GiphyContextProvider>
        </Channel>
    </Chat>
            </div>           
        </ModalBody>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};




const InputLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding: 0 20px;
`;
const StyledInput = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px;
  font-size: 20px;
  background: #272734;
  border-radius: 20px !important;
  display: flex;
  align-items: center;
  font-family: Mulish;
`;
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
  }
`;

const Error = styled.div<{ show: boolean }>`
  color: red;
  font-size: 16px;
  font-family: Mulish;
  display: ${({ show }) => (show ? "block" : "none")};
`;



export default ChatModal;