import { EmailIcon } from "@chakra-ui/icons";
import { Badge, Box, useDisclosure } from "@chakra-ui/react";
import {
  addUserToMurbleChannel,
  getChatUser,
  getOrCreateChatUserToken,
} from "hooks/useChat";
import { getProfileInfo } from "hooks/useProfile";
import { redirect } from "next/dist/next-server/server/api-utils";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { StreamChat } from "stream-chat";
import { default_image } from "util/constants";
import ChatModal from "../ChatModal/ChatModal";

export const MessageCounter = () => {
  const profile = useSelector((state: any) => state.profileData.profile_status);
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [totalUnreadCount, setChatUserUnreadCount] = useState(0);
  const [showChatModal, setshowChatModal] = useState(false);
  const [chatCurrentUserProfile, setchatCurrentUserProfile] = useState<any>({});
  const [chatUser, setChatUser] = useState<any>({});
  const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
  const { isOpen, onToggle, onClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      if (!address) return;

      if (!address) return;

      let _chatUser = await getOrCreateChatUserToken(address);
      if (!_chatUser?.id) return;

      // client-side you initialize the Chat client with your API key
      const chatClient = StreamChat.getInstance(apiKey, {
        timeout: 6000,
      });

      const activeProfile = await getProfileInfo(address);
      if (activeProfile?.id) {
        await addUserToMurbleChannel(address);

        const _chatCurrentUserProfile: {
          id: string;
          name?: string;
          image?: string;
        } = {
          id: _chatUser.getStream_id,
          name: activeProfile.name ?? activeProfile.id,
          image: activeProfile.avatar
            ? process.env.NEXT_PUBLIC_PINATA_URL + activeProfile.avatar
            : "https://juno-nft.marbledao.finance" + default_image,
        };

        const _user = await chatClient.connectUser(
          _chatCurrentUserProfile,
          _chatUser.token
        );

        setchatCurrentUserProfile(_chatCurrentUserProfile);
        setChatUser(_chatUser);

        if (_user && _user?.me)
          setChatUserUnreadCount(_user?.me.total_unread_count);

        chatClient.on((event) => {
          if (event.total_unread_count !== undefined) {
            setChatUserUnreadCount(event.total_unread_count);
            console.log(event.total_unread_count);
          }
        });
      }
    })();
  }, []);

  const openChatModal = async () => {
    setshowChatModal(true);
    onToggle();
  };

  return (
    <>
      {Boolean(address) && (
        <Box onClick={openChatModal} style={{ position: "relative" }}>
          <EmailIcon boxSize={6} color="white" cursor="pointer" />
          <Badge
            style={{
              position: "absolute",
              borderRadius: "10px",
              fontSize: "10px;",
              right: "-12px",
              top: "-2px",
              lineHeight: "15px",
            }}
            variant="solid"
            colorScheme="red"
          >
            {totalUnreadCount}
          </Badge>
        </Box>
      )}

      {showChatModal && (
        <ChatModal
          currentUserToConnect={chatCurrentUserProfile}
          chatUser={chatUser}
          otherUser={null}
          hideOpenButton={true}
          showRemoveFilterButton={false}
          IsOpenOutSide={isOpen}
          OnCloseOutSide={onClose}
        />
      )}
    </>
  );
};

export default MessageCounter;
