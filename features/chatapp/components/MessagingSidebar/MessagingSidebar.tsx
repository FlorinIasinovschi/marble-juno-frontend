import type { MouseEventHandler } from 'react';
import { ChannelList, ChannelListProps } from 'stream-chat-react';
import { MessagingChannelListHeader, MessagingChannelPreview } from '../index';

import type { ThemeClassName } from '../../hooks';

type MessagingSidebarProps = {
  channelListOptions: {
    filters: ChannelListProps['filters']
    sort: ChannelListProps['sort']
    options: ChannelListProps['options']
  }
  onClick: MouseEventHandler;
  onCreateChannel: () => void;
  onPreviewSelect: MouseEventHandler;
  theme: ThemeClassName;
  onRemoveFilter?: () => void;
  showRemoveFilterButton: boolean
}

const MessagingSidebar = ({channelListOptions, onClick, onCreateChannel, onPreviewSelect, theme, onRemoveFilter,showRemoveFilterButton}: MessagingSidebarProps) => {

  return (
    <div className={`str-chat messaging__sidebar ${theme}`} id='mobile-channel-list' onClick={onClick}>
      <MessagingChannelListHeader
        onCreateChannel={onCreateChannel}
        onRemoveFilter={onRemoveFilter}
        showRemoveFilterButton={showRemoveFilterButton}
      />
      <ChannelList
        {...channelListOptions}
        Preview={(props) => <MessagingChannelPreview {...props} onClick={onPreviewSelect} />}
      />
    </div>
  )
}

export default MessagingSidebar;