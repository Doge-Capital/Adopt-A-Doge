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

    const mintNftToPda = async (): Promise<[Nft, anchor.web3.PublicKey]> => {
        const valutPda = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("authority")
            ],
            program.programId
        )[0];

        console.log("Minting an NFT...");
        const { nft } = await metaplex.nfts().create({
            uri: "",
            name: "My NFT",
            sellerFeeBasisPoints: 500, // Represents 5.00%.
        });

        console.log("NFT created (mint): " + nft.address + "\n" + "NFT name: " + nft.name + "\n" + "NFT Metadata: " + nft.metadataAddress + "\n" + "NFT Edition: " + nft.edition.address);

        const nftATA = await getAssociatedTokenAddress(nft.address, valutPda, true);
        const myATA = await getAssociatedTokenAddress(nft.address, test_keypair.publicKey);

        const send_tx = await metaplex.nfts().transfer({
            nftOrSft: nft,
            authority: test_keypair,
            fromOwner: test_keypair.publicKey,
            fromToken: myATA,
            toOwner: valutPda,
            toToken: nftATA,
        }, { commitment: "finalized" });

        console.log(`Transfer to PDA transaction signature: ${await send_tx.response.signature}`);

        const updatedNft = await metaplex.nfts().findByMint({
            mintAddress: nft.address,
            tokenOwner: valutPda
        }) as Nft;

        console.log("NFT Token Account (PDA TA): " + nftATA);

        return [updatedNft, nftATA];
    };

    const createAccountMeta = (mint: anchor.web3.PublicKey, metadata: anchor.web3.PublicKey, edition: anchor.web3.PublicKey, ata: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mint, isWritable: true, isSigner: false },
            { pubkey: metadata, isWritable: true, isSigner: false },
            { pubkey: edition, isWritable: true, isSigner: false },
            { pubkey: ata, isWritable: true, isSigner: false },
        ];
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

    it.skip("burns 4 NFTs and transfers fees", async () => {
        const [nft1, ata1] = await mintToken();
        const [nft2, ata2] = await mintToken();
        const [nft3, ata3] = await mintToken();
        const [nft4, ata4] = await mintToken();

        let mint1AccountMeta = createAccountMeta(nft1.address, nft1.metadataAddress, nft1.edition.address, ata1);
        let mint2AccountMeta = createAccountMeta(nft2.address, nft2.metadataAddress, nft2.edition.address, ata2);
        let mint3AccountMeta = createAccountMeta(nft3.address, nft3.metadataAddress, nft3.edition.address, ata3);
        let mint4AccountMeta = createAccountMeta(nft4.address, nft4.metadataAddress, nft4.edition.address, ata4);

        let combinedAccountMeta = [...mint1AccountMeta, ...mint2AccountMeta, ...mint3AccountMeta, ...mint4AccountMeta];

        console.log("Runs \"burn\" ix...");
        const tx = await program.methods.burn()
            .accounts({
                authority: test_keypair.publicKey,
                feesReceiver: test_keypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .remainingAccounts(combinedAccountMeta)
            .signers([test_keypair])
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
                    signer: test_keypair.publicKey,
                    pdaAccount: vaultPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([test_keypair])
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
            const [nft, pdaAta] = await mintNftToPda();

            const myATA = await getAssociatedTokenAddress(nft.address, test_keypair.publicKey);

            const tx2 = await program.methods.initialize()
                .accounts({
                    signer: test_keypair.publicKey,
                    pdaAccount: vaultPDA,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([test_keypair])
                .instruction();

            const tx = await program.methods.transferNftFromPda()
                .accounts({
                    payer: test_keypair.publicKey,
                    authority: vaultPDA,
                    ataToSendFrom: pdaAta,
                    mint: nft.mint.address,
                    ataToReceiveTicket: myATA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .signers([test_keypair])
                .postInstructions([tx2])
                .rpc({
                    skipPreflight: true
                });

            console.log("Transfer transaction signature", tx);
        } catch (error) {
            console.log("An error occcured while minting and transferring NFT from PDA: ", error);
        }
    })

    it("inits, burns and transfers a ticket", async () => {
        const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("authority"),
            ],
            program.programId
        )[0];

        try {
            // INIT instruction, uncomment if you havent initialized a PDA yet and add that to the main burn instruction
            // as "preInstruction([initTx])"

            // const initIx = await program.methods.initialize()
            //     .accounts({
            //         signer: test_keypair.publicKey,
            //         pdaAccount: vaultPDA,
            //         systemProgram: anchor.web3.SystemProgram.programId,
            //     })
            //     .signers([test_keypair])
            //     instruction();

            // TRANSFER ticket instruction
            const [nft, pdaAta] = await mintNftToPda();
            const myATA = await getAssociatedTokenAddress(nft.address, test_keypair.publicKey);

            const transferTicketIx = await program.methods.transferNftFromPda()
                .accounts({
                    payer: test_keypair.publicKey,
                    authority: vaultPDA,
                    ataToSendFrom: pdaAta,
                    mint: nft.mint.address,
                    ataToReceiveTicket: myATA,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .signers([test_keypair])
                .instruction();

            // main (BRUN) instruction
            const [nft1, ata1] = await mintToken();
            const [nft2, ata2] = await mintToken();
            const [nft3, ata3] = await mintToken();

            let mint1AccountMeta = createAccountMeta(nft1.address, nft1.metadataAddress, nft1.edition.address, ata1);
            let mint2AccountMeta = createAccountMeta(nft2.address, nft2.metadataAddress, nft2.edition.address, ata2);
            let mint3AccountMeta = createAccountMeta(nft3.address, nft3.metadataAddress, nft3.edition.address, ata3);

            let combinedAccountMeta = [...mint1AccountMeta, ...mint2AccountMeta, ...mint3AccountMeta];

            console.log("Runs \"burn\" ix...");
            const burnIx = await program.methods.burn()
                .accounts({
                    authority: test_keypair.publicKey,
                    feesReceiver: test_keypair.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .remainingAccounts(combinedAccountMeta)
                .signers([test_keypair])
                .postInstructions([transferTicketIx])
                .rpc({
                    skipPreflight: true
                });

                console.log("Burn tx hash: ", burnIx);
        } catch (error) {
            console.log("An error occurred: ", error);
        }
    })
});
