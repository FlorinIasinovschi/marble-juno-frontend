import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Grid,
  HStack,
  IconButton,
  Stack,
  Text,
  useRadioGroup,
} from "@chakra-ui/react";
import { Button } from "components/Button";
import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import Select from "react-select";
import { CollectionToken } from "services/nft";
import styled from "styled-components";

import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { Factory, Royalty, useSdk } from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import { FACTORY_ADDRESS, categories } from "util/constants";
import { isMobile } from "util/device";

const customStyles = {
  control: (base, state) => ({
    ...base,
    height: "70px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2) !important",
    background: "#272734",
    color: "#FFFFFF",
  }),
  menuList: (base, state) => ({
    ...base,
    background: "#272734",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    maxHeight: "400px",
  }),
  option: (base, state) => ({
    ...base,
    color: "white",
    background: "#272734",
    ":hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
  }),
  singleValue: (base, state) => ({
    ...base,
    color: "white",
  }),
  valueContainer: (base, state) => ({
    ...base,
    display: "flex",
  }),
  menu: (base, state) => ({
    ...base,
    zIndex: "10",
    margin: "0px",
    background: "none",
  }),
};

const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
const PUBLIC_PINATA_SECRET_API_KEY =
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "";
let themeValue = "1";
export const CollectionCreate = () => {
  const router = useRouter();
  //const toast = useToast()
  const [isJsonUploading, setJsonUploading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Digital");

  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [token, setToken] = useState("");
  const [tokens, setTokens] = useState<number[]>([]);
  const [collectionTokens, setCollectionTokens] = useState<CollectionToken[]>(
    []
  );
  const [tokenReomveCount, setTokenReomveCount] = useState(0);
  const [inputFields, setInputFields] = useState([
    { address: address, rate: 0 },
  ]);

  const handleChange = (index, evnt) => {
    const { name, value } = evnt.target;

    // check rate
    if (
      name === "rate" &&
      (/^\d*[.]?\d*$/.test(value) === false || parseFloat(value) > 100)
    ) {
      return;
    }

    const list = [...inputFields];
    list[index][name] = value;

    setInputFields(list);
  };

  const addFormFields = () => {
    setInputFields([...inputFields, { address: "", rate: 0 }]);
  };

  const removeFormFields = (i, e) => {
    const newFormValues = [...inputFields];
    newFormValues.splice(i, 1);
    setInputFields(newFormValues);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone };
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) };
      case "SET_LOGO":
        return { ...state, logo: action.logo };
      case "SET_FEATURED_IMAGE":
        return { ...state, featuredImage: action.featuredImage };
      case "SET_BANNER":
        return { ...state, banner: action.banner };
      default:
        return state;
    }
  };

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    logo: "",
    featuredImage: "",
    banner: "",
  });

  const options = ["1", "2", "3"];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "template",
    defaultValue: "1",
    onChange: console.log,
  });
  const group = getRootProps();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const collectionTokenList = await response.json();
      setCollectionTokens(collectionTokenList.tokens);
    })();
  }, []);

  const createCollection = async (e) => {
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
      toast.warning(`Please input the collection name.`, {
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

    let tokenSymbols = [];
    for (let i = 0; i < tokens.length; i++) {
      tokenSymbols.push(collectionTokens[tokens[i]].symbol);
    }

    let total_royalty_rate: number = 0;
    let royaltiesArr: Royalty[] = [];
    const royalties = [...inputFields];

    for (let i = 0; i < royalties.length; i++) {
      total_royalty_rate += parseFloat(royalties[i]["rate"].toString());
      royalties[i]["rate"] = royalties[i]["rate"];
      royaltiesArr.push({
        address: royalties[i]["address"],
        royalty_rate: (royalties[i]["rate"] / 100).toString(),
      });
    }
    if (!address || !signingClient) {
      return;
    }
    const factoryContract = Factory().useTx(signingClient);
    const collection = await factoryContract.addCollection(
      address,
      name,
      royaltiesArr,
      category
    );
    toast.success(`You have created your collection successfully.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    router.push("/explore/collections");
  };

  return (
    address && (
      <Container>
        <Stack spacing={isMobile() ? "20px" : "50px"}>
          <Title>Create On Marble Dao</Title>

          <Collections>
            <Stack spacing={isMobile() ? "20px" : "50px"}>
              <Stack>
                <CardTitle>Create A Collection</CardTitle>
                <SubText>Deploy a smart contract to showcase NFTs</SubText>
              </Stack>

              <Stack>
                <SubTitle>Set Up Your Smart Contract</SubTitle>
                <SubText>
                  The following details are used to create your smart contract.
                  They will be added to the blockchain and cannot be edited.
                </SubText>
                <StyledLink>Learn more about smart contracts</StyledLink>
              </Stack>

              <Stack>
                <InputLabel>Collection Name</InputLabel>
                <StyledInput value={name} onChange={handleNameChange} />
              </Stack>

              <Stack>
                <InputLabel>Collection Category</InputLabel>
                <Select
                  defaultValue={categories[0]}
                  options={categories}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  styles={customStyles}
                  onChange={(e) => {
                    setCategory(e.value);
                  }}
                />
              </Stack>

              <Stack>
                <SubTitle>ROYALTY</SubTitle>
                <Text fontSize="16px" fontWeight="500" fontFamily="Mulish">
                  Enable a split to autonatically divide any funds or royalties
                  earned from the NFT with up to five recipients, including
                  yourself.
                </Text>
              </Stack>

              <Stack width="100%">
                {inputFields.map((data, index) => {
                  const { address, rate } = data;

                  return (
                    <Grid templateColumns="repeat(2, 1fr)" gap={6} key={index}>
                      <Stack>
                        {index === 0 && (
                          <RoyaltyLabel>Account Name</RoyaltyLabel>
                        )}
                        <StyledInput
                          name="address"
                          readOnly={index !== 0 ? false : true}
                          value={address}
                          onChange={(evnt) => handleChange(index, evnt)}
                        />
                      </Stack>

                      <HStack justifyContent="space-between">
                        <Stack width={index ? "80%" : "100%"}>
                          {index === 0 && (
                            <RoyaltyLabel>Percentage Fee(%)</RoyaltyLabel>
                          )}
                          <StyledInput
                            name="rate"
                            value={rate}
                            onChange={(evnt) => handleChange(index, evnt)}
                            style={{ marginRight: "20px" }}
                          />
                        </Stack>

                        {index ? (
                          <IconWrapper width="70px">
                            <IconButton
                              aria-label="icon"
                              icon={<CloseIcon />}
                              onClick={(e) => removeFormFields(index, e)}
                              style={{ backgroundColor: "transparent" }}
                            />
                          </IconWrapper>
                        ) : null}
                      </HStack>
                    </Grid>
                  );
                })}
                {inputFields.length < 5 && (
                  <IconWrapper>
                    <IconButton
                      aria-label="icon"
                      icon={<AddIcon />}
                      onClick={addFormFields}
                      width="100%"
                      background="transparent"
                      _hover={{ background: "transparent" }}
                    />
                  </IconWrapper>
                )}
              </Stack>
              <Stack padding="0 20%">
                <Button
                  css={{
                    background: "#ffffff",
                    color: "#000000",
                    stroke: "#000000",
                    width: "100%",
                    padding: "20px",
                    borderRadius: "14px",
                  }}
                  variant="primary"
                  size="large"
                  onClick={(e) => createCollection(e)}
                  disabled={isJsonUploading}
                >
                  Create
                </Button>
              </Stack>
            </Stack>
          </Collections>
        </Stack>
      </Container>
    )
  );
};

const Container = styled.div`
  padding: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 1024px) {
    padding: 100px 50px;
  }
  @media (max-width: 650px) {
    padding: 10px;
  }
`;
const HorizontalDivider = styled.div`
  border-bottom: 1px solid #363b4e;
  width: 100%;
`;

const Title = styled.div`
  font-size: 46px;
  font-weight: 600;
  text-align: center;
  @media (max-width: 1024px) {
    font-size: 30px;
  }
  @media (max-width: 650px) {
    font-size: 22px;
  }
`;
const CardTitle = styled.div`
  font-size: 30px;
  font-weight: 500;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
`;
const SubTitle = styled.div`
  font-size: 25px;
  font-weight: 500;
  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;
const InputLabel = styled.div`
  font-size: 20px;
  font-weight: 500;
  margin-left: 30px;
  @media (max-width: 1024px) {
    font-size: 12px;
    font-weight: 400;
  }
`;
const RoyaltyLabel = styled.div`
  font-size: 20px;
  font-weight: 500;
  margin-left: 30px;
  @media (max-width: 1024px) {
    font-size: 12px;
    margin-left: 0;
  }
`;
const Collections = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(30px);
  border-radius: 30px;
  max-width: 1000px;
  padding: 50px;
  border: 1px solid;
  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  @media (max-width: 1024px) {
    width: 100%;
    padding: 20px;
  }
`;
const SubText = styled.div`
  font-size: 18px;
  font-family: Mulish;
  @media (max-width: 1024px) {
    font-size: 14px;
    font-weight: 400;
  }
`;
const StyledLink = styled.a`
  padding-top: 10px;
  font-size: 18px;
  font-family: Mulish;
  font-weight: 600;
  color: #cccccc;
  text-decoration: underline;
  @media (max-width: 1024px) {
    font-size: 14px;
    font-weight: 400;
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
  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;
const IconWrapper = styled.div<{ width?: string; m?: string }>`
  background: rgba(225, 225, 225, 0.3);
  padding: 20px;
  display: flex;
  width: ${({ width }) => width || "100%"};
  height: 70px;
  border-radius: 20px;
  margin: ${({ m }) => m || "0"};
  align-items: center;
  justify-content: center;
`;
