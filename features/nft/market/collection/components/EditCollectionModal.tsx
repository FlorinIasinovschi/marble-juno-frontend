import React, { useReducer, useState } from 'react'
import {
    Modal,
    ChakraProvider,
    ModalContent,
    ModalOverlay,
    useDisclosure,
    Textarea,
    Stack,
    HStack,
} from '@chakra-ui/react'
import Select, { components } from 'react-select'
import { CheckIcon } from '@chakra-ui/icons'
import { toast } from 'react-toastify'
import DropZone from 'components/DropZone'
import FeaturedImageUpload from 'components/FeaturedImageUpload'
import { Button } from 'components/Button'
import { Save } from 'icons/Save'
import styled from 'styled-components'

const options = [
    {
      value: 'Undefined',
      label: 'Undefined',
    },
    {
      value: 'Digital',
      label: 'Digital',
    },
    {
      value: 'Physical',
      label: 'Physical',
    },
    {
      value: 'Music',
      label: 'Music',
    },
    {
      value: 'Painting',
      label: 'Painting',
    },
    {
      value: 'Videos',
      label: 'Videos',
    },
    {
      value: 'Photography',
      label: 'Photography',
    },
    {
      value: 'Sports',
      label: 'Sports',
    },
    {
      value: 'Utility',
      label: 'Utility',
    },
]

export const EditCollectionModal = ({ collectionInfo }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [description, setDescription] = useState(
        collectionInfo.description || ''
    )
    const [isJsonUploading, setJsonUploading] = useState(false)
    const [saved, setSaved] = useState(false)
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

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value)
    }

    return (
        <>
            <Button
                className="btn-buy btn-default"
                css={{
                background: '$white',
                color: '$black',
                stroke: '$black',
                width: '100%',
            }}
            variant="primary"
            onClick={onOpen}
        >
            Edit Collection
        </Button>

        <Modal
            blockScrollOnMount={false}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
        >
            <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
            <Container>
                <ModalWrapper>
                    <Stack spacing="40px">
                        <Title>Edit Collection</Title>
                        <Stack>
                            <Text>Collection Logo</Text>
                            <DropZone data={data} dispatch={dispatch} item="logo"/>
                        </Stack>
                        <Stack>
                            <Text>Cover Image</Text>
                            <FeaturedImageUpload data={data} dispatch={dispatch} item="featured"/>
                        </Stack>
                        <Stack>
                            <Text>Description</Text>
                                <Input
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    maxLength="1000"
                                />
                            <Footer>
                                <div>Use markdown syntax to embed links</div>
                                <div>{description.length}/1000</div>
                            </Footer>
                        </Stack>
                    </Stack>
                </ModalWrapper>
            </Container>
        </Modal>
      </>
    )
}

const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 30px;
  color: white !important;
  max-width: 900px !important;
  @media (max-width: 480px) {
    max-width: 90vw !important;
    padding: 5px;
  }
`
const ModalWrapper = styled.div`
  max-height: 90vh;
  overflow: auto;
  padding: 20px;
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
`

const Input = styled(Textarea)`
  background: #272734 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09) !important;
  backdrop-filter: blur(40px) !important;
  /* Note: backdrop-filter has minimal browser support */
  font-family: Mulish;
  border-radius: 20px !important;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 30px;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`

const Text = styled.div`
  font-size: 14px;
  font-weight: 700;
  padding: 0 40px;
  @media (max-width: 480px) {
    font-size: 12px;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  opacity: 0.5;
  font-size: 14px;
  padding: 0 10px;
  div {
    font-family: Mulish;
  }
`
const SelectWrapper = styled.div`
  width: 100%;
`
const IconWrapper = styled.div`
  cursor: pointer;
`