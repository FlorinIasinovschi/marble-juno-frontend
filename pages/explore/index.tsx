import { useRouter } from "next/router";

export default function Explores() {
  const router = useRouter();
  router.push("/explore/nfts");
  return null;
}
