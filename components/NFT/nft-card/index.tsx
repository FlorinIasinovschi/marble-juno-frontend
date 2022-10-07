import styled from 'styled-components'
import { useEffect, useState } from "react"
import { Stack, Flex, HStack } from '@chakra-ui/react'
import * as React from "react"
import Link from 'next/link'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from "react-redux"
import { State } from 'store/reducers'
import {
  NftInfo,
  CW721,
  Collection,
  Market,
  useSdk,
  getRealTokenAmount,
  toMinDenom,
  PaymentToken,
  SALE_TYPE,
  
} from "services/nft"
import { NftInfoResponse } from 'services/nft'

import { Dispatch, AnyAction } from "redux"
import { BuyDialog } from 'features/nft/market/detail/BuyDialog'
import { OfferDialog } from 'features/nft/market/detail/OfferDialog'
import { NftPrice } from './price'
import { shortenAddress } from 'util/shortenAddress'
interface NftCardProps {
  readonly nft: NftInfo
  readonly type: string
}
export function NftAuctionTime(start:number, end:number){
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  useEffect(() => {
    setStartTime(start)
    setEndTime(end)
  }, [start, end])
  return (
    <>
    <p>
    {startTime}
    </p>
    <p>
    {endTime}
    </p>
    </>
  )
}

const saleType = {
  NotSale: 'NOT ON SALE',
  Auction: 'CURRENT BID',
  Fixed: 'BUY NOW',
}

const backgroundColor = {
  NotSale: 'rgba(05, 06, 22, 0.2)',
  Auction: 'rgba(219, 115, 115, 0.5)',
  Fixed: '#FFFFFF',
}

