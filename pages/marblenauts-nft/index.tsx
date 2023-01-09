import type { NextPage } from "next";
import NFTToken from "features/nft";
import { SdkProvider } from "services/nft/client/wallet";
import { config } from "services/config";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme";
import { useCallback, useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { Button } from "components/Button";
import { walletState } from "state/atoms/walletAtoms";
import { getRandomInt } from "util/numbers";
import { GradientBackground, SecondGradientBackground } from "styles/styles";
import { toast } from "react-toastify";
import {
  Collection,
  Marble,
  NftCollection,
  CW721,
  useSdk,
  getFileTypeFromURL,
} from "services/nft";
import { useRecoilValue } from "recoil";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";
interface StakeConfigType {
  daily_reward: string;
  enabled: boolean;
  cw20_address: string;
  interval: number;
  lock_time: number;
  collection_address: string;
  cw721_address: string;
  total_supply: number;
  end_date: number;
}
const collection_address =
  "juno16hjg4c5saxqqa3cwfx7aw9vzapqna7fn2xprttge888lw0zlw5us87nv8x";
export default function StakePage() {
  const [maxToken, setMaxToken] = useState(0);
  const [soldCnt, setSoldCnt] = useState(0);
  const [price, setPrice] = useState(0);
  const [mintedNFTs, setMintedNFTs] = useState<number>(50);
  const [royalties, setRoyalties] = useState(0);
  const totalNFTs = 1001;
  const priceNFTs = 5;
  const PUBLIC_CW721_CONTRACT = process.env.NEXT_PUBLIC_CW721_CONTRACT || "";
  const PUBLIC_NFTSALE_CONTRACT =
    process.env.NEXT_PUBLIC_NFTSALE_CONTRACT || "";

  const presaleStart = "May 2, 2022 21:00:00 UTC+00:00";
  const presaleEnd = "March 27, 2023 00:00:00 UTC+00:00";
  const dateTo =
    new Date() > new Date(presaleStart) ? presaleEnd : presaleStart;

  const { client } = useSdk();
  const [collection, setCollection] = useState<NftCollection>();
  const { address, client: signingClient } = useRecoilValue(walletState);
  useEffect(() => {
    (async () => {
      try {
        const collectionContract = Collection(collection_address).use(client);
        const collectionConfig = await collectionContract.getConfig();
        let res_collection: any = {};
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

        setCollection(collection_info);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [client]);

  const loadNfts = useCallback(async () => {
    if (!client) return;
    const marbleContract = Marble(PUBLIC_NFTSALE_CONTRACT).use(client);
    const contractConfig = await marbleContract.getConfig();
    setMaxToken(totalNFTs);
    console.log("contractConfig: ", contractConfig);
    setSoldCnt(594 + contractConfig.sold_index + 1);
    setPrice(Number(contractConfig.price));
    // setRoyalties(contractConfig.royalty)
    const contract = CW721(contractConfig.cw721_address).use(client);
    const numTokens = await contract.numTokens();

    setMintedNFTs(numTokens);
  }, [client, PUBLIC_NFTSALE_CONTRACT]);

  const onBuy = useCallback(async () => {
    return;
    const now = new Date();
    if (
      now.getTime() < new Date(presaleStart).getTime() ||
      now.getTime() > new Date(presaleEnd).getTime()
    ) {
      toast.error("Minting not started yet!");
      return;
    }

    if (!address || !signingClient) {
      toast.error("Connect your wallet!");
      return;
    }

    const contract = Marble(PUBLIC_NFTSALE_CONTRACT).use(client);
    const marbleContract = Marble(PUBLIC_NFTSALE_CONTRACT).useTx(signingClient);
    const result = await marbleContract.buyNative(address, price);
    toast.success(`Successfully Minted`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    console.log(result);
    loadNfts();
  }, [
    address,
    signingClient,
    client,
    loadNfts,
    price,
    PUBLIC_NFTSALE_CONTRACT,
  ]);
  useEffect(() => {
    loadNfts();
  }, [loadNfts, client]);

  return (
    <AppLayout fullWidth={false}>
      <Container>
        <Header>Listings</Header>
        {collection && (
          <StakingCardWrapper>
            <h1>{collection.name}</h1>
            <ContentWrapper>
              <CollectionCardWrapper>
                <NftCollectionCard collection={collection} />
              </CollectionCardWrapper>
              <CollectionContent>
                <StakingInfoContainer>
                  The Marblenauts is a special collection of 1001 Cosmosnauts
                  made of marble with DAO membership, rewards and airdrop for
                  owners. Each NFT provides the membership to exclusive contents
                  and incentives
                </StakingInfoContainer>
                <StakingContentContainer>
                  • Marblenauts owners receive the Airdrop of 5,000,000 $BLOCK
                  and 100 $MARBLE
                  <br />• Marblenauts owners can vote by staking $MARBLE
                  <br />• Marblenauts owners can stake the NFTs to earn rewards
                  <br></br>
                </StakingContentContainer>
                <StyledRow>
                  <StyledDiv>
                    <StyledSubHeading>Total NFTs</StyledSubHeading>
                    <StyledText>{maxToken}</StyledText>
                  </StyledDiv>

                  <StyledDiv>
                    <StyledSubHeading>Minted(%)</StyledSubHeading>
                    <StyledText>100 %</StyledText>
                  </StyledDiv>

                  <StyledDiv>
                    <StyledSubHeading>Price</StyledSubHeading>
                    <StyledText>
                      {Number((price / 1000000).toFixed(2))} JUNO
                    </StyledText>
                  </StyledDiv>

                  <StyledDiv>
                    <StyledSubHeading>Fees</StyledSubHeading>
                    <StyledText>{royalties}%</StyledText>
                  </StyledDiv>
                </StyledRow>

                <Button
                  className="btn-buy btn-default"
                  css={{
                    background: "$white",
                    color: "$black",
                    stroke: "$black",
                    padding: "15px auto",
                  }}
                  onClick={onBuy}
                  disabled={true}
                >
                  {/* Mint */}
                  Sold Out
                </Button>
              </CollectionContent>
            </ContentWrapper>
          </StakingCardWrapper>
        )}
      </Container>
    </AppLayout>
  );
}

const StakingContentContainer = styled.div`
  font-size: 16px;
  font-family: Mulish;
  margin-left: 20px;
  @media (max-width: 650px) {
    text-align: left;
  }
`;
const StyledDiv = styled("div")`
  flex: 1;
  padding-top: 20px;
  padding-bottom: 20px;
  display: grid;
  justify-content: center;
  align-items: center;
`;
const ContentWrapper = styled.div`
  padding: 40px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  @media (max-width: 1550px) {
    padding: 20px;
  }
  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    padding: 10px;
  }
  @media (max-width: 650px) {
    padding: 0px;
  }
`;
const StyledRow = styled("div")`
  display: flex;
  justify-content: space-between;
  @media (max-width: 650px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledSubHeading = styled(Text)`
  font-size: 22px;
  line-height: 40px;
`;

const StyledText = styled(Text)`
  font-size: 20px;
  line-height: 31.2px;
  opacity: 0.5;
  padding-top: 10px;
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Header = styled.div`
  font-size: 50px;
  font-weight: 700;
  padding-bottom: 20px;
  @media (max-width: 1550px) {
    font-size: 40px;
    font-weight: 500;
    margin-top: 20px;
  }
`;
const StakingCardWrapper = styled(SecondGradientBackground)`
  &:before {
    border-radius: 20px;
    opacity: 0.5;
  }
  h1 {
    font-size: 40px;
    text-align: center;
  }
  padding-top: 20px;
`;

const CollectionContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 30px;
  width: 100%;
  row-gap: 20px;
  h1 {
    font-size: 42px;
    font-weight: 500;
  }
  @media (max-width: 1550px) {
    h1 {
      font-size: 36px;
    }
  }
  @media (max-width: 1024px) {
    text-align: center;
    padding-left: 0;
  }
  @media (max-width: 650px) {
    padding: 10px;
  }
`;
const StakingInfoContainer = styled.div`
  font-family: Mulish;
  font-size: 18px;
  @media (max-width: 650px) {
    text-align: left;
  }
`;
const CollectionCardWrapper = styled.div`
  height: fit-content;
`;
