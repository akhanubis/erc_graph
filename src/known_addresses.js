/*
Etherscan scrap
Array.from(document.querySelectorAll('#table-subcatid-0 tbody, #table-subcatid-1 tbody, #table-subcatid-2 tbody, #table-subcatid-3 tbody')).map(a => {
  return Array.from(a.querySelectorAll('tr')).map(row => `'${ row.querySelector('td a').innerHTML }': '${ row.querySelector('td:nth-child(3)').innerText.trim() }',`).join("\n")
}).join("\n")
*/

import { retryablePromise } from './utils' 
import BigNumber from 'bignumber.js'

export const BY_PROTOCOL = {
  zero: {
    '0x0000000000000000000000000000000000000000': 'Mint/Burn address',
    '0x000000000000000000000000000000000000dead': 'Dead address',
  },
  one_inch: {
    '0x11111254369792b2ca5d084ab5eea397ca8fa48b': '1inch.exchange',
    '0x0000000000004946c0e9f43f4dee607b0ef1fa1c': '1inch.exchange: CHI Token',
  },
  binance: {
    '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be': 'Binance',
    '0xd551234ae421e3bcba99a0da6d736074f22192ff': 'Binance 2',
    '0x564286362092d8e7936f0549571a803b203aaced': 'Binance 3',
    '0x0681d8db095565fe8a346fa0277bffde9c0edbbf': 'Binance 4',
    '0xfe9e8709d3215310075d67e3ed32a380ccf451c8': 'Binance 5',
    '0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67': 'Binance 6',
    '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8': 'Binance 7',
    '0xf977814e90da44bfa03b6295a0616a897441acec': 'Binance 8',
    '0x001866ae5b3de6caa5a51543fd9fb64f524f5478': 'Binance 9',
    '0x8b99f3660622e21f2910ecca7fbe51d654a1517d': 'Binance Charity',
    '0xab83d182f3485cf1d6ccdd34c7cfef95b4c08da4': 'Binance JEX',
  },
  sushiswap: {
    '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd': 'SushiSwap: MasterChef',
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'SushiSwap: Router',
    '0x6684977bbed67e101bb80fc07fccfba655c0a64f': 'SushiSwap: SushiMaker',
    '0x8798249c2e607446efb7ad49ec89dd1865ff4272': 'SushiSwap: SushiBar',
  },
  uniswap: {
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2: Router',
    '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f': 'Uniswap V2: Factory',
  },
  curve: {
    '0x69fb7c45726cfe2badee8317005d3f94be838840': 'Curve.fi: bCrv Gauge',
    '0x3b3ac5386837dc563660fb6a0937dfaa5924333b': 'Curve.fi: bCrv Token',
    '0xb6c057591e073249f2d9d88ba59a46cfc9b59edb': 'Curve.fi: BUSD Deposit',
    '0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27': 'Curve.fi: BUSD Swap',
    '0xc1db00a8e5ef7bfa476395cdbcc98235477cde4e': 'Curve.fi: Calc',
    '0x7ca5b0a2910b33e9759dc7ddb0413949071d7575': 'Curve.fi: cCrv Gauge',
    '0x845838df265dcd2c412a1dc9e959c7d08537f8a2': 'Curve.fi: cCrv Token',
    '0xeb21209ae4c2c9ff2a86aca31e123764a3b6bc06': 'Curve.fi: Compound Deposit',
    '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56': 'Curve.fi: Compound Swap',
    '0xd533a949740bb3306d119cc777fa900ba034cd52': 'Curve.fi: CRV Token',
    '0x2f50d538606fa9edd2b11e2446beb18c9d5846bb': 'Curve.fi: Gauge Controller',
    '0xa50ccc70b6a011cffddf45057e39679379187287': 'Curve.fi: PAX Deposit',
    '0x06364f10b501e868329afbc005b3492902d6c763': 'Curve.fi: PAX Swap',
    '0x64e3c23bfc40722d3b649844055f1d51c1ac041d': 'Curve.fi: pCrv Gauge',
    '0xd905e2eaebe188fc92179b6350807d8bd91db0d8': 'Curve.fi: pCrv Token',
    '0x7002b727ef8f5571cb5f9d70d13dbeeb4dfae9d1': 'Curve.fi: Registry',
    '0x9fe350dfa5f66bc086243f21a8f0932514316627': 'Curve.fi: Ren Adapter',
    '0x26d9980571e77ffb0349f9c801dd7ca9951fb656': 'Curve.fi: Ren Adapter 2',
    '0x73ab2bd10ad10f7174a1ad5afae3ce3d991c5047': 'Curve.fi: Ren Adapter 3',
    '0x93054188d876f558f4a66b2ef1d97d16edf0895b': 'Curve.fi: REN Swap',
    '0xb1f2cdec61db658f091671f5f199635aef202cac': 'Curve.fi: renCrv Gauge',
    '0x49849c98ae39fff122806c06791fa73784fb3675': 'Curve.fi: renCrv Token',
    '0x104c1e66c67c385e6095ffcc6227d75c761dc019': 'Curve.fi: sBTC Adapter',
    '0x02b3f51ac9202aa19be63d61a8c681579d6e3a51': 'Curve.fi: sBTC Adapter 2',
    '0xaeade605d01fe9a8e9c4b3aa0130a90d62167029': 'Curve.fi: sBTC Adapter 3',
  },
  uma: {
    '0x28a5da04a94f0501a6f77df8f8a9529d27b92744': 'UMA: Migrations',
    '0x40f941e48a552bf496b154af6bf55725f18d77c3': 'UMA: Finder',
    '0x04fa0d235c4abf4bcf4787af4cf447de572ef828': 'UMA: VotingToken',
    '0xcf649d9da4d1362c4daea67573430bd6f945e570': 'UMA: IdentifierWhitelist',
    '0x1d847fb6e04437151736a53f09b6e49713a52aad': 'UMA: Voting',
    '0x3e532e6222afe9bcf02dcb87216802c75d5113ae': 'UMA: Registry',
    '0x4e6ccb1da3c7844887f9a5af4e8450d9fd90317a': 'UMA: FinancialContractsAdmin',
    '0x54f44ea3d2e7aa0ac089c4d8f7c93c27844057bf': 'UMA: Store',
    '0x592349f7dedb2b75f9d4f194d4b7c16d82e507dc': 'UMA: Governor',
    '0xe81eee5da165fa6863bbc82df66e62d18625d592': 'UMA: DesignatedVotingFactory',
    '0x7c96d6235cfaaccac5d80fce74e6032b25dd1f03': 'UMA: TokenFactory',
    '0xdbf90434df0b98219f87d112f37d74b1d90758c7': 'UMA: AddressWhitelist',
    '0x38015ddb8b34c84934cff058f571349cc7d4139d': 'UMA: ExpiringMultiPartyLib',
    '0x9a077d4fcf7b26a0514baa4cff0b481e9c35ce87': 'UMA: ExpiringMultiPartyCreator',
  },
  compound: {
    '0x35a18000230da775cac24873d00ff85bccded550': 'Compound: cUNI Token',
    '0x3fda67f7583380e67ef93072294a7fac882fd7e7': 'Compound',
    '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e': 'Compound Basic Attention Token',
    '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': 'Compound Dai',
    '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': 'Compound Ether',
    '0xf5dce57282a584d2746faf1593d3121fcac444dc': 'Compound Sai',
    '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9': 'Compound Tether',
    '0x39aa39c021dfbae8fac545936693ac917d5e7563': 'Compound USD Coin',
    '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4': 'Compound Wrapped BTC',
    '0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4': 'Compound: cCOMP Token',
    '0xc00e94cb662c3520282e6f5717214004a7f26888': 'Compound: COMP Token',
    '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': 'Compound: Comptroller',
    '0xf859a1ad94bcf445a406b892ef0d3082f4174088': 'Compound: Contract 1',
    '0x158079ee67fce2f58472a96584a73c7ab9ac95c1': 'Compound: cREP Token',
    '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407': 'Compound: cZRX Token',
    '0xa7ff0d561cd15ed525e31bbe0af3fe34ac2059f6': 'Compound: Deployer 1',
    '0x1449e0687810bddd356ae6dd87789244a46d9adb': 'Compound: Deployer 2',
    '0xcec237e83a080f3225ab1562605ee6dedf5644cc': 'Compound: Deployer 3',
    '0xfe83af639f769ead20bad76067abc120245a06a9': 'Compound: Deployer 4',
    '0xc0da01a04c3f3e0be433606045bb7017a7323e38': 'Compound: Governor Alpha',
    '0x1055be4bf7338c7606d9efdcf80593f180ba043e': 'Compound: Liquidator',
    '0x02557a5e05defeffd4cae6d83ea3d173b272c904': 'Compound: Oracle',
    '0x9e77ad51e5c0825d6e440f49e49ef1a1bca37b5d': 'Compound: Oracle 2',
    '0xe7664229833ae4abf4e269b8f23a86b657e2338d': 'Compound: Oracle v2',
    '0xddc46a3b076aec7ab3fc37420a8edd2959764ec4': 'Compound: Price Oracle Proxy',
    '0xd25c029a607ee888bdbdbe054515e25ec6f3fff9': 'Compound: Rate Model',
  },
  balancer: {
    '0x6317c5e82a06e1d8bf200d21f4510ac2c038ac81': 'Balancer: Exchange Proxy',
    '0x3e66b66fd1d0b02fda6c811da9e0547970db2f21': 'Balancer: Exchange Proxy 2',
  },
  aave: {
    '0x317625234562b1526ea2fac4030ea499c5291de4': 'Aave: LEND To AAVE Migrator',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'Aave: AAVE Token',
    '0xe1ba0fb44ccb0d11b80f92f4f8ed94ca3ff51d00': 'Aave: aBAT Token',
    '0x6ee0f7bb50a54ab5253da0667b0dc2ee526c30a8': 'Aave: aBUSD Token',
    '0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d': 'Aave: aDAI Token',
    '0x3a3a65aab0dd2a17e3f1947ba16138cd37d08c04': 'Aave: aETH Token',
    '0x9d91be44c06d373a8a226e1f3b146956083803eb': 'Aave: aKNC Token',
    '0x7d2d3688df45ce7c552e19c27e007673da9204b8': 'Aave: aLEND Token',
    '0xa64bd6c70cb9051f6a9ba1f163fdc07e0dfb5f84': 'Aave: aLINK Token',
    '0x6fce4a401b6b80ace52baaefe4421bd188e76f6f': 'Aave: aMANA Token',
    '0x7deb5e830be29f91e298ba5ff1356bb7f8146998': 'Aave: aMKR Token',
    '0x71010a9d003445ac60c4e6a7017c1e89a477b438': 'Aave: aREP Token',
    '0x328c4c80bc7aca0834db37e6600a6c49e12da4de': 'Aave: aSNX Token',
    '0x625ae63000f46200499120b906716420bd059240': 'Aave: aSUSD Token',
    '0x4da9b813057d04baef4e5800e36083717b4a0341': 'Aave: aTUSD Token',
    '0x9ba00d6856a4edf4665bca2c2309936572473b7e': 'Aave: aUSDC Token',
    '0x71fc860f7d3a592a4a98740e39db31d25db65ae8': 'Aave: aUSDT Token',
    '0xfc4b8ed459e00e5400be803a9bb3954234fd50e3': 'Aave: aWBTC Token',
    '0x6fb0855c404e09c47c3fbca25f08d4e41f9f062f': 'Aave: aZRX Token',
    '0x80fb784b7ed66730e8b1dbd9820afd29931aab03': 'Aave: LEND Token',
    '0x398ec7346dcd622edc5ae82352f02be94c62d119': 'Aave: Lending Pool',
    '0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3': 'Aave: Lending Pool Core',
    '0x24a42fd28c976a61df5d00d0599c34c4f90748c8': 'Aave: Lending Pool Provider',
    '0x4965f6fa20fe9728decf5165016fc338a5a85abf': 'Aave: Proxy',
  },
  maker: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'Dai Stablecoin',
    '0x39755357759ce0d7f32dc8dc45414cca409ae24e': 'Eth2Dai: Old Contract',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'Maker Token',
    '0x5ef30b9986345249bc32d8928b7ee64de9435e39': 'Maker: CDP Manager',
    '0x448a5065aebb8e423f0896e6c5d525c040f59af3': 'Maker: Contract 1',
    '0xbda109309f9fafa6dd6a9cb9f1df4085b27ee8ef': 'Maker: Contract 2',
    '0x9b0f70df76165442ca6092939132bbaea77f2d7a': 'Maker: Contract 3',
    '0x9b0ccf7c8994e19f39b2b4cf708e0a7df65fa8a3': 'Maker: Contract 4',
    '0xf2c5369cffb8ea6284452b0326e326dbfdcb867c': 'Maker: Contract 5',
    '0x315cbb88168396d12e1a255f9cb935408fe80710': 'Maker: Contract 6',
    '0x79f6d0f646706e1261acf0b93dcb864f357d4680': 'Maker: Contract 7',
    '0x8e2a84d6ade1e7fffee039a35ef5f19f13057152': 'Maker: Contract 8',
    '0x69076e44a9c70a67d5b79d95795aba299083c275': 'Maker: Contract 9',
    '0x4f26ffbe5f04ed43630fdc30a87638d53d0b0876': 'Maker: Deployer 1',
    '0xdb33dfd3d61308c33c63209845dad3e6bfb2c674': 'Maker: Deployer 2',
    '0x00daa9a2d88bed5a29a6ca93e0b7d860cd1d403f': 'Maker: Deployer 3',
    '0xddb108893104de4e1c6d0e47c42237db4e617acc': 'Maker: Deployer 4',
    '0xda0fab05039809e63c5d068c897c3e602fa97457': 'Maker: Deployer 5',
    '0xa26e15c895efc0616177b7c1e7270a4c7d51c997': 'Maker: DS Proxy Factory',
    '0x36a724bd100c39f0ea4d3a20f7097ee01a8ff573': 'Maker: Get CDPS',
    '0x9ef05f7f6deb616fd37ac3c959a2ddd25a54e4f5': 'Maker: Governance Contract',
    '0x78f2c2af65126834c51822f56be0d7469d7a523e': 'Maker: MCD Cat',
    '0xbaa65281c2fa2baacb2cb550ba051525a480d3f4': 'Maker: MCD Deploy',
    '0xab14d3ce3f733cacb76ec2abe7d2fcb00c99f3d5': 'Maker: MCD End',
    '0x0581a0abe32aae9b5f0f68defab77c6759100085': 'Maker: MCD ESM',
    '0xdfe0fb1be2a52cdbf8fb962d5701d7fd0902db9f': 'Maker: MCD Flap',
    '0xaa745404d55f88c108a28c86abe7b5a1e7817c07': 'Maker: MCD Flip BAT A',
    '0xd8a04f5412223f513dc55f839574430f5ec15531': 'Maker: MCD Flip ETH A',
    '0x5432b2f3c0dff95aa191c45e5cbd539e2820ae72': 'Maker: MCD Flip SAI',
    '0xbe00fe8dfd9c079f1e5f5ad7ae9a3ad2c571fcac': 'Maker: MCD Flop',
    '0x4f5f0933158569c026d617337614d00ee6589b6e': 'Maker: MCD Gov Actions',
    '0x3d0b1912b66114d4096f48a8cee3a56c231772ca': 'Maker: MCD Join BAT A',
    '0x9759a6ac90977b93b58547b4a71c78317f391a28': 'Maker: MCD Join DAI',
    '0x2f0b23f53734252bda2277357e97e1517d6b042a': 'Maker: MCD Join ETH A',
    '0xad37fd42185ba63009177058208dd1be4b136e6b': 'Maker: MCD Join SAI',
    '0x19c0976f590d67707e62397c87829d896dc0f1f1': 'Maker: MCD Jug',
    '0xbe286431454714f511008713973d3b053a2d38f3': 'Maker: MCD Pause',
    '0xbe8e3e3618f7474f8cb1d074a26affef007e98fb': 'Maker: MCD Pause Proxy',
    '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7': 'Maker: MCD Pot',
    '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3': 'Maker: MCD Spot',
    '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b': 'Maker: MCD Vat',
    '0xa950524441892a31ebddf91d3ceefa04bf454466': 'Maker: MCD Vow',
    '0x99041f808d598b782d5a3e498681c2452a31da08': 'Maker: Medianizer 1',
    '0x729d19f657bd0614b4985cf1d82531c67569197b': 'Maker: Medianizer 2',
    '0xc73e0383f3aff3215e6f04b0331d58cecf0ab849': 'Maker: Migration',
    '0xe4b22d484958e582098a98229a24e8a43801b674': 'Maker: Migration Proxy Actions',
    '0x5e227ad1969ea493b43f840cff78d08a6fc17796': 'Maker: Multicall',
    '0x8ee7d9235e01e6b42345120b5d270bdb763624c7': 'Maker: MultiSig',
    '0x793ebbe21607e4f04788f89c7a9b97320773ec59': 'Maker: Oasis Proxy',
    '0xc66ea802717bfb9833400264dd12c2bceaa34a6d': 'Maker: Old Token',
    '0xb4eb54af9cc7882df0121d26c5b97e802915abe6': 'Maker: PIP BAT',
    '0x81fe72b5a8d1a857d176c3e7d5bd2679a9b85763': 'Maker: PIP ETH',
    '0x54003dbf6ae6cba6ddae571ccdc34d834b44ab1e': 'Maker: PIP SAI',
    '0x82ecd135dce65fbc6dbdd0e4237e0af93ffd5038': 'Maker: Proxy Actions',
    '0x07ee93aeea0a36fff2a9b95dd22bd6049ee54f26': 'Maker: Proxy Actions DSR',
    '0x069b2fb501b6f16d1f5fe245b16f6993808f1008': 'Maker: Proxy Actions End',
    '0x1b93556ab8dccef01cd7823c617a6d340f53fb58': 'Maker: Proxy Deployer',
    '0x6bda13d43b7edd6cafe1f70fb98b5d40f61a1370': 'Maker: Proxy Pause Actions',
    '0x4678f0a6958e4d2bc4f1baf7bc52e8f3564f3fe4': 'Maker: Proxy Registry',
    '0x190c2cfc69e68a8e8d5e2b9e2b9cc3332caff77b': 'Maker: Sai Proxy 1',
    '0x526af336d614ade5cc252a407062b8861af998f5': 'Maker: Sai Proxy 2',
    '0xbf72da2bd84c5170618fbe5914b0eca9638d5eb5': 'Maker: WBTC',
    '0x794e6e91555438afc3ccf1c5076a74f42133d08d': 'OasisDEX',
    '0x14fbca95be7e99c15cc2996c6c9d841e54b79425': 'OasisDex: Old Contract 1',
    '0xb7ac09c2c0217b07d7c103029b4918a2c401eecb': 'OasisDex: Old Contract 2',
    '0xf53ad2c6851052a81b42133467480961b2321c09': 'Pooled Ether',
    '0x59adcf176ed2f6788a41b8ea4c4904518e62b6a4': 'ProtoSAI Token',
    '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': 'Sai Stablecoin',
  },
  dodo: {
    '0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd': 'DODO: DODO Token',
    '0x8876819535b48b551c9e97ebc07332c7482b4b2d': 'DODO: DODO Pair: DODO-USDT',
    '0xaed7384f03844af886b830862ff0a7afce0a632c': 'DODO: DODO Mining',
    '0x0e504d3e053885a82bd1cb5c29cbaae5b3673be4': 'DODO: Pre-allocation',
    '0x4447183c50e82a8b0141718c405381a3b1bad634': 'DODO: Incentive Program Reserve',
    '0x5c37d4f0e8d03820bec925e105a53fd94f6cf4ab': 'DODO: Locked Token Vault 1',
    '0xdb9119789116dc4fb6f42a4e0d76856142cfff5f': 'DODO: Locked Token Vault 2',
    '0x3e19d726ed435afd3a42967551426b3a47c0f5b7': 'DODO: Undistributed Token Vault',
    '0x75c23271661d9d143dcb617222bc4bec783eff34': 'DODO: DODO Pair: WETH-USDC',
    '0x562c0b218cc9ba06d9eb42f3aef54c54cc5a4650': 'DODO: DODO Pair: LINK-USDC',
    '0xc226118fcd120634400ce228d61e1538fb21755f': 'DODO: DODO Pair: LEND-USDC',
    '0xca7b0632bd0e646b0f823927d3d2e61b00fe4d80': 'DODO: DODO Pair: SNX-USDC',
    '0x0d04146b2fe5d267629a7eb341fb4388dcdbd22f': 'DODO: DODO Pair: COMP-USDC',
    '0x2109f78b46a789125598f5ad2b7f243751c2934d': 'DODO: DODO Pair: WBTC-USDC',
    '0x1b7902a66f133d899130bf44d7d879da89913b2e': 'DODO: DODO Pair: YFI-USDC',
    '0x9d9793e1e18cdee6cf63818315d55244f73ec006': 'DODO: DODO Pair: FIN-USDT',
    '0x3a97247df274a17c59a3bd12735ea3fcdfb49950': 'DODO: DODO Zoo',
    '0x37adc35f7b12582240818df04aac04ca409d5913': 'DODO: DODO EthProxy',
    '0x3d7cbd8ae59505283d438eb6ff54b8b42d0c98a6': 'DODO: DODO EthProxy (compatible)',
    '0xbf90b54cc00ceeaa93db1f6a54a01e3fe9ed4422': 'DODO: Uniswap arbitrageur',
    '0x6dae6ae227438378c117821c51fd61661faa8893': 'DODO: Multisig Wallet with Time Lock',
    '0x95c4f5b83aa70810d4f142d58e5f7242bd891cb0': 'DODO: Gnosis Multisig Wallet',
    '0xc11eccdee225d644f873776a68a02ecd8c015697': 'DODO: WETH-USDC : WETH',
    '0x6a5eb3555cbbd29016ba6f6ffbccee28d57b2932': 'DODO: WETH-USDC : USDC',
    '0xf03f3d2fbee37f92ec91ae927a8019cacef4b738': 'DODO: LINK-USDC : LINK',
    '0x0f769bc3ecbda8e0d78280c88e31609e899a1f78': 'DODO: LINK-USDC : USDC',
    '0xbf999544b31706c5fef693b64a6c2cd8ddb5bbec': 'DODO: LEND-USDC : LEND',
    '0xd768b486645717a55ed97126bbe2eb8b02f0e9b3': 'DODO: LEND-USDC : USDC',
    '0x5bd1b7d3930d7a5e8fd5aeec6b931c822c8be14e': 'DODO: SNX-USDC: SNX',
    '0x1b06a22b20362b4115388ab8ca3ed0972230d78a': 'DODO: SNX-USDC: USDC',
    '0x53cf4694b427fcef9bb1f4438b68df51a10228d0': 'DODO: COMP-USDC: COMP',
    '0x51baf2656778ad6d67b19a419f91d38c3d0b87b6': 'DODO: COMP-USDC: USDC',
    '0x2ec2a42901c761b295a9e6b95200cd0bdaa474eb': 'DODO: WBTC-USDC: WBTC',
    '0x0cdb21e20597d753c90458f5ef2083f6695eb794': 'DODO: WBTC-USDC: USDC',
    '0xe2852c572fc42c9e2ec03197defa42c647e89291': 'DODO: YFI-USDC: YFI',
    '0xd9d0bd18ddfa753d0c88a060ffb60657bb0d7a07': 'DODO: YFI-USDC: USDC',
  }
}

