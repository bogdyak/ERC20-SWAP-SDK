import { Swap } from './swap/swap'

async function example () {
  await window.ethereum.enable()
  const SWAP = new Swap()
  // const res = await SWAP.swapExactETHForTokens(0.01, '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', '0x3137643D0a4308df08A7B77e61C657592Cc1687f')
  // swapExactETHForTokens - PARAM1: Кол-во (Сколько BNB меняем), PARAM2: Адрес кошелька откуда меняем, PARAM3: Адрес токена, на который меняем BNB.
  // const res = await SWAP.swapExactTokensForTokens(0.01, '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', '0x3137643D0a4308df08A7B77e61C657592Cc1687f', '0x9B3726D10DF962C1D35bfCA09F7F86ADC7022568', 2)
  // swapExactTokensForTokens - PARAM1: Кол-во токена который отдаем, PARAM2: Адрес кошелька откуда меняем, PARAM2: Адрес токена который меняем, PARAM3: Адрес токена который хотим получить, PARAM4: decimals токена, который отдаем.
  // const res = await SWAP.getBalance('0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', '0x3137643D0a4308df08A7B77e61C657592Cc1687f', 2)
  // getBalance - PARAM1: Адрес кошелька, чей баланс хотим получить. PARAM2: Адрес токена, баланс которого мы хотим получить. PARAM3: decimals токена, чей баланс хотим получить.
  const res = await SWAP.addLiquidityETH(
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f',
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4',
    1,
    2
  )
  // addLiquidityETH - PARAM1: Адрес токена, который хотим положить, PARAM2: Адрес кошелька с которого кладем, PARAM3: кол-во токена, которое кладем, PARAM4: decimals токена, которые кладем.
  console.log(res)
}

example()
