import btc from "@assets/tokens/bitcoin.svg";
import eth from "@assets/tokens/ethereum.svg";
import kemele from "@assets/tokens/kemele.svg";
import tremp from "@assets/tokens/tremp.svg";
import uni from "@assets/tokens/uni.svg";
import usdc from "@assets/tokens/usdc.svg";

const TOKEN_LOGOS: Record<string, string> = {
  ETH: eth,
  BTC: btc,
  USDC: usdc,
  tETH: eth,
  tBTC: btc,
  tUSDC: usdc,
  UNI: uni,
  KMLA: kemele,
  TRMP: tremp,
};

export default TOKEN_LOGOS;
