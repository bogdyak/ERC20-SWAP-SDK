# ERC20-SWAP-SDK
  ### swapExactETHForTokens()
 - (INT) PARAM1: Кол-во (Сколько BNB меняем).
 - (STRING) PARAM2: Адрес кошелька откуда меняем. 
 - (STRING) PARAM3: Адрес токена, на который меняем BNB.
  
  ### swapExactTokensForTokens()
 - (INT) PARAM1: Кол-во токена который отдаем. 
 - (STRING) PARAM2: Адрес кошелька откуда меняем. 
 - (STRING) PARAM2: Адрес токена который меняем.
 - (STRING) PARAM3: Адрес токена который хотим получить. 
 - (INT) PARAM4: decimals токена, который отдаем.

  ### getBalance()
 - (STRING) PARAM1: Адрес кошелька, чей баланс хотим получить. 
 - (STRING) PARAM2: Адрес токена, баланс которого мы хотим получить. 
 - (INT) PARAM3: decimals токена, чей баланс хотим получить.

  ### addLiquidityETH()
 - (STRING) PARAM1: Адрес токена, который хотим добавить в ликвидность.
 - (STRING) PARAM2: Адрес кошелька, с которого добавляем ликвидность.
 - (INT) PARAM3: Количество токена, которое добавляем в ликвидность.
 - (INT) PARAM4: decimals токена, который добавляем в ликвидность.