export const KNOWN_ADDRESSES = {
  '0x176b98ab38d1ae8ff3f30bf07f9b93e26f559c17': 'ACO: Factory Contract',
  '0x5bca0f6cd5f9a74895d66005acef969342f301a0': 'CollateralSwap: Alpha',
  '0xfd14431285a570adc839c73cc973542e0ffee56f': 'CollateralSwap: Core Alpha v0.2',
  '0x3fda67f7583380e67ef93072294a7fac882fd7e7': 'Compound',
  '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56': 'Curve.fi: Compound Swap',
  '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714': 'Curve.fi: sBTC Swap',
  '0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c': 'Curve.fi: USDT Swap',
  '0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51': 'Curve.fi: y Swap',
  '0x0528a32fda5bedf89ba9ad67296db83c9452f28c': 'DeFi Saver: Owner',
  '0x745daa146934b27e3f0b6bff1a6e36b9b90fb131': 'DEX.AG: Proxy Contract',
  '0xdd7680b6b2eec193ce3ece7129708ee12531bccf': 'DMM: Foundation Safe',
  '0x1e0447b19bb6ecfdae1e4ae1694b0c3659614e4e': 'dYdX: Solo Margin',
  '0x710b80571db3792fbf4df7763efa6548c25a1635': 'Furucombo: Proxy v0.2',
  '0x3a306a399085f3460bbcb5b77015ab33806a10d5': 'InstaDApp: Maker',
  '0x68eb4de507c6802d73904a18fb228c7dc2981200': 'Keep: Stakedrop Escrow',
  '0x448a5065aebb8e423f0896e6c5d525c040f59af3': 'Maker: Contract 1',
  '0xf617346a0fb6320e9e578e0c9b2a4588283d9d39': 'mStable: mUSD Aave Vault',
  '0xd55684f4369040c12262949ff78299f2bc9db735': 'mStable: mUSD Compound Vault',
  '0xcf3f73290803fc04425bee135a4caeb2bab2c2a1': 'mStable: mUSD Savings Contract',
  '0x7046b0bfc4c5eeb90559c0805dd9c1a6f4815370': 'mStable: Savings Manager 1.1',
  '0x8683dcf44d44f78310bc9c1c1e9a0d75f8291d7e': 'ODE Money: Retirement Fund',
  '0x0d4c1222f5e839a911e2053860e45f18921d72ac': 'OMG Network V1: Plasma Framework',
  '0x86969d29f5fd327e1009ba66072be22db6017cc6': 'ParaSwap 2',
  '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f': 'Uniswap V2: Factory Contract',
  '0xc0a47dfe034b400b47bdad5fecda2621de6c4d95': 'Uniswap: Factory Contract',
  '0x975f1bc238303593efab00d63cf0fc5f519a8de0': 'yearn: yCurve Zap In',
  '0xed03415e5705c5abbf8e94c491b715df526cad55': 'yearn: yCurve Zap Out',
  '0x2c3a2558e9b91e893e53bce94de3457a29f6b262': 'yearn: yCurve Zap Swap',
  '0x033e52f513f9b98e129381c6708f9faa2dee5db5': 'Ygov.finance: Balancer',
  '0x3a22df48d84957f907e67f4313e3d43179040d6e': 'Ygov.finance: Governance',
  '0x0001fb050fe7312791bf6475b96569d83f695c9f': 'Ygov.finance: yearn',
  '0x52fc6455f258760705e70f70160b06619bfe0adb': 'Zapper.Fi: cDAI Unipool',
  '0xd17cda470bd0237fae82ef254c84d06d0e4cc02f': 'Zapper.Fi: CHAI Unipool',
  '0x8dfcb49766c0296e4373a0300b52c3637614db59': 'Zapper.Fi: DAI LLP 100% ETH',
  '0x929a10efda7099865dad8286aee8715078902d51': 'Zapper.Fi: DAI Unipool',
  '0x1ee8c303f5ab9b36bc30b9345dec7e9a748fa693': 'Zapper.Fi: Double Bull',
  '0xf0cd9981f15695324763a06869d1c1dd90073c2a': 'Zapper.Fi: ERC20 Inputs',
  '0x04b35ef193e2357328ae79914569721a7ffd6146': 'Zapper.Fi: ETH Bull',
  '0xebd5e23927891fbfda10487ccc9a1a1a7b9a4210': 'Zapper.Fi: Lender',
  '0x20ef0c900f8e7ec3a1a89a761f0670ae9e3dd709': 'Zapper.Fi: LINK LLP 100% ETH',
  '0x408609f5acab253d41cb5dfce913ff367937313b': 'Zapper.Fi: LINK LLP 100% LINK',
  '0x13240b97c40d7e306cedf3adc9cb057cec74c361': 'Zapper.Fi: MKR Unipool',
  '0x3b122c376e472ae6ae7a4739bebf7b68e045b285': 'Zapper.Fi: Moderate Bull',
  '0x2346722daa00ebbd0fc452c0e7ab7976bdafeae8': 'Zapper.Fi: Old Zapper Swap',
  '0xd3eba712988df0f8a7e5073719a40ce4cbf60b33': 'Zapper.Fi: sETH Unipool',
  '0xe3385df5b47687405a02fc24322dedb7df381852': 'Zapper.Fi: SNX Unipool',
  '0xecb53d65816444dbbf6a326b8df959caeda3faf9': 'Zapper.Fi: Super Saver',
  '0x606563f8dc27f316b77f22d14d9cd025b4f70469': 'Zapper.Fi: UniPool General',
  '0x4316e3ad83ca2cf0ea5e3b25e3de2fa7f93cfe9c': 'Zapper.Fi: Unipool UnZap',
  '0x21091c5ea13854ab0965090dc4fc20280f1a5730': 'Zapper.Fi: wBTC LLP 100% ETH',
  '0xe4b7b00a802834bea733f06a0a24a869f2765df7': 'Zapper.Fi: wBTC LLP 100% wBTC',
  '0x4ebee4cf5ba7de81f222fefa4e5d0c30c4968fff': 'Zapper.Fi: wBTC Unipool',
  '0xacdf47c844eff0ecb218d8945e28a9a484af8d07': 'Zapper.Fi: Zapper Swap V1',
  '0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672': 'Zerion: DeFi SDK AdapterRegistry v0.1',
  '0xadfc6460233221eca99dac25d00f98d32ea3989e': 'Zerion: DeFi SDK AdapterRegistry v1.0',
  '0xd291328a6c202c5b18dcb24f279f69de1e065f70': 'Zerion: DeFi SDK Core v1.0',
  '0xb2be281e8b11b47fec825973fc8bb95332022a54': 'Zerion: DeFi SDK v1.0',
  '0x11111254369792b2ca5d084ab5eea397ca8fa48b': '1inch.exchange',
  '0xe8fff15bb5e14095bfdfa8bb85d83cc900c23c56': 'AfroDex',
  '0x4572f2554421bd64bef1c22c8a81840e8d496bea': 'AirSwap',
  '0xdc1882f350b42ac9a23508996254b1915c78b204': 'Allbit 1',
  '0xff6b1cdfd2d3e37977d7938aa06b6d89d6675e27': 'Allbit 2',
  '0x0e8ba001a821f3ce0734763d008c9d7c957f5852': 'AmadeusRelay',
  '0xc898fbee1cc94c0ff077faa5449915a506eff384': 'Bamboo Relay',
  '0x3c020e014069df790d4f4e63fd297ba4e1c8e51f': 'Bitcratic',
  '0x39fbd1140cd1fc298f00c3ea64b3591de94c67e7': 'BitEye 1',
  '0xb5adb233f28c86cef693451b67e1f2d41da97d21': 'Bitox.io',
  '0xa4dc97a565e2364cdeb4efe38c0f153bccb62b01': 'BTswap: Router',
  '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56': 'Curve.fi: Compound Swap',
  '0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c': 'Curve.fi: USDT Swap',
  '0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51': 'Curve.fi: y Swap',
  '0x49497a4d914ae91d34ce80030fe620687bf333fd': 'DDEX 1.0',
  '0xaf8ae6955d07776ab690e565ba6fbc79b8de3a5d': 'DeversiFi',
  '0x5d22045daceab03b158031ecb7d9d06fad24609b': 'DeversiFi 2',
  '0x745daa146934b27e3f0b6bff1a6e36b9b90fb131': 'DEX.AG: Proxy Contract',
  '0x000000000000541e251335090ac5b47176af4f7e': 'dex.blue',
  '0x7600977eb9effa627d6bd0da2e5be35e11566341': 'DEx.top',
  '0x268be5667d4e5bd036bd608d0601ef1441604429': 'DINNGO: Proxy',
  '0x58a5959a6c528c5d5e03f7b9e5102350e24005f1': 'ERC dEX',
  '0x4aea7cf559f67cedcad07e12ae6bc00f07e8cf65': 'EtherDelta 1',
  '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819': 'EtherDelta 2',
  '0xa5cc679a3528956e8032df4f03756c077c1ee3f4': 'EtherMium',
  '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208': 'IDEX',
  '0xa7a7899d944fe658c4b0a1803bab2f490bd3849e': 'IDEX 2',
  '0x2cc42d1cd65af27cc999e41ef93d1a763dc821f8': 'IDT Exchange',
  '0x04f062809b244e37e7fdc21d9409469c989c2342': 'Joyso',
  '0x4524baa98f9a3b9dec57caae7633936ef96bd708': 'LedgerDex',
  '0xc692453625023c6e03fec04158ea31ab4de2650a': 'LocalCoin Dex 1',
  '0x37c4bcaba4bcf3a605414236b8b108f160eb45a6': 'LocalCoin Dex 2',
  '0x8d1c1571367a148e92d6ac83494b1bdf3b497d07': 'LocalCoin DEX 3',
  '0x944644ea989ec64c2ab9ef341d383cef586a5777': 'LoopringDEX: Beta 1',
  '0x6f400810b62df8e13fded51be75ff5393eaa841f': 'Mesa.eth.link',
  '0x51a2b1a38ec83b56009d5e28e6222dbb56c23c22': 'nDEX Market',
  '0x794e6e91555438afc3ccf1c5076a74f42133d08d': 'OasisDEX',
  '0xc22d5b2951db72b44cfb8089bb8cd374a3c354ea': 'OpenRelay',
  '0xd2045edc40199019e221d71c0913343f7908d0d5': 'Paradex',
  '0xf92c1ad75005e6436b4ee84e88cb23ed8a290988': 'ParaSwap',
  '0xa258b39954cef5cb142fd567a46cddb31a670124': 'Radar Relay',
  '0x1f0d1de1558582ad6f13763f477119a1455502af': 'Saturn Network 1',
  '0xaa5bbd5a177a588b9f213505ca3740b444dbd586': 'Saturn Network 2',
  '0x55890b06f0877a01bb5349d93b202961f8e27a9b': 'Shark Relay',
  '0x9a2d163ab40f88c625fd475e807bbc3556566f80': 'SingularX',
  '0x0681e844593a051e2882ec897ecd5444efe19ff2': 'Star Bit Ex',
  '0x7ee7ca6e75de79e618e88bdf80d0b1db136b22d0': 'Switcheo Exchange V2',
  '0x7219612be7036d1bfa933e16ca1246008f38c5fe': 'The Ocean',
  '0x1ce7ae555139c5ef5a57cc8d814a867ee6ee33d8': 'Token.Store',
  '0x5e150a33ffa97a8d22f59c77ae5487b089ef62e9': 'TokenJar',
  '0xdc6c91b569c98f9f6f74d90f9beff99fdaf4248b': 'Tokenlon',
  '0x77208a6000691e440026bed1b178ef4661d37426': 'Totle: Primary',
  '0xbd2a43799b83d9d0ff56b85d4c140bce3d1d1c6c': 'UniswapEX',
  '0xd97d09f3bd931a14382ac60f156c1285a56bb51b': 'WeDEX: Beta 2',
}

