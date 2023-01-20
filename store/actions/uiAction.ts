import { Dispatch, AnyAction } from "redux";
import { COUNT_INFO, UI_ERROR } from "../types";

interface ProfileCountType {
  creators: number;
  profiles: number;
}
interface UICountType {
  nft: number;
  collection: number;
  profile: ProfileCountType;
}

export const setUICountData =
  (action: string, data: UICountType) =>
  async (dispatch: Dispatch<AnyAction>) => {
    try {
      switch (action) {
        case COUNT_INFO:
          dispatch({
            type: action,
            payload: data,
          });
          break;
      }
    } catch (error) {
      dispatch({
        type: UI_ERROR,
        payload: "error message",
      });
    }
  };
