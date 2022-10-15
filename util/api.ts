import axios from "axios";
import { backend_url } from "./constants";
import { shortenAddress } from "util/shortenAddress";

export const getLogoUriFromAddress = async (address) => {
  try {
    const { data } = await axios.get(`${backend_url}/get_user`, {
      params: { id: address },
    });
    return {
      avatar: data.avatar
        ? process.env.NEXT_PUBLIC_PINATA_URL + data.avatar
        : "/default.png",
      name: data.name || shortenAddress(address),
    };
  } catch (err) {
    console.log("axios get logo uri error: ", err);
    return { avatar: "/default.png", name: address };
  }
};
