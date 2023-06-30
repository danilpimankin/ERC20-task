import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('approve', 'Approve to another user')
    .addParam('token', 'Token address')
    .addParam('spender', 'spender address')
    .addParam('amount', 'Token amount')
	.setAction(async ({ token, spender, amount}, { ethers }) => {
        const Token = await ethers.getContractFactory('MyToken')
        const tokenContract = Token.attach(token)
        try
        { 
            const contractTx: ContractTransaction = await tokenContract.approve(spender, amount);
            const contractReceipt: ContractReceipt = await contractTx.wait();
            const event = contractReceipt.events?.find(event => event.event === 'Approval');
            const eInitiator: Address = event?.args!['owner'];
            const eRecipient: Address = event?.args!['spender'];
            const eAmount: BigNumber = event?.args!['value'];            
            console.log(`Initiator: ${eInitiator}`)
            console.log(`Recipient: ${eRecipient}`)
            console.log(`Amount: ${eAmount}`)
        }

        catch(error: any) {
         console.log(error.error);
        }
    })