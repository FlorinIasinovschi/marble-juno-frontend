import { DownloadIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Tooltip } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Avatar, useChatContext } from 'stream-chat-react';
import type { StreamChatGenerics } from '../../types';

type Props = {
  onCreateChannel?: () => void;
  onRemoveFilter?: () => void;
  showRemoveFilterButton : boolean;
};

// eslint-disable-next-line react/display-name
const MessagingChannelListHeader = React.memo((props: Props) => {
  const { onCreateChannel,onRemoveFilter,showRemoveFilterButton } = props;

  const { client } = useChatContext<StreamChatGenerics>();

  const { id, image ='', name = 'Example User' } = client.user || {};

  const [_showRemoveFilterButton, setshowRemoveFilterButton] = useState(showRemoveFilterButton);

  const showAllChat = async () => {
    setshowRemoveFilterButton(false);
    onRemoveFilter();
  };

  return (
      <div className='messaging__channel-list__header'>
        <Avatar image={image} name={name} size={40} />
        <div className={`messaging__channel-list__header__name`}>{name || id}</div>
        
        {_showRemoveFilterButton &&(
          <button
          className={`messaging__channel-list__header__button`}
          onClick={showAllChat}
        >
          <Tooltip label='Show All Chats' fontSize='md'>
            <DownloadIcon boxSize={6} color="white" />
          </Tooltip>
        </button>
        )}
      </div>
  );
});

export default React.memo(MessagingChannelListHeader);
