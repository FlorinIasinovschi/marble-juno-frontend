import styled from "styled-components";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ArrowDown } from "icons";

const DropDownButton = ({ menuList, onChange, current }) => {
  const menuButtonCss = {
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.06) 100%) !important",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "30px",
    padding: "30px",
    " span": {
      fontFamily: "Mulish",
    },
    "&:hover": {
      background: "none",
    },
    "&:focus": {
      background: "none",
    },
  };
  const menuListCss = {
    background: "rgb(35,38,52)",
    border: "1px solid rgba(255,255,255,0.7)",
  };
  const menuItemCss = {
    fontFamily: "Mulish",
    "&:hover": {
      background: "none",
      opacity: "0.6",
    },
    "&:focus": {
      background: "none",
    },
  };
  return (
    <Menu>
      <MenuButton css={menuButtonCss} as={Button} rightIcon={<ArrowDown />}>
        {current.key}
      </MenuButton>
      <MenuList css={menuListCss}>
        {menuList.map((_menu, index) => (
          <MenuItem
            css={menuItemCss}
            key={index}
            onClick={() => {
              onChange(index);
            }}
          >
            {_menu.key}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default DropDownButton;
