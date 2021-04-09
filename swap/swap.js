/* eslint-disable no-async-promise-executor */
import * as Web3 from 'web3'

import { routerabi } from './ABI/router.js' // ABI PancakeRouter
import { tokenabi } from './ABI/token.js' // ABI Token
import { factoryabi } from './ABI/factory.js'
import { pairabi } from './ABI/pair.js'

const web3 = new Web3(window.web3.currentProvider)

const PANCAKE_FACTORY_ADDR = '0xb3bED7c8814DD91dF8e521B154c7c11A0d867822' // Pancake Factory Testnet
const PANCAKE_ROUTER_ADDR = '0x4fb3e9656055B520950eC0ED0b45651bc21Ff697' // Pancake Router Testnet

const WBNBToken = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' // WBNB Token Testnet

export class Swap {
  constructor () {
    this.address = PANCAKE_ROUTER_ADDR // Сохранили адрес роутера в константу

    this.indaswap = new web3.eth.Contract(routerabi, PANCAKE_ROUTER_ADDR) // создали новый инстанс роутера.
    this.factory = new web3.eth.Contract(factoryabi, PANCAKE_FACTORY_ADDR) // создали новый инстанс фактори.
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

  async addLiquidityETH (tokenA, buyer, amount, decimals) {
    // const pairAddr = await this.factory.methods.getPair(tokenA, tokenB).call()

    const rate = await this.getRate(tokenA, WBNBToken)
    console.log(rate)
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
