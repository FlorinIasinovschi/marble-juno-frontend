import axios from "axios";
import { backend_url } from "util/constants";

export const getUserNotifications = async (userId: string) => {
  try {
    const { data } = await axios.get(`${backend_url}/notifications/${userId}`);
    return data;
  } catch (error) {
    console.log("getUserNotificationsError: ", error);
    return [];
  }
};

export const markNotificationsAsRead = async (notificationsId: string[]) => {
  try {
    const { data } = await axios.put(
      `${backend_url}/notifications/mark_as_read`,
      {
        notificationsId,
      }
    );
    return data;
  } catch (error) {
    console.log("markNotificationsAsRead: ", error);
    return [];
  }
};
