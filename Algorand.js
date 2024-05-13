const algosdk = require('algosdk');

const token = "429687815be14b8b23c3cc89e23eb8b03a9aa6e99dc89dc777c8b9646d68e331";
const server = "https://testnet-api.algonode.cloud/";
const port = 443;

let algodClient = new algosdk.Algodv2(token, server, port);


//----------------------- Sample Accounts --------------------------
let mn1 = 'jazz improve cycle february size bike bicycle wagon mixture luggage industry quick pair adapt small maple hip donor physical moon danger pink auction able filter';
let mn2 = 'predict scrub dirt derive battle fossil collect famous race barrel filter pattern tribe cover quick educate cinnamon angry fly heavy way please swim abandon crew';
let mn3 = 'drama company fruit shy wrap loan bid dilemma derive turkey burst october trust wet globe roof trim country cushion simple math surprise brief able globe';
let mn4 = 'liar dragon orient giggle chalk quantum rally gap aerobic orphan shoe dog outdoor hover better grass tool ostrich tone analyst damp beyond into abandon enable';
let mn5 = 'venture cloud paddle spell tornado tank rude animal dignity wall step sort steel moment subway eye expect debate oyster caution abuse ready tank about claw';
let mn6 = 'crumble disease analyst else give bird away aerobic involve coast hello drastic upgrade cruise once hello wrestle jealous upset link cactus insane symbol absent regret';

var account1 = algosdk.mnemonicToSecretKey(mn1);
var account2 = algosdk.mnemonicToSecretKey(mn2);
var account3 = algosdk.mnemonicToSecretKey(mn3);
var account4 = algosdk.mnemonicToSecretKey(mn4);
var account5 = algosdk.mnemonicToSecretKey(mn5);
var account6 = algosdk.mnemonicToSecretKey(mn6);

let sampleAccounts = [
    {
        name: 'CREATOR',
        account: account1,
        mn: mn1
    },
    {
        name: 'RECEIVER',
        account: account2,
        mn: mn2
    },
    {
        name: 'MANAGER',
        account: account3,
        mn: mn3
    },
    {
        name: 'RESERVE',
        account: account4,
        mn: mn4
    },
    {
        name: 'FREEZE',
        account: account5,
        mn: mn5
    },
    {
        name: 'CLAWBACK',
        account: account6,
        mn: mn6
    }
]

let CREATOR = sampleAccounts[0].account;
let RECEIVER = sampleAccounts[1].account
let MANAGER = sampleAccounts[2].account;
let RESERVE = sampleAccounts[3].account;
let FREEZE = sampleAccounts[4].account;
let CLAWBACK = sampleAccounts[5].account;
//------------------------------------------------------------------



//----------------------- Create Account ---------------------------
const createGeneralAccount = async function () {
    let newAccount = algosdk.generateAccount();
    let mn = algosdk.secretKeyToMnemonic(newAccount.sk);

    let accountDetails = {
        account: newAccount,
        mn
    }
    return accountDetails;
}
//------------------------------------------------------------------



//------------------- Recover Account from MN ----------------------
const recoverAccount = async function(mn){
    return algosdk.mnemonicToSecretKey(mn);
}
//------------------------------------------------------------------



//--------------------- Find Accounts Details -----------------------
const findAccountDet = async function (accountAddr) {
    let account_info = await algodClient.accountInformation(accountAddr).do();

    let details = {
        AccountAddress: account_info.address,
        AlgosAmount: account_info.amount,
        AmountWithoutPendingRewards: account_info['amount-without-pending-rewards'],
        AppsLocalState: account_info['apps-local-state'],
        AppsTotalSchema: account_info['apps-total-schema'],
        Assets: account_info.assets,
        CreatedApps: account_info['created-apps'],
        CreatedAssets: account_info['created-assets'],
        MinBalance: account_info['min-balance'],
        PendingRewards: account_info['pending-rewards'],
        RewardBase: account_info['reward-base'],
        Rewards: account_info.rewards,
        Round: account_info.round,
        Status: account_info.status,
        TotalAppsOptedIn: account_info['total-apps-opted-in'],
        TotalAssetsOptedIn: account_info['total-assets-opted-in'],
        TotalCreatedApps: account_info['total-created-apps'],
        TotalCreatedAssets: account_info['total-created-assets'],
    }

    return details;
}
//------------------------------------------------------------------



//------------------- Find Accounts Algo Count ---------------------
const findAccountAlgoAmount = async function (accountAddr) {
    const acctInfo = await algodClient.accountInformation(accountAddr).do();
    return (`Account address: ${accountAddr}\nAccount balance: ${acctInfo.amount} microAlgos`);
}
//------------------------------------------------------------------



//--------------------- Find Accounts Assets -----------------------
const findAccountAssets = async function (accountAddr) {
    let account_info = (await algodClient.accountInformation(accountAddr).do());
    let assets = account_info.assets;

    return assets;
}
//------------------------------------------------------------------



