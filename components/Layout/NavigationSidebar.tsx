import { useEffect, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { useRecoilState } from "recoil";
import { walletState, WalletStatusType } from "../../state/atoms/walletAtoms";
import { useRouter } from "next/router";
import { isMobile } from "util/device";
import { RoundedIcon, RoundedIconComponent } from "components/RoundedIcon";
import { default_image } from "../../util/constants";
import { getProfileData } from "store/actions/profileAction";
import { useBaseTokenInfo } from "hooks/useTokenInfo";
import { useTokenBalance } from "hooks/useTokenBalance";
import { formatTokenBalance } from "util/conversion";
import {
  Search,
  User,
  RoundedLeft,
  UpRightArrow,
  ArrowDown,
  Exchange,
  Presale,
  Open,
  Dao,
  NFTs,
  Dash,
  NewDash,
  Airdrop,
  Astronaut,
  Ellipse,
  Nav,
} from "../../icons";
import { IconWrapper } from "../IconWrapper";
import { ConnectedWalletButton } from "../ConnectedWalletButton";

import { styled } from "../theme";
import {
  StyledWrapper,
  StyledListForLinks,
  StyledLink,
  StyledDivForLogo,
  CreateButton,
} from "./styled";
import { __TEST_MODE__ } from "../../util/constants";

export function NavigationSidebar({ openNav, setOpenNav }) {
  const { mutate: connectWallet } = useConnectWallet();
  const [{ key }, setWalletState] = useRecoilState(walletState);
  const dispatch = useDispatch();
  const profile = useSelector((state: any) => state.profileData.profile_status);
  const baseToken = useBaseTokenInfo();
  const { balance } = useTokenBalance(baseToken?.symbol);
  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: "",
      key: null,
      client: null,
    });
  }
  useEffect(() => {
    if (!!key?.name) {
      if (key?.bech32Address === "[id]") return;
      getProfileData(key?.bech32Address, dispatch);
    }
  }, [key?.name]);
  const { pathname } = useRouter();
  const getActiveStylesIfActive = (path) =>
    pathname === path ||
    (pathname.indexOf("/collection/") != -1 &&
      path.indexOf("/collection/") != -1)
      ? {
          borderBottom: "3px solid $white",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 100%)",
        }
      : { borderBottom: "3px solid transparent", background: "transparent" };

  const isActive = (path) => (pathname === path ? "active" : "");
  const StyledImageForLogoText = styled("img", {
    borderRadius: "0%",
  });
  return (
    <>
      {isMobile() ? (
        <></>
      ) : (
        <StyledWrapper className={`wrap-header ${openNav ? "open" : ""}`}>
          <StyledMenuContainer className="wrap-menu container">
            <StyledListForLinks className="top-menu-links">
              <Link href="/" passHref>
                <StyledDivForLogo as="a">
                  <img
                    className="logo-img"
                    src="/images/logotext.svg"
                    alt="logo"
                  />
                </StyledDivForLogo>
              </Link>

              <VerticalDivider />

              <StyledLink>
                <Link href="https://app.marbledao.finance/dashboard" passHref>
                  <a className="dropdown-item">
                    <span>Feed</span>
                  </a>
                </Link>
              </StyledLink>

              <StyledLink>
                <Link href="/explore" passHref>
                  <a className="dropdown-item">
                    <span className={isActive("/explore")}>Browse</span>
                  </a>
                </Link>
              </StyledLink>

              <StyledLink>
                <a
                  className="dropdown-item"
                  href="https://near.marbledao.finance/"
                  target="__blank"
                >
                  <span className={isActive("/defi")}>DeFi</span>
                </a>
              </StyledLink>
                <StyledLink>
                  <Link href="/stake" passHref>
                    <a className="dropdown-item">
                      <span className={isActive("/stake")}>Stake</span>
                    </a>
                  </Link>
                </StyledLink>
            </StyledListForLinks>

            <ButtonField>
              {Boolean(key?.name) ? (
                <Menu>
                  <MenuButton
                    borderRadius="50%"
                    border="3px solid rgba(255, 255, 255, 0.2)"
                  >
                    <RoundedIcon
                      size="36px"
                      src={
                        profile.avatar
                          ? process.env.NEXT_PUBLIC_PINATA_URL + profile.avatar
                          : default_image
                      }
                    />
                  </MenuButton>
                  <StyledMenuList>
                    <Link href={`/profile/${key?.bech32Address}`} passHref>
                      <ProfileMenuItem>
                        <Flex>
                          <RoundedIconComponent
                            size="58px"
                            address={key?.bech32Address}
                          />
                        </Flex>
                        <RoundedLeft />
                      </ProfileMenuItem>
                    </Link>
                    <StyledMenuItem>
                      <VFlex>
                        <p>Wallet Balance</p>
                        <h1>
                          {formatTokenBalance(balance, {
                            includeCommaSeparation: true,
                          })}{" "}
                          {baseToken?.symbol}
                        </h1>
                      </VFlex>
                      <AddressWrapper>
                        <p>{key?.name}</p>&nbsp;
                        <GreenRound />
                      </AddressWrapper>
                    </StyledMenuItem>
                    <StyledMenuItem>
                      <Flex>
                        {/* <Setting /> */}
                        &nbsp; Settings
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                    <StyledMenuItem>
                      <Flex>
                        {/* <Help /> */}
                        &nbsp; Help
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                    <StyledMenuItem onClick={resetWalletConnection}>
                      <Flex>
                        {/* <Disconnect /> */}
                        &nbsp; Disconnect
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                  </StyledMenuList>
                </Menu>
              ) : (
                <ConnectedWalletButton
                  connected={!!key?.name}
                  walletName={key?.name}
                  onConnect={() => connectWallet(null)}
                  onDisconnect={() => resetWalletConnection}
                />
              )}
              {key?.name && (
                <Link href="/create" passHref>
                  <CreateButton>Create</CreateButton>
                </Link>
              )}
            </ButtonField>
          </StyledMenuContainer>
        </StyledWrapper>
      )}
    </>
  );
}

