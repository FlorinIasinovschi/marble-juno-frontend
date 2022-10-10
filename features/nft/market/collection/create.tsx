import * as React from "react"
import { useCallback, useState, useReducer, useEffect } from "react"
import { useRouter } from 'next/router'
import axios from 'axios'
import styled from 'styled-components'
import Select, { components } from 'react-select'

import {
  NftInfo,
  NftCategory,
  NftCollection,
  CollectionToken
} from "services/nft"

import {
  Stack,
  useRadioGroup,
  useRadio,
  Grid,
  Box,
  Text,
  HStack,
  IconButton,
  Button
} from '@chakra-ui/react'
import { AddIcon, CloseIcon } from '@chakra-ui/icons'

import { toast } from 'react-toastify'
import DropZone from "components/DropZone"
import FeaturedImageUpload from "components/FeaturedImageUpload"
import BannerImageUpload from "components/BannerImageUpload"
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { Market, useSdk } from 'services/nft'
import { isMobile } from 'util/device'

const categories = [
  {
    value: '0',
    label: 'All'
  },
  {
    value: '1',
    label: 'Digital',
  },
  {
    value: '2',
    label: 'Physical',
  },
  {
    value: '3',
    label: 'Music',
  },
  {
    value: '4',
    label: 'Painting',
  },
  {
    value: '5',
    label: 'Videos',
  },
  {
    value: '6',
    label: 'Photography',
  },
  {
    value: '7',
    label: 'Sports',
  },
  {
    value: '8',
    label: 'Utility',
  },
]

const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '70px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2) !important',
    background: '#272734',
    color: '#FFFFFF',
  }),
  menuList: (base, state) => ({
    ...base,
    background: '#272734',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    maxHeight: '400px',
  }),
  option: (base, state) => ({
    ...base,
    color: 'white',
    background: '#272734',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.1)',
    },
  }),
  singleValue: (base, state) => ({
    ...base,
    color: 'white',
  }),
  valueContainer: (base, state) => ({
    ...base,
    display: 'flex',
  }),
  menu: (base, state) => ({
    ...base,
    zIndex: '10',
    margin: '0px',
    background: 'none',
  }),
}

const PUBLIC_CW721_CONTRACT = process.env.NEXT_PUBLIC_CW721_CONTRACT || ''
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''
const PUBLIC_CW721_BASE_CODE_ID = process.env.NEXT_PUBLIC_CW721_BASE_CODE_ID || 388

const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PUBLIC_PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || ''
const PUBLIC_PINATA_URL = process.env.NEXT_PUBLIC_PINATA_URL || ''
let themeValue = "1"
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getCheckboxProps()
  
  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          // boxShadow: 'outline',
        }}
        _focus={{
          // boxShadow: 'outline',
        }}
        className={props.isChecked?'active':''}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}

