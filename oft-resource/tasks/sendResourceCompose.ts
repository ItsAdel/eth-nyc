import { task } from 'hardhat/config'

/**
 * Task to send resource OFT tokens cross-chain with compose message for processing
 * This triggers the ResourceOFTComposerMock's lzCompose function on the destination chain
 */
task('send-resource-compose', 'Sends resource OFT tokens to trigger processing on the destination chain')
    .addParam('srcContract', 'Source OFT contract name (e.g., OreResourceOFT or WoodResourceOFT)')
    .addParam('dstEndpointId', 'Destination chain endpoint ID')
    .addParam('composerAddress', 'Composer address on dst chain')
    .addParam('amount', 'Amount of tokens to send (in ether units, e.g., "10.5")')
    .addOptionalParam('recipient', 'Recipient address for processed resources (defaults to sender)')
    .addOptionalParam('sendBack', 'Whether to send processed resources back (true/false)', 'true')
    .addOptionalParam('lzReceiveGas', 'Gas for lzReceive', '200000')
    .addOptionalParam('lzComposeGas', 'Gas for lzCompose', '500000')
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const { srcContract, dstEndpointId, composerAddress, amount, recipient, sendBack, lzReceiveGas, lzComposeGas } =
            taskArgs

        const [signer] = await ethers.getSigners()
        const signerAddress = await signer.getAddress()

        console.log(`\n🌲 Sending Resource OFT with Compose`)
        console.log(`════════════════════════════════════════`)
        console.log(`Source Contract: ${srcContract}`)
        console.log(`Sender: ${signerAddress}`)
        console.log(`Destination EID: ${dstEndpointId}`)
        console.log(`Composer: ${composerAddress}`)
        console.log(`Amount: ${amount} tokens`)

        // Get the deployed OFT contract
        const oftDeployment = await deployments.get(srcContract)
        const oft = await ethers.getContractAt('OreResourceOFT', oftDeployment.address)

        console.log(`\n📍 Source OFT Address: ${oftDeployment.address}`)

        // Parse amount to wei
        const amountLD = ethers.utils.parseEther(amount)

        // Determine recipient (default to sender)
        const recipientAddr = recipient || signerAddress

        // Create compose message
        // Format: abi.encode(recipientAddress, dstEid, sendBack)
        const composeMsg = ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint32', 'bool'],
            [recipientAddr, dstEndpointId, sendBack === 'true']
        )

        console.log(`📦 Compose message created`)
        console.log(`   - Recipient: ${recipientAddr}`)
        console.log(`   - Send back: ${sendBack}`)

        // Build options with lzReceive and lzCompose
        // Create options manually
        const optionsType3 = ethers.utils.solidityPack(
            ['uint16', 'uint128', 'uint128'],
            [3, parseInt(lzReceiveGas), 0] // Type 3, gas, value
        )

        const composeOption = ethers.utils.solidityPack(
            ['uint16', 'uint16', 'uint128', 'uint128'],
            [1, 0, parseInt(lzComposeGas), 0] // Type 1 (compose), index 0, gas, value
        )

        const options = ethers.utils.hexConcat([optionsType3, composeOption])

        console.log(`\n⚙️  Options configured:`)
        console.log(`   - lzReceive gas: ${lzReceiveGas}`)
        console.log(`   - lzCompose gas: ${lzComposeGas}`)

        // Create SendParam struct
        const sendParam = {
            dstEid: dstEndpointId,
            to: ethers.utils.hexZeroPad(composerAddress, 32),
            amountLD: amountLD,
            minAmountLD: amountLD, // No slippage for testing
            extraOptions: options,
            composeMsg: composeMsg,
            oftCmd: '0x',
        }

        // Quote the send
        console.log(`\n💰 Quoting cross-chain send...`)
        const feeQuote = await oft.quoteSend(sendParam, false)
        const nativeFee = feeQuote.nativeFee

        console.log(`   Native fee: ${ethers.utils.formatEther(nativeFee)} ETH`)

        // Check balance
        const balance = await oft.balanceOf(signerAddress)
        console.log(`\n👛 Your balance: ${ethers.utils.formatEther(balance)} ${await oft.symbol()}`)

        if (balance.lt(amountLD)) {
            throw new Error(
                `Insufficient balance! You have ${ethers.utils.formatEther(balance)} but trying to send ${amount}`
            )
        }

        // Send the tokens
        console.log(`\n📤 Sending ${amount} tokens...`)
        const tx = await oft.send(sendParam, { nativeFee: nativeFee, lzTokenFee: 0 }, signerAddress, {
            value: nativeFee,
        })

        console.log(`   Transaction hash: ${tx.hash}`)
        console.log(`   Waiting for confirmation...`)

        const receipt = await tx.wait()

        console.log(`\n✅ Transaction confirmed!`)
        console.log(`   Block: ${receipt.blockNumber}`)
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`)

        console.log(`\n🎉 Resource OFT sent successfully!`)
        console.log(`⚙️  Resources will be processed on destination chain`)
        console.log(`📊 Processing ratio: 10:1 (10 input → 1 output)`)
        console.log(`🎲 Success rate: 80%`)
        console.log(`\n🔍 Monitor the transaction on LayerZero Scan:`)
        console.log(`   https://testnet.layerzeroscan.com/tx/${tx.hash}`)
    })

export default {}
