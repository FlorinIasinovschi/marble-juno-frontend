import { useRecoilValue } from "recoil";
import { walletState } from "state/atoms/walletAtoms";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();
  const { address } = useRecoilValue(walletState);
  router.push(`/profile/${address}`);
  return null;
}
