"use client"

import { Metadata, Metaplex, Nft, walletAdapterIdentity } from "@metaplex-foundation/js";
import idl from "../../adoptcontract/target/idl/adoptcontract.json";
import { Adoptcontract } from "../../adoptcontract/target/types/adoptcontract"
import * as anchor from "@project-serum/anchor";
import { AnchorWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AccountMeta, Transaction, TransactionInstruction } from "@solana/web3.js";
import { FC, createContext, useContext, useEffect, useState } from "react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync } from "@solana/spl-token";

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
    burnNfts: (nfts: Array<Metadata>) => Promise<string>;
    connection: anchor.web3.Connection;
    wallet: AnchorWallet | undefined;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export const ProgramProvider: FC<Props> = ({ children }) => {
    const [program, setProgram] = useState<anchor.Program<Adoptcontract>>(null!);
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const metaplex = wallet && Metaplex.make(connection).use(walletAdapterIdentity(wallet));

    const programId = new anchor.web3.PublicKey(idl.metadata.address);
    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

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
        console.log("Vault's address: " + vaultPDA.toBase58());
        getProgram();
    }, [wallet]);

    const createBurnAccountMeta = (mint: anchor.web3.PublicKey, metadata: anchor.web3.PublicKey, edition: anchor.web3.PublicKey, ata: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mint, isWritable: true, isSigner: false },
            { pubkey: metadata, isWritable: true, isSigner: false },
            { pubkey: edition, isWritable: true, isSigner: false },
            { pubkey: ata, isWritable: true, isSigner: false },
        ];
    };

    const createTransferAccountMeta = (mintAddress: anchor.web3.PublicKey, nftAta: anchor.web3.PublicKey, myAta: anchor.web3.PublicKey): Array<AccountMeta> => {
        return [
            { pubkey: mintAddress, isWritable: true, isSigner: false },
            { pubkey: nftAta, isWritable: true, isSigner: false },
            { pubkey: myAta, isWritable: true, isSigner: false },
        ];
    };

    const getNftsAccountMetaArray = async (nfts: Metadata[]): Promise<Array<AccountMeta>> => {
        let nftsAccountMetaArray: Array<AccountMeta> = [];

        for (const nft of nfts) {
            const loadedNft = await metaplex?.nfts().load({ metadata: nft }) as Nft;

            if (loadedNft) {
                const nftAta = wallet && await getAssociatedTokenAddress(loadedNft.address, wallet?.publicKey);
                const nftAccountMeta = nftAta && createBurnAccountMeta(loadedNft.address, loadedNft.metadataAddress, loadedNft.edition.address, nftAta);

                if (nftAccountMeta) {
                    nftsAccountMetaArray = nftsAccountMetaArray.concat(nftAccountMeta);
                }
            }
        };

        return nftsAccountMetaArray;
    }

    const getTicketsAccountMetaArray = async (amount: number): Promise<Array<AccountMeta>> => {
        const nfts = wallet && await metaplex?.nfts().findAllByOwner({ owner: vaultPDA }) as Metadata[];
        if (nfts && nfts.length > 0) {
            for (const nft of nfts) {
                console.log("ticket mint address: " + nft.mintAddress);
            }
        } else {
            throw new Error("Zero tickets were found in the PDA, contact the Adopt a Doge team.");
        }

        const ticketsMetadata: Metadata[] = [];

        for (let i = 0; i < amount; i++) {
            console.log("TICKET'S MINT TO BE SENT: " + nfts[0].mintAddress);
            ticketsMetadata.push(nfts.splice(0, 1)[0]);
        }

        let ticketsAccountMetaArray: Array<AccountMeta> = [];

        if (ticketsMetadata.length > 0) {
            for (const ticket of ticketsMetadata) {
                const nftAta = wallet && await getAssociatedTokenAddress(ticket.mintAddress, vaultPDA, true);
                const myAta = wallet && await getAssociatedTokenAddress(ticket.mintAddress, wallet?.publicKey);

                const ticketAccountMeta = nftAta && myAta && createTransferAccountMeta(ticket.mintAddress, nftAta, myAta);

                if (ticketAccountMeta) {
                    ticketsAccountMetaArray = ticketsAccountMetaArray.concat(ticketAccountMeta);
                }
            }
        }

        return ticketsAccountMetaArray;
    }

    const burnNfts = async (nfts: Metadata[]): Promise<string> => {
        if (!wallet) { throw new Error("No wallet connected!") }

        const nftsAccountMetaArray = await getNftsAccountMetaArray(nfts);
        const ticketsAccountMetaArray = await getTicketsAccountMetaArray(nfts.length);

        if (ticketsAccountMetaArray.length < nftsAccountMetaArray.length && ticketsAccountMetaArray.length === 0) {
            throw new Error("Insufficient tickets in the vault, contact the Adopt A Doge team to top it up");
        }
        if (nftsAccountMetaArray.length === 0) {
            throw new Error("Zero NFTs to be burnt, try one more time or contact the Adopt A Doge team");
        }

        const userBurnInfo = anchor.web3.PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("burnstate"),
                wallet.publicKey.toBuffer()
            ],
            programId
        )[0];

        const transferTicketIx = await program.methods.transferNftFromPda()
            .accounts({
                payer: wallet.publicKey,
                authority: vaultPDA,
                tokenProgram: TOKEN_PROGRAM_ID,
                userBurnInfo: userBurnInfo,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
            })
            .remainingAccounts(ticketsAccountMetaArray)
            .instruction();

        const burnIx = await program.methods.burn()
            .accounts({
                authority: wallet.publicKey,
                feesReceiver: wallet.publicKey,
                userBurnInfo: userBurnInfo,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .remainingAccounts(nftsAccountMetaArray)
            .postInstructions([transferTicketIx])
            .rpc();

        return burnIx as string
    }

    return (
        <ProgramContext.Provider value={{ burnNfts, connection, wallet }}>
            {children}
        </ProgramContext.Provider>
    );
}