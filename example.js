import { Swap } from './swap/swap'

window.ethereum.enable()
const SWAP = new Swap()

async function example1(){
  const res = await SWAP.swapExactETHForTokens(
    0.01, 
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', 
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f'
    );
  return res;
}

async function example2(){
  const res = await SWAP.swapExactTokensForTokens(
    0.01, 
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', 
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f', 
    '0x9B3726D10DF962C1D35bfCA09F7F86ADC7022568', 
    2
    );
  return res;
}

async function example3(){
  const res = await SWAP.getBalance(
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', 
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f', 
    2
  );
  return res;
}

async function example4(){
  const res = await SWAP.addLiquidityETH(
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f',
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4',
    1,
    2
  );
  return res;
}