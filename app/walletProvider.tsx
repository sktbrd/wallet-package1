// Assuming AssetValue and keepkey.walletMethods are defined elsewhere in your application
import { getPaths } from '@pioneer-platform/pioneer-coins'
import { ChainToNetworkId, getChainEnumValue } from '@coinmasters/types'
import { AssetValue } from '@coinmasters/core'


class AssetManager {
  private keepkey: any; // Placeholder type, adjust according to your implementation

  constructor(keepkey: any) {
    this.keepkey = keepkey;
  }

  async loadAssetValue(asset: string, amount: string): Promise<any> {
    await AssetValue.loadStaticAssets();
    const assetValue = AssetValue.fromStringSync(asset, parseFloat(amount));
    if (!assetValue) throw new Error('Failed to find asset! ' + asset);
    console.log('assetValue: ', assetValue);
    return assetValue;
  }

  async transfer(params: { to: string; amount: string; asset: string; memo?: string }): Promise<any> {
    const { to, amount, asset, memo = '' } = params;
    const assetValue = await this.loadAssetValue(asset, amount);

    let sendPayload = {
      assetValue,
      memo,
      recipient: to,
    };
    console.log('sendPayload: ', sendPayload);

    let result = await this.keepkey.walletMethods.transfer(sendPayload);
    return result;
  }

  async deposit(params: { to: string; amount: string; asset: string; memo: string }): Promise<any> {
    const { to, amount, asset, memo } = params;
    const assetValue = await this.loadAssetValue(asset, amount);

    let sendPayload = {
      assetValue,
      memo,
      recipient: to,
    };
    console.log('sendPayload: ', sendPayload);
    console.log('walletMethods: ', this.keepkey);
    console.log('walletMethods: ', this.keepkey.walletMethods);

    let result = await this.keepkey.walletMethods.deposit(sendPayload);
    return result;
  }
}

// Usage would require creating an instance of AssetManager and then calling its methods with the appropriate parameters.
