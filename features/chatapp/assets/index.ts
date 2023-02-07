import type { ChannelMemberResponse } from 'stream-chat';

import type { StreamChatGenerics } from '../types';



export { ChannelInfoIcon } from './ChannelInfoIcon';
export { ChannelSaveIcon } from './ChannelSaveIcon';
export { CloseThreadIcon } from './CloseThreadIcon';
export { CommandIcon } from './CommandIcon';
export { CreateChannelIcon } from './CreateChannelIcon';
export { EmojiIcon } from './EmojiIcon';
export { HamburgerIcon } from './HamburgerIcon';
export { LightningBoltSmall } from './LightningBoltSmall';
export { SendIcon } from './SendIcon';
export { XButton } from './XButton';
export { XButtonBackground } from './XButtonBackground';


//export const getImage = (userId: string) => {
//  const hash = hashCode(userId);
//  //const index = Math.abs(hash) % staticImages.length;
//  return staticImages[0];
//};

export const getCleanImage = (member: ChannelMemberResponse<StreamChatGenerics>) => {
  let cleanImage = member.user?.image || '';
  //const cleanIndex = staticImages.indexOf(cleanImage);
  //if (cleanIndex === -1) {
  //  cleanImage = getImage(member.user_id || 'stream-user');
  //}

  //if (member.user?.name === 'Jen Alexander') {
  //  cleanImage = staticImages[11];
  //}
//
  //if (member.user?.name === 'Kevin Rosen') {
  //  cleanImage = staticImages[23];
  //}

  return cleanImage;
};

// https://stackoverflow.com/a/7616484/1270325
const hashCode = (value: string) => {
  let hash = 0;
  if (value.length === 0) return hash;
  for (let i = 0; i < value.length; i++) {
    const chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
