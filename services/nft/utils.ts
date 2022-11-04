import { coins, Token } from "../config";
import { getFileTypeFromURL, NftCollection } from "./type";

export function formatAddress(wallet: string): string {
  return ellideMiddle(wallet, 24);
}

export function ellideMiddle(str: string, maxOutLen: number): string {
  if (str.length <= maxOutLen) {
    return str;
  }
  const ellide = "…";
  const frontLen = Math.ceil((maxOutLen - ellide.length) / 2);
  const tailLen = Math.floor((maxOutLen - ellide.length) / 2);
  return (
    str.slice(0, frontLen) +
    ellide +
    str.slice(str.length - tailLen, str.length)
  );
}

export function getTokenConfig(denom: string): Token | undefined {
  return coins.find((c) => c.denom === denom);
}
export function getRealTokenAmount(price: {
  amount: string;
  denom: string;
}): number {
  const coin = getTokenConfig(price.denom)!;
  const amount = parseInt(price.amount) / Math.pow(10, coin.decimals);
  return amount;
}
export function formatPrice(price: { amount: string; denom: string }): string {
  const coin = getTokenConfig(price.denom)!;
  const amount = parseInt(price.amount) / Math.pow(10, coin.decimals);

  return amount + " " + coin.name;
}

export function toMinDenom(amount: number, denom: string): string {
  const coin = getTokenConfig(denom)!;
  return Math.ceil(amount * Math.pow(10, coin.decimals)).toString();
}

export function isValidURL(string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

export async function getCollectionInfo(collectionConfig): Promise<NftCollection> {
  let res_collection: any = {};
  try {
    let ipfs_collection = await fetch(
      process.env.NEXT_PUBLIC_PINATA_URL + collectionConfig.uri
    );
    res_collection = await ipfs_collection.json();

    let collection_info: any = {};
    collection_info.id = 0;
    collection_info.name = res_collection.name;
    collection_info.description = res_collection.description;
    collection_info.image =
      process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
    collection_info.banner_image = res_collection.featuredImage
      ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
      : process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
    collection_info.slug = res_collection.slug;
    collection_info.creator = collectionConfig.owner ?? "";
    collection_info.cat_ids = res_collection.category;

    let collection_type = await getFileTypeFromURL(
      process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
    );
    collection_info.type = collection_type.fileType;
    return collection_info
  } catch (err) {
    console.log("err", err);
  }
}