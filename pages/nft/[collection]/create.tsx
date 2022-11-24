import React, { useReducer, useState, useEffect } from "react";
import { Stack, HStack, ChakraProvider, Textarea } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axios from "axios";
import styled from "styled-components";
import { RoundedIcon } from "components/RoundedIcon";
import { Button } from "components/Button";
import Checkbox from "components/Checkbox";
import { AppLayout } from "components/Layout/AppLayout";
import NFTUpload from "components/NFTUpload";
import { isMobile } from "util/device";
import { Market, CW721, Collection, useSdk } from "services/nft";
import { GradientBackground, SecondGradientBackground } from "styles/styles";

const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
const PUBLIC_PINATA_SECRET_API_KEY =
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "";
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

export default function NFTCreate() {
  const { asPath } = useRouter();
  const { client } = useSdk();
  const collection_id = asPath.split("/")[2];
  const { address, client: signingClient } = useRecoilValue(walletState);
  const router = useRouter();
  const [error, setError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [original, setOriginal] = useState(false);
  const [kind, setKind] = useState(false);
  const [creative, setCreative] = useState(false);
  const [isJsonUploading, setJsonUploading] = useState(false);
  const [collection, setCollection] = useState<any>({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
  useEffect(() => {
    (async () => {
      if (collection_id === undefined || collection_id == "[collection]")
        return false;
      const { collectionInfo, collectionSize } = await fetchCollectionInfo();
      const resCollectionInfo = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collectionInfo.uri
      );
      const resJsonInfo = await resCollectionInfo.json();
      setCollection({
        ...collectionInfo,
        count: collectionSize,
        ...resJsonInfo,
      });
    })();
  }, [collection_id, client]);
  async function fetchCollectionInfo() {
    try {
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collection_info = await marketContract.collection(
        Number(collection_id)
      );
      const cw721Contract = CW721(collection_info.cw721_address).use(client);
      const num_tokens = await cw721Contract.numTokens();
      return { collectionSize: num_tokens, collectionInfo: collection_info };
    } catch (err) {
      return {};
    }
  }

  const handleAgree = () => {
    if (original && kind && creative) {
      setAgreed(true);
      setError(false);
    } else {
      setError(true);
    }
  };
  const handleMint = async () => {
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
    const jsonData: any = {};
    jsonData["name"] = name;
    jsonData["description"] = description;
    jsonData["uri"] = data.nft;
    jsonData["owner"] = address;
    jsonData["collectionId"] = collection_id;
    const pinataJson = {
      pinataMetadata: {
        name: name,
      },
      pinataContent: jsonData,
    };
    setJsonUploading(true);
    let url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    let response = await axios.post(url, pinataJson, {
      maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `application/json`,
        pinata_api_key: PUBLIC_PINATA_API_KEY,
        pinata_secret_api_key: PUBLIC_PINATA_SECRET_API_KEY,
      },
    });
    let ipfsHash = "";
    if (response.status == 200) {
      ipfsHash = response.data.IpfsHash;
    }
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
    let _collection = await marketContract.collection(Number(collection_id));
    // const cw721Contract = CW721(collection.collection_address).useTx(
    //   signingClient
    // );
    const cwCollectionContract = Collection(
      _collection.collection_address
    ).useTx(signingClient);
    let nft = await cwCollectionContract.mint(address, ipfsHash);
    // const nft = await marketContract.mint(
    //   address, ipfsHash
    // )
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
  };
  const UploadImage = () => {
    return (
      <Stack padding={isMobile() ? "0" : "0 100px"} spacing="40px">
        {!isMobile() && <h2>Upload A Media File</h2>}
        <NFTUpload data={data} dispatch={dispatch} item="nft-create" />
      </Stack>
    );
  };
  console.log("collection: ", collection);
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
                  {data.nft ? (
                    <Card>
                      <Stack spacing="40px">
                        <h2>Mint An NFT</h2>
                        <Stack>
                          <h3>Add Details</h3>
                          <p>
                            Once your NFT is minted to the Marble blockchain,
                            you will not be able to edit or update any of this
                            information.
                          </p>
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
                        <Stack>
                          <h3>Collections</h3>
                          <CollectionCard>
                            <RoundedIcon
                              size="70px"
                              src={
                                collection.logo.startsWith("https://")
                                  ? collection.logo
                                  : process.env.NEXT_PUBLIC_PINATA_URL +
                                    collection.logo
                              }
                              alt="collection"
                            />
                            <Stack marginLeft="20px">
                              <h3>{collection && collection.name}</h3>
                              <p>{collection.count} NFTs</p>
                            </Stack>
                          </CollectionCard>
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
                            onClick={handleMint}
                          >
                            Mint NFT
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ) : (
                    <Card fullWidth>
                      <UploadImage />
                    </Card>
                  )}
                  {data.nft && (
                    <NFTContainer>
                      <Stack spacing="20px">
                        <ImgDiv className="nft-img-url">
                          <Image
                            src={process.env.NEXT_PUBLIC_PINATA_URL + data.nft}
                            alt="NFT Image"
                          />
                        </ImgDiv>
                        <h2 style={{ textAlign: "left" }}>{collection.name}</h2>
                      </Stack>
                    </NFTContainer>
                  )}
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
const CollectionCard = styled(GradientBackground)`
  &:before {
    opacity: 0.2;
    border-radius: 20px;
  }
  padding: 25px;
  display: flex;
  align-items: center;
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
  padding-bottom: 100%;
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
