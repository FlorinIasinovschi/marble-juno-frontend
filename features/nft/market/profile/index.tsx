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
  OWNED,
  CREATED,
  getRealTokenAmount,
  getFileTypeFromURL,
} from "services/nft";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

export const MyCollectedNFTs = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const pageCount = 10;
  const [nfts, setNfts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const dispatch = useDispatch();
  const [nftCounts, setNftCounts] = useState({
    Auction: 0,
    "Direct Sell": 0,
    NotSale: 0,
  });
  const { address } = useRecoilValue(walletState);
  const { client } = useSdk();
  const [filtered, setFiltered] = useState([]);
  const [filterTab, setFilterTab] = useState("");
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [reloadCount, setReloadCount] = useState(0);
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  // const profileData = useSelector((state: State) => state.profileData)
  // const { profile_status } = profileData
  const fetchOwnedNFTs = useCallback(async () => {
    let collectionNFTs = [];
    let counts = { Auction: 0, "Direct Sell": 0, NotSale: 0 };
    try {
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collections = await marketContract.listCollections();
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const paymentTokenList = await response.json();
      setPaymentTokens(paymentTokenList.tokens);
      let paymentTokensAddress = [];
      for (let i = 0; i < paymentTokenList.tokens.length; i++) {
        paymentTokensAddress.push(paymentTokenList.tokens[i].address);
      }
      let rCount = 0;
      for (let k = 0; k < collections.length; k++) {
        let collection = await marketContract.collection(collections[k].id);
        const response = await fetch(
          process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
        );
        const paymentTokenList = await response.json();
        setPaymentTokens(paymentTokenList.tokens);
        const cwCollectionContract = Collection(
          collection.collection_address
        ).use(client);
        let sales: any = await cwCollectionContract.getSales();
        let saleIds = [];
        for (let i = 0; i < sales.length; i++) {
          saleIds.push(sales[i].token_id);
        }
        const cw721Contract = CW721(collection.cw721_address).use(client);
        let tokenIdsInfo: any;
        let tokenIds: any;
        tokenIdsInfo = await cw721Contract.tokens(id);
        tokenIds = tokenIdsInfo.tokens;
        while (tokenIds.length > 0) {
          for (let i = 0; i < tokenIds.length; i++) {
            let nftInfo = await cw721Contract.nftInfo(tokenIds[i]);
            let ipfs_nft = await fetch(
              process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
            );
            let res_nft = await ipfs_nft.json();
            res_nft["tokenId"] = tokenIds[i];
            res_nft["created"] = res_nft["owner"];
            res_nft["collectionId"] = collections[k].id;
            res_nft["image"] = res_nft.uri.includes("https://")
              ? res_nft["uri"]
              : process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"];
            res_nft["owner"] = await cw721Contract.ownerOf(res_nft["tokenId"]);
            if (res_nft["created"] != id && res_nft["owner"] != id) {
              continue;
            }
            let res_uri = res_nft["uri"];
            if (res_uri.indexOf("https://") == -1) {
              res_uri = process.env.NEXT_PUBLIC_PINATA_URL + res_uri;
            }
            let nft_type = await getFileTypeFromURL(res_uri);
            res_nft["type"] = nft_type.fileType;
            if (saleIds.indexOf(parseInt(tokenIds[i])) != -1) {
              let sale = sales[saleIds.indexOf(parseInt(tokenIds[i]))];
              let paymentToken: any;
              if (sale.denom.hasOwnProperty("cw20")) {
                paymentToken =
                  paymentTokenList.tokens[
                    paymentTokensAddress.indexOf(sale.denom.cw20)
                  ];
              } else {
                paymentToken =
                  paymentTokenList.tokens[
                    paymentTokensAddress.indexOf(sale.denom.native)
                  ];
              }
              res_nft["symbol"] = paymentToken?.symbol;
              res_nft["paymentToken"] = paymentToken;
              res_nft["price"] = getRealTokenAmount({
                amount: sale.initial_price,
                denom: paymentToken?.denom,
              });
              // res_nft.price = {};
              res_nft["owner"] = sale.provider;
              res_nft["sale"] = sale;
            } else {
              res_nft["price"] = 0;
              res_nft["sale"] = {};
            }
            collectionNFTs.push(res_nft);
          }
          let start_after = tokenIds[tokenIds.length - 1];
          tokenIds = [];
          tokenIdsInfo = await cw721Contract.tokens(id, start_after);
          tokenIds = tokenIdsInfo.tokens;
          rCount++;
          setReloadCount(rCount);
        }
      }
    } catch (err) {
      console.log("fetchOwnedNFTs Error: ", err);
    }
    return { nftList: collectionNFTs, nft_counts: counts };
  }, [address, client]);
  useEffect(() => {
    (async () => {
      const { nftList, nft_counts }: any = await fetchOwnedNFTs();
      setNfts(nftList);
      setFiltered(nftList);
      setNftCounts(nft_counts);
      setHasMore(true);
      setLoading(false);
    })();
  }, [id, fetchOwnedNFTs]);
  const getMoreNfts = async () => {};
  const handleFilter = (id: string) => {
    if (id == filterTab) {
      setFilterTab("");
      setFiltered(nfts);
      return;
    }
    const filteredNFTs = nfts.filter((nft) => nft.saleType === id);
    setFiltered(filteredNFTs);
    setFilterTab(id);
  };
  return (
    <CollectionWrapper>
      <NftList>
        <Filter>
          <FilterCard onClick={() => handleFilter("Direct Sell")}>
            <NumberWrapper isActive={filterTab === "Direct Sell"}>
              {nftCounts["Direct Sell"]}
            </NumberWrapper>
            Buy Now
          </FilterCard>
          <FilterCard onClick={() => handleFilter("Auction")}>
            <NumberWrapper isActive={filterTab === "Auction"}>
              {nftCounts["Auction"]}
            </NumberWrapper>
            Live Auction
          </FilterCard>
          <FilterCard onClick={() => handleFilter("NotSale")}>
            <NumberWrapper isActive={filterTab === "NotSale"}>
              {nftCounts["NotSale"]}
            </NumberWrapper>
            Active Offers
          </FilterCard>
        </Filter>
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
            dataLength={nfts.length}
            next={getMoreNfts}
            hasMore={false}
            loader={<h3> Loading...</h3>}
            endMessage={<h4></h4>}
          >
            <NftTable data={filtered} type="sell" nft_column_count={2} />
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
