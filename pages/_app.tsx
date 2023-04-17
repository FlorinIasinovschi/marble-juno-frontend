import "normalize.css";
import "react-toastify/dist/ReactToastify.css";
import "styles/globals.scss";
import "focus-visible";

import "node_modules/stream-chat-react/dist/css/v2/index.css";
import "../features/chatapp/styles/index.css";
import "../features/chatapp/components/AvatarGroup/AvatarGroup.css";
import "../features/chatapp/components/CreateChannel/CreateChannel.css";
import "../features/chatapp/components/MessagingChannelHeader/MessagingChannelHeader.css";
import "../features/chatapp/components/MessagingChannelPreview/MessagingChannelPreview.css";
import "../features/chatapp/components/MessagingThreadHeader/MessagingThreadHeader.css";
import "../features/chatapp/components/TypingIndicator/TypingIndicator.css";
import "../features/chatapp/components/WindowControls/WindowControls.css";

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
import Script from "next/script";
import { useRouter } from "next/router";
import * as fbq from "../lib/fpixel";
import { useEffect } from "react";

function SafeHydrate({ children }) {
  return (
    <div data-app-wrapper="" lang="en-US" suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  useEffect(() => {
    // This pageview only triggers the first time (it's important for Pixel to have real information)
    fbq.pageview();

    const handleRouteChange = () => {
      fbq.pageview();
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${fbq.FB_PIXEL_ID});
        `,
        }}
      />
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
    </>
  );
}

export default MyApp;
