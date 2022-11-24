import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Stack,
  HStack,
  LinkBox,
  ChakraProvider,
  Spinner,
} from "@chakra-ui/react";
import Checkbox from "components/Checkbox";
import InfiniteScroll from "react-infinite-scroll-component";
import { getAllUsers, getFilteredUsers } from "hooks/useProfile";
import { Sort, Filter, CloseCircle } from "icons";
import ProfileCard from "components/profile/ProfileCard";
import Link from "next/link";
import { isMobile, isPC } from "util/device";
import { GradientBackground } from "styles/styles";

const AllProfiles = ({ profileCounts }) => {
  const [profiles, setProfiles] = useState([]);
  const [asc, setAsc] = useState(true);
  const [creator, setCreator] = useState(false);
  const [collector, setCollector] = useState(false);
  const [filterShow, setFilterShow] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    (async () => {
      setHasMore(true);
      if (creator === collector) {
        const selectedUsers = await getAllUsers({
          sort: asc ? "asc" : "desc",
          skip: 0,
          limit: 15,
        });
        setProfiles(selectedUsers);
        return;
      }

      const filteredUsers = await getFilteredUsers({
        sort: asc ? "asc" : "desc",
        creator: creator,
        skip: 0,
        limit: 15,
      });
      setProfiles(filteredUsers);
    })();
  }, [asc, creator, collector]);
  const getMoreNfts = async () => {
    try {
      if (creator === collector) {
        const selectedUsers = await getAllUsers({
          sort: asc ? "asc" : "desc",
          skip: profiles.length,
          limit: 15,
        });
        if (selectedUsers.length < 15) setHasMore(false);
        setProfiles(profiles.concat(selectedUsers));
        return;
      }

      const filteredUsers = await getFilteredUsers({
        sort: asc ? "asc" : "desc",
        creator: creator,
        skip: profiles.length,
        limit: 15,
      });
      if (filteredUsers.length < 15) setHasMore(false);
      setProfiles(profiles.concat(filteredUsers));
    } catch (err) {
      console.log("all fetched");
    }
  };
  return (
    <Container>
      {!isPC() ? (
        <HStack justifyContent="space-between" paddingBottom="20px">
          <MobileSortWrapper onClick={() => setFilterShow(true)}>
            Filter
            <Filter />
          </MobileSortWrapper>
          <MobileSortComponent>
            <p>Sort by</p>
            <MobileSortWrapper onClick={() => setAsc(!asc)}>
              <Sort /> {asc ? "A-Z" : "Z-A"}
            </MobileSortWrapper>
          </MobileSortComponent>
        </HStack>
      ) : (
        <Card>
          <Stack>
            <Stack spacing="20px">
              <h1>Type</h1>

              <HorizontalDivider />
              <Stack spacing="30px">
                <HStack justifyContent="space-between">
                  <HStack>
                    <Checkbox
                      value={creator}
                      onChange={(e) => setCreator(!creator)}
                    />{" "}
                    <h3>Creator</h3>
                  </HStack>
                  <h3>{profileCounts.creators}</h3>
                </HStack>
                <HStack justifyContent="space-between">
                  <HStack>
                    <Checkbox
                      value={collector}
                      onChange={(e) => setCollector(!collector)}
                    />{" "}
                    <h3>Collector</h3>
                  </HStack>
                  <h3>{profileCounts.profiles - profileCounts.creators}</h3>
                </HStack>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      )}
      {filterShow && (
        <MobileFilterContainer>
          <MobileFilterWrapper>
            <Stack>
              <Stack spacing="20px">
                <MobileFilterTitle>
                  <div>{""}</div>
                  <h1>Filter</h1>
                  <IconButton onClick={() => setFilterShow(false)}>
                    <CloseCircle />
                  </IconButton>
                </MobileFilterTitle>
                <HorizontalDivider />
                <Stack spacing="30px">
                  <h1>Type</h1>
                  <HStack justifyContent="space-between">
                    <HStack>
                      <Checkbox
                        value={creator}
                        onChange={(e) => setCreator(!creator)}
                      />{" "}
                      <h3>Creator</h3>
                    </HStack>
                    <h3>{profileCounts.creators}</h3>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <HStack>
                      <Checkbox
                        value={collector}
                        onChange={(e) => setCollector(!collector)}
                      />{" "}
                      <h3>Collector</h3>
                    </HStack>
                    <h3>{profileCounts.profiles - profileCounts.creators}</h3>
                  </HStack>
                </Stack>
              </Stack>
            </Stack>
          </MobileFilterWrapper>
        </MobileFilterContainer>
      )}
      <InfiniteScroll
        dataLength={profiles.length}
        next={getMoreNfts}
        hasMore={hasMore}
        loader={
          <ChakraProvider>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                padding: "20px",
              }}
            >
              <Spinner size="xl" />
            </div>
          </ChakraProvider>
        }
        endMessage={<h4></h4>}
      >
        <ProfilesContainer>
          {isPC() && (
            <SortComponent>
              <p>Sort by</p>
              <SortWrapper onClick={() => setAsc(!asc)}>
                <Sort /> {asc ? "A-Z" : "Z-A"}
              </SortWrapper>
            </SortComponent>
          )}

          {profiles.map((profile, index) => (
            <Link href={`/profile/${profile.id}`} passHref key={index}>
              <LinkBox
                as="picture"
                transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
                _hover={{
                  transform: "scale(1.05)",
                }}
              >
                <ProfileCard profileInfo={profile} />
              </LinkBox>
            </Link>
          ))}
        </ProfilesContainer>
      </InfiniteScroll>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding: 50px 0;
  p {
    font-family: Mulish;
    font-size: 14px;
    text-align: center;
  }
  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 18px;
  }
  h3 {
    font-size: 16px;
    font-family: Mulish;
  }
  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    padding: 20px 0;
  }
