import React, { useReducer, useState, useEffect, useRef } from "react";
import { Stack, HStack, ChakraProvider, Textarea } from "@chakra-ui/react";
import { default_image, FACTORY_ADDRESS } from "util/constants";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { Create, Chevron } from "icons";
import styled from "styled-components";
import { RoundedIcon } from "components/RoundedIcon";
import { Button } from "components/Button";
import Checkbox from "components/Checkbox";
import { AppLayout } from "components/Layout/AppLayout";
import NFTUpload from "components/NFTUpload";
import { isMobile } from "util/device";
import { Factory, CW721, Marketplace, useSdk } from "services/nft";
import { GradientBackground, SecondGradientBackground } from "styles/styles";

export default function NFTCreate() {
  const { asPath } = useRouter();
  const { client } = useSdk();
  const [collection, setCollection] = useState<any>({});
  const { address, client: signingClient } = useRecoilValue(walletState);
  const router = useRouter();
  const [error, setError] = useState(false);
  // const [agreed, setAgreed] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [original, setOriginal] = useState(false);
  const [kind, setKind] = useState(false);
  const [creative, setCreative] = useState(false);
  const [isJsonUploading, setJsonUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [ownedCollections, setOwnedCollections] = useState([]);
  const ref = useRef();
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone };
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) };
      case "SET_NFT":
        return { ...state, nft: action.nft };
      default:
        return state;
    }
  };

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    nft: "",
  });
  function useOutsideClick(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowDropdown(false);
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
  const fetchCollections = async () => {
    try {
      if (!client || !address) return [];
      const factoryContract = Factory().use(client);
      let _collection = await factoryContract.ownedCollections(address);
      return _collection;
    } catch (error) {
      return [];
    }
  };
  useEffect(() => {
    (async () => {
      const collectionList = await fetchCollections();
      const collectionData = await Promise.all(
        collectionList.map(async (_collection) => {
          let res_collection: any = {};
          const contract = CW721(_collection.address).use(client);
          const numTokens = await contract.numTokens();
          try {
            const ipfs_collection = await fetch(
              process.env.NEXT_PUBLIC_PINATA_URL + _collection.uri
            );
            res_collection = await ipfs_collection.json();
          } catch (err) {}
          return {
            counts: numTokens,
            media: res_collection.logo
              ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
              : default_image,
            name: _collection.name,
            collection_id: _collection.id,
            address: _collection.address,
          };
        })
      );
      setOwnedCollections(collectionData);
    })();
  }, [client]);

  const handleAgree = () => {
    if (original && kind && creative) {
      setAgreed(true);
      setError(false);
    } else {
      setError(true);
    }
  };
  const handleMint = async () => {
    return;
    if (!address || !signingClient) {
      toast.warning(`Please connect your wallet.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if (!collection.collection_id) {
      toast.warning(`Please select your collection.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if (name == "") {
      toast.warning(`Please input the NFT name.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if (!data.nft) {
      toast.warning(`Please upload your nft picture.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const cw721Contract = CW721(collection.address).useTx(signingClient);

    const result = await cw721Contract.mint(
      address,
      name,
      data.nft,
      description
    );
    const collectionId = result.logs[0].events[2].attributes[8].value;

    setJsonUploading(false);
    toast.success(`You have created your NFT successfully.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    router.push(`/collection/${collectionId}`);
  };
  console.log("collection: ", collection);
  // return null;
  return (
    <AppLayout fullWidth={true}>
      <ChakraProvider>
        {address && (
          <Container>
            <Stack alignItems="center" spacing="50px">
              <Stack>
                <h1>Create On Marble Dao</h1>
                {!agreed && !collection?.count && (
                  <p style={{ textAlign: "center" }}>
                    Before you mint your first NFT, Please read through and
                    agree to <br />
                    our community guidelines.
                  </p>
                )}
              </Stack>
              {agreed || collection?.count > 0 ? (
                <MainWrapper>
                  <Card>
                    <Stack spacing="40px">
                      <h2>Mint An NFT</h2>
                      <Stack>
                        <h3>Add Details</h3>
                        <p>
                          Once your NFT is minted to the Marble blockchain, you
                          will not be able to edit or update any of this
                          information.
                        </p>
                      </Stack>
                      <Stack>
                        <Text>Collection</Text>
                        {/* <CollectionDropdown  /> */}
                        <DropdownContent ref={ref}>
                          <CollectionCard
                            onClick={() => setShowDropdown(!showDropdown)}
                          >
                            {!collection.collection_id ? (
                              <DropDownText>Select A Collection</DropDownText>
                            ) : (
                              <SelectedItem>
                                <RoundedIcon
                                  size={isMobile() ? "50px" : "70px"}
                                  src={collection.media}
                                  alt="collection"
                                />
                                <Stack marginLeft="20px">
                                  <DropDownText>{collection.name}</DropDownText>
                                  <DropDownText
                                    fontWeight="600"
                                    fontFamily="Mulish"
                                  >
                                    {collection.counts} NFTs
                                  </DropDownText>
                                </Stack>
                              </SelectedItem>
                            )}
                            <ChevronIconWrapper>
                              <Chevron />
                            </ChevronIconWrapper>
                          </CollectionCard>
                          <DropDownContentWrapper show={showDropdown}>
                            {ownedCollections.map((info, index) => (
                              <DropdownItem
                                key={index}
                                onClick={() => {
                                  setCollection(info);
                                  setShowDropdown(false);
                                }}
                              >
                                <RoundedIcon
                                  size={isMobile() ? "50px" : "70px"}
                                  src={info.media}
                                  alt="collection"
                                />
                                <Stack marginLeft="20px">
                                  <DropDownText
                                    fontSize={isMobile() ? "14px" : "20px"}
                                    fontWeight="700"
                                  >
                                    {info.name}
                                  </DropDownText>
                                  <DropDownText
                                    fontSize={isMobile() ? "14px" : "20px"}
                                    fontWeight="600"
                                    fontFamily="Mulish"
                                  >
                                    {info.counts} NFTs
                                  </DropDownText>
                                </Stack>
                              </DropdownItem>
                              // </Link>
                            ))}
                            <Link href="/collection/create" passHref>
                              <DropdownItem
                                onClick={() => setShowDropdown(false)}
                              >
                                <IconWrapper>
                                  <Create />
                                </IconWrapper>
                                <DropDownText
                                  fontSize={isMobile() ? "14px" : "20px"}
                                  fontWeight="700"
                                >
                                  Create A New Collection
                                </DropDownText>
                              </DropdownItem>
                            </Link>
                          </DropDownContentWrapper>
                        </DropdownContent>
                      </Stack>
                      <Stack>
                        <Text>Name</Text>
                        <StyledInput
                          placeholder="Name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                          }}
                        />
                      </Stack>
                      <Stack>
                        <Text>Description</Text>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          maxLength="1000"
                        />
                        <Footer>
                          <div>Use markdown syntax to embed links</div>
                          <div>{description.length}/1000</div>
                        </Footer>
                      </Stack>
                      <Stack padding={isMobile() ? "0" : "0 150px"}>
                        <Button
                          className="btn-buy btn-default"
                          css={{
                            background: "$white",
                            color: "$black",
                            stroke: "$black",
                            width: "100%",
                            marginTop: "20px",
                          }}
                          variant="primary"
                          size="large"
                          onClick={async () => {
                            if (!collection.collection_id) return;
                            await handleMint();
                          }}
                          disabled={!collection.collection_id}
                        >
                          Mint NFT
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <NFTContainer>
                    <Stack spacing="20px">
                      <ImgDiv className="nft-img-url">
                        <NFTUpload
                          data={data}
                          dispatch={dispatch}
                          item="nft-create"
                        />
                      </ImgDiv>
                      <h2 style={{ textAlign: "left" }}>Upload your NFT</h2>
                    </Stack>
                  </NFTContainer>
                </MainWrapper>
              ) : (
                <Card>
                  <Stack spacing="70px">
                    <h2>Here&apos;s a Summary</h2>
                    <Stack>
                      <HStack>
                        <Checkbox
                          checked={original}
                          onChange={(e) => {
                            setOriginal(!original);
                          }}
                        />
                        <h3>Be Original</h3>
                      </HStack>
                      <Text>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry.{" "}
                      </Text>
                    </Stack>
                    <Stack>
                      <HStack>
                        <Checkbox
                          checked={kind}
                          onChange={(e) => setKind(!kind)}
                        />
                        <h3>Be Kind and Inclusive</h3>
                      </HStack>
                      <Text>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry.{" "}
                      </Text>
                    </Stack>
                    <Stack>
                      <HStack>
                        <Checkbox
                          checked={creative}
                          onChange={(e) => setCreative(!creative)}
                        />
                        <h3>Be Creative And Have Fun</h3>
                      </HStack>
                      <Text>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry.{" "}
                      </Text>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Stack spacing="50px" maxWidth="600px" margin="0 auto">
                    <a>Read our full community guidelines here</a>
                    <Stack>
                      {error && (
                        <p style={{ color: "red" }}>
                          Please select all conditions
                        </p>
                      )}
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
                        onClick={handleAgree}
                      >
                        I Agree
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Container>
        )}
      </ChakraProvider>
    </AppLayout>
  );
}

const Text = styled.div`
  font-size: 14px;
  font-weight: 400;
  padding: 0 40px;
`;
const Divider = styled.div`
  height: 0px;
  border: 1px solid #363b4e;
  margin: 60px 0;
`;
const Container = styled.div`
  padding: 70px;
  p {
    font-size: 18px;
    font-family: Mulish;
  }
  h1 {
    font-size: 46px;
    font-weight: 600;
  }
  h2 {
    font-size: 30px;
    font-weight: 600;
    text-align: center;
  }
  h3 {
    font-size: 20px;
    font-weight: 600;
  }
  a {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    text-decoration-line: underline;
    font-family: Mulish;
    cursor: pointer;
  }
  @media (max-width: 1024px) {
    padding-top: 100px;
    h1 {
      font-size: 30px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 14px;
      font-family: Mulish;
    }
  }
  @media (max-width: 650px) {
    padding: 0;
    h1 {
      font-size: 22px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 14px;
      font-family: Mulish;
    }
  }
`;
const Card = styled(SecondGradientBackground)<{ fullWidth: boolean }>`
  &:before {
    opacity: 0.3;
    border-radius: 30px;
  }
  padding: 40px;
  max-width: 1000px;
  width: 100%;
  @media (max-width: 1024px) {
    padding: 20px;
  }
`;
const StyledInput = styled.input`
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 20px;
  font-size: 20px;
  font-family: Mulish;
  @media (max-width: 650px) {
    font-size: 16px;
  }
`;
const Input = styled(Textarea)`
  background: #272734 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09) !important;
  backdrop-filter: blur(40px) !important;
  /* Note: backdrop-filter has minimal browser support */
  font-family: Mulish;
  border-radius: 20px !important;
`;
const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  opacity: 0.5;
  font-size: 14px;
  padding: 0 10px;
  div {
    font-family: Mulish;
  }
`;
const CollectionCard = styled.div`
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120px;
  cursor: pointer;
`;
const NFTContainer = styled(SecondGradientBackground)`
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  width: 35%;
  padding: 25px;

  height: fit-content;
  @media (max-width: 800px) {
    width: 100%;
  }
`;
const ImgDiv = styled.div`
  width: 100%;
  /* padding-bottom: 100%; */
  display: block;
  position: relative;
`;
const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
`;
const MainWrapper = styled.div`
  display: flex;
  align-items: start;
  column-gap: 40px;
  justify-content: space-between;
  @media (max-width: 800px) {
    flex-direction: column-reverse;
    width: 100%;
    row-gap: 20px;
  }
`;
const SelectedItem = styled.div`
  display: flex;
  align-items: center;
`;
const ChevronIconWrapper = styled.div`
  transform: rotate(-90deg);
`;
const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.16);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  @media (max-width: 650px) {
    width: 50px;
    height: 50px;
  }
`;
const DropdownContent = styled.div`
  position: relative;
`;

const DropDownContentWrapper = styled.div<{ show: boolean }>`
  position: absolute;
  top: 120px;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: ${({ show }) => (show ? "block" : "none")};
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  height: fit-content;
  max-height: 500px;
  overflow: auto;
  width: 100%;
  /* max-height: 200px;
  overflow: auto; */
`;

const DropdownItem = styled.div`
  padding: 25px;
  display: flex;
  align-items: center;
  height: 120px;
  cursor: pointer;
  &:hover {
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }
`;
const DropDownText = styled.div`
  font-size: 20px;
  @media (max-width: 650px) {
    font-size: 14px;
  }
`;
