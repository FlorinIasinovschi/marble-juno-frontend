import axios from "axios";
import { backend_url } from "util/constants";

export const getChatUser = async (address) => {
  try {
    const { data } = await axios.get(`${backend_url}/chat/get_user`, {
      params: { id: address },
    });
    return data;
  } catch (err) {
    console.log("get chat profile info: ", err);
    return {};
  }
};

export const getOrCreateChatUserToken = async (address) => {
  try {
    const { data } = await axios.get(`${backend_url}/chat/get_or_create_token`, {
      params: { id: address },
    });
    return data;
  } catch (err) {
    console.log("get or create token info: ", err);
    return {};
  }
};

export const addUserToMurbleChannel = async (address) => {
  try {
    const { data } = await axios.get(`${backend_url}/chat/add_user_to_murble_channel`, {
      params: { id: address },
    });
    return data;
  } catch (err) {
    console.log("addUserToMurbleChannel: ", err);
    return {};
  }
};

export const getOrCreateChatChannel = async (users) => {
  try {
   // console.log('getOrCreateChatChannel');
   // console.log(users);
    const { data } = await axios.get(`${backend_url}/chat/get_or_create_channel`, {
      params: { users:  users },
    });
    return data;
  } catch (err) {
    console.log("get or create channel info: ", err);
    return {};
  }
};