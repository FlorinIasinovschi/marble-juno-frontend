import { useState } from 'react'
import styled from 'styled-components'
import { ChevronRightIcon } from '@chakra-ui/icons'

export const Menu = ({ title, children }) => {
  const [listShow, setListShow] = useState(false)

  return (
    <MenuWrapper>
      <MenuButton onClick={() => setListShow(!listShow)}>
        {title}
        <ChevronRightIcon
          transform={listShow ? `rotate(90deg)` : `rotate(0deg)`}
        />
      </MenuButton>
      <MenuList show={listShow}>{children}</MenuList>
    </MenuWrapper>
  )
}

const MenuWrapper = styled.div`
  padding-top: 40px;
`

const MenuButton = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
`
const MenuList = styled.div<{ show: boolean }>`
  display: ${({ show }) => (show ? 'block' : 'none')};
`
export const MenuItem = styled.div<{ active: boolean }>`
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  font-weight: ${({ active }) => (active ? 700 : 400)};
  margin: 20px 0;
  font-size: 16px;
  cursor: pointer;
`
