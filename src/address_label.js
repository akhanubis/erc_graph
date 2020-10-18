import KNOWN_ADDRESSES from './known_addresses'
import TokensMetadata from './TokensMetadata'

const addressLabel = address => {
  return KNOWN_ADDRESSES[address] || (TokensMetadata.get(address) || {}).symbol || address.substr(0, 7)
}

export default addressLabel