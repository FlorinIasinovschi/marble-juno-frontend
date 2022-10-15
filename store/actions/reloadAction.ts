import { RELOAD_STATUS } from "../types";
import { Dispatch, AnyAction } from "redux";

export const setReloadData = (action: string, data) => async (dispatch) => {
  try {
    switch (action) {
      case RELOAD_STATUS:
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
