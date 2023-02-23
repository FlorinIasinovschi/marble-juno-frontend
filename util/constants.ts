/* legacy and is a subject for refactor */
export const colorTokens = {
  black: "#161616",
  gray: "#858585",
  lightGray: "#FAF9F9",
  lightBlue: "#2F80ED",
  white: "#ffffff",
  primary: "#0066DB",
  secondaryText: "rgba(25, 29, 32, 0.75)",
  bodyText: "rgba(25, 29, 32, 0.95)",
  tertiaryText: "rgba(25, 29, 32, 0.6)",
  tertiaryIcon: "rgba(25, 29, 32, 0.5)",
  disabled: "#858585",
};

/* legacy and is a subject for refactor */
export const spaces = {
  0: "0",
  2: "2px",
  10: "10px",
  12: "12px",
  14: "14px",
  18: "18px",
  24: "24px",
};

export const default_image = "/default.png";
export const DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL = 10000;
export const SLIPPAGE_OPTIONS = [0.01, 0.02, 0.03, 0.05];
export const NETWORK_FEE = 0.003;

export const APP_NAME = process.env.NEXT_PUBLIC_SITE_TITLE;
export const INCENTIVE_AMOUNT = 40000000;

/* the app operates in test mode */
export const __TEST_MODE__ = !JSON.parse(
  process.env.NEXT_PUBLIC_TEST_MODE_DISABLED
);

/* feature flags */
export const __POOL_REWARDS_ENABLED__ = true; // is under development and cannot be enabled
export const __TRANSFERS_ENABLED__ = JSON.parse(
  process.env.NEXT_PUBLIC_ENABLE_FEATURE_TRANSFERS
);
/* /feature flags */
export const backend_url = "https://juno-api.marbledao.finance";
// export const backend_url = "http://localhost:3030";
export const PINATA_PRIMARY_IMAGE_SIZE =
  process.env.NEXT_PUBLIC_PINATA_PRIMARY_IMAGE_SIZE;
export const PINATA_SECONDARY_IMAGE_SIZE =
  process.env.NEXT_PUBLIC_PINATA_SECONDARY_IMAGE_SIZE;
export const PINATA_URL = process.env.NEXT_PUBLIC_PINATA_URL;
export const NUM_PER_PAGE = 12;
export const FACTORY_ADDRESS =
  "juno19m5duxnjrz9s3857xmefrmr7cagqmdl93fcjy2zt2zjc2fmzj99sueqdl0";
export const MARKETPLACE_ADDRESS =
  "juno1pc8uu8vzccuwgth3jm6n47hwxelg4dkvc8322q3pz790g9vgnftsxg72fq";
export const SUBQUERY_URL =
  "https://api.subquery.network/sq/rafleberry/marble-nft";

export const categories = [
  {
    value: "Digital",
    label: "Digital",
  },
  {
    value: "Community",
    label: "Community",
  },
  {
    value: "Phygital",
    label: "Phygital",
  },
];
export const SORT_INFO = {
  all: [
    {
      key: "Newest",
      value: "CREATED_TIME_DESC",
    },
    {
      key: "Oldest",
      value: "CREATED_TIME_ASC",
    },
    {
      key: "Name A-Z",
      value: "NAME_ASC",
    },
    {
      key: "Name Z-A",
      value: "NAME_DESC",
    },
  ],
  fixed: [
    {
      key: "Most Expensive",
      value: "PRICE_ASC",
    },
    {
      key: "Cheapest",
      value: "PRICE_DESC",
    },
  ],
  auction: [
    {
      key: "Most Expensive",
      value: "PRICE_ASC",
    },
    {
      key: "Cheapest",
      value: "PRICE_DESC",
    },
  ],
  offer: [
    {
      key: "Most Expensive",
      value: "PRICE_ASC",
    },
    {
      key: "Cheapest",
      value: "PRICE_DESC",
    },
  ],
};
