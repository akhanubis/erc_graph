import React from 'react'
import TOKEN_IMAGES from './token_images'

const TokenIcon = ({ address }) => {
  return <img src={(TOKEN_IMAGES[address] || TOKEN_IMAGES.thinking).src}></img>
}

export default TokenIcon
