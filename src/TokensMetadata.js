import ERC20 from './ERC20'

const hextoAscii = hex => {
  let str = ''
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  return str
}

class TokensMetadata {
  static _metadata = {
    ETH: {
      address: '',
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18
    }
  }

  static add(address, metadata) {
    this._metadata[address] = metadata
  }

  static get(address) {
    return this._metadata[address]
  }

  static symbol(address) {
    return this._metadata[address].symbol
  }
  
  static decimals(address) {
    return this._metadata[address].decimals
  }

  static fromDecimals(value, address) {
    return value.times(Math.pow(10, -1 * this.decimals(address)))
  }

  static async fetch(address) {
    if (this._metadata[address])
      return this._metadata[address]

    const contract_string = new window.web3.eth.Contract(ERC20.string, address),
          contract_bytes32 = new window.web3.eth.Contract(ERC20.bytes32, address)

    const [name, symbol, decimals] = await Promise.all([
      contract_string.methods.name().call().catch(async _ => {
        const hex_string = await contract_bytes32.methods.name().call().catch(_ => '')
        return hextoAscii(hex_string)
      }),
      contract_string.methods.symbol().call().catch(async _ => {
        const hex_string = await contract_bytes32.methods.symbol().call().catch(_ => '')
        return hextoAscii(hex_string)
      }),
      contract_string.methods.decimals().call().catch(_ => {
        return contract_bytes32.methods.decimals().call().catch(_ => -1)
      })
    ])
    const metadata = {
      address,
      symbol,
      name,
      decimals: parseInt(decimals)
    }
    this._metadata[address] = metadata
    return metadata
  }
}

export default TokensMetadata