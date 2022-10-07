import * as React from "react";
import { useEffect } from "react";
import { LinkBox } from "@chakra-ui/react";
import Link from 'next/link'
import { NftCard } from "../nft-card";
import { NftInfo, CollectionToken } from "services/nft";
import { useDispatch, useSelector } from "react-redux";
import { State } from 'store/reducers'
import styled from 'styled-components'

interface NftTableProps {
  readonly data: NftInfo[]
  readonly type: string
}

export function NftTable({ data, type}: NftTableProps) {
  const dispatch = useDispatch()
  const uiListData = useSelector((state: State) => state.uiData)
  const { nft_column_count } = uiListData
  const filterData = useSelector((state: State) => state.filterData)
  const { filter_status } = filterData
  useEffect(() => {
    
  }, [dispatch, nft_column_count])

  return (
    <Container>
      {data.map(nft => (
        //<Link href="https://app.marbledao.finance/marblenauts-nft" passHref key={nft.tokenId}>
        <Link href={`/nft/${nft.collectionId}/${nft.tokenId}`} passHref key={nft.tokenId}>
          <LinkBox as="picture" 
              transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
              _hover={{
                transform: "scale(1.05)"
              }}
              key={nft.tokenId}
            >
            <NftCard nft={nft} type={type}/>
          </LinkBox>
        </Link>  
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 20px;
  gap: 20px;
`