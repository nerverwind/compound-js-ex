import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants as _constants, address as _address, abi, decimals as _decimals, underlyings as _underlyings, cTokens as _cTokens } from './constants';

/**
 * Supplies the user's Ethereum asset to the Compound protocol.
 *
 * @param {string} asset A string of the asset to supply.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to supply. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there 
 *     are no decimals) or in its natural scale.
 * @param {object} options Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the supply
 *     transaction.
 */
export async function supply(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [supply] | ';

  const address = _address[this._pool];  
  const underlyings = _underlyings[this._pool];
  const decimals = _decimals[this._pool];
  const constants = _constants[this._pool];

  console.log('address', address);
  console.log('underlyings', underlyings);
  console.log('decimals', decimals);
  console.log('constants', constants);

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider };
  const parameters = [];
  if (cTokenName === constants.cETH) {
    trxOptions.value = amount;
    trxOptions.abi = abi.cEther;
  } else {
    parameters.push(amount);
    trxOptions.abi = abi.cErc20;
  }

  return eth.trx(cTokenAddress, 'mint', parameters, trxOptions);
}

/**
 * Redeems the user's Ethereum asset from the Compound protocol.
 *
 * @param {string} asset A string of the asset to redeem, or its cToken name.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to redeem. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there 
 *     are no decimals) or in its natural scale. This can be an amount of 
 *     cTokens or underlying asset (use the `asset` parameter to specify).
 * @param {object} options Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the redeem
 *     transaction.
 */
export async function redeem(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [redeem] | ';

  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
  }

  const address = _address[this._pool];  
  const underlyings = _underlyings[this._pool];
  const decimals = _decimals[this._pool];
  const constants = _constants[this._pool];  
  const cTokens = _cTokens[this._pool];

  const assetIsCToken = asset[0] === 'c';

  const cTokenName = assetIsCToken ? asset : 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  const underlyingName = assetIsCToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (!cTokens.includes(cTokenName) || !underlyings.includes(underlyingName)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = {
    _compoundProvider: this._provider,
    abi: cTokenName === constants.cETH ? abi.cEther : abi.cErc20,
  };
  const parameters = [ amount ];
  const method = assetIsCToken ? 'redeem' : 'redeemUnderlying';

  return eth.trx(cTokenAddress, method, parameters, trxOptions);
}

/**
 * Borrows an Ethereum asset from the Compound protocol for the user. The user's
 *     address must first have supplied collateral and entered a corresponding
 *     market.
 *
 * @param {string} asset A string of the asset to borrow (must be a supported 
 *     underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there 
 *     are no decimals) or in its natural scale.
 * @param {object} options Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the borrow
 *     transaction.
 */
export async function borrow(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [borrow] | ';

  const address = _address[this._pool];  
  const underlyings = _underlyings[this._pool];
  const decimals = _decimals[this._pool];
  const constants = _constants[this._pool];    

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be borrowed.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider, ...options };
  const parameters = [ amount ];
  trxOptions.abi = cTokenName === constants.cETH ? abi.cEther : abi.cErc20;

  return eth.trx(cTokenAddress, 'borrow', parameters, trxOptions);
}

/**
 * Repays a borrowed Ethereum asset for the user or on behalf of another 
 *     Ethereum address.
 *
 * @param {string} asset A string of the asset that was borrowed (must be a 
 *     supported underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there 
 *     are no decimals) or in its natural scale.
 * @param {string | null} [borrower] The Ethereum address of the borrower to 
 *     repay an open borrow for. Set this to `null` if the user is repaying
 *     their own borrow.
 * @param {object} options Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the repayBorrow
 *     or repayBorrowBehalf transaction.
 */
export async function repayBorrow(asset: string, amount: any, borrower: string, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [repayBorrow] | ';

  const address = _address[this._pool];  
  const underlyings = _underlyings[this._pool];
  const decimals = _decimals[this._pool];
  const constants = _constants[this._pool];    

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  let method = ethers.utils.isAddress(borrower) ? 'repayBorrowBehalf' : 'repayBorrow';
  if (borrower && method === 'repayBorrow') {
    throw Error(errorPrefix + 'Invalid `borrower` address.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider, ...options };
  const parameters = method === 'repayBorrowBehalf' ? [ borrower ] : [];
  if (cTokenName === constants.cETH) {
    trxOptions.value = amount;
    trxOptions.abi = abi.cEther;
  } else {
    parameters.push(amount);
    trxOptions.abi = abi.cErc20;

    // ERC-20 approve transaction
    const underlyingAddress = address[this._network.name][asset];
    await eth.trx(
      underlyingAddress,
      'approve',
      [ cTokenAddress, amount ],
      { _compoundProvider: this._provider, abi: abi.cErc20 }
    );
  }

  return eth.trx(cTokenAddress, method, parameters, trxOptions);
}

export async function totalSupply(asset: string, options: any = {})  {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'totalSupply';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();
}

export async function supplyRate(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'supplyRatePerBlock';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();  
} 

export async function totalBorrows(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'totalBorrowsCurrent';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();  
}

export async function borrowRate(asset: string, options: any = {}) {
  
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'borrowRatePerBlock';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();    
}

export async function reserveFactor(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'reserveFactorMantissa';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();   
}

export async function totalReserves(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'totalReserves';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();   
}

export async function getCash(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'getCash';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString(); 
}

export async function exchangeRate(asset: string, options: any = {}) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  

  const method = 'exchangeRateCurrent';
  const trxOptions: any = { 
    _compoundProvider: this._provider, 
    abi: abi.cErc20,
    ...options 
  };

  const res = await eth.read(cTokenAddress, method, [], trxOptions);  
  return res.toString();   
}

export async function getContractAddress(asset: string) {
  await netId(this);
  const address = _address[this._pool];  

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];  
  const underlyingAddress =   address[this._network.name][asset];  

  return {
    address: cTokenAddress,
    underlyingAddress: underlyingAddress
  }
}