export function NftCard({ nft, type }: NftCardProps): JSX.Element {
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const [time, setTime] = useState(Math.round(new Date().getTime())/1000)
  const [isDisabled, setIsDisabled] = useState(false)
  const dispatch = useDispatch()
  const buyData = useSelector((state: State) => state.buyData)
  const { buy_status } = buyData
  const offerData = useSelector((state: State) => state.offerData)
  const { offer_status } = offerData
  const [reloadNft, setReloadNft] = useState(0)
  const reloadData = useSelector((state: State) => state.reloadData)
  const { reload_status } = reloadData
  const [tokenInfo, setTokenInfo] = useState<NftInfoResponse>();
  
  const [isBuyShowing, setIsBuyShowing] = useState(false)
  const [buyId, setBuyId] = useState("")
  const [isOfferShowing, setIsOfferShowing] = useState(false)
  const [offerId, setOfferId] = useState("")

  const showBuyDialog = async(e) => {
    e.preventDefault()
    // dispatch(
    //   {
    //     type: BUY_STATUS,
    //     payload: nft.tokenId
    //   }
    // )
    setBuyId(nft.tokenId)
    setIsBuyShowing(true)
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const showOfferDialog = async(e) => {
    e.preventDefault()
    // dispatch(
    //   {
    //     type: OFFER_STATUS,
    //     payload: nft.tokenId
    //   }
    // )
    setOfferId(nft.tokenId)
    setIsOfferShowing(true)
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const cancelSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(nft.collectionId))
    const collectionContract = Collection(collection.collection_address).useTx(signingClient)
    let cancel = await collectionContract.cancelSale(address, Number(nft.tokenId))
    
    toast.success(
      `You have cancelled this NFT successfully.`,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
    setIsDisabled(false)
    nft.paymentToken = {}
    nft.price = "0"
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const acceptSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(nft.collectionId))
    const collectionContract = Collection(collection.collection_address).useTx(signingClient)
    let accept = await collectionContract.acceptSale(address, Number(nft.tokenId))
    
    toast.success(
      `You have accepted this NFT Auction successfully.`,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
    setIsDisabled(false)
    nft.paymentToken = {}
    nft.price = "0"
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  
  useEffect(() => {
  }, [reloadNft])
  
  useEffect(() => {
    (async () => {
      
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const paymentTokenList = await response.json()
      let paymentTokensAddress = []
      for (let i = 0; i < paymentTokenList.tokens.length; i++){
        paymentTokensAddress.push(paymentTokenList.tokens[i].address)
      }

      const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
      let collection = await marketContract.collection(Number(nft.collectionId))
      const cwCollectionContract = Collection(collection.collection_address).use(client)
      const cw721Contract = CW721(collection.cw721_address).use(client)
      let sales:any = await cwCollectionContract.getSales()
      let saleIds = []
      for (let i=0; i<sales.length; i++){
        saleIds.push(sales[i].token_id)
      }

      nft.paymentToken = {}
      nft.price = "0"
      nft.symbol = "Marble"
      nft.sale = {}
      nft.user = await cw721Contract.ownerOf(nft.tokenId)
      setTokenInfo(await cw721Contract.nftInfo(nft.tokenId))
      if (saleIds.indexOf(parseInt(nft.tokenId)) != -1){
        let sale = sales[saleIds.indexOf(parseInt(nft.tokenId))]
        let paymentToken: any
        if (sale.denom.hasOwnProperty("cw20")){
          paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.cw20)]
        }else{
          paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.native)]
        }
        nft.symbol = paymentToken.symbol
        nft.paymentToken = paymentToken
        nft.price = getRealTokenAmount({amount: sale.initial_price, denom: paymentToken.denom}).toString()
        nft.user = sale.provider
        nft.sale = sale
      }
      let reloadNftCnt = reloadNft + 1
      setReloadNft(reloadNftCnt)
    })();
  }, [dispatch, reload_status])

  console.log('nft info res', tokenInfo);
  
  return (
    <NftCardDiv 
      className="nft-card"
      color={backgroundColor[Object.keys(nft.sale).length < 0 ? 'NotSale' : nft.sale.sale_type]}
      revertColor={Object.keys(nft.sale).length > 0 && nft.sale.sale_type === 'Fixed'}
    >
      {/* {/* {buyId != "" && 
        <BuyDialog 
          isShowing={isBuyShowing}
          onRequestClose={() => {
            setIsBuyShowing(false)
            setBuyId("")
            
          }}
          collectionId={nft.collectionId.toString()}
          id={buyId}
        />
      }
      {offerId != "" && 
        <OfferDialog 
          isShowing={isOfferShowing}
          onRequestClose={() => {
            setIsOfferShowing(false)
            setOfferId("")
            
          }}
          collectionId={nft.collectionId.toString()}
          id={offerId}
        />
      } */}
      {/* <Link href={`/nft/${nft.collectionId}/${nft.tokenId}`} passHref > */}
        <>
          <ImgDiv className="nft-img-url">
            
            {nft.type == 'image' &&
            <Image src={nft.image} alt="NFT Image"/>
            }
            {nft.type == 'video' &&
            <video controls>
              <source src={nft.image}/>
            </video>
            }
            {nft.type == 'audio' &&
            <audio controls>
              <source src={nft.image}/>
            </audio>
            }
          </ImgDiv>
          <Stack paddingTop="15px">
            <Flex justifyContent="space-between">
              <NFTName>{nft.name}</NFTName>
              <HStack>
                <Logo
                  src={'/default.png'}
                  alt="logo"
                  size="34px"
                />
                <p>{shortenAddress(nft.user)}</p>
              </HStack>
            </Flex>

            <Flex justifyContent="space-between" paddingTop="10px 0">
              <Stack>
                <Title>{saleType[Object.keys(nft.sale).length === 0 ? "NotSale" : nft.sale.sale_type]}</Title>
                {
                  Object.keys(nft.sale).length > 0 && nft.sale.sale_type === 'Fixed' && (
                    <Flex alignItems="center">
                      <Value>
                        {getRealTokenAmount({amount: nft.sale.initial_price, denom: nft.paymentToken.denom})}
                      </Value>
                      &nbsp;
                      <img
                        src={nft.paymentToken.logoUri}
                        alt="token"
                        width="20px"
                        height="20px"
                      />
                    </Flex>
                  )
                }
                {
                  Object.keys(nft.sale).length > 0 && nft.sale.sale_type === 'Auction' && (
                    <Flex alignItems="center">
                      {
                        nft.sale.requests > 0 ? (
                          <>
                            <Value>
                              {getRealTokenAmount({amount: nft.sale.requests[nft.sale.requests.length - 1].price, denom: nft.paymentToken.denom})}
                            </Value>
                            &nbsp;
                            <img
                              src={nft.paymentToken.logoUri}
                              alt="token"
                              width="20px"
                              height="20px"
                            />
                          </>
                        ) : (
                          "No requests"
                        )
                      }
                    </Flex>
                  )
                }
              </Stack>
            </Flex>
          </Stack>
        </>
      {/* </Link> */}
    </NftCardDiv>
  );
}

const NftCardDiv = styled.div<{ color: string; revertColor: boolean }>`
  border-radius: 20px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${({ color }) => color};
  padding: 30px;
  height: 100%;
  width: 100%;
  cursor: pointer;
  color: ${({ revertColor }) => (revertColor ? 'black' : 'white')};
  @media (max-width: 1550px) {
    padding: 20px;
  }
  p {
    font-size: 16px;
    font-family: Mulish;
    @media (max-width: 1550px) {
      font-size: 16px;
    }
  }
  @media (max-width: 480px) {
    width: 320px;
  }
`
const NFTName = styled.div`
  font-size: 20px;
`
const Title = styled.div`
  font-size: 14px;
  @media (max-width: 1550px) {
    font-size: 12px;
  }
`
const Value = styled.div`
  margin-top: 3px;
  font-size: 18px;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`
const Timetrack = styled.div`
  .dcd-info {
    font-size: 14px;
    width: 100%;
    @media (max-width: 1550px) {
      font-size: 12px;
    }
  }
  .dcd-val {
    font-size: 18px;
    @media (max-width: 1550px) {
      font-size: 14px;
    }
  }
`

const ImgDiv = styled.div`
  width: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
`
const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
`
const Logo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`
