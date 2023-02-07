import { getImage } from './assets';
import { getChannelListOptions } from './channelListOptions';
import React, { useState } from 'react';
import type { ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';
import { Channel, Chat } from 'stream-chat-react';


const apiKey = 'cwkgrfthb2km' /*process.env.REACT_APP_STREAM_KEY*/;
const user = 'juno1ckc3d8s0xusx5m6xzduyhhacsd5utpedpne2ak';
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoianVubzFja2MzZDhzMHh1c3g1bTZ4emR1eWhoYWNzZDV1dHBlZHBuZTJhayJ9.XQxtJPiWnBlOq4DnVyfzm1495zPxtJN1v1wZ3cEklf4' /*process.env.REACT_APP_USER_TOKEN*/;
const targetOrigin = process.env.REACT_APP_TARGET_ORIGIN;

console.log(apiKey);
console.log(user);
console.log(userToken);
console.log(targetOrigin);


const noChannelNameFilter =  true;
const skipNameImageSet = false;

const channelListOptions = getChannelListOptions(true,user);
const userToConnect: { id: string; name?: string; image?: string } = {
  id: user!,
  name: user!,
  image: skipNameImageSet ? undefined : 'https://i.imgur.com/fR9Jz14.png'/*getImage(user!)*/,
};


import {
  ChannelInner,
  CreateChannel,
  MessagingSidebar,
  MessagingThreadHeader,
  SendButton
} from './components';

import { GiphyContextProvider } from './context';

import {
  useConnectUser,
  useChecklist,
  useMobileView,
  useTheme,
  useUpdateAppHeightOnResize
} from './hooks';

import type { StreamChatGenerics } from './types';


const ChatApp = () => {
  const [isCreating, setIsCreating] = useState(false);
  console.log(isCreating);
  const chatClient = useConnectUser<StreamChatGenerics>(apiKey, userToConnect, userToken);
  const toggleMobile = useMobileView();
  const theme = useTheme(targetOrigin);

  useChecklist(chatClient, targetOrigin);
  useUpdateAppHeightOnResize();

  if (!chatClient) {
    return null; // render nothing until connection to the backend is established
  }

  return (
    <Chat client={chatClient} theme={`messaging ${theme}`}>
        <MessagingSidebar
          channelListOptions={channelListOptions}
          onClick={toggleMobile}
          onCreateChannel={() => setIsCreating(!isCreating)}
          onPreviewSelect={() => setIsCreating(false)}
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
  );
};

export default ChatApp;