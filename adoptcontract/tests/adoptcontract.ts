import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintToChecked, getMint, getAccount } from "@solana/spl-token";
import { Adoptcontract } from "../target/types/adoptcontract";
import { expect } from "chai";

describe("adoptcontract", () => {
    const provider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    anchor.setProvider(provider);

    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;
    let test_keypair: anchor.web3.Keypair;

    const mintToken = async (): Promise<[anchor.web3.PublicKey, anchor.web3.PublicKey]> => {
        // Create mint
        let mintPubkey = await createMint(
            connection, // conneciton
            test_keypair, // fee payer
            test_keypair.publicKey, // mint authority
            test_keypair.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
            0 // decimals
        );

        let mintAccount = await getMint(connection, mintPubkey);
        console.log("Mint account: " + mintAccount.address);

        // Create the token account
        let ata = await createAssociatedTokenAccount(
            connection, // connection
            test_keypair, // fee payer
            mintPubkey, // mint
            test_keypair.publicKey // owner,
        );

        let tokenAccount = await getAccount(connection, ata);
        console.log(`ATA address: ${tokenAccount.address}\nATA mint: ${tokenAccount.mint}\nATA owner: ${tokenAccount.owner}`);


        // Mint token to the account
        let txhash = await mintToChecked(
            connection, // connection
            test_keypair, // fee payer
            mintPubkey, // mint
            ata, // receiver (sholud be an associated token account)
            test_keypair.publicKey, // mint authority
            1, // amount
            0 // decimals
        );

        console.log(`Token was minted, tx hash: ${txhash}`);

        return [mintPubkey, ata];
    };

    before("Generate keypair, airdrop and mint a 0-decimal token", async function () {
        test_keypair = anchor.web3.Keypair.generate();

        let airdrop_txhash = await connection.requestAirdrop(test_keypair.publicKey, .5 * anchor.web3.LAMPORTS_PER_SOL).catch(console.error);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        airdrop_txhash && await connection.confirmTransaction({
            signature: airdrop_txhash,
            blockhash,
            lastValidBlockHeight
        }, "finalized");

        console.log(`Airdrop tx hash: ${airdrop_txhash}`);
    });

    it("burns an NFT and closes its TA", async () => {
        try {
            console.log("Burn NFT instruction...");
            const [mintPublicKey, ata] = await mintToken();

            await connection.getTokenAccountBalance(ata).then(balance => {
                console.log("Token amount before burning: " + balance.value.amount);
                expect(balance.value.amount).eq("1", "Wrong token amount, should be 1");
            });
            
            // Add your test here.
            const tx = await program.methods.burnToken()
            .accounts({
                mint: mintPublicKey,
                from: ata,
                authority: test_keypair.publicKey,
                feesReceiver: test_keypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .signers([test_keypair])
            .rpc();

            // TODO: add an assertion (TA doesn't exist and mint has 0 supply)
            
            console.log("Burning transaction signature", tx);
        } catch (error) {
            console.log(error);
        }
    });
});
