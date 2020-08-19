import { address as _address,  } from './constants';
import { netId } from './helpers';
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

export async function getPoolAssets(cTokens: Array<any>) {
  await netId(this);
  const address : Array<any> = _address[this._pool][this._network.name];
  let _cTokens = [];
  let _underlyings = [];
  for( let key in address) {
    if(address.hasOwnProperty(key)) {
      let _temp = cTokens.filter(token => {
        return token == address[key];
      });
      if(_temp.length > 0) {
        let cToken = {
          symbol: key,
          address: _temp[0]
        }

        _cTokens.push(cToken);
        let underlyingSymbol = cToken.symbol.substr(1);
        let underlying = {
          symbol: underlyingSymbol,
          address: address[underlyingSymbol]
        }
        _underlyings.push(underlying);
      }
    }
  }

  return {
    cTokens: _cTokens,
    underlyings: _underlyings
  }

}