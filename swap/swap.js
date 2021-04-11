/* eslint-disable no-async-promise-executor */
import * as Web3 from 'web3'

import { routerabi } from './ABI/router.js' // ABI PancakeRouter
import { tokenabi } from './ABI/token.js' // ABI Token
import { factoryabi } from './ABI/factory.js'
import { pairabi } from './ABI/pair.js'

const web3 = new Web3(window.web3.currentProvider)
const web3Version = 97 // Для прода поменять на 56

let PANCAKE_FACTORY_ADDR
let PANCAKE_ROUTER_ADDR
let WBNBToken

switch (web3Version) {
  case 97: {
    PANCAKE_FACTORY_ADDR = '0xb3bED7c8814DD91dF8e521B154c7c11A0d867822' // Pancake Factory Testnet
    PANCAKE_ROUTER_ADDR = '0x4fb3e9656055B520950eC0ED0b45651bc21Ff697' // Pancake Router Testnet
    WBNBToken = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' // WBNB Token Testnet
    break
  }
  case 56: {
    PANCAKE_FACTORY_ADDR = '0xBCfCcbde45cE874adCB698cC183deBcF17952812' // Pancake Factory Mainnet
    PANCAKE_ROUTER_ADDR = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F' // Pancake Router Mainnet
    WBNBToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // WBNB Token Mainnet
    break
  }
  default: {
    PANCAKE_FACTORY_ADDR = 0
    PANCAKE_ROUTER_ADDR = 0
    WBNBToken = 0
    break
  }
}

export class Swap {
  constructor () {
    this.address = PANCAKE_ROUTER_ADDR // Сохранили адрес роутера в константу

    this.indaswap = new web3.eth.Contract(routerabi, PANCAKE_ROUTER_ADDR) // создали новый инстанс роутера.
    this.factory = new web3.eth.Contract(factoryabi, PANCAKE_FACTORY_ADDR) // создали новый инстанс фактори.
  }

  async getPair (token1, token2) {
    const pairAddr = await this.factory.methods.getPair(token1, token2).call()
    return pairAddr
  }

  async getRate (tokenA, tokenB) {
    const pairaddr = await this.getPair(tokenA, tokenB)
    const currentPairContract = new web3.eth.Contract(pairabi, pairaddr)
    const reserves = await currentPairContract.methods.getReserves().call()
    const token = reserves._reserve0 / Math.pow(10, 2)
    const eth = reserves._reserve1 / Math.pow(10, 18)

    this.rate = token / eth

    return this.rate
  }

  async getLPBalance (tokenA, tokenB, address) {
    const pairaddr = await this.getPair(tokenA, tokenB)
    console.log(pairaddr)
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

  async addLiquidityETH (tokenA, buyer, amount, decimals) {
    const rate = await this.getRate(tokenA, WBNBToken)
    return new Promise(async (resolve, reject) => {
      const bnb = ((((amount / (rate)) * 0.995)) * 1e18).toFixed()
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
    })
  }

  async addLiquidity (tokenA, tokenB, buyer, decimals) {
    const rate = await this.getRate(tokenA.address, tokenB)
    return new Promise(async (resolve, reject) => {
      const amountB = ((tokenA.amount / rate) * Math.pow(10, decimals))
      const amountA = tokenA.amount * Math.pow(10, tokenA.decimals)
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