export const COLORS_BY_PROTOCOL = {
  zero: '#CCCCCC',
  one_inch: '#673AB7',
  binance: '#FFC107',
  sushiswap: '#795548',
  uniswap: '#FF4081',
  curve: '#1976D2',
  uma: '#F44336',
  compound: '#4CAF50',
  balancer: '#607D8B',
  dodo: '#FFEB3B'
}

export const KNOWN_ADDRESSES_COLORS = {}

for (const protocol in BY_PROTOCOL)
  for (const a in BY_PROTOCOL[protocol]) {
    KNOWN_ADDRESSES[a] = BY_PROTOCOL[protocol][a]
    KNOWN_ADDRESSES_COLORS[a] = COLORS_BY_PROTOCOL[protocol]
  }

const load_uniswap_like_pairs = async (subgraph, callback) => {
  let skip = 0
  while (true) {
    const pairs = await retryablePromise(_ => fetch(`https://api.thegraph.com/subgraphs/name/${ subgraph }`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `{
          pairs(first: 1000 skip: ${ skip }) {
            id
            token0 {
              symbol
            }
            token1 {
              symbol
            }
          }
        }`
      })
    }).then(r => r.json()).then(r => r.data.pairs), 5)

    for (const p of pairs)
      callback(p)

    if (pairs.length < 1000)
      break

    skip += 1000
  }
}