`;
const ProfilesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 0 50px;
  column-gap: 20px;
  row-gap: 20px;
  position: relative;
  @media (max-width: 1550px) {
    padding: 0 30px;
  }
  @media (max-width: 1024px) {
    padding: 0 0px;
    grid-template-columns: 1fr 1fr 1fr;
  }
`;
const Card = styled(GradientBackground)`
  &:before {
    opacity: 0.2;
    border-radius: 20px;
  }
  padding: 30px;
  @media (max-width: 1550px) {
  }
`;
const HorizontalDivider = styled.div`
  width: 100%;
  height: 0px;
  border: 1px solid #434960;
`;
const SortComponent = styled.div`
  position: absolute;
  right: 60px;
  top: 60px;
  display: flex;
  align-items: center;
  p {
    font-size: 18px;
    font-weight: 600;
    opacity: 0.5;
  }
`;
const MobileSortComponent = styled.div`
  align-items: center;
  display: flex;
  p {
    font-size: 18px;
    font-weight: 600;
    opacity: 0.5;
  }
`;
const SortWrapper = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  width: 150px;
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(30px);
  /* Note: backdrop-filter has minimal browser support */
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 30px;
  padding: 15px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  cursor: pointer;
`;
const MobileSortWrapper = styled.div`
  backdrop-filter: blur(40px);
  /* Note: backdrop-filter has minimal browser support */
  border-radius: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  cursor: pointer;
  background: linear-gradient(0deg, #050616, #050616),
    linear-gradient(90.65deg, #ffffff 0.82%, rgba(0, 0, 0, 0) 98.47%);
  border: 1px solid;

  border-image-source: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  font-family: Mulish;
`;

const MobileFilterWrapper = styled.div`
  position: fixed;
  width: 100vw;
  bottom: 0;
  left: 0;
  background: #171a29;
  backdrop-filter: blur(40px);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 30px 30px 0px 0px;
  padding: 20px;
  h1 {
    font-size: 18px;
    font-weight: 600;
  }
`;

const MobileFilterContainer = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(1px);
`;

const MobileFilterTitle = styled.div`
  position: relative;
  text-align: center;
  h1 {
    font-size: 18px;
    font-family: Mulish;
    font-weight: 600;
  }
`;
const IconButton = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

export default AllProfiles;
