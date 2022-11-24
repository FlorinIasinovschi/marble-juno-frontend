import { AppLayout } from "components/Layout/AppLayout";
import { styled } from "components/theme";
import { CollectionCreate } from "features/nft/market/collection/create";

import { config } from "services/config";
import { SdkProvider } from "services/nft/client/wallet";

export default function Home() {
  return (
    <AppLayout fullWidth={true}>
      <SdkProvider config={config}>
        <CollectionCreate />
      </SdkProvider>
    </AppLayout>
  );
}
