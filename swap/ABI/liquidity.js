export const liquidityabi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "factory_",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "factory",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "liquidityAmount",
          "type": "uint256"
        }
      ],
      "name": "getLiquidityValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tokenAAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "tokenBAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
]
