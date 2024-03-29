/* eslint-disable no-async-promise-executor */
import * as Web3 from 'web3'

import { routerabi } from './ABI/router.js' // ABI PancakeRouter
import { tokenabi } from './ABI/token.js' // ABI Token
import { factoryabi } from './ABI/factory.js' // ABI PancakeFactory
import { pairabi } from './ABI/pair.js' // ABI Pair
import { liquidityabi } from './ABI/liquidity.js' // ABI Liqidity

const request = require('request')

const web3 = new Web3(window.web3.currentProvider)
const web3Version = 97 // Для прода поменять на 56

let PANCAKE_FACTORY_ADDR
let PANCAKE_ROUTER_ADDR
let LIQUIDITY_ADRR
let WBNBToken
let urlPairs

switch (web3Version) {
  case 97: {
    PANCAKE_FACTORY_ADDR = '0xb3bED7c8814DD91dF8e521B154c7c11A0d867822' // Pancake Factory Testnet
    PANCAKE_ROUTER_ADDR = '0x4fb3e9656055B520950eC0ED0b45651bc21Ff697' // Pancake Router Testnet
    LIQUIDITY_ADRR = '0x26c8067959E6B3FF489dF9d781a7c79bBdb4dCd6' // Liquidity Testnet
    WBNBToken = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' // WBNB Token Testnet
    INDAToken = '0x3137643D0a4308df08A7B77e61C657592Cc1687f' // Inda Token Testnet
    urlPairs = 'https://indaswap.com/api/test/pairs'
    break
  }
  case 56: {
    PANCAKE_FACTORY_ADDR = '0x40cbAc284135423c41ACcfc073801d3e4123CBe7' // Pancake Factory Mainnet
    PANCAKE_ROUTER_ADDR = '0x2D6a6dFDd9933dBF1CC94dCEBb088281cF11bF93' // Pancake Router Mainnet
    LIQUIDITY_ADRR = '0x6eD12dfFdC25A529112d092eDC9731fC888Cd8E9' // Liquidity Token
    WBNBToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // WBNB Token Mainnet
    INDAToken = '0xC878A79B63A41a831E469AE1A830A765eFd9d468' // INDA Token Mainnet
    urlPairs = 'https://indaswap.com/api/pairs'
    break
  }
  default: {
    PANCAKE_FACTORY_ADDR = 0
    PANCAKE_ROUTER_ADDR = 0
    LIQUIDITY_ADRR = 0
    WBNBToken = 0
    urlPairs = 0
    break
  }
}

export class Swap {
  constructor () {
    this.address = PANCAKE_ROUTER_ADDR // Сохранили адрес роутера в константу
    this.liquidity = new web3.eth.Contract(liquidityabi, LIQUIDITY_ADRR) // создали новый инстанс ликвидити.
    this.indaswap = new web3.eth.Contract(routerabi, PANCAKE_ROUTER_ADDR) // создали новый инстанс роутера.
    this.factory = new web3.eth.Contract(factoryabi, PANCAKE_FACTORY_ADDR) // создали новый инстанс фактори.
  }

  async _getExistingPairsFromDB () {
    return new Promise((resolve, reject) => {
      request(urlPairs, (err, res, body) => {
        if (err) { return console.log(err) }
        resolve(JSON.parse(body))
      })
    })
  }

