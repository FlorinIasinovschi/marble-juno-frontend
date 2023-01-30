import { Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { RoundedIcon, RoundedIconComponent } from "components/RoundedIcon";
import { useTokenBalance } from "hooks/useTokenBalance";
import { useBaseTokenInfo } from "hooks/useTokenInfo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRecoilState } from "recoil";
import { getProfileData } from "store/actions/profileAction";
import { formatTokenBalance, getReducedAddress } from "util/conversion";
import { isMobile } from "util/device";
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { Nav, RoundedLeft, Setting, Help, Disconnect } from "../../icons";
import { walletState, WalletStatusType } from "../../state/atoms/walletAtoms";
import { default_image } from "../../util/constants";
import { ConnectedWalletButton } from "../ConnectedWalletButton";
import { IconWrapper } from "../IconWrapper";
import { styled } from "../theme";
import {
  StyledWrapper,
  StyledListForLinks,
  StyledLink,
  StyledDivForLogo,
  CreateButton,
  StyledMenuItem,
  MobileProfileInfo,
  AddressWrapper,
} from "./styled";

export function NavigationSidebar({ openNav, setOpenNav }) {
  const { mutate: connectWallet } = useConnectWallet();
  const [{ key }, setWalletState] = useRecoilState(walletState);
  const dispatch = useDispatch();
  const ref = useRef(null);
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

  const isActive = (path) => (pathname === path ? "active" : "");
  const StyledImageForLogoText = styled("img", {
    borderRadius: "0%",
  });
  function useOutsideClick(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpenNav(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideClick(ref);
  return (
    <>
      {isMobile() ? (
        <MobileWrapper>
          <IconWrapper
            className="mobile-nav"
            type="button"
            size="40px"
            icon={<Nav />}
            onClick={() => {
              setOpenNav(!openNav);
            }}
          />
          <Link href="/" passHref>
            <StyledDivForLogo as="a">
              <img className="logo-img" src="/images/logotext.svg" alt="logo" />
            </StyledDivForLogo>
          </Link>
          {Boolean(key?.name) ? (
            <Link href="/create" passHref>
              <CreateButton>Mint</CreateButton>
            </Link>
          ) : (
            <ConnectedWalletButton
              connected={!!key?.name}
              walletName={key?.name}
              onConnect={() => connectWallet(null)}
              onDisconnect={() => resetWalletConnection}
            />
          )}
          {openNav && (
            <MobileMenu ref={ref}>
              <MobileMenuWrapper>
                <Link href="/" passHref>
                  <StyledDivForLogo as="a">
                    <img
                      className="logo-img"
                      src="/images/logotext.svg"
                      alt="logo"
                    />
                  </StyledDivForLogo>
                </Link>
                {Boolean(key?.name) && (
                  <MobileProfileInfo>
                    <RoundedIconComponent
                      size="48px"
                      address={key?.bech32Address}
                      direction="column"
                      font="16px"
                    />
                    <MobileWalletInfo>
                      <p>Wallet Balance</p>
                      <h2>
                        {formatTokenBalance(balance, {
                          includeCommaSeparation: true,
                        })}{" "}
                        {baseToken?.symbol}
                      </h2>
                      <AddressWrapper>
                        <p>{getReducedAddress(key?.bech32Address)}</p>&nbsp;
                        <GreenRound />
                      </AddressWrapper>
                    </MobileWalletInfo>
                  </MobileProfileInfo>
                )}
                <MobileLinkWrapper>
                  <StyledLink>
                    <Link
                      href="https://app.marbledao.finance/dashboard"
                      passHref
                    >
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
                      href="https://juno.marbledao.finance/"
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
                  <StyledLink>
                    <Link href="/metaverse" passHref>
                      <a className="dropdown-item">
                        <span className={isActive("/metaverse")}>
                          Metaverse
                        </span>
                      </a>
                    </Link>
                  </StyledLink>
                  <StyledLink>
                    <Link href="/loyalty" passHref>
                      <a className="dropdown-item">
                        <span>Loyalty</span>
                      </a>
                    </Link>
                  </StyledLink>
                  {Boolean(key?.name) && (
                    <StyledLink>
                      <Link href="/quest" passHref>
                        <a className="dropdown-item">
                          <span>Quests</span>
                        </a>
                      </Link>
                    </StyledLink>
                  )}
                  <HorizontalDivider />
                  <StyledLink>
                    <Setting />
                    &nbsp; Settings (soon)
                  </StyledLink>
                  <StyledLink>
                    <Help />
                    &nbsp; Help (soon)
                  </StyledLink>
                </MobileLinkWrapper>
                <ConnectedWalletButton
                  connected={!!key?.name}
                  walletName={key?.name}
                  onConnect={() => connectWallet(null)}
                  onDisconnect={() => resetWalletConnection}
                />
              </MobileMenuWrapper>
            </MobileMenu>
          )}
        </MobileWrapper>
      ) : (
        <StyledWrapper>
          <StyledListForLinks>
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
            {Boolean(key?.name) && (
              <StyledLink>
                <Link href="/feed" passHref>
                  <a className="dropdown-item">
                    <span>Feed</span>
                  </a>
                </Link>
              </StyledLink>
            )}
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
                href="https://juno.marbledao.finance/"
                target="__blank"
              >
                <span className={isActive("/defi")}>DeFi</span>
              </a>
            </StyledLink>

            {Boolean(key?.name) && (
              <StyledLink>
                <Link href="/stake" passHref>
                  <a className="dropdown-item">
                    <span className={isActive("/stake")}>Stake</span>
                  </a>
                </Link>
              </StyledLink>
            )}
            <StyledLink>
              <Link href="/metaverse" passHref>
                <a className="dropdown-item">
                  <span className={isActive("/metaverse")}>Metaverse</span>
                </a>
              </Link>
            </StyledLink>
          </StyledListForLinks>

          <ButtonField>
            <StyledLink>
              <Link href="/loyalty" passHref>
                <a className="dropdown-item">
                  <span>Loyalty</span>
                </a>
              </Link>
            </StyledLink>
            {Boolean(key?.name) && (
              <StyledLink>
                <Link href="/quest" passHref>
                  <a className="dropdown-item">
                    <span>Quests</span>
                  </a>
                </Link>
              </StyledLink>
            )}
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
                <CreateButton>Mint</CreateButton>
              </Link>
            )}
          </ButtonField>
        </StyledWrapper>
      )}
    </>
  );
}
const GreenRound = styled("div", {
  width: "12px",
  height: "12px",
  background: "#24BE74",
  borderRadius: "50%",
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
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4) !important",
  background: "rgb(56,56,69) !important",
  border: "1px solid rgba(255,255,255,0.2) !important",
  borderRadius: "24px !important",
  padding: "20px !important",
  width: "400px !important",
  backdropFilter: "blur(80px) !important",
});

const ProfileMenuItem = styled("div", {
  backDropFilter: "blur(40px)",
  margin: "5px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const ButtonField = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const VerticalDivider = styled("div", {
  width: "1px",
  height: "60%",
  border: "1px solid #363B4E",
  marginInline: "20px 20px",
  "@media(max-width: 1550px)": {
    marginInline: "40px 20px",
  },
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
