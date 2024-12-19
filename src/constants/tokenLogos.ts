import btc from "@assets/tokens/bitcoin.svg";
import eth from "@assets/tokens/ethereum.svg";
import fuel from "@assets/tokens/fuel.svg";
import kemele from "@assets/tokens/kemele.svg";
import tremp from "@assets/tokens/tremp.svg";
import uni from "@assets/tokens/uni.svg";
import usdc from "@assets/tokens/usdc.svg";
import usdt from "@assets/tokens/usdt.svg";

const TOKEN_LOGOS: Record<string, string> = {
  ETH: eth,
  BTC: btc,
  USDC: usdc,
  USDT: usdt,
  tETH: eth,
  tBTC: btc,
  tUSDC: usdc,
  UNI: uni,
  KMLA: kemele,
  TRMP: tremp,
  FUEL: fuel,
};

export default TOKEN_LOGOS;