const load_balancer_pools = async callback => {
  let skip = 0
  while (true) {
    const pools = await retryablePromise(_ => fetch('https://api.thegraph.com/subgraphs/name/balancer-labs/balancer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `{
          pools(skip: ${ skip }, first: 1000) {
            id
            tokens {
              id
              symbol
              denormWeight
            }
          }
        }`
      })
    }).then(r => r.json()).then(r => r.data.pools), 5)

    for (const p of pools)
      callback(p)

    if (pools.length < 1000)
      break

    skip += 1000
  }
}

export const loadSubgraphs = async callback => {
  await Promise.all([
    load_uniswap_like_pairs('uniswap/uniswap-v2', p => {
      const address = p.id,
            label = `UNI-V2: ${ p.token0.symbol }/${ p.token1.symbol }`
      BY_PROTOCOL.uniswap[address] = label
      KNOWN_ADDRESSES[address] = label
      KNOWN_ADDRESSES_COLORS[address] = COLORS_BY_PROTOCOL.uniswap
      callback(address)
    }),
    load_balancer_pools(p => {
      const address = p.id,
            symbols = p.tokens.map(t => t.symbol),
            total_weight = p.tokens.reduce((out, t) => out.plus(t.denormWeight), new BigNumber(0)),
            weights = p.tokens.map(t => new BigNumber(t.denormWeight).times(100).div(total_weight).integerValue().toString()),
            label = `Balancer: ${ symbols.join('/') } ${ weights.join('/') }`
      BY_PROTOCOL.balancer[address] = label
      KNOWN_ADDRESSES[address] = label
      KNOWN_ADDRESSES_COLORS[address] = COLORS_BY_PROTOCOL.balancer
      callback(address)
    }),
    load_uniswap_like_pairs('zippoxer/sushiswap-subgraph-fork', p => {
      const address = p.id,
            label = `Sushiswap: ${ p.token0.symbol }/${ p.token1.symbol }`
      BY_PROTOCOL.sushiswap[address] = label
      KNOWN_ADDRESSES[address] = label
      KNOWN_ADDRESSES_COLORS[address] = COLORS_BY_PROTOCOL.sushiswap
      callback(address)
    })
  ])
}