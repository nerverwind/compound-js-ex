import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address as _address, abi, } from './constants';

export async function getTokenBalance(address: string, asset: string) {
    if('ETH' == asset) {
        let provider: any = this._provider;
        if (provider._isSigner) {
            provider = provider.provider;
        }

        return await provider.send('eth_getBalance', [address, 'latest']);


    }
    else {
        await netId(this);
        const addressConstants = _address[this._pool];
        const contractAddress = addressConstants[this._network.name][asset];
        return await eth.read(contractAddress, 'balanceOf', [address], {
            _compoundProvider: this._provider,
            abi: abi.Erc20
        }); 
    }
}