  _promiseAll (promises) {
    var count = promises.length // количество ожидаемых Promise
    var result = new Array(count) // результат
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(val => { // если Promise решен
          result[i] = val // сохраняем результа
          if (--count === 0) { // если больше нечего ждать
            resolve(result) // возвращаем результат
          }
        }, (err) => reject(err)) // если ошибка - прерываем основной Promise
      }
    })
  }

  async _getHistory (pairs) {
    console.log('')
    const history = pairs.map(async (pair) => {
      const blockNum = await web3.eth.getBlockNumber()
      const currentContract = await new web3.eth.Contract(pairabi, pair.liquidityToken.address)
      const swapHistory = await currentContract.getPastEvents('Swap', { fromBlock: blockNum - 4999, toBlock: blockNum })
      const mintHistory = await currentContract.getPastEvents('Mint', { fromBlock: blockNum - 4999, toBlock: blockNum })
      const burnHistory = await currentContract.getPastEvents('Burn', { fromBlock: blockNum - 4999, toBlock: blockNum })
      const array = { swap: swapHistory, addLiquidity: mintHistory, removeLiquidity: burnHistory }
      return {
        pairAddress: pair.liquidityToken.address,
        tokenA: { symbol: pair.tokenAmounts[0].symbol, address: pair.tokenAmounts[0].address },
        tokenB: { symbol: pair.tokenAmounts[1].symbol, address: pair.tokenAmounts[1].address },
        events: array
      }
    })
    const result = await this._promiseAll(history)
    return result
  }

  async getHistory () {
    const pairs = await this._getExistingPairsFromDB()
    const res = await this._getHistory(pairs)
    return res
  }

  async _getTimestamp (data) {
    const block = await web3.eth.getBlock(data.blockNumber)
    const timeStamp = block.timestamp
    return timeStamp
  }

  async getPair (token1, token2) {
    const pairAddr = await this.factory.methods.getPair(token1, token2).call()
    return pairAddr
  }

  async getRate (tokenA, tokenB, decimals) {
    const pairaddr = await this.getPair(tokenA.address, tokenB)
    const currentPairContract = new web3.eth.Contract(pairabi, pairaddr)
    const pairTokenFirst = await currentPairContract.methods.token0().call()
    const reserves = await currentPairContract.methods.getReserves().call()
    let rate
    if (pairTokenFirst === tokenA.address) {
      rate = (reserves._reserve1 / Math.pow(10, decimals)) / (reserves._reserve0 / Math.pow(10, tokenA.decimals))
    } else {
      rate = (reserves._reserve0 / Math.pow(10, decimals)) / (reserves._reserve1 / Math.pow(10, tokenA.decimals))
    }
    console.log(rate)
    return rate
  }

  async getLPBalance (tokenA, tokenB, address) {
    const pairaddr = await this.getPair(tokenA, tokenB)
    const currentPairContract = new web3.eth.Contract(pairabi, pairaddr)
    const balance = await currentPairContract.methods.balanceOf(web3.utils.toChecksumAddress(address)).call()
    return balance / 1e18
  }

  getProvider () {
    return window.web3
  }

  async getBalance (usrAddr, tokenAddr, decimals) {
    const currentContract = new web3.eth.Contract(tokenabi, tokenAddr)
    const balance = await currentContract.methods.balanceOf(usrAddr).call()
    const dc = Math.pow(10, decimals)
    return balance / dc
  }

  getBuyAmount (txAmount, from, to, decimals) {
    return new Promise(async (resolve, reject) => {
      const res = await this.indaswap.methods.getAmountsOut(
        (txAmount * Math.pow(10, decimals)).toString(),
        [
          from,
          to
        ]
      ).call()
      console.log('expected return: ', res)
      resolve(res)
    })
  }

  async getLiquidityValue (tokenA, tokenB, amount) {
    return new Promise((resolve, reject) => {
      const res = this.liquidity.methods.getLiquidityValue(
        web3.utils.toChecksumAddress(tokenA),
        web3.utils.toChecksumAddress(tokenB),
        (amount * 1e18).toFixed().toString()
      ).call()
      resolve(res)
    })
  }

  async approveToken (address, buyer) {
    const currentContract = new web3.eth.Contract(tokenabi, address)
    return new Promise(async (resolve, reject) => {
      const gas = await currentContract.methods.approve(PANCAKE_ROUTER_ADDR, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').estimateGas({
        from: buyer,
        gas: '0x' + Number(3000000).toString(16)
      })

      const res = await currentContract.methods.approve(PANCAKE_ROUTER_ADDR, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({
        from: buyer,
        gas: gas
      })
      resolve(res)
    })
  }

  async getAllowance (address, buyer) {
    const currentContract = new web3.eth.Contract(tokenabi, address)
    return new Promise(async (resolve, reject) => {
      const res = await currentContract.methods.allowance(buyer, PANCAKE_ROUTER_ADDR).call()
      resolve(res)
    })
  }

  async removeLiquidityETH (token, amount, buyer) {
    const liqValue = await this.getLiquidityValue(token, WBNBToken, amount)
    return new Promise(async (resolve, reject) => {
      const gas = await this.indaswap.methods.removeLiquidityETH(
        token,
        (amount * 1e18).toFixed().toString(),
        (liqValue.tokenAAmount * 0.99).toFixed().toString(),
        (liqValue.tokenBAmount * 0.99).toFixed().toString(),
        buyer,
        Math.floor(new Date().getTime() / 1000) + 1200
      ).estimateGas({
        from: buyer,
        gas: '0x' + Number(3000000).toString(16)
      })
      const res = await this.indaswap.methods.removeLiquidityETH(
        token,
        (amount * 1e18).toFixed().toString(),
        (liqValue.tokenAAmount * 0.99).toFixed().toString(),
        (liqValue.tokenBAmount * 0.99).toFixed().toString(),
        buyer,
        Math.floor(new Date().getTime() / 1000) + 1200
      ).send({
        from: buyer,
        gas: gas
      })
      resolve(res)
    })
  }

  async removeLiquidity (tokenA, tokenB, amount, buyer) {
    const liqValue = await this.getLiquidityValue(tokenA, tokenB, amount)
    return new Promise(async (resolve, reject) => {
      const gas = await this.indaswap.methods.removeLiquidity(
        tokenA,
        tokenB,
        (amount * 1e18).toFixed().toString(),
        (liqValue.tokenAAmount * 0.99).toFixed().toString(),
        (liqValue.tokenBAmount * 0.99).toFixed().toString(),
        buyer,
        Math.floor(new Date().getTime() / 1000) + 1200
      ).estimateGas({
        from: buyer,
        gas: '0x' + Number(3000000).toString(16)
      })
      const res = this.indaswap.methods.removeLiquidity(
        tokenA,
        tokenB,
        (amount * 1e18).toFixed().toString(),
        (liqValue.tokenAAmount * 0.99).toFixed().toString(),
        (liqValue.tokenBAmount * 0.99).toFixed().toString(),
        buyer,
        Math.floor(new Date().getTime() / 1000) + 1200
      ).send({
        from: buyer,
        gas: gas
      })
      resolve(res)
    })
  }

  async addLiquidityETH (tokenA, buyer, amount, decimals) {
    const tokenAdata = { address: tokenA, decimals: decimals }
    const rate = await this.getRate(tokenAdata, WBNBToken, 18)
    console.log(rate)
    return new Promise(async (resolve, reject) => {
      const bnb = ((((amount / (rate)) * 0.995)) * 1e18).toFixed()
      const tokenAmount = (amount * Math.pow(10, decimals)).toFixed().toString()
      if (tokenAmount === 0 || bnb === 0) {
        reject(new Error('INVALID AMOUNT'))
      } else {
        const gas = await this.indaswap.methods.addLiquidityETH(
          tokenA,
          (amount * Math.pow(10, decimals)).toFixed().toString(),
          (((amount * 0.99) * Math.pow(10, decimals)).toFixed()).toString(),
          bnb.toString(),
          buyer,
          Math.floor(new Date().getTime() / 1000) + 1200
        ).estimateGas({
          from: buyer,
          gas: '0x' + Number(3000000).toString(16),
          value: bnb
        })
        const res = this.indaswap.methods.addLiquidityETH(
          tokenA,
          (amount * Math.pow(10, decimals)).toFixed().toString(),
          (((amount * 0.99) * Math.pow(10, decimals)).toFixed()).toString(),
          bnb.toString(),
          buyer,
          Math.floor(new Date().getTime() / 1000) + 1200
        ).send({
          from: buyer,
          gas: gas,
          value: bnb
        })
        resolve(res)
      }
    })
  }

  async addLiquidity (tokenA, tokenB, buyer, decimals) {
    const rate = await this.getRate(tokenA, tokenB, decimals)
    return new Promise(async (resolve, reject) => {
      const amountB = ((tokenA.amount * rate) * Math.pow(10, decimals))
      const amountA = tokenA.amount * Math.pow(10, tokenA.decimals)
      const minAmountA = (amountA * 0.99).toFixed().toString()
      const minAmountB = (amountB * 0.99).toFixed().toString()
      if (minAmountA === 0 || minAmountB === 0) {
        reject(new Error('INVALID AMOUNTS'))
      } else {
        const gas = await this.indaswap.methods.addLiquidity(
          tokenA.address,
          tokenB,
          amountA.toFixed().toString(),
          amountB.toFixed().toString(),
          (amountA * 0.99).toFixed().toString(),
          (amountB * 0.99).toFixed().toString(),
          buyer,
          Math.floor(new Date().getTime() / 1000) + 1200
        ).estimateGas({
          from: buyer,
          gas: '0x' + Number(3000000).toString(16)
        })
        const res = this.indaswap.methods.addLiquidity(
          tokenA.address,
          tokenB,
          amountA.toFixed().toString(),
          amountB.toFixed().toString(),
          (amountA * 0.99).toFixed().toString(),
          (amountB * 0.99).toFixed().toString(),
          buyer,
          Math.floor(new Date().getTime() / 1000) + 1200
        ).send({
          from: buyer,
          gas: gas
        })
        resolve(res)
      }
    })
  }

  async swapExactTokensForTokens (sellAmount, buyer, from, to, decimals) {
    const expectedReturn = await this.getBuyAmount(sellAmount, from, to, decimals)
    const buyamount = (expectedReturn[1] * 0.995).toFixed()
    sellAmount = expectedReturn[0]
    if (buyamount === 0 || sellAmount === 0) {
      return 'Expected return is 0 or this pair is currently unavailable. Please try bigger amount.'
    } else {
      return new Promise(async (resolve, reject) => {
        const gas = await this.indaswap.methods.swapExactTokensForTokens(
          sellAmount,
          buyamount,
          [
            from, // какой токен отдаем
            to // какой токен хотим получить
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200).toString()
        ).estimateGas({
          from: buyer,
          gas: '0x' + Number(3000000).toString(16)
        })

        const res = this.indaswap.methods.swapExactTokensForTokens(
          sellAmount,
          buyamount,
          [
            from, // какой токен отдаем
            to // какой токен хотим получить
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200).toString()
        ).send({
          from: buyer,
          gas: gas
        })
        resolve(res)
      })
    }
  }

  async SwapExactTokensForTokensFromInda(sellAmount, buyer, from, to, decimals) {
    const expectedReturn = await this.getBuyAmount(sellAmount, from, to, decimals)
    const buyamount = (expectedReturn[1] * 0.995).toFixed()
    sellAmount = expectedReturn[0]
    if (buyamount === 0 || sellAmount === 0) {
      return 'Expected return is 0 or this pair is currently unavailable. Please try bigger amount.'
    } else {
      return new Promise(async (resolve, reject) => {
        const gas = await this.indaswap.methods.swapExactTokensForTokens(
          sellAmount,
          buyamount,
          [
            from, // какой токен отдаем
            INDAToken, // Промежуточная валюта
            to // какой токен хотим получить
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200).toString()
        ).estimateGas({
          from: buyer,
          gas: '0x' + Number(3000000).toString(16)
        })

        const res = this.indaswap.methods.swapExactTokensForTokens(
          sellAmount,
          buyamount,
          [
            from, // какой токен отдаем
            INDAToken, // Промежуточная валюта
            to // какой токен хотим получить
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200).toString()
        ).send({
          from: buyer,
          gas: gas
        })
        resolve(res)
      })
    }
  }

  async swapExactETHForTokens (sellAmount, buyer, to) {
    const expectedReturn = await this.getBuyAmount(sellAmount, WBNBToken, to, 18)
    const buyamount = expectedReturn[1] * 0.995
    if (buyamount === 0 || sellAmount === 0) {
      return 'Expected return is 0 or this pair is currently unavailable. Please try bigger amount.'
    } else {
      return new Promise(async (resolve, reject) => {
        const gas = await this.indaswap.methods.swapExactETHForTokens(
          ((buyamount / Math.pow(10, 18)).toFixed()).toString(),
          [
            WBNBToken,
            to
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200).toString()
        ).estimateGas({
          from: buyer,
          value: `0x${(sellAmount * Math.pow(10, 18)).toString(16)}`,
          gas: '0x' + Number(3000000).toString(16)
        })
        const res = this.indaswap.methods.swapExactETHForTokens(
          ((buyamount / Math.pow(10, 18)).toFixed()),
          [
            WBNBToken,
            to
          ],
          buyer,
          (Math.floor(new Date().getTime() / 1000) + 1200)
        ).send({
          from: web3.utils.toChecksumAddress(buyer),
          value: (sellAmount * Math.pow(10, 18)),
          gas: gas,
          to: PANCAKE_FACTORY_ADDR
        })
        resolve(res)
      })
    }
  }
}