let collectionTokenArr = []
let collectionTokenCount = 0
export const CollectionCreate = () => {
  const router = useRouter()
  //const toast = useToast()
  const [nftcategories, setNftCategories] = useState<NftCategory[]>(
    []
  )
  const [isJsonUploading, setJsonUploading] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("0")
  const [website, setWebsite] = useState("")
  const [discord, setDiscord] = useState("")
  const [instagram, setInstagram] = useState("")
  const [medium, setMedium] = useState("")
  const [telegram, setTelegram] = useState("")
  const [maximumRoyaltyFee, setMaximumRoyaltyFee] = useState("10")
  const [explicit, setExplicit] = useState("")
  const [collectionIpfsHash, setCollectionIpfsHash] = useState("")
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const [token, setToken] = useState("")
  const [tokens, setTokens] = useState<number[]>([])
  const [collectionTokens, setCollectionTokens] = useState<CollectionToken[]>([])
  const [tokenReomveCount, setTokenReomveCount] = useState(0)
  const [inputFields, setInputFields] = useState([{address:address, rate: 0}])

  const handleChange = (index, evnt)=>{
    const { name, value } = evnt.target
    const list = [...inputFields]
    list[index][name] = value

    console.log(name, value);

    setInputFields(list)
  }

  const addFormFields = () => {
    setInputFields([...inputFields, { address: '', rate: 0 }])
  }

  const removeFormFields = (i, e) => {
    const newFormValues = [...inputFields]
    newFormValues.splice(i, 1)
    setInputFields(newFormValues)
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }
  const handleSlugChange = (event) => {
    setSlug(event.target.value)
  }
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }
  const handleCategoryChange = (event) => {
    setCategory(event.target.value)
  }
  const handleWebsiteChange = (event) => {
    setWebsite(event.target.value)
  }
  const handleDiscordChange = (event) => {
    setDiscord(event.target.value)
  }
  const handleInstagramChange = (event) => {
    setInstagram(event.target.value)
  }
  const handleMediumChange = (event) => {
    setMedium(event.target.value)
  }
  const handleTelegramChange = (event) => {
    setTelegram(event.target.value)
  }
  const handleMaximumRoyaltyFeeChange = (event) => {
    setMaximumRoyaltyFee(event.target.value)
  }
  const handleTokenChange = (event) => {
    setToken(event.target.value)
    if (tokens.indexOf(parseInt(event.target.value)) == -1){
      console.log("tokens", tokens, event.target.value)
      if (event.target.value == "")
        return
      let tokenIds = tokens
      tokenIds.push(parseInt(event.target.value))
      setTokens(tokenIds)
      collectionTokenArr = tokenIds
      collectionTokenCount++
      setTokenReomveCount(collectionTokenCount)
    }
  }
  
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone }
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) }
      case "SET_LOGO":
        console.log("state logo", action.logo)
        return { ...state, logo: action.logo}
      case "SET_FEATURED_IMAGE":
        return { ...state, featuredImage: action.featuredImage}
      case "SET_BANNER":
        return { ...state, banner: action.banner}
      default:
        return state
    }
  }

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    logo: "",
    featuredImage: "",
    banner: "",
  })

  const options = ['1', '2', '3']
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'template',
    defaultValue: '1',
    onChange: console.log,
  })
  const group = getRootProps()
  

  useEffect(() => {
    (async () => {
      let res_categories = await fetch(process.env.NEXT_PUBLIC_CATEGORY_URL)
      let categories = await res_categories.json()
      console.log(categories);
      setNftCategories(categories.categories)
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const collectionTokenList = await response.json()
      setCollectionTokens(collectionTokenList.tokens)
    })()

  }, [])

  useEffect(() => {
    console.log("collectionTokenArr", collectionTokenArr)

  }, [tokenReomveCount])
  
  const createCollection = async(e) => {
    
    if (!address || !signingClient) {
      toast.warning(
        `Please connect your wallet.`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      )
      return
    }

    if (name == "")
    {
      toast.warning(
        `Please input the collection name.`,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      )
      return  
    }
    
    let tokenSymbols = []
    for (let i = 0; i < tokens.length; i++){
      tokenSymbols.push(collectionTokens[tokens[i]].symbol)
    }

    let total_royalty_rate:number = 0
    let royaltiesArr:any = []
    const royalties = [...inputFields]

    for (let i = 0; i < royalties.length; i++){
      total_royalty_rate += parseFloat(royalties[i]["rate"].toString())
      royalties[i]["rate"] = royalties[i]["rate"]
      royaltiesArr.push({"address": royalties[i]['address'], "rate": royalties[i]["rate"] * 10000})
    }

    const jsonData = {}
    jsonData["logo"] = ""
    jsonData["featuredImage"] = ""
    jsonData["banner"] = ""
    jsonData["name"] = name
    jsonData["slug"] = ""
    jsonData["description"] = description
    jsonData["category"] = category
    jsonData["website"] = website
    jsonData["discord"] = discord
    jsonData["instagram"] = instagram
    jsonData["medium"] = medium
    jsonData["telegram"] = telegram
    jsonData["royalties"] = royaltiesArr
    jsonData["network"] = "JUNO"
    jsonData["tokens"] = ["BLOCK"]//tokenSymbols
    jsonData["maximumRoyaltyFee"] = parseFloat(maximumRoyaltyFee) * 10000
    jsonData["themeValue"] = themeValue
    jsonData["explicit"] = explicit
    jsonData["owner"] = address
    const pinataJson = {
      "pinataMetadata": 
      {
        "name": name, 
        keyvalues:
        {
          "slug": slug
        }
      }, 
      "pinataContent": jsonData
    }
    console.log(pinataJson)
    setJsonUploading(true)
    let url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    let response = await axios
        .post(url, pinataJson, {
            maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `application/json`,
                pinata_api_key: PUBLIC_PINATA_API_KEY,
                pinata_secret_api_key: PUBLIC_PINATA_SECRET_API_KEY
            }
        })
    let ipfsHash = ""
    if (response.status == 200){
      console.log(response)
      setCollectionIpfsHash(response.data.IpfsHash)
      ipfsHash = response.data.IpfsHash
    }
    setJsonUploading(false)
    
    if (!address || !signingClient) {
      console.log("unauthorized user")
      return
    }
    const marketContract = Market(PUBLIC_MARKETPLACE).useTx(signingClient)
    const collection = await marketContract.addCollection(
      address, 10000, name, "BLOCK", Number(PUBLIC_CW721_BASE_CODE_ID), Number(parseFloat(maximumRoyaltyFee) * 10000), royaltiesArr, ipfsHash
    )
    console.log("Collection:", collection)
    toast.success(
      `You have created your collection successfully.`,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
  }

  return (
    // <Container>
    //   <p><span className="required">*</span> Required Fields</p>
    //   <LogoFeaturedContinaer className="logo-featured-container collection-item">
    //     <LogoContainer>
    //       <h3>Logo image <span className="required">*</span></h3>
    //       <p>This image will also be used for navigation. 350*350 recommended.</p>
    //       <AspectRatio maxW='350px' ratio={1}>
    //         <DropZone data={data} dispatch={dispatch} item="logo"/>
    //       </AspectRatio>
    //     </LogoContainer>
    //     <FeaturedContainer className="hide">
    //       <h3>Featured image</h3>
    //       <p>This image will also be used for Featured your collection on home page, category pages, or other promotional areas of OpenSea. 600*400 recommended.</p>
    //       <AspectRatio maxW='600px' ratio={1.5}>
    //         <FeaturedImageUpload data={data} dispatch={dispatch} item="featured"/>
    //       </AspectRatio>
    //     </FeaturedContainer>
    //   </LogoFeaturedContinaer>
    //   <BannerContainer className="collection-item hide">
    //     <h3>Banner image</h3>
    //     <p>This image will appear at the top of your collection page. Avoid including too much text in this banner image, as the dimemsions change on different devices. 1400*400 recommended.</p>
    //     <AspectRatio maxW='1400px' ratio={3.5}>
    //       <BannerImageUpload data={data} dispatch={dispatch} item="collection-banner"/>
    //     </AspectRatio>
    //   </BannerContainer>
    //   <ChakraProvider>
    //     <CollectionItem className="collection-item">
    //       <h3>Name <span className="required">*</span></h3>
    //       <Input
    //               pr='48px'
    //               type='text'
    //               placeholder='Example: Treasures of the Sea'
    //               value={name} onChange={handleNameChange}
    //             />
    //     </CollectionItem>
    //     <CollectionItem className="collection-item hide">
    //       <h3>URL <span className="required">*</span></h3>
    //       <p>Customize your URL on Marble NFT Marketplace. Must only contain lowercase letters, numbers, and hyphens.</p>
    //       <InputGroup size='sm'>
    //         <InputLeftAddon children={`${window.location.origin}/`} />
    //         <Input placeholder='collection-name' value={slug} onChange={handleSlugChange}/>
    //       </InputGroup>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <h3>Description</h3>
    //       <p>Markdown syntax is supported. 0 of 1000 characters used.</p>
    //       <Textarea value={description} onChange={handleDescriptionChange}/>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <h3>Category</h3>
    //       <p>Adding a category will help make your item discoverable on Marble NFT Marketplace.</p>
    //       <Select id='category_id' value={category} onChange={handleCategoryChange}>
    //         {nftcategories.length > 0 && nftcategories.map((category, idx) => (
    //             <option value={category.id} key={`cat${idx}`}>{category.name=='All'?'':category.name}</option>
    //         ))}
    //       </Select>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <h3>Link</h3>
    //       <Stack spacing={0} className="link-group">
    //         <InputGroup className="link-item first-item">
    //           <InputLeftAddon pointerEvents='none'>
    //             <YourSite/>
    //           </InputLeftAddon>
    //           <Input type='text' placeholder='yoursite.io' value={website} onChange={handleWebsiteChange}/>
    //         </InputGroup>
    //         <InputGroup className="link-item">
    //           <InputLeftAddon pointerEvents='none'>
    //             <Discord/>https://discord.gg/
    //           </InputLeftAddon>
    //           <Input placeholder='abcdef' value={discord} onChange={handleDiscordChange}/>
    //         </InputGroup>
    //         <InputGroup className="link-item">
    //           <InputLeftAddon pointerEvents='none'>
    //             <Instagram/>https://www.instagram.com/
    //           </InputLeftAddon>
    //           <Input type='text' placeholder='YourInstagramHandle' value={instagram} onChange={handleInstagramChange}/>
    //         </InputGroup>
    //         <InputGroup className="link-item">
    //           <InputLeftAddon pointerEvents='none'>
    //             <MediumM/>https://medium.com/@
    //           </InputLeftAddon>
    //           <Input type='text' placeholder='YourMediumHandle' value={medium} onChange={handleMediumChange}/>
    //         </InputGroup>
    //         <InputGroup className="link-item last-item">
    //           <InputLeftAddon pointerEvents='none'>
    //             <Telegram/>https://t.me/
    //           </InputLeftAddon>
    //           <Input type='text' placeholder='abcdef' value={telegram} onChange={handleTelegramChange}/>
    //         </InputGroup>
    //       </Stack>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <h3>Creator earnings</h3>
    //       <p>Collec a free when a user re-sells an item you originally created. This is deducted from the final sale price and paid monthly to a payout of your choosing.</p>
    //       <Link href="#" passHref>Learn more about creator earnings.</Link>
          
    //       <RatesContainer>
    //         <h4>Royalty</h4>
    //         <h4>Maximum Royalty Fee <span className="required">*</span></h4>
    //         <Input
    //                 type='number'
    //                 value={maximumRoyaltyFee} onChange={handleMaximumRoyaltyFeeChange}
    //               />
    //         {inputFields.map((data, index)=>{
    //             const {address, rate}= data;
    //             return(
    //               <div className="rate-item" key={index}>
    //                 <Input type="text" readOnly={index!==0?false:true} onChange={(evnt)=>handleChange(index, evnt)} value={address} name="address" className="form-control"  placeholder="Address" />
    //                 <Input type="number" onChange={(evnt)=>handleChange(index, evnt)} value={rate} name="rate" className="form-control"  placeholder="Rate" />
    //                 <Button disabled={index!==0?false:true} onClick={removeInputFields}>x</Button>
    //               </div>
    //             )
    //           })
    //         }

    //         <div className="add-rate-item">
    //           <Button onClick={addInputField}>Add New</Button>
    //         </div>
    //       </RatesContainer>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <h3>Blockchain</h3>
    //       <HStack spacing={0} className="chain-group">
    //         <Image alt="Token Icon" className="token-icon" src="/juno.png"/><span>JUNO</span>
    //       </HStack>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item hide">
    //       <h3>Payment tokens</h3>
    //       <HStack spacing={0} className="chain-group">
          
    //         {collectionTokens.length > 0 && collectionTokens.map((token, idx) => (
    //           <Button
    //             key={`token${idx}`}
    //             variant="secondary"
    //             className={`${tokens.indexOf(idx) != -1?'active':'default'}`}
    //             onClick={() => {

    //               if (tokens.indexOf(idx) == -1){
    //                 let tokenIds = tokens
    //                 tokenIds.push(idx)
    //                 setTokens(tokenIds)
    //                 collectionTokenCount++
    //                 setTokenReomveCount(collectionTokenCount)
    //               }else{
    //                 let tokenIds = tokens
    //                 tokenIds.splice(tokenIds.indexOf(idx), 1)
    //                 console.log("Tokens", tokenIds)
    //                 setTokens(tokenIds)
    //                 collectionTokenCount--
    //                 setTokenReomveCount(collectionTokenCount)
    //               }
    //               if (tokens.indexOf(idx) == -1){
    //                 let tokenIds = []
    //                 tokenIds.push(idx)
    //                 setTokens(tokenIds)
    //                 collectionTokenCount++
    //                 setTokenReomveCount(collectionTokenCount)
    //               }else{
    //                 let tokenIds = tokens
    //                 tokenIds.splice(tokenIds.indexOf(idx), 1)
    //                 console.log("Tokens", tokenIds)
    //                 setTokens([])
    //                 collectionTokenCount--
    //                 setTokenReomveCount(collectionTokenCount)
    //               }
    //               return false
    //             }}
    //           >
                
    //             <Image alt="Token Icon" className="token-icon" src={collectionTokens[idx].logoUri}/>{token.name}
    //             <span className={`${tokens.indexOf(idx) != -1?'visible-yes':'visible-no'}`}>
    //             <CheckIcon />
    //             </span>
    //           </Button>
    //         ))}
          
    //       </HStack>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item hide">
    //       <h3>Display theme</h3>
    //       <p>Change how your items are shown.</p>
    //       <Stack spacing={0} className="theme-group">
    //         <HStack {...group}>
    //           {options.map((value) => {
    //             const radio = getRadioProps({ value })
    //             if (radio.isChecked){
    //               themeValue = radio.value.toString()
    //             }
                
    //             return (
    //               <RadioCard key={value} value={value} {...radio}>
    //                 {value == '1' &&
    //                   <Template>
    //                     <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
    //                     <Design>
    //                       <Template1/><Template1/><Template1/>
    //                     </Design>
    //                     <h3>Padded</h3>
    //                     <p>Recommended for assets with transparent background</p>
    //                   </Template>
    //                 }
    //                 {value == '2' &&
    //                   <Template>
    //                     <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
    //                     <Design>
    //                       <Template1/><Template1/><Template1/>
    //                     </Design>
    //                     <h3>Contained</h3>
    //                     <p>Recommended for assets that are not a 1:1 ratio</p>
    //                   </Template>
    //                 }
    //                 {value == '3' &&
    //                   <Template>
    //                     <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
    //                     <Design>
    //                       <Template1/><Template1/><Template1/>
    //                     </Design>
    //                     <h3>Covered</h3>
    //                     <p>Recommended for assets that can extend to the edge</p>
    //                   </Template>
    //                 }
    //               </RadioCard>
    //             )
    //           })}
    //         </HStack>
    //       </Stack>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item hide">
    //       <h3>Explicit & sensitive content</h3>
    //       <ExplicitItem>
    //         <p>Set this collection as explicit and senstive content</p>
    //         <Switch value="yes" id='explicit-senstive' onChange={(e) => e.target.checked?setExplicit(e.target.value):setExplicit("")}/>
    //       </ExplicitItem>
    //     </CollectionItem>
    //     <CollectionItem className="collection-item">
    //       <Button className="btn-default"
    //         css={{
    //           'background': '$black',
    //           'color': '$white',
    //           'stroke': '$white',
    //         }}
    //         variant="primary"
    //         size="large"
    //         onClick={(e) => {
              
    //           createCollection(e)
            
    //         }}

    //         disabled={isJsonUploading}
    //       >
    //         Create
    //       </Button>
    //       {collectionIpfsHash != "" &&
    //         <span className="hide">
    //         Pinata IpfsHash: <Link href={`https://gateway.pinata.cloud/ipfs/${collectionIpfsHash}`} passHref>{collectionIpfsHash}</Link>
    //         </span>
    //       }
    //     </CollectionItem>
    //   </ChakraProvider>
    // </Container>
    (
      address && (
        <Container>
          <Stack spacing={isMobile() ? '20px' : '50px'}>
            <Title>Create On Marble Dao</Title>

            <Collections>
              <Stack spacing={isMobile() ? '20px' : '50px'}>
                <Stack>
                  <CardTitle>Create A Collection</CardTitle>
                  <SubText>Deploy a smart contract to showcase NFTs</SubText>
                </Stack>

                <Stack>
                  <SubTitle>Set Up Your Smart Contract</SubTitle>
                  <SubText>
                    The following details are used to create your smart
                    contract. They will be added to the blockchain and cannot be
                    edited.
                  </SubText>
                  <StyledLink>Learn more about smart contracts</StyledLink>
                </Stack>

                <Stack>
                  <InputLabel>Collection Name</InputLabel>
                  <StyledInput
                    value={name}
                    onChange={handleNameChange}
                  />
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
                      setCategory(e.value)
                    }}
                  />
                </Stack>

                <Stack>
                  <SubTitle>ROYALTY</SubTitle>
                  <Text fontSize="16px" fontWeight="500" fontFamily="Mulish">
                    Enable a split to autonatically divide any funds or
                    royalties earned from the NFT with up to five recipients,
                    including yourself.
                  </Text>
                </Stack>

                <Stack width="100%">
                  {
                    inputFields.map((data, index) => {
                      const {address, rate}= data;

                      return (
                        <Grid templateColumns="repeat(2, 1fr)" gap={6} key={index}>
                          <Stack>
                            {index === 0 && (
                              <RoyaltyLabel>Account Name</RoyaltyLabel>
                            )}
                            <StyledInput
                              name="address"
                              readOnly={index!==0?false:true}
                              value={address}
                              onChange={(evnt)=>handleChange(index, evnt)}
                            />
                          </Stack>

                          <HStack justifyContent="space-between">
                            <Stack width={index ? '80%' : '100%'}>
                              {index === 0 && (
                                <RoyaltyLabel>Percentage Fee(%)</RoyaltyLabel>
                              )}
                              <StyledInput
                                name="rate"
                                type="number"
                                value={rate}
                                onChange={(evnt)=>handleChange(index, evnt)}
                                style={{ marginRight: '20px' }}
                              />
                            </Stack>

                            {index ? (
                              <IconWrapper width="70px">
                                <IconButton
                                  aria-label="icon"
                                  icon={<CloseIcon />}
                                  onClick={(e) => removeFormFields(index, e)}
                                  style={{ backgroundColor: 'transparent' }}
                                />
                              </IconWrapper>
                            ) : null}
                          </HStack>
                        </Grid>
                      )
                    })
                  }
                  {inputFields.length < 5 && (
                    <IconWrapper>
                      <IconButton
                        aria-label="icon"
                        icon={<AddIcon />}
                        onClick={addFormFields}
                        width="100%"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </IconWrapper>
                  )}
                </Stack>
                <Stack padding="0 20%">
                  <Button
                    className="btn-buy btn-default"
                    css={{
                      background: '#ffffff',
                      color: '#000000',
                      stroke: '#000000',
                      width: '100%',
                      padding: '20px',
                      borderRadius: '14px'
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
    )
  )
}

