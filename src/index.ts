import { ethers, utils } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as comptroller from './comptroller';
import * as cToken from './cToken';
import * as priceFeed from './priceFeed';
import { constants as _constants, decimals as _decimals } from './constantsMultiPlatform';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Compound.js SDK.
 *
 * @param {any{} | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {any{}} [options] Optional provider options.
 *
 * @returns {object} Returns an instance of Compound.js SDK.
 * 
 */
const Compound = function(provider: any='mainnet', options: any={}, platform: string = 'compound') {
  options.provider = provider || options.provider;
  provider = eth.createProvider(options);

  console.log('platform', platform);

  const decimals = _decimals[platform];
  Compound.decimals = decimals;  

  const constants = _constants[platform];
  console.log('constants', constants);
  Object.assign(Compound, constants);  

  const instance: any = {
    _provider: provider,
    ...comptroller,
    ...cToken,
    ...priceFeed,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Compound.eth = eth;
Compound.util = util;
Compound._ethers = ethers;
Compound.decimals = {};

export default Compound;
