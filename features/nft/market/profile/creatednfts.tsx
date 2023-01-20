import { ChakraProvider, Spinner } from "@chakra-ui/react";
import { NftTable } from "components/NFT";
import styled from "styled-components";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { walletState } from "state/atoms/walletAtoms";
import { useRecoilValue } from "recoil";
import DropDownButton from "components/DrowdownButton";
import { LinkBox } from "@chakra-ui/react";
import { NftCard } from "components/NFT";
import Link from "next/link";
import { State } from "store/reducers";
import { NFT_COLUMN_COUNT } from "store/types";
import {
  CW721,
  Factory,
  Marketplace,
  useSdk,
  PaymentToken,
  NftInfo,
  OWNED,
  CREATED,
  getRealTokenAmount,
  getFileTypeFromURL,
} from "services/nft";
import { MARKETPLACE_ADDRESS, SORT_INFO } from "util/constants";
import useSubquery from "hooks/useSubquery";

const MyCreatedNFTs = ({ id }) => {
  const { client } = useSdk();
  const { getCreatedNfts, getCreatedNftCounts } = useSubquery();
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [loading, setLoading] = useState(true);
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(0);
  const [countInfo, setCountInfo] = useState({
    nft: 0,
    auction: 0,
    fixed: 0,
    offer: 0,
  });
  const [reloadCount, setReloadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const getNfts = async (limit = 12) => {
    setLoading(true);
    let paymentTokensAddress = [];
    if (!paymentTokens) return;
    for (let i = 0; i < paymentTokens.length; i++) {
      paymentTokensAddress.push(paymentTokens[i].address);
    }
    const marketplaceContract = Marketplace(MARKETPLACE_ADDRESS).use(client);
    const allNfts = await getCreatedNfts({
      creator: id,
      filter,
      skip: limit * page,
      limit,
      sort: SORT_INFO[filter][sort].value,
    });
    if (allNfts.length < limit) setHasMore(false);
    const nftData = await Promise.all(
      allNfts.map(async (_nft) => {
        let res_collection: any = {};
        let res_nft: any = {};
        const token_id = _nft.id.split(":")[1];
        const nft_address = _nft.id.split(":")[0];
        try {
          const ipfs_collection = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL + _nft.collection.uri
          );
          res_collection = await ipfs_collection.json();
        } catch (err) {}
        res_nft.image = process.env.NEXT_PUBLIC_PINATA_URL + _nft.imageUrl;
        res_nft.tokenId = token_id;
        res_nft.type = "image";
        res_nft.owner = _nft.owner;
        res_nft.name = _nft.name;
        try {
          const nft_type = await getFileTypeFromURL(
            process.env.NEXT_PUBLIC_PINATA_URL + _nft.imageUrl
          );
          res_nft.type = nft_type.fileType;
        } catch {}
        try {
          const sale: any = await marketplaceContract.getSale(
            token_id,
            nft_address
          );
          let paymentToken: any;
          if (sale.denom.hasOwnProperty("cw20")) {
            paymentToken =
              paymentTokens[paymentTokensAddress.indexOf(sale.denom.cw20)];
          } else {
            paymentToken =
              paymentTokens[paymentTokensAddress.indexOf(sale.denom.native)];
          }
          res_nft["paymentToken"] = paymentToken;
          res_nft["price"] = getRealTokenAmount({
            amount: sale.initial_price,
            denom: paymentToken?.denom,
          });
          res_nft["owner"] = sale.provider;
          res_nft["sale"] = sale;
        } catch (err) {
          res_nft["price"] = 0;
          res_nft["sale"] = {};
        }
        return {
          nftInfo: res_nft,
          collectionInfo: {
            name: res_collection.name,
            image: process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo,
            collectionId: _nft.collection.collectionId,
          },
        };
      })
    );
    setLoading(false);
    setLoadedNfts(loadedNfts.concat(nftData));
    setPage(page + 1);
  };
  useEffect(() => {
    (async () => {
      if (!client) {
        return;
      }
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const paymentTokenList = await response.json();
      setPaymentTokens(paymentTokenList.tokens);
      const createdNftCountInfo = await getCreatedNftCounts(id);
      setCountInfo(createdNftCountInfo);
    })();
  }, [client]);

  useEffect(() => {
    (async () => {
      await getNfts();
    })();
  }, [paymentTokens, sort, reloadCount]);
  useEffect(() => {
    setPage(0);
    setLoadedNfts([]);
    setReloadCount(reloadCount + 1);
  }, [filter]);
  const handleSortChange = async (e) => {
    setSort(e);
    setPage(0);
    setLoadedNfts([]);
  };
  const getMoreNfts = async () => {
    if (!hasMore) return false;
    getNfts();
  };
  return (
    <CollectionWrapper>
      <NftList>
        <FilterSortWrapper>
          <Filter>
            <FilterCard
              isActive={filter == "all"}
              onClick={() => setFilter("all")}
            >
              <CountWrapper>{countInfo.nft}</CountWrapper>
              All
            </FilterCard>
            <FilterCard
              isActive={filter == "fixed"}
              onClick={() => setFilter("fixed")}
            >
              <CountWrapper>{countInfo.fixed}</CountWrapper>
              Buy Now
            </FilterCard>
            <FilterCard
              isActive={filter == "auction"}
              onClick={() => setFilter("auction")}
            >
              <CountWrapper>{countInfo.auction}</CountWrapper>
              Live Auction
            </FilterCard>
            <FilterCard
              isActive={filter == "offer"}
              onClick={() => setFilter("offer")}
            >
              <CountWrapper>{countInfo.offer}</CountWrapper>
              Active Offers
            </FilterCard>
          </Filter>
          <DropDownButton
            menuList={SORT_INFO[filter]}
            onChange={handleSortChange}
            current={SORT_INFO[filter][sort]}
          />
        </FilterSortWrapper>
        {loading ? (
          <ChakraProvider>
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
          </ChakraProvider>
        ) : (
          <InfiniteScroll
            dataLength={loadedNfts.length}
            next={getMoreNfts}
            hasMore={false}
            loader={<h3> Loading...</h3>}
            endMessage={<h4></h4>}
          >
            <NftGrid>
              {loadedNfts.map((nft, index) => (
                <Link
                  href={`/nft/${nft.collectionInfo.collectionId}/${nft.nftInfo.tokenId}`}
                  passHref
                  key={index}
                >
                  <LinkBox as="picture">
                    <NftCard
                      nft={nft.nftInfo}
                      collection={nft.collectionInfo}
                      id=""
                    />
                  </LinkBox>
                </Link>
              ))}
            </NftGrid>
          </InfiniteScroll>
        )}
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
const FilterCard = styled.div<{ isActive: boolean }>`
  border-radius: 30px;
  display: flex;
  align-items: center;
  border: 1px solid;

  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  padding: 10px 30px 10px 10px;
  cursor: pointer;
  text-align: center;
  font-family: Mulish;
  color: ${({ isActive }) => (isActive ? "white" : "rgba(255,255,255,0.5)")};
  @media (max-width: 650px) {
    width: 114px;
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
const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  padding: 20px 0;
  overflow: hidden;
  overflow: auto;
`;
const FilterSortWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
const CountWrapper = styled.div`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  margin-right: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-width: 30px;
`;
export default MyCreatedNFTs;
