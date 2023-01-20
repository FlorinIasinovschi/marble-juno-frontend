import { LinkBox, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DropDownButton from "components/DrowdownButton";
import { NftCard } from "components/NFT";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Marketplace,
  CW721,
  getFileTypeFromURL,
  getRealTokenAmount,
  Factory,
  PaymentToken,
  useSdk,
} from "services/nft";
import { MARKETPLACE_ADDRESS, SORT_INFO } from "util/constants";
import useSubquery from "hooks/useSubquery";
import {
  Container,
  ExploreWrapper,
  FilterSortWrapper,
  Filter,
  FilterCard,
  CountWrapper,
} from "./styled";

const Explore = ({ filter }) => {
  const { client } = useSdk();
  const { getAllNfts } = useSubquery();
  const { countInfo } = useSelector((state: any) => state.uiData);
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const getNfts = async (limit = 12) => {
    let paymentTokensAddress = [];
    if (!paymentTokens) return;
    for (let i = 0; i < paymentTokens.length; i++) {
      paymentTokensAddress.push(paymentTokens[i].address);
    }
    const marketplaceContract = Marketplace(MARKETPLACE_ADDRESS).use(client);
    const allNfts = await getAllNfts({
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
    <ExploreWrapper>
      <FilterSortWrapper>
        <Filter>
          <Link href="/explore/nfts" passHref>
            <FilterCard isActive={filter == "all"}>
              <CountWrapper>{countInfo.nft}</CountWrapper>
              All
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/fixed" passHref>
            <FilterCard isActive={filter == "fixed"}>
              <CountWrapper>{countInfo.fixed}</CountWrapper>
              Buy Now
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/auction" passHref>
            <FilterCard isActive={filter == "auction"}>
              <CountWrapper>{countInfo.auction}</CountWrapper>
              Live Auction
            </FilterCard>
          </Link>
          <Link href="/explore/nfts/offer" passHref>
            <FilterCard isActive={filter == "offer"}>
              <CountWrapper>{countInfo.offer}</CountWrapper>
              Active Offers
            </FilterCard>
          </Link>
        </Filter>
        <DropDownButton
          menuList={SORT_INFO[filter]}
          onChange={handleSortChange}
          current={SORT_INFO[filter][sort]}
        />
      </FilterSortWrapper>
      {loadedNfts.length > 0 && (
        <InfiniteScroll
          dataLength={loadedNfts.length}
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
                padding: "20px",
              }}
            >
              <Spinner size="xl" />
            </div>
          }
          endMessage={<h4></h4>}
        >
          <Container>
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
          </Container>
        </InfiniteScroll>
      )}
    </ExploreWrapper>
  );
};

export default Explore;
