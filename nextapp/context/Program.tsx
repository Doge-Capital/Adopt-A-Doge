"use client"

import { DigitalAsset, fetchEdition, fetchEditionMarkerFromSeeds, findMetadataPda, findTokenRecordPda } from "@metaplex-foundation/mpl-token-metadata";
import idl from "../../adoptcontract/target/idl/adoptcontract.json";
import { Adoptcontract } from "../../adoptcontract/target/types/adoptcontract"
import * as anchor from "@project-serum/anchor";
import { AnchorWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AccountMeta, ConfirmedSignatureInfo, ParsedAccountData } from "@solana/web3.js";
import { FC, createContext, useContext, useEffect, useState } from "react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress} from "@solana/spl-token";
import { toast } from "react-hot-toast";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { PublicKey, Umi, unwrapOption } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";

export const useProgram = (): ProgramContextType => {
    const context = useContext(ProgramContext);
    if (!context) {
        throw new Error('useProgram must be used within the BurnNftsProvider');
    }
    return context;
}

type Props = {
    children?: React.ReactNode
}

interface ProgramContextType {
    burnNfts: (nfts: Array<DigitalAsset>) => Promise<string>;
    connection: anchor.web3.Connection;
    wallet: AnchorWallet | undefined;
    umi: Umi;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const ProgramProvider: FC<Props> = ({ children }) => {
    const [program, setProgram] = useState<anchor.Program<Adoptcontract>>(null!);
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const umi = createUmi(connection.rpcEndpoint);

    const programId = new anchor.web3.PublicKey("AAD24i9vjjW2RdrZvDpJptCfwfSPUQJtnKJ3kjjF8Kc8");
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const FEES_RECEIVER = new anchor.web3.PublicKey("C326k1ZK43BPfLGVzSBc8991L94a3X7XUvX9BSmJZLbb");
    const TICKETS_MINT_ADDRESS = new anchor.web3.PublicKey("Ha8S2T77GegYpcWh3L9REjx4pPYpy6hdu3zW4ERgdsmP");
    // for devnet testing 
    // const TICKETS_MINT_ADDRESS = new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z");

    const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("authority"),
        ],
        programId
    )[0];

    useEffect(() => {
        const getProgram = async () => {
            if (!wallet) {
                return;
            };

            const provider = new anchor.AnchorProvider(
                connection,
                wallet,
                {}
            );

            anchor.setProvider(provider);

            const program = new anchor.Program<Adoptcontract>(JSON.parse(JSON.stringify(idl)), programId, provider);
            setProgram(program);
        }
        getProgram();
    }, [wallet]);

    const createBurnNftAccountMeta = (mint: anchor.web3.PublicKey, metadata: anchor.web3.PublicKey, edition: anchor.web3.PublicKey, ata: anchor.web3.PublicKey, collectionMetadata?: anchor.web3.PublicKey, masterEditionMint?: anchor.web3.PublicKey, masterEdition?: anchor.web3.PublicKey, masterEditionTA?: anchor.web3.PublicKey, editionMarker?: anchor.web3.PublicKey, tokenRecord?: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mint, isWritable: true, isSigner: false },
            { pubkey: metadata, isWritable: true, isSigner: false },
            { pubkey: edition, isWritable: true, isSigner: false },
            { pubkey: ata, isWritable: true, isSigner: false },
            { pubkey: collectionMetadata ? collectionMetadata : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
            { pubkey: masterEditionMint ? masterEditionMint : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
            { pubkey: masterEdition ? masterEdition : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
            { pubkey: masterEditionTA ? masterEditionTA : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
            { pubkey: editionMarker ? editionMarker : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
            { pubkey: tokenRecord ? tokenRecord : new anchor.web3.PublicKey("4niSCMSdCw3Rh6dqjjEUeUUL4jhEyLAsKdFewZoZ4Z3Z"), isWritable: true, isSigner: false },
        ]
    };

    const createBurnTokenAccountMeta = (mintAddress: anchor.web3.PublicKey, nftAta: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mintAddress, isWritable: true, isSigner: false },
            { pubkey: nftAta, isWritable: true, isSigner: false },
        ];
    };

    const getNftsAccountMetaArray = async (nfts: DigitalAsset[]): Promise<{ nftsAccountMeta: Array<AccountMeta>, tokensAccountMeta: Array<AccountMeta> }> => {
        let nftsAccountMetaArray: Array<AccountMeta> = [];
        let tokensAccountMetaArray: Array<AccountMeta> = [];

        for (const nft of nfts) {
            console.log("Burning nft: " + nft.mint.publicKey);
            if (nft) {
                const nftAta = wallet && await getAssociatedTokenAddress(toWeb3JsPublicKey(nft.mint.publicKey), wallet.publicKey);

                if (nft.edition && nft.edition.publicKey && nftAta) {
                    let nftAccountMeta: any[] = [];
                    if (unwrapOption(nft.metadata.tokenStandard) === 4) {
                        const tokenRecordPubkey = findTokenRecordPda(umi, { mint: nft.mint.publicKey, token: fromWeb3JsPublicKey(nftAta) });

                        const collectionMetadata = findMetadataPda(umi, { mint: unwrapOption(nft.metadata.collection)?.key as PublicKey })[0];

                        nftAccountMeta = nftAta && createBurnNftAccountMeta(toWeb3JsPublicKey(nft.mint.publicKey), toWeb3JsPublicKey(nft.metadata.publicKey), toWeb3JsPublicKey(nft.edition?.publicKey), nftAta, toWeb3JsPublicKey(collectionMetadata), undefined, undefined, undefined, undefined, toWeb3JsPublicKey(tokenRecordPubkey[0]));
                    } else if (unwrapOption(nft.metadata.tokenStandard) === 0) {
                        const collectionMetadata = findMetadataPda(umi, { mint: unwrapOption(nft.metadata.collection)?.key as PublicKey })[0];

                        nftAccountMeta = nftAta && createBurnNftAccountMeta(toWeb3JsPublicKey(nft.mint.publicKey), toWeb3JsPublicKey(nft.metadata.publicKey), toWeb3JsPublicKey(nft.edition?.publicKey), nftAta, toWeb3JsPublicKey(collectionMetadata));
                    } else if (unwrapOption(nft.metadata.tokenStandard) === 3) {
                        const collectionMetadata = findMetadataPda(umi, { mint: unwrapOption(nft.metadata.collection)?.key as PublicKey })[0];

                        const masterEdition = (await fetchEdition(umi, nft.edition.publicKey)).parent;

                        const MasterEditionTxSignatures: ConfirmedSignatureInfo[] = await connection.getConfirmedSignaturesForAddress2(toWeb3JsPublicKey(masterEdition));
                        const firstSig = MasterEditionTxSignatures.reverse()[0].signature;
                        const txInfo = await connection.getParsedTransaction(firstSig);
                        const masterEditionFirstIxParsed = txInfo?.transaction.message.instructions[0] as anchor.web3.ParsedInstruction;

                        const masterEditionMint = new anchor.web3.PublicKey(masterEditionFirstIxParsed.parsed.info.newAccount);

                        const masterEditionMintData = await connection.getTokenLargestAccounts(masterEditionMint);
                        console.log("Largest Token accs: " + JSON.stringify(masterEditionMintData));

                        const masterEditionTA = new anchor.web3.PublicKey(masterEditionMintData.value[0].address);
                        console.log("TA found: " + JSON.stringify(masterEditionTA));

                        const editionMarker = (await fetchEditionMarkerFromSeeds(umi, { mint: fromWeb3JsPublicKey(masterEditionMint), editionMarker: "0" })).publicKey;

                        nftAccountMeta = nftAta && createBurnNftAccountMeta(toWeb3JsPublicKey(nft.mint.publicKey), toWeb3JsPublicKey(nft.metadata.publicKey), toWeb3JsPublicKey(nft.edition?.publicKey), nftAta, toWeb3JsPublicKey(collectionMetadata), masterEditionMint, toWeb3JsPublicKey(masterEdition), masterEditionTA, toWeb3JsPublicKey(editionMarker));
                    } else {
                        nftAccountMeta = createBurnNftAccountMeta(toWeb3JsPublicKey(nft.mint.publicKey), toWeb3JsPublicKey(nft.metadata.publicKey), toWeb3JsPublicKey(nft.edition?.publicKey), nftAta);
                    }


                    if (nftAccountMeta) {
                        nftsAccountMetaArray = nftsAccountMetaArray.concat(nftAccountMeta);
                    }
                } else {
                    const tokenAccountMeta = nftAta && createBurnTokenAccountMeta(toWeb3JsPublicKey(nft.mint.publicKey), nftAta);

                    if (tokenAccountMeta) {
                        tokensAccountMetaArray = tokensAccountMetaArray.concat(tokenAccountMeta);
                    }
                }
            }
        };

        return { nftsAccountMeta: nftsAccountMetaArray, tokensAccountMeta: tokensAccountMetaArray };
    }

    const burnNfts = async (nfts: DigitalAsset[]): Promise<string> => {
        if (!wallet) { throw new Error("No wallet connected!") }

        const accountsMetas = await getNftsAccountMetaArray(nfts);
        const ticketsAta = await getAssociatedTokenAddress(TICKETS_MINT_ADDRESS, vaultPDA, true);
        const walletAta = await getAssociatedTokenAddress(TICKETS_MINT_ADDRESS, wallet.publicKey);

        const ticketsAtaBalance = await connection.getTokenAccountBalance(ticketsAta);
        if (Number(ticketsAtaBalance.value.amount) <= 0) {
            throw new Error("Insufficient tickets in the vault, contact the Adopt A Doge team to top it up");
        }

        if (accountsMetas.nftsAccountMeta.length === 0 && accountsMetas.tokensAccountMeta.length === 0) {
            throw new Error("Zero NFTs to be burnt, try one more time or contact the Adopt A Doge team");
        }

        const userBurnInfo = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("burnstate"),
                wallet.publicKey.toBuffer()
            ],
            programId
        )[0];

        let burnIxsArray: anchor.web3.TransactionInstruction[] = [];

        if (accountsMetas.nftsAccountMeta.length > 0) {
            const burnNftsIx = await program.methods.burnNfts()
                .accounts({
                    authority: wallet.publicKey,
                    feesReceiver: FEES_RECEIVER,
                    userBurnInfo: userBurnInfo,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY
                })
                .remainingAccounts(accountsMetas.nftsAccountMeta)
                .instruction();

            burnIxsArray.push(burnNftsIx);
        }

        if (accountsMetas.tokensAccountMeta.length > 0) {
            const burnTokensIx = await program.methods.burnTokens()
                .accounts({
                    authority: wallet.publicKey,
                    feesReceiver: FEES_RECEIVER,
                    userBurnInfo: userBurnInfo,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId
                })
                .remainingAccounts(accountsMetas.tokensAccountMeta)
                .instruction();

            burnIxsArray.push(burnTokensIx);
        }

        const transferTicketsIx = await program.methods.transferNftFromPda()
            .accounts({
                payer: wallet.publicKey,
                authority: vaultPDA,
                ticketsMint: TICKETS_MINT_ADDRESS,
                from: ticketsAta,
                to: walletAta,
                tokenProgram: TOKEN_PROGRAM_ID,
                userBurnInfo: userBurnInfo,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
            })
            .preInstructions(burnIxsArray)
            .rpc({
                skipPreflight: true
            });

        console.log(transferTicketsIx);
        await connection.confirmTransaction(transferTicketsIx, "confirmed");
        return transferTicketsIx as string;
    }

    return (
        <ProgramContext.Provider value={{ burnNfts, connection, wallet, umi }}>
            {children}
        </ProgramContext.Provider>
    );
}