const Container = styled.div`
  padding: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 480px) {
    padding: 10px;
  }
`
const Title = styled.div`
  font-size: 46px;
  font-weight: 600;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 22px;
  }
`
const CardTitle = styled.div`
  font-size: 30px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 20px;
    text-align: center;
  }
`
const SubTitle = styled.div`
  font-size: 30px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 14px;
  }
`
const InputLabel = styled.div`
  font-size: 25px;
  font-weight: 700;
  margin-left: 30px;
  @media (max-width: 480px) {
    font-size: 12px;
    font-weight: 400;
  }
`
const RoyaltyLabel = styled.div`
  font-size: 30px;
  font-weight: 700;
  margin-left: 30px;
  @media (max-width: 480px) {
    font-size: 12px;
    margin-left: 0;
  }
`
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
  width: 1000px;
  padding: 50px;
  border: 1px solid;
  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  @media (max-width: 480px) {
    width: 100%;
    padding: 20px;
  }
`
const SubText = styled.div`
  font-size: 18px;
  font-family: Mulish;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 14px;
    font-weight: 400;
  }
`
const StyledLink = styled.a`
  font-size: 18px;
  font-family: Mulish;
  font-weight: 600;
  color: #cccccc;
  @media (max-width: 480px) {
    font-size: 14px;
    font-weight: 400;
  }
`

const StyledInput = styled.input`
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 20px;
  font-size: 20px;
  font-family: Mulish;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`
const IconWrapper = styled.div<{ width?: string; m?: string }>`
  background: rgba(225, 225, 225, 0.3);
  padding: 20px;
  display: flex;
  width: ${({ width }) => width || '100%'};
  height: 70px;
  border-radius: 20px;
  margin: ${({ m }) => m || '0'};
  align-items: center;
  justify-content: center;
`
