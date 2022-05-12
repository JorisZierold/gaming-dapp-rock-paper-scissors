import { ethers } from "ethers";
import { contractABIList } from "../../utils/contracts/contracts";
const { MinimalForwarder: abi } = contractABIList;
const address = import.meta.env.VITE_CONTRACT_MINIMAL_FORWARDER;

export function createInstance(provider) {
  return new ethers.Contract(address, abi, provider);
}
