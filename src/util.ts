import { address as _address } from './constants';

/**
 * Gets the contract address of the named contract. This method supports 
 *     contracts used by the Compound protocol.
 *
 * @param {string} contract The name of the contract.
 * @param {string} [network] Optional name of the Ethereum network. Main net and
 * all the popular public test nets are supported.
 *
 * @returns {string} Returns the address of the contract.
 */
export function getAddress(contract, network='mainnet') {
  const address = _address[this._pool];
  return address[network][contract];
}