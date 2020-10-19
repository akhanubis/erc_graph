import KNOWN_ADDRESSES from './known_addresses'
import TokensMetadata from './TokensMetadata'

export const addressLabel = address => KNOWN_ADDRESSES[address] || (TokensMetadata.get(address) || {}).symbol || address.substr(0, 7)

export const addressName = address => KNOWN_ADDRESSES[address] || (TokensMetadata.get(address) || {}).symbol || address