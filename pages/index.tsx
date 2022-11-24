import { AppLayout } from "../components/Layout/AppLayout";
import HomePage from "../features/home";

export default function Home() {
  return (
    <AppLayout fullWidth={true}>
      <HomePage />
    </AppLayout>
  );
}
