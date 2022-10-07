export const shortenAddress = (address: string) => {
    return address != null
      ? `${address.slice(0, 3)}...${address.slice(
          address.length - 3,
          address.length
        )}`
      : "";
}