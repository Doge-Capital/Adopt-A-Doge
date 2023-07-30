import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { Metaplex, keypairIdentity, Nft } from "@metaplex-foundation/js";
import { Adoptcontract } from "../target/types/adoptcontract";
import { expect } from "chai";

describe("adoptcontract", () => {
    const provider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    anchor.setProvider(provider);

    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;
    let test_keypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(test_keypair));
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const mintToken = async (): Promise<[Nft, anchor.web3.PublicKey]> => {
        console.log("Minting an NFT...");
        const { nft } = await metaplex.nfts().create({
            uri: "",
            name: "My NFT",
            sellerFeeBasisPoints: 500, // Represents 5.00%.
        });

        console.log("NFT created (mint): " + nft.address + "\n" + "NFT name: " + nft.name + "\n" + "NFT Metadata: " + nft.metadataAddress + "\n" + "NFT Edition: " + nft.edition.address);

        const nftATA = await getAssociatedTokenAddress(nft.address, test_keypair.publicKey);
        console.log("NFT Token Account: " + nftATA);

        return [nft, nftATA];
    };

    // use 1-2 times on Devnet, then comment it out to avoid the rate limit issue
    before("SOL airdrop", async function () {
        console.log("Airdropping SOL...");

        let airdrop_txhash = await connection.requestAirdrop(test_keypair.publicKey, .5 * anchor.web3.LAMPORTS_PER_SOL).catch(console.error);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        airdrop_txhash && await connection.confirmTransaction({
            signature: airdrop_txhash,
            blockhash,
            lastValidBlockHeight
        }, "finalized");

        console.log(`Airdrop tx hash: ${airdrop_txhash}`);
    });

    it("burns an NFT and transfers fees", async () => {
        const [nft, ata] = await mintToken();

        await connection.getTokenAccountBalance(ata).then(balance => {
            console.log("Token amount before burning: " + balance.value.amount);
            expect(balance.value.amount).eq("1", "Wrong token amount, should be 1");
        });

        console.log("Runs burnNFTs ix...");
        const tx = await program.methods.burnNfts()
            .accounts({
                mint: nft.address,
                from: ata,
                authority: test_keypair.publicKey,
                feesReceiver: test_keypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                metadata: nft.metadataAddress,
                masterEdition: nft.edition.address,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .signers([test_keypair])
            .rpc({
                skipPreflight: true
            });


        console.log("Burning transaction signature", tx);

        // TODO: add an assertion (TA doesn't exist and mint has 0 supply)
    });
});
