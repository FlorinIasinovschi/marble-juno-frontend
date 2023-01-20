import * as React from "react";
import styled from "styled-components";

export function CategoryTab({ categories, activeCategory, setActiveCategory }) {
  const getActiveTabIfActive = (tabId) =>
    activeCategory === tabId ? true : false;
  return (
    <Container>
      <CategoryItem
        onClick={() => setActiveCategory("All")}
        isActive={getActiveTabIfActive("All")}
      >
        All
      </CategoryItem>
      {categories.length > 0 &&
        categories.map((category) => (
          <CategoryItem
            key={category.id}
            onClick={() => setActiveCategory(category.value)}
            isActive={getActiveTabIfActive(category.value)}
          >
            {category.value}
          </CategoryItem>
        ))}
    </Container>
  );
}

const Container = styled.div`
  margin: 30px 0;
  display: flex;
  column-gap: 5px;
  overflow: auto;
  justify-content: space-around;
`;

const CategoryItem = styled.div<{ isActive: boolean }>`
  border-radius: 30px;

  border: 1px solid;

  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  padding: 15px 30px;
  cursor: pointer;
  text-align: center;
  font-family: Mulish;
  color: ${({ isActive }) => (isActive ? "white" : "rgba(255,255,255,0.5)")};
`;
