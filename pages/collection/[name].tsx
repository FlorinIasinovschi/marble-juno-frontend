import React from "react";
// import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { AppLayout } from "components/Layout/AppLayout";
// import { useDispatch, useSelector } from "react-redux";
// import { State } from "store/reducers";
// import { NFT_COLUMN_COUNT, FILTER_STATUS } from "store/types";
import { CollectionPage } from "features/nft/market/collection/collection";

export default function Home() {
  const { asPath } = useRouter();
  const collectionId = asPath.replace("/collection/", "");
  return (
    <AppLayout fullWidth={true} hasBanner={true}>
      <CollectionPage id={collectionId} />
    </AppLayout>
  );
}
