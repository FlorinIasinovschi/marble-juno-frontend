import { AppLayout } from "components/Layout/AppLayout";
import { PageHeader } from "components/Layout/PageHeader";
import { styled } from "components/theme";
import { NFTDetail } from "features/nft/market/detail/NFTDetail";
import { useRouter } from "next/router";
import { useState } from "react";

import { config } from "services/config";
import { SdkProvider } from "services/nft/client/wallet";

export default function Home() {
  const { asPath, pathname } = useRouter();
  const id = asPath.split("/")[3];
  const collectionId = asPath.split("/")[2];
  const [fullWidth, setFullWidth] = useState(true);
  return (
    <AppLayout fullWidth={fullWidth} hasBanner={true}>
      <SdkProvider config={config}>
        <PageHeader title="" subtitle="" align="center" />
        <Container className="middle mauto">
          <NFTDetail collectionId={collectionId} id={id} />
        </Container>
      </SdkProvider>
    </AppLayout>
  );
}

const Container = styled("div", {});
