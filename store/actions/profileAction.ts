import { PROFILE_STATUS } from "../types";
import axios from "axios";
import { backend_url } from "util/constants";

export const setProfileData = (action: string, data) => async (dispatch) => {
  try {
    switch (action) {
      case PROFILE_STATUS:
        dispatch({
          type: action,
          payload: data,
        });
        break;
    }
  } catch (error) {
    console.log(error);
  }
};
export const getProfileData = (address, dispatch) => {
  if (address == "[id]") return;
  axios
    .get(`${backend_url}/get_profile`, { params: { id: address } })
    .then(({ data }) => {
      dispatch({
        type: PROFILE_STATUS,
        payload: data,
      });
    })
    .catch((err) => {
      console.log("get_user_error: ", err);
    });
};

export const createProfileData = (
  profileInfo,
  dispatch,
  successCallback = () => {},
  failCallback = () => {}
) => {
  axios
    .post(`${backend_url}/register_user`, profileInfo)
    .then(({ data }) => {
      dispatch({
        type: PROFILE_STATUS,
        payload: data,
      });
    })
    .catch((err) => {
      console.log("create_user_error: ", err);
    });
};
