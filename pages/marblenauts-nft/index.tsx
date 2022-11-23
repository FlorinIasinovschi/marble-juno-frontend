import type { NextPage } from 'next'
import NFTToken from 'features/nft'
import { SdkProvider } from "services/nft/client/wallet"
import { config } from "services/config";
import {
  ChakraProvider,
} from "@chakra-ui/react"
import theme from "theme"
import { useCallback, useEffect, useState } from 'react'
import { Text } from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { Button } from "components/Button";
import { walletState } from "state/atoms/walletAtoms";
import { getRandomInt } from "util/numbers";
import { toast } from "react-toastify";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  convertToFixedDecimalNumber,
  convertMicroDenomToDenom,
} from "util/conversion";
import {
  Collection,
  Stake,
  Marble,
  NftCollection,
  CW721,
  UserStakeInfoType,
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

export default function StakePage() {
  const [maxToken, setMaxToken] = useState(0)
  const [soldCnt, setSoldCnt] = useState(0)
  const [mintedNFTs, setMintedNFTs] = useState<number>(50)
  const [royalties, setRoyalties] = useState(0)
  const totalNFTs = 1001
  const priceNFTs = 5
  const PUBLIC_CW721_CONTRACT = process.env.NEXT_PUBLIC_CW721_CONTRACT || ''
  const PUBLIC_NFTSALE_CONTRACT = process.env.NEXT_PUBLIC_NFTSALE_CONTRACT || ''

  const presaleStart = 'May 2, 2022 21:00:00 UTC+00:00'
  const presaleEnd = 'March 27, 2023 00:00:00 UTC+00:00'
  const dateTo = new Date() > new Date(presaleStart) ? presaleEnd : presaleStart

  const { client } = useSdk();
  const [collection, setCollection] = useState<NftCollection>();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [stakeConfig, setStakeConfig] = useState<StakeConfigType>({
    daily_reward: "0",
    enabled: false,
    cw20_address: "",
    interval: 0,
    lock_time: 0,
    collection_address: "",
    cw721_address: "",
    total_supply: 0,
    end_date: 0,
  });
  const [rCount, setRCount] = useState(0);
  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfoType>({
    address: "",
    claimed_amount: "0",
    unclaimed_amount: "0",
    create_unstake_timestamp: 0,
    token_ids: [],
    last_timestamp: 0,
    claimed_timestamp: 0,
  });
  const [ownedNfts, setOwnedNfts] = useState([]);
  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
      try {
        const userStakeInfo = await stakeContract.getStaking(address);
        console.log("userStakeInfo: ", userStakeInfo);
        setUserStakeInfo(userStakeInfo);
      } catch (err) {
        setUserStakeInfo({
          address: "",
          claimed_amount: "0",
          unclaimed_amount: "0",
          create_unstake_timestamp: 0,
          token_ids: [],
          last_timestamp: 0,
          claimed_timestamp: 0,
        });
      }
      try {
        const _stakeConfig = await stakeContract.getConfig();
        const collectionContract = Collection(
          _stakeConfig.collection_address
        ).use(client);
        const collectionConfig = await collectionContract.getConfig();
        setStakeConfig({
          ..._stakeConfig,
          cw721_address: collectionConfig.cw721_address,
        });
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
  }, [client, address, rCount]);
  console.log("stakeConfig: ", stakeConfig);
  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      try {
        const cw721Contract = CW721(stakeConfig.cw721_address).use(client);
        const tokenIdsInfo = await cw721Contract.tokens(address);
        const tokenIds = tokenIdsInfo.tokens;
        setOwnedNfts(tokenIds);
      } catch (err) {
        console.log("get ownedToekns Error: ", err);
      }
    })();
  }, [stakeConfig, client, address]);

  const loadNfts = useCallback(async () => {
    if (!client) return
    const marbleContract = Marble(PUBLIC_NFTSALE_CONTRACT).use(client)
    const contractConfig = await marbleContract.getConfig()
    setMaxToken(totalNFTs)
    setSoldCnt(594 + contractConfig.sold_index + 1)
    // setRoyalties(contractConfig.royalty)
    console.log('cw721:', contractConfig.cw721_address)
    const contract = CW721(contractConfig.cw721_address).use(client)
    const numTokens = await contract.numTokens()

    setMintedNFTs(numTokens)
  }, [client])

  const onBuy = useCallback(async () => {
    const now = new Date()
    if (now.getTime() < new Date(presaleStart).getTime() || now.getTime() > new Date(presaleEnd).getTime()) {
      toast.error('Minting not started yet!')
      return
    }

    if (!address || !signingClient) {
      return
    }

    const contract = Marble(PUBLIC_NFTSALE_CONTRACT).use(client)
    const contractConfig = await contract.getConfig()

    const marbleContract = Marble(PUBLIC_NFTSALE_CONTRACT).useTx(signingClient)
    const result = await marbleContract.buyNative(address)
    console.log(result)
    loadNfts()
  }, [address, signingClient, client, loadNfts])
  useEffect(() => {
    loadNfts()
  }, [loadNfts])

  return (
    <AppLayout fullWidth={false}>
      <StyledTitle>Listings</StyledTitle>
      {collection && (
        <StyledCard>
          <StyledDivForNftCollection>
            <NftCollectionCard collection={collection} />
          </StyledDivForNftCollection>
          <StyledDivForInfo>
            <StyledHeading>{collection.name}</StyledHeading>
            <StyledRow>
              <StyledDiv>
                <Text>
                  The Marblenauts is a special collection of 1001 Cosmosnauts made
                  of marble with DAO membership, rewards and airdrop for owners.
                  Each NFT provides the membership to exclusive contents and
                  incentives
                </Text>
              </StyledDiv>
            </StyledRow>
            <StyledRow>
              <StyledDivProp>
                <Text variant="secondary">
                  • Marblenauts owners receive the Airdrop of 5,000,000 $BLOCK
                  and 100 $MARBLE<br></br>• Marblenauts owners can vote by staking $MARBLE<br></br>• Marblenauts owners can stake the NFTs to earn rewards<br></br>
                </Text>
              </StyledDivProp>
            </StyledRow>
            <StyledRow>

            <StyledDiv>
              <StyledSubHeading>Total NFTs</StyledSubHeading>
              <StyledText>{maxToken}</StyledText>
            </StyledDiv>

            <StyledDiv>
            <StyledSubHeading>Minted(%)</StyledSubHeading>
            <StyledText>{Number((soldCnt / totalNFTs * 100).toFixed(2))} %</StyledText>
            </StyledDiv>

            <StyledDiv>
              <StyledSubHeading>Price</StyledSubHeading>
              <StyledText>{Number((8).toFixed(2))} JUNO</StyledText>
            </StyledDiv>

            <StyledDiv>
              <StyledSubHeading>Fees</StyledSubHeading>
              <StyledText>{royalties}%</StyledText>
            </StyledDiv>
            </StyledRow>

            <ButtonWrapper>
                <Button
                  className="btn-buy btn-default"
                  css={{
                    background: "$white",
                    color: "$black",
                    stroke: "$black",
                    padding: "15px auto",
                  }}
                  onClick={onBuy}
                >
                  Mint
                </Button>
            </ButtonWrapper>
          </StyledDivForInfo>
        </StyledCard>
      )}
    </AppLayout>
  );
}

