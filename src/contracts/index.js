import ethProvider from './eth_provider'
import { ethers } from 'ethers'
import config from 'config'
import WMUE_ABI from './abi/ERC20.json'

export const WMUE = new ethers.Contract(config.public.contracts.WMUE.address, WMUE_ABI, ethProvider)

export { ethProvider }
