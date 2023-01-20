import { NftCard } from "components/NFT";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Marketplace, CW721, Stake, useSdk } from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import styled from "styled-components";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";

const MyStakedNFTs = ({ id }) => {
  // const [nfts, setNfts] = useState<any>([]);
  // const { address } = useRecoilValue(walletState);
  // const { client } = useSdk();

  // useEffect(() => {
  //   (async () => {
  //     if (!client || !address) {
  //       return;
  //     }
  //     try {
  //       const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
  //       const _stakeConfig = await stakeContract.getConfig();
  //       const userStakeInfo = await stakeContract.getStaking(address);
  //       const collectionContract = Marketplace(
  //         _stakeConfig.collection_address
  //       ).use(client);
  //       const collectionConfig = await collectionContract.getConfig();
  //       const cw721Contract = CW721(collectionConfig.cw721_address).use(client);
  //       const tokenInfo = await Promise.all(
  //         userStakeInfo.token_ids.map(async (_tokenId) => {
  //           const _tokenInfo = await cw721Contract.allNftInfo(_tokenId);
  //           const ipfs_nft = await fetch(
  //             process.env.NEXT_PUBLIC_PINATA_URL + _tokenInfo.info.token_uri
  //           );
  //           let res_nft = await ipfs_nft.json();
  //           res_nft.image = res_nft.uri;
  //           res_nft.sale = {};
  //           res_nft.price = 0;
  //           res_nft.type = "image";
  //           return res_nft;
  //         })
  //       );
  //       setNfts(tokenInfo);
  //     } catch (err) {
  //       console.log("get ownedToekns Error: ", err);
  //     }
  //   })();
  // }, [client, address]);
  return (
    <></>
    // <CollectionWrapper>
    //   <NftList>
    //     {nfts.map((nft, index) => (
    //       <NftCard nft={nft} key={index} />
    //     ))}
    //   </NftList>
    // </CollectionWrapper>
  );
};

const CollectionWrapper = styled.div`
  @media (max-width: 480px) {
    width: fit-content;
  }
`;

const NftList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  padding: 20px;
  overflow: hidden;
  overflow: auto;
`;

export default MyStakedNFTs;
