import type { ChannelFilters, ChannelOptions, ChannelSort } from 'stream-chat';

/**
 * Exports few channel list configuration options. See the docs for more information:
 * - https://getstream.io/chat/docs/sdk/react/core-components/channel_list/
 *
 * @param user the user id.
 */
export const getChannelListOptions = (
  user: string | undefined,
) => {
  //console.log('getChannelListOptions');
  //console.log(user);
  const filters: ChannelFilters =  user && user !='' ? { type: 'messaging', members: { $in: [user!] } } : { type: 'messaging' }  ;
  //const filters: ChannelFilters = disableChannelNameFilter
  //  ? { type: 'messaging', members: { $in: [user!] } }
  //  : { type: 'messaging', name: 'Social Demo', demo: 'social' };

  const options: ChannelOptions = { state: true, watch: true, presence: true, limit: 20 };

  const sort: ChannelSort = {
    last_message_at: -1,
    updated_at: -1,
  };

  return {
    filters,
    options,
    sort,
  };
};
