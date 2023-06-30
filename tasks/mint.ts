import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('mint', 'Mint tokens to the address')
    .addParam('token', 'Token address')
    .addParam('user', 'Resiver user address')
    .addParam('amount', 'Token amount')
	.setAction(async ({ token, user, amount}, { ethers }) => {
        const Token = await ethers.getContractFactory('MyToken')
        const tokenContract = Token.attach(token)
        try
        { 
            const contractTx: ContractTransaction = await tokenContract.mint(user, amount);
            const contractReceipt: ContractReceipt = await contractTx.wait();
            const event = contractReceipt.events?.find(event => event.event === 'Transfer');
            const eInitiator: Address = event?.args!['from'];
            const eRecipient: Address = event?.args!['to'];
            const eAmount: BigNumber = event?.args!['value'];            
            console.log(`Initiator: ${eInitiator}`)
            console.log(`Recipient: ${eRecipient}`)
            console.log(`Amount: ${eAmount}`)
        }

        catch(error: any) {
         console.log(error.error);
        }
    })