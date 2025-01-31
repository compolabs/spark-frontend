import btc from "@assets/tokens/bitcoin.svg";
import eth from "@assets/tokens/ethereum.svg";
import ezeth from "@assets/tokens/ezeth.svg";
import fuel from "@assets/tokens/fuel.svg";
import kemele from "@assets/tokens/kemele.svg";
import psycho from "@assets/tokens/psycho.svg";
import pzeth from "@assets/tokens/pzeth.svg";
import tremp from "@assets/tokens/tremp.svg";
import trump from "@assets/tokens/trump.svg";
import uni from "@assets/tokens/uni.svg";
import usdc from "@assets/tokens/usdc.svg";
import usdf from "@assets/tokens/usdf.svg";
import usdt from "@assets/tokens/usdt.svg";
import weth from "@assets/tokens/weth.svg";

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
  ezETH: ezeth,
  pzETH: pzeth,
  TRUMP: trump,
  WETH: weth,
  PSYCHO: psycho,
  USDF: usdf,
};

export default TOKEN_LOGOS;
