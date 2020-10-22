import { ethers } from 'ethers'
import { KNOWN_ADDRESSES, KNOWN_ADDRESSES_COLORS, CUSTOM_LABELS } from './known_addresses'
import TokensMetadata from './TokensMetadata'

export const addressLabel = address => CUSTOM_LABELS[address] || KNOWN_ADDRESSES[address] || (TokensMetadata.get(address) || {}).symbol || address.substr(0, 7)

export const addressName = address => CUSTOM_LABELS[address] || KNOWN_ADDRESSES[address] || (TokensMetadata.get(address) || {}).symbol || address

export const addressColor = address => KNOWN_ADDRESSES_COLORS[address]

/* closure */
export const reverseENS = (_ => {
  if (!window.ethereum)
    return _ => {}
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  return address => provider.lookupAddress(address)
})()