const StyledCard = styled("div")`
  display: flex;
  padding: 40px;
  margin-top: 30px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 70%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 30px;
  max-width: 1530px;
  margin: auto;
`;

const StyledDiv = styled("div")`
  flex: 1;
  padding-top: 20px;
  padding-bottom: 20px;
  display: grid;
  justify-content: center;
  align-items: center;

`;

const StyledDivProp = styled("div")`
  flex: 1;
  padding-top: 20px;
  padding-bottom: 20px;
  display: grid;
  justify-content: center;
  align-items: center;

`;

const StyledDivForInfo = styled("div")`
  flex: 1;
  padding-left: 60px;
`;

const StyledRow = styled("div")`
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled(Text)`
  font-size: 50px;
  text-align: center;
  line-height: 60px;
  margin-top: 40px;
  margin-bottom: 15px;
`;

const StyledHeading = styled(Text)`
  font-size: 42px;
  line-height: 50.4px;
`;

const StyledSubHeading = styled(Text)`
  font-size: 28px;
  line-height: 40px;
`;

const StyledText = styled(Text)`
  font-size: 26px;
  line-height: 31.2px;
  opacity: 0.5;
  padding-top: 10px;
`;

const StyledDivForNftCollection = styled("div")`
  width: 400px;
`;

export const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 50px;
  margin-top: 20px;
`;
