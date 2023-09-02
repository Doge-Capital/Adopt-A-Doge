import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, transfer } from "@solana/spl-token";
import { Metaplex, keypairIdentity, Nft } from "@metaplex-foundation/js";
import { Adoptcontract } from "../target/types/adoptcontract";
import { AccountMeta } from "@solana/web3.js";

describe("adoptcontract", () => {
    const provider = anchor.AnchorProvider.env();
    const connection = provider.connection;
    anchor.setProvider(provider);

    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;
    let testKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(testKeypair));
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

        const nftATA = await getAssociatedTokenAddress(nft.address, testKeypair.publicKey);
        console.log("NFT Token Account: " + nftATA + "\n" + "*--------------------*" + "\n");

        return [nft, nftATA];
    };

    const mintNftToPda = async (): Promise<[Nft, anchor.web3.PublicKey, anchor.web3.PublicKey]> => {
        const valutPda = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("authority")
            ],
            program.programId
        )[0];

        console.log("Minting an NFT to transfer to PDA later...");
        const { nft } = await metaplex.nfts().create({
            uri: "",
            name: "My NFT",
            sellerFeeBasisPoints: 500, // Represents 5.00%.
        });

        console.log("NFT created (mint): " + nft.address + "\n" + "NFT name: " + nft.name + "\n" + "NFT Metadata: " + nft.metadataAddress + "\n" + "NFT Edition: " + nft.edition.address);

        const nftATA = await getAssociatedTokenAddress(nft.address, valutPda, true);
        const myATA = await getAssociatedTokenAddress(nft.address, testKeypair.publicKey);

        const send_tx = await metaplex.nfts().transfer({
            nftOrSft: nft,
            authority: testKeypair,
            fromOwner: testKeypair.publicKey,
            fromToken: myATA,
            toOwner: valutPda,
            toToken: nftATA,
        }, { commitment: "finalized" });

        console.log(`Transfer to PDA transaction signature: ${await send_tx.response.signature}`);

        const updatedNft = await metaplex.nfts().findByMint({
            mintAddress: nft.address,
            tokenOwner: valutPda
        }) as Nft;

        console.log("NFT Token Account (PDA TA): " + nftATA + "\n" + "*--------------------*" + "\n");

        return [updatedNft, nftATA, myATA];
    };

    const createBurnAccountMeta = (mint: anchor.web3.PublicKey, metadata: anchor.web3.PublicKey, edition: anchor.web3.PublicKey, ata: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mint, isWritable: true, isSigner: false },
            { pubkey: metadata, isWritable: true, isSigner: false },
            { pubkey: edition, isWritable: true, isSigner: false },
            { pubkey: ata, isWritable: true, isSigner: false },
        ];
    };

    const createTransferAccountMeta = (ticketMint: anchor.web3.PublicKey, nftAta: anchor.web3.PublicKey, myAta: anchor.web3.PublicKey) : Array<AccountMeta> => {
        return [
            { pubkey: ticketMint, isWritable: true, isSigner: false },
            { pubkey: nftAta, isWritable: true, isSigner: false },
            { pubkey: myAta, isWritable: true, isSigner: false },
        ];
    };

    // use 1-2 times on Devnet, then comment it out to avoid the rate limit issue
    before("SOL airdrop", async function () {
        console.log("Airdropping SOL...");

        let airdrop_txhash = await connection.requestAirdrop(testKeypair.publicKey, .5 * anchor.web3.LAMPORTS_PER_SOL).catch(console.error);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

        airdrop_txhash && await connection.confirmTransaction({
            signature: airdrop_txhash,
            blockhash,
            lastValidBlockHeight
        }, "finalized");

        console.log(`Airdrop tx hash: ${airdrop_txhash}`);
    });

    it("inits, burns and transfers a ticket", async () => {
        const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("authority"),
            ],
            program.programId
        )[0];

        const userBurnInfo = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("burnstate"),
                testKeypair.publicKey.toBuffer()
            ],
            program.programId
        )[0];

        try {
            // INIT instruction, uncomment if you havent initialized a PDA yet and add that to the main burn instruction
            // as "preInstruction([initTx])"

            const initIx = await program.methods.initialize()
                .accounts({
                    signer: testKeypair.publicKey,
                    pdaAccount: vaultPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([testKeypair])
                .instruction();

            // TRANSFER ticket instruction
            const [pdaNft1, pdaAta1, myAta1] = await mintNftToPda(); 
            const [pdaNft2, pdaAta2, myAta2] = await mintNftToPda(); 
            const [pdaNft3, pdaAta3, myAta3] = await mintNftToPda(); 

            const ticket1AccountMeta = createTransferAccountMeta(pdaNft1.address, pdaAta1, myAta1);
            const ticket2AccountMeta = createTransferAccountMeta(pdaNft2.address, pdaAta2, myAta2);
            const ticket3AccountMeta = createTransferAccountMeta(pdaNft3.address, pdaAta3, myAta3);

            const combinedTransferAccountMetas = [...ticket1AccountMeta, ...ticket2AccountMeta, ...ticket3AccountMeta];

            const transferTicketIx = await program.methods.transferNftFromPda()
                .accounts({
                    payer: testKeypair.publicKey,
                    authority: vaultPDA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    userBurnInfo: userBurnInfo,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .signers([testKeypair])
                .remainingAccounts(combinedTransferAccountMetas)
                .instruction();

            // main (BURN) instruction
            const [nft1, ata1] = await mintToken();
            const [nft2, ata2] = await mintToken();
            const [nft3, ata3] = await mintToken();

            let mint1AccountMeta = createBurnAccountMeta(nft1.address, nft1.metadataAddress, nft1.edition.address, ata1);
            let mint2AccountMeta = createBurnAccountMeta(nft2.address, nft2.metadataAddress, nft2.edition.address, ata2);
            let mint3AccountMeta = createBurnAccountMeta(nft3.address, nft3.metadataAddress, nft3.edition.address, ata3);

            let combinedAccountMeta = [...mint1AccountMeta, ...mint2AccountMeta, ...mint3AccountMeta];

            console.log("Runs \"burn\" ix...");
            const burnIx = await program.methods.burn()
                .accounts({
                    authority: testKeypair.publicKey,
                    feesReceiver: testKeypair.publicKey,
                    userBurnInfo: userBurnInfo,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .remainingAccounts(combinedAccountMeta)
                .signers([testKeypair])
                .preInstructions([initIx])
                .postInstructions([transferTicketIx])
                .rpc({
                    skipPreflight: true
                });

                console.log("Burn tx hash: ", burnIx);
        } catch (error) {
            console.log("An error occurred: ", error);
        }
    })

    it.skip("burns 4 NFTs and transfers fees", async () => {
        const [nft1, ata1] = await mintToken();
        const [nft2, ata2] = await mintToken();
        const [nft3, ata3] = await mintToken();
        const [nft4, ata4] = await mintToken();

        let mint1AccountMeta = createBurnAccountMeta(nft1.address, nft1.metadataAddress, nft1.edition.address, ata1);
        let mint2AccountMeta = createBurnAccountMeta(nft2.address, nft2.metadataAddress, nft2.edition.address, ata2);
        let mint3AccountMeta = createBurnAccountMeta(nft3.address, nft3.metadataAddress, nft3.edition.address, ata3);
        let mint4AccountMeta = createBurnAccountMeta(nft4.address, nft4.metadataAddress, nft4.edition.address, ata4);

        let combinedAccountMeta = [...mint1AccountMeta, ...mint2AccountMeta, ...mint3AccountMeta, ...mint4AccountMeta];

        console.log("Runs \"burn\" ix...");
        const tx = await program.methods.burn()
            .accounts({
                authority: testKeypair.publicKey,
                feesReceiver: testKeypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .remainingAccounts(combinedAccountMeta)
            .signers([testKeypair])
            .rpc({
                skipPreflight: true
            });

        console.log("Burning transaction signature", tx);

        // TODO: add an assertion (TA doesn't exist and mint has 0 supply)
    });

    // Set "it.skip()" in case you have a PDA initialized already
    it.skip("initializes the PDA account", async () => {
        console.log("Initializing PDA...");

        const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("authority"),
            ],
            program.programId
        )[0];

        try {
            const tx = await program.methods.initialize()
                .accounts({
                    signer: testKeypair.publicKey,
                    pdaAccount: vaultPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([testKeypair])
                .rpc({
                    skipPreflight: true
                });

            console.log("Init transaction signature", tx);
        } catch (error) {
            console.log("An error occurred initializing the PDA account: ", error);
        }
    })

    it.skip("sends a token (ticket) from the PDA", async () => {
        // uncomment this in case you already initialized the PDA account and comment the "findProgramAddressSync" method
        const vaultPDA = "1XKyJWhajCumUmPcqt3VxARoK2CuTx9ZqChNjN2u5aJ";

        // const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
        //     [
        //         anchor.utils.bytes.utf8.encode("authority"),
        //     ],
        //     program.programId
        // )[0];

        console.log("Minting NFT and transferring to PDA...")

        try {
            const [nft, pdaAta, myAta] = await mintNftToPda();
            const transferAccountMeta = createTransferAccountMeta(nft.address, pdaAta, myAta);

            const initIx = await program.methods.initialize()
                .accounts({
                    signer: testKeypair.publicKey,
                    pdaAccount: vaultPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([testKeypair])
                .instruction();

            const tx = await program.methods.transferNftFromPda()
                .accounts({
                    payer: testKeypair.publicKey,
                    authority: vaultPDA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .signers([testKeypair])
                .remainingAccounts(transferAccountMeta)
                .postInstructions([initIx])
                .rpc({
                    skipPreflight: true
                });

            console.log("Transfer transaction signature", tx);
        } catch (error) {
            console.log("An error occcured while minting and transferring NFT from PDA: ", error);
        }
    })
});