//----------------- Find Accounts Created Assets -------------------
const findAccountCreatedAssets = async function (accountAddr) {
    let account_info = (await algodClient.accountInformation(accountAddr).do());
    return account_info['created-assets'];
}
//------------------------------------------------------------------



//------------------------ Create an Asset --------------------------
const createAsset = async function () {
    const suggestedParams = await algodClient.getTransactionParams().do();

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: CREATOR.addr,
        suggestedParams,
        defaultFrozen: false,
        unitName: 'USH',
        assetName: 'Ushan',
        manager: MANAGER.addr,
        reserve: RESERVE.addr,
        freeze: FREEZE.addr,
        clawback: CLAWBACK.addr,
        assetURL: "https://www.forbes.com/advisor/in/investing/cryptocurrency/what-is-an-nft-how-do-nfts-work/",
        total: 1000,
        decimals: 0,
    });

    const signedTxn = txn.signTxn(CREATOR.sk);
    await algodClient.sendRawTransaction(signedTxn).do();

    const result = await algosdk.waitForConfirmation(
        algodClient,
        txn.txID().toString(),
        3
    );

    const assetIndex = result['asset-index'];
    return assetIndex;
}
//------------------------------------------------------------------



//---------------------- Modifying an Asset ------------------------
const modifyAsset = async function(asId){
    const suggestedParams = await algodClient.getTransactionParams().do();

    let assetId = asId;

    const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
        from: CREATOR.addr,
        suggestedParams,
        assetId,
        manager: CREATOR.addr,
        clawback: MANAGER.addr,
        reserve: MANAGER.addr,
        freeze: MANAGER.addr
    });

    const signedTxn = txn.signTxn(CREATOR.sk);
    await algodClient.sendRawTransaction(signedTxn).do();

    const result = await algosdk.waitForConfirmation(
        algodClient,
        txn.txID().toString(),
        3
    );

    const assetIndex = result['asset-index'];
    return assetIndex;
}
//------------------------------------------------------------------



//----------------------- Transfer an Asset ------------------------
const transferAsset = async function(asId){
    const suggestedParams = await algodClient.getTransactionParams().do();

    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: RECEIVER.addr,
        to: RECEIVER.addr,
        suggestedParams,
        assetIndex: asId,
        amount: 0
    });

    const signedOptInTxn = optInTxn.signTxn(sampleAccounts[1].account.sk);
    await algodClient.sendRawTransaction(signedOptInTxn).do();
    await algosdk.waitForConfirmation(algodClient, optInTxn.txID().toString(), 3);


    const xferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: CREATOR.addr,
        to: RECEIVER.addr,
        suggestedParams,
        assetIndex: asId,
        amount: 50
    });

    const  signedXferTxn = xferTxn.signTxn(CREATOR.sk);
    await  algodClient.sendRawTransaction(signedXferTxn).do();
    await algosdk.waitForConfirmation(algodClient, xferTxn.txID().toString(), 3);
}
//------------------------------------------------------------------



//------------------------ Freeze an Asset -------------------------
const freezeAsset = async function(asId){
    const suggestedParams = await algodClient.getTransactionParams().do();

    const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
        from: FREEZE.addr,
        suggestedParams,
        assetIndex: asId,
        freezeState: true,
        freezeTarget: CREATOR.addr
    });

    const signedFreezeTxn = freezeTxn.signTxn(FREEZE.sk);
    await algodClient.sendRawTransaction(signedFreezeTxn).do();
    await algosdk.waitForConfirmation(
        algodClient,
        freezeTxn.txID().toString(),
        3
    );
}
//------------------------------------------------------------------


//------------------------ Revoke an Asset -------------------------
const revokeAsset = async function(asId){
    const suggestedParams = await algodClient.getTransactionParams().do();

    const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
        {
            from: CLAWBACK.addr,
            to: CREATOR.addr,
            revocationTarget: RECEIVER.addr,
            suggestedParams,
            assetIndex: asId,
            amount: 10,
        }
    );

    const signedClawbackTxn = clawbackTxn.signTxn(CLAWBACK.sk);
    await algodClient.sendRawTransaction(signedClawbackTxn).do();
    await algosdk.waitForConfirmation(
        algodClient,
        clawbackTxn.txID().toString(),
        3
    );
}
//------------------------------------------------------------------



//------------------------ Opt Out an Asset ------------------------
const optOutAsset = async function(astId){
    const suggestedParams = await algodClient.getTransactionParams().do();

    const optOutTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: RECEIVER.addr,
        to: CREATOR.addr,
        closeRemainderTo: CREATOR.addr,
        suggestedParams,
        assetIndex: astId,
        amount: 0,
    });

    const signedOptOutTxn = optOutTxn.signTxn(RECEIVER.sk);
    await algodClient.sendRawTransaction(signedOptOutTxn).do();
    await algosdk.waitForConfirmation(
        algodClient,
        optOutTxn.txID().toString(),
        3
    );
}
//------------------------------------------------------------------
