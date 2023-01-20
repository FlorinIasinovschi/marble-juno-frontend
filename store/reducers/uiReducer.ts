import { COUNT_INFO, UI_ERROR } from "../types";

const initialState = {
  countInfo: {
    nft: 0,
    collection: 0,
    fixed: 0,
    auction: 0,
    offer: 0,
    profile: {
      creators: 0,
      profiles: 0,
    },
  },
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case COUNT_INFO:
      return {
        ...state,
        countInfo: action.payload,
      };

    case UI_ERROR:
      return {
        countInfo: {},
        error: action.payload,
      };

    default:
      return state;
  }
};

export default uiReducer;
