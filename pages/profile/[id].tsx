import { HStack, Stack } from "@chakra-ui/react";
import BannerImageUpload from "components/BannerImageUpload";
import { Button } from "components/Button";
import { AppLayout } from "components/Layout/AppLayout";
import ProfilleLogoImageUpload from "components/ProfileLogoImageUpload";
import { MyCollectedNFTs } from "features/nft/market/profile";
import CreatedNFTs from "features/nft/market/profile/creatednfts";
import StakedNFTs from "features/nft/market/profile/stakednfts";
import CreatedCollections from "features/nft/market/profile/createdCollections";
import EditProfileModal from "features/profile/EditProfileModal";
import {
  controlFollow,
  getProfileInfo,
  setImage,
  setProfileInfo,
  getFollowInfo,
} from "hooks/useProfile";
import { DiscordT, Email } from "icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import styled from "styled-components";
import { GradientBackground } from "styles/styles";
import { getReducedAddress } from "util/conversion";
import { isMobile } from "util/device";
import ChatModal from "features/chatapp/components/ChatModal/ChatModal";
import {
  addUserToMurbleChannel,
  getOrCreateChatChannel,
  getOrCreateChatUserToken,
} from "hooks/useChat";
import { default_image } from "util/constants";

interface FollowInfoInterface {
  followers: number;
  followings: number;
  isFollowing: boolean;
}
export default function Home() {
  const { asPath, push } = useRouter();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [profile, setProfile] = useState<any>({});
  const [chatCurrentUserProfile, setchatCurrentUserProfile] = useState<any>({});
  const [chatUser, setChatUser] = useState<any>({});
  const [chatOtherUser, setChatOtherUser] = useState<any>({});

  const [followInfo, setFollowInfo] = useState<FollowInfoInterface>({
    followers: 0,
    followings: 0,
    isFollowing: false,
  });
  const [tab, setTab] = useState("owned");
  const id = asPath && asPath.split("/")[2].split("?")[0];

  useEffect(() => {
    (async () => {
      if (id == "[id]") return;
      const _profile = await getProfileInfo(id);
      if (!_profile) push("/404");
      const _followInfo = await getFollowInfo(id, address);
      setFollowInfo(_followInfo);
      setProfile(_profile);

      if (address) {
        const activeProfile = await getProfileInfo(address);
        if (
          _profile?.id &&
          _profile?.id != "[id]" &&
          activeProfile?.id &&
          activeProfile?.id != "[id]" &&
          _profile?.id != activeProfile?.id
        ) {
          const _chatUser = await getOrCreateChatUserToken(address);
          const _chatUser2 = await getOrCreateChatUserToken(_profile.id);
          const channel = await getOrCreateChatChannel([
            _chatUser.getStream_id,
            _chatUser2.getStream_id,
          ]);

          const _chatCurrentUserProfile: {
            id: string;
            name?: string;
            image?: string;
          } = {
            id: _chatUser.getStream_id,
            name: activeProfile.name ?? activeProfile.id,
            image: activeProfile.avatar
              ? process.env.NEXT_PUBLIC_PINATA_URL + activeProfile.avatar
              : "https://juno-nft.marbledao.finance" + default_image,
          };
          setchatCurrentUserProfile(_chatCurrentUserProfile);
          setChatUser(_chatUser);
          setChatOtherUser(_chatUser2);
        }
      }
    })();
  }, [id]);
  const handleSetHash = async (e) => {
    const newProfile = await setImage({ id, ...e });
    setProfile(newProfile);
  };
  const handleProfileEdit = async (e) => {
    try {
      const new_profile = await setProfileInfo({ ...profile, ...e, id });
      setProfile(new_profile);
      toast.success(`Success`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return true;
    } catch (err) {
      toast.warning(`Failed. Please try again.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
  };
  const handleFollow = async () => {
    const new_followInfo = await controlFollow({
      from: address,
      to: id,
    });
    if (new_followInfo) {
      setFollowInfo(new_followInfo);
    } else {
      toast.warning(`Failed. Please try again.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const getSelectedComponent = () => {
    switch (tab) {
      case "owned":
        return <MyCollectedNFTs id={id} />;
      case "created":
        return <CreatedNFTs id={id} />;
      case "staked":
        return <StakedNFTs id={id} />;
      case "collection":
        return <CreatedCollections id={id} />;
    }
  };
  return (
    <AppLayout fullWidth={true} hasBanner={true}>
      <Container>
        <Banner>
          <BannerImageUpload
            hash={profile.banner}
            setHash={handleSetHash}
            isActive={address === id}
          />
        </Banner>
        <ProfileContainer>
          <ProfileInfo>
            <LogoImage>
              <ProfilleLogoImageUpload
                isActive={address === id}
                hash={profile.avatar}
                setHash={handleSetHash}
              />
            </LogoImage>
            <Stack spacing="50px">
              <Stack spacing="50px">
                <h1>{profile.name || getReducedAddress(id)}</h1>
                <HStack justifyContent="space-around">
                  <Stack>
                    <h1>{followInfo.followings}</h1>
                    <p>Following</p>
                  </Stack>
                  <VerticalDivider />
                  <Stack>
                    <h1>{followInfo.followers}</h1>
                    <p>Followers</p>
                  </Stack>
                </HStack>
                {address !== id && address && (
                  <Button
                    className="btn-buy btn-default"
                    css={{
                      background: "$white",
                      color: "$black",
                      stroke: "$black",
                      width: "100%",
                    }}
                    variant="primary"
                    size="large"
                    onClick={handleFollow}
                  >
                    {profile.following && profile.following.includes(id)
                      ? "Unfollow"
                      : "Follow"}
                  </Button>
                )}
              </Stack>
              <div
                style={{
                  opacity: "0.5",
                  textAlign: "center",
                  fontSize: isMobile() ? "16px" : "18px",
                  fontFamily: "Mulish",
                }}
              >
                Not followed by anyone you follow
              </div>
              <Card>
                <h3>Bio</h3>
                <p>{profile.bio || "Undefined"}</p>
              </Card>
              {(profile.mail || profile.discord) && (
                <Card>
                  <h3>Links</h3>
                  <Stack spacing="5px">
                    {profile.mail && (
                      <HStack>
                        <Email /> &nbsp; <p>{profile.mail}</p>
                      </HStack>
                    )}
                    {profile.discord && (
                      <HStack>
                        <DiscordT /> &nbsp; <p>{profile.discord}</p>
                      </HStack>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>

            {address &&
              address !== id &&
              chatCurrentUserProfile?.id &&
              chatUser?.id &&
              chatOtherUser?.id && (
                <IconButton2Wrapper>

                  <ChatModal
                    currentUserToConnect={chatCurrentUserProfile}
                    chatUser={chatUser}
                    otherUser={chatOtherUser}
                    hideOpenButton={false}
                    showRemoveFilterButton={true}
                    IsOpenOutSide={null}
                    OnCloseOutSide={null}
                  />
                </IconButton2Wrapper>
              )}

            {address === id && (
              <IconButtonWrapper>
                <EditProfileModal
                  profileInfo={profile}
                  onHandleSave={handleProfileEdit}
                />
              </IconButtonWrapper>
            )}
          </ProfileInfo>
          <ProfileNFTInfo>
            <StyledTabList>
              <StyledTab
                onClick={() => {
                  setTab("owned");
                }}
                isActive={tab === "owned"}
              >{`Owned`}</StyledTab>
              <StyledTab
                onClick={() => {
                  setTab("created");
                }}
                isActive={tab === "created"}
              >{`Created`}</StyledTab>
              <StyledTab
                onClick={() => {
                  setTab("staked");
                }}
                isActive={tab === "staked"}
              >{`Staked`}</StyledTab>
              <StyledTab
                onClick={() => {
                  setTab("collection");
                }}
                isActive={tab === "collection"}
              >{`Created Collections`}</StyledTab>
            </StyledTabList>

            {getSelectedComponent()}
          </ProfileNFTInfo>
        </ProfileContainer>
      </Container>
    </AppLayout>
  );
}

const Container = styled.div``;
const Banner = styled.div`
  position: relative;
  height: 650px;
  width: 100%;
  display: block;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  @media (max-width: 650px) {
    height: 216px;
  }
`;
const LogoImage = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 7px solid #ffffff;
  position: absolute;
  top: -100px;
  left: calc(50% - 100px);
  z-index: 1000;
  @media (max-width: 1550px) {
    width: 150px;
    height: 150px;
    top: -75px;
    left: calc(50% - 75px);
  }
  @media (max-width: 650px) {
    width: 120px;
    height: 120px;
    top: -60px;
    left: calc(50% - 60px);
    border: 3px solid #ffffff;
  }
`;
const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  padding: 0 50px;
  p {
    font-size: 18px;
    font-weight: 400;
    font-family: Mulish;
  }
  h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 5px;
  }
  h2 {
    font-size: 22px;
    font-weight: 600;
  }
  h1 {
    font-size: 40px;
    font-weight: 600;
    text-align: center;
  }
  @media (max-width: 1200px) {
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    h1 {
      font-size: 24px;
    }
    p {
      font-size: 20px;
    }
    h3 {
      font-size: 16px;
    }
  }
`;
const ProfileInfo = styled(GradientBackground)`
  padding: 120px 50px 50px 50px;

  &:before {
    border-radius: 0px 0px 20px 20px;
    opacity: 0.2;
  }
  height: fit-content;
  position: relative;
  @media (max-width: 1550px) {
    padding: 120px 30px 30px 30px;
  }
  @media (max-width: 650px) {
    padding: 80px 25px 25px 25px;
  }
`;
const VerticalDivider = styled.div`
  border: 1px solid #5f5858;
  transform: rotate(90deg);
  width: 90px;
  height: 0px;
`;
const Card = styled(GradientBackground)`
  backdrop-filter: blur(40px);
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  padding: 20px;
  @media (max-width: 650px) {
    p {
      font-size: 14px;
    }
  }
`;
const ProfileNFTInfo = styled.div`
  padding: 10px 50px;
  @media (max-width: 1200px) {
    padding: 10px 10px;
  }
  @media (max-width: 650px) {
    padding: 10px 0px;
    width: 100%;
  }
`;
const StyledTabList = styled.div`
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  display: flex;
  margin-bottom: 20px;
  overflow: auto;
  width: fit-content;
  @media (max-width: 800px) {
    width: auto;
  }
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  font-size: 22px;
  font-weight: 400;
  padding: 20px;
  margin: 0 20px;
  cursor: pointer;
  ${({ isActive }) => isActive && "border-bottom: 2px solid"};
  @media (max-width: 1550px) {
    font-size: 18px;
    margin: 0 15px;
    padding: 15px;
  }
`;

const IconButtonWrapper = styled.div`
  position: absolute;
  right: 50px;
  top: 50px;
`;
