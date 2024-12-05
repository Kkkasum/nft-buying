import { compile, NetworkProvider } from '@ton/blueprint';
import { Address, beginCell, toNano } from '@ton/core';
import { contentToCell, NftCollection, royaltyParamsToCell } from '../wrappers/NftCollection';

export async function run(provider: NetworkProvider) {
    const ownerAddress = Address.parse(''); // адрес владельца коллекции
    const royaltyAddress = Address.parse(''); // адрес кошелька, на который будут приходить комиссии с продажи на маркетплейсах
    const feeAddress = Address.parse(''); // адрес кошелька, на который будут приходить комиссии с первоначальной продажи (1 ТОН)

    const contentCell = contentToCell(
        'https://starsfinance.fra1.digitaloceanspaces.com/starsfinft/collection.json',
        'https://starsfinance.fra1.digitaloceanspaces.com/starsfinft/items/',
    );
    const royaltyParamsCell = royaltyParamsToCell(10, 100, royaltyAddress);

    const nftCollection = provider.open(
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

    const { nextItemIndex } = await nftCollection.getCollectionData();
    const userAddress = Address.parse(''); // адрес пользователя
    const rarity = '.json'; // вводите файл, соответствующий рарности
    // Возможные варианты:
    // common.json
    // uncommon.json
    // rare.json
    // mythical.json
    // legendary.json
    // immortal.json

    await nftCollection.sendMint(provider.sender(), {
        value: toNano('0.05'),
        itemIndex: nextItemIndex,
        amount: toNano('0.05'),
        nftContent: beginCell()
            .storeAddress(userAddress)
            .storeRef(beginCell().storeBuffer(Buffer.from(rarity)).endCell())
            .storeAddress(ownerAddress)
            .endCell(),
    });
}
