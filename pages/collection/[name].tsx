import React from 'react'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'

import { AppLayout } from 'components/Layout/AppLayout'
import { useDispatch, useSelector } from "react-redux";
import { State } from 'store/reducers'
import { NFT_COLUMN_COUNT, FILTER_STATUS } from "store/types";
import { CollectionPage } from 'features/nft/market/collection/collection';


export default function Home() {
  const DEFAULT_NFT_COLUMN_COUNT = 3

  const { asPath } = useRouter();
  const collectionId = asPath.replace('/collection/', '')

  const [fullWidth, setFullWidth] = useState(true);

  const dispatch = useDispatch()

  const filterData = useSelector((state: State) => state.filterData)
  const { filter_status } = filterData
  
  useEffect(() => {
    //setUIData(NFT_COLUMN_COUNT, DEFAULT_NFT_COLUMN_COUNT)
    dispatch(
      {
        type: NFT_COLUMN_COUNT,
        payload: DEFAULT_NFT_COLUMN_COUNT
      }
    )
    //setFilterData(FILTER_STATUS, DEFAULT_FILTER_STATUS)
    dispatch(
      {
        type: FILTER_STATUS,
        payload: filter_status,
      }
    )
  }, [dispatch]);
  useEffect(() => {
    (async () => {
      
      if (collectionId === undefined || collectionId == "[name]")
        return false
      
    })();

  }, [collectionId])
  return (
    <AppLayout fullWidth={fullWidth} hasBanner={true}>
      <CollectionPage id={collectionId} />
    </AppLayout>
  )
}
