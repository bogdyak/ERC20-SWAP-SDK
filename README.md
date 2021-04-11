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

  ### getLPBalance()
  - (STRING) PARAM1: Адрес первого токена пары.
  - (STRING) PARAM2: Адрес второго токена пары.
  - (STRING) PARAM3: Адрес кошелька.

  ### addLiqudity()
  - (OBJECT) PARAM1: { (string) address: адрес первого токена, (int) amount: кол-во первого токена, (int) decimals: decimals первого токена }.
  - (STRING) PARAM2: Адрес второго токена.
  - (STRING) PARAM3: Адрес кошелька.
  - (INT) PARAM4: decimals второго токена.

  ### addLiquidityETH()
 - (STRING) PARAM1: Адрес токена, который хотим добавить в ликвидность.
 - (STRING) PARAM2: Адрес кошелька, с которого добавляем ликвидность.
 - (INT) PARAM3: Количество токена, которое добавляем в ликвидность.
 - (INT) PARAM4: decimals токена, который добавляем в ликвидность.

  ### removeLiquidity()
  - (STRING) PARAM1: Адрес первого токена пары, который хотим забрать.
  - (STRING) PARAM2: Адрес второго токена пары, который хотим забрать.
  - (INT) PARAM3: Сколько ЛП токенов хотим забрать.
  - (STRING) PARAM4: Адрес кошелька, на котором проводим транзакцию.
  
  ### removeLiquidityETH()
  - (STRING) Адрес токена, который забираем (второй токен в паре с WBNB).
  - (INT) Кол-во ЛП токена, которое хотим забрать.
  - (STRING) Адрес кошелька, на котором проводим транзакцию.
  
  ### approveToken()
  - (STRING) PARAM1: Адрес токена, для которого делаем approve.
  - (STRING) PARAM2: Адрес кошелька, для которого делаем approve.

  ### getAllowance()
  - (STRING) PARAM1: Адрес токена, для которого хотим проверить allowance.
  - (STRING) PARAM2: Адрес кошелька, для которого хотим проверить allowance.

  ### getPair()
  - (STRING) PARAM1: Адрес первого токена в паре.
  - (STRING) PARAM2: Адрес второго токена в паре.

  ### getProvider()
  - Входящих параметров не принимает, возвращает текущий инстанс Web3. 