// const StyledWrapper = styled('div', {
//   color: '$colors$white',
//   backgroundColor: '$black',
//   borderRight: '1px solid $borderColors$inactive',
// })

// const StyledMenuContainer = styled('div', {
//   display: 'flex',
//   flexDirection: 'column',
//   position: 'relative',
//   zIndex: '$1',
//   ' a':{
//     color: '$colors$white',
//     display: 'flex',
//     ' svg':{
//       color: '$colors$white',
//       stroke: '$colors$white',
//     },
//   }
// })

// const StyledListForLinks = styled('div', {
//   display: 'flex',
//   rowGap: '$space$2',
//   flexDirection: 'row',
//   ' .span-mark':{
//     border: '2px solid $white'
//   }
// })

// const StyledDivForLogo = styled('div', {
//   columnGap: '$space$4',
//   alignItems: 'center',
//   '& [data-logo]': {
//     marginBottom: '$2',
//   },
// })

// const MobileMenu = styled('div', {

// })

const GreenRound = styled("div", {
  width: "12px",
  height: "12px",
  background: "#24BE74",
  borderRadius: "50%",
});
const AddressWrapper = styled("div", {
  background:
    "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.37) 100%)",
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  backdropFilter: "blur(30px)",
  borderRadius: "10px",
  display: "flex",
  " p": {
    fontSize: "14px",
  },
  padding: "10px",
  alignItems: "center",
});
const Flex = styled("div", {
  display: "flex",
  alignItems: "center",
  " p": {
    fontSize: "22px",
  },
});
const VFlex = styled("div", {
  " p": {
    fontSize: "14px",
    fontWeight: "400",
    fontFamily: "Mulish",
  },
  " h1": {
    fontSize: "20px",
    fontWeight: "700",
  },
});

const StyledMenuList = styled(MenuList, {
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  background:
    "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, #000000 100%) !important",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "20px",
  width: "400px",
  backdropFilter: "blur(30px)",
});
const StyledMenuItem = styled("div", {
  background: "rgba(05, 06, 22, 0.2)",
  boxShadow: "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78",
  backDropFilter: "blur(40px)",
  borderRadius: "20px",
  padding: "20px 25px",
  margin: "10px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  "&:hover": {
    opacity: "0.7 !important",
  },
});
const ProfileMenuItem = styled("div", {
  backDropFilter: "blur(40px)",
  margin: "5px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const StyledMenuContainer = styled("div", {
  display: "flex",
  flexDirection: "column",

  position: "relative",
  zIndex: "$2",
  padding: "0 0",
  width: "100%",
  " a": {
    color: "$colors$white",
    display: "flex",
    " svg": {
      color: "$colors$white",
      stroke: "$colors$white",
    },
  },
});

const ButtonField = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const VerticalDivider = styled("div", {
  width: "1px",
  height: "80%",
  border: "1px solid #363B4E",
  margin: "0 10px",
});
const HorizontalDivider = styled("div", {
  height: "1px",
  width: "100%",
  background: "#363B4E",
});
const MobileMenu = styled(`div`, {
  position: "fixed",
  background: "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, #000000 100%)",
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  backdropFilter: "blur(30px)",
  left: 0,
  top: 0,
  overflow: "auto",
  height: "100vh",
  width: "80vw",
});

const MobileMenuWrapper = styled("div", {
  padding: "30px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  rowGap: "36px",
});
const MobileWrapper = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  padding: "20px",
  alignItems: "center",
  zIndex: "2",
  background: "rgba(8,12,28,0,6)",
});
const MobileProfileInfo = styled("div", {
  background: "rgba(5,6,21,0.2)",
  boxShadow: "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78",
  backdropFilter: "blur(40px)",
  borderRadius: "20px",
  display: "flex",
  justifyContent: "space-between",
  padding: "15px",
  width: "100%",
});
const MobileWalletInfo = styled("div", {
  "& p": {
    fontSize: "12px",
  },
  "& h2": {
    fontFamily: "Trajan",
    fontSize: "16px",
  },
});

const MobileLinkWrapper = styled("div", {
  width: "100%",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  rowGap: "36px",
});
