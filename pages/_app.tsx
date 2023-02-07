import "normalize.css";
import "react-toastify/dist/ReactToastify.css";
import "styles/globals.scss";
import "focus-visible";

import 'node_modules/stream-chat-react/dist/css/v2/index.css';
import '../features/chatapp/styles/index.css';
import  '../features/chatapp/components/AvatarGroup/AvatarGroup.css';
import  '../features/chatapp/components/CreateChannel/CreateChannel.css';
import  '../features/chatapp/components/MessagingChannelHeader/MessagingChannelHeader.css';
import  '../features/chatapp/components/MessagingChannelPreview/MessagingChannelPreview.css';
import  '../features/chatapp/components/MessagingThreadHeader/MessagingThreadHeader.css';
import  '../features/chatapp/components/TypingIndicator/TypingIndicator.css';
import  '../features/chatapp/components/WindowControls/WindowControls.css';

import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import { ChakraProvider } from "@chakra-ui/react";
// import { ErrorBoundary } from "components/ErrorBoundary";
import { QueryClientProvider } from "react-query";
import { Portal } from "@reach/portal";
import { ToastContainer } from "react-toastify";
import { TestnetDialog } from "components/TestnetDialog";
import { queryClient } from "services/queryClient";
import { __TEST_MODE__ } from "../util/constants";
import { SdkProvider } from "services/nft/client/wallet";
import { config } from "services/config";
import React from "react";
import { wrapper, store } from "../store/store";
import { Provider } from "react-redux";

function SafeHydrate({ children }) {
  return (
    <div data-app-wrapper="" lang="en-US" suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }: any) {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <SafeHydrate>
          <ChakraProvider>
            <SdkProvider config={config}>
              {/* <ErrorBoundary> */}
              <Provider store={store}>
                <Component {...pageProps} />
                {__TEST_MODE__ && <TestnetDialog />}
                <Portal>
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    toastStyle={{ zIndex: 150 }}
                    style={{ width: "auto" }}
                  />
                </Portal>
              </Provider>
              {/* </ErrorBoundary> */}
            </SdkProvider>
          </ChakraProvider>
        </SafeHydrate>
      </QueryClientProvider>
    </RecoilRoot>
  );
}

export default MyApp;
