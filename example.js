import { Swap } from './swap/swap'

window.ethereum.enable()
const SWAP = new Swap()

async function example1(){
  const res = await SWAP.swapExactETHForTokens( // Поменять BNB на токены
    0.01, // Сколько BNB меняем
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', // Адрес кошелька
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f' // На что меняем (В данном случае INDA TOKENs)
    );
  return res;
}

async function example2(){
  const res = await SWAP.swapExactTokensForTokens( // Поменять токены на токены
    0.01, // Сколько меняем
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', // Адрес кошелька
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f', // Что меняем (INDA Token)
    '0x9B3726D10DF962C1D35bfCA09F7F86ADC7022568', // На что меняем (BUSD Token)
    2 // decimals того, что меняем
    );
  return res;
}

async function example3(){
  const res = await SWAP.getBalance( // Получить баланс токена
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', // Адрес кошелька
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f',  // INDA Token
    2 // decimals INDA
  );
  return res;
}

async function example4(){
  const res = await SWAP.getLPBalance( // Получить баланс LP токенов (пары).
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f', // Адрес первого токена (INDA Token)
    '0x9b3726d10df962c1d35bfca09f7f86adc7022568', // Адрес второго токена (BUSD Token)
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4' // Адрес кошелька 
    )
  return res;
}

async function example5(){
  const res = await SWAP.addLiquidityETH( // Добавить ликвидность (Token / BNB)
    '0x3137643D0a4308df08A7B77e61C657592Cc1687f', // INDA Token
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', // Адрес кошелька на котором добавляем ликвидку
    1, // Кол-во INDA
    2 // decimals INDA
  );
  return res;
}

async function example6() {
    const res = await SWAP.addLiquidity( // Добавить ликвидность (Token / Token)
    {
      address: '0x3137643D0a4308df08A7B77e61C657592Cc1687f', // INDA Token
      amount: 1, // Кол-во инды
      decimals: 2 // decimals инды
    },
    '0x9b3726d10df962c1d35bfca09f7f86adc7022568', // BUSD Token
    '0xDA21A245BACef568DF3f9CCF445C43889B59E3C4', // Адрес кошелька на котором делаем swap
    18 // decimals BUSD
  )
  return res;
}