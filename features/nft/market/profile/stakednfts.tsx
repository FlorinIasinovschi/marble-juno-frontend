import { ChakraProvider, Spinner } from "@chakra-ui/react";
import { NftTable } from "components/NFT";
import styled from "styled-components";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { walletState } from "state/atoms/walletAtoms";
import { useRecoilValue } from "recoil";
import { State } from "store/reducers";
import { NFT_COLUMN_COUNT } from "store/types";
import {
  CW721,
  Market,
  Collection,
  useSdk,
  PaymentToken,
  NftInfo,
  Stake,
  OWNED,
  CREATED,
  getRealTokenAmount,
  getFileTypeFromURL,
} from "services/nft";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";

const MyStakedNFTs = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState<any>([]);
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { address } = useRecoilValue(walletState);
  const { client } = useSdk();
  const fetchStakedNFTs = useCallback(async () => {}, [address, client]);
  useEffect(() => {
    (async () => {
      const nftList = await fetchStakedNFTs();
      setNfts(nftList);
    })();
  }, [id]);
  const getMoreNfts = async () => {};
  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      try {
        const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
        const _stakeConfig = await stakeContract.getConfig();
        const collectionContract = Collection(
          _stakeConfig.collection_address
        ).use(client);
        const collectionConfig = await collectionContract.getConfig();
        const cw721Contract = CW721(collectionConfig.cw721_address).use(client);
        const tokenIdsInfo = await cw721Contract.tokens(address);
        const tokenIds = tokenIdsInfo.tokens;
        setOwnedNfts(tokenIds);
      } catch (err) {
        console.log("get ownedToekns Error: ", err);
      }
    })();
  }, [client, address]);
  return (
    <CollectionWrapper>
      <NftList>
        <InfiniteScroll
          dataLength={nfts.length}
          next={getMoreNfts}
          hasMore={hasMore}
          loader={
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Spinner size="xl" />
            </div>
          }
          endMessage={<h4></h4>}
        >
          <NftTable data={nfts} type="sell" nft_column_count={2} />
        </InfiniteScroll>
      </NftList>
    </CollectionWrapper>
  );
};

const CollectionWrapper = styled.div`
  @media (max-width: 480px) {
    width: fit-content;
  }
`;

const NftList = styled.div``;
const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  margin-top: 20px;
`;
const FilterCard = styled.div`
  border-radius: 30px;
  backdrop-filter: blur(30px);
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  display: flex;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: Mulish;
  align-items: center;
  width: fit-content;
  padding: 10px;
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;
const NumberWrapper = styled.div<{ isActive: boolean }>`
  height: 34px;
  background: ${({ isActive }) =>
    isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.1)"};
  color: ${({ isActive }) => (isActive ? "black" : "white")};
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-right: 10px;
`;

export default MyStakedNFTs;
