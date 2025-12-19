import { useLiveBalance } from "@/services/balance/userBalance";

// WalletBadge.tsx
export function WalletBadge({ memberId, loginBalance, authToken }: { memberId: string; loginBalance: number; authToken: string }) {
  const balance = useLiveBalance(memberId, loginBalance, authToken);
  return <div className="wallet">৳ {balance}</div>;
}