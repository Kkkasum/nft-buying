import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, beginCell, toNano } from '@ton/core';
import { contentToCell, NftCollection, royaltyParamsToCell } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {
    const ownerAddress = Address.parse('');
    const royaltyAddress = Address.parse('');
    const feeAddress = Address.parse('');

    const contentCell = contentToCell(
        'https://starsfinance.fra1.digitaloceanspaces.com/nft/collection.json',
        'https://starsfinance.fra1.digitaloceanspaces.com/nft/items/',
    );
    const royaltyParamsCell = royaltyParamsToCell(10, 100, royaltyAddress);

    const nftMinter = provider.open(
        NftCollection.createFromConfig(
            {
                ownerAddress: ownerAddress,
                nextItemIndex: 0,
                content: contentCell,
                nftItemCode: await compile('NftItem'),
                royaltyParams: royaltyParamsCell,
                purchaseFee: toNano('1'),
                feeAddress: feeAddress,
            },
            await compile('NftCollection'),
        ),
    );

    const { nextItemIndex } = await nftMinter.getCollectionData();

    await nftMinter.sendMint(provider.sender(), {
        value: toNano('0.1'),
        itemIndex: nextItemIndex,
        amount: toNano('0.05'),
        nftContent: beginCell().storeBuffer(Buffer.from('common.json')).endCell(),
    });
}
