import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Adoptcontract } from "../target/types/adoptcontract";
import { Metaplex, Nft, Sft, keypairIdentity, toBigNumber, } from "@metaplex-foundation/js";
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as fs from 'fs';

const mintSftToPda = async (): Promise<[Nft, anchor.web3.PublicKey, anchor.web3.PublicKey]> => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;

    // setting up a devnet connection, because we want this test to work on devnet only
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com");

    // create a testKeypair.json file with an array of bytes representing a keypair
    const decodedKey = new Uint8Array(JSON.parse(fs.readFileSync("/Users/elijah/Adopt-A-Doge/adoptcontract/tests/testKeypair.json").toString()));
    const testKeypair = await anchor.web3.Keypair.fromSecretKey(decodedKey);

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(testKeypair));

    const valutPda = anchor.web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("authority")
        ],
        program.programId
    )[0];

    console.log("Minting an pNFT...");
    const { nft } = await metaplex.nfts().create({
        uri: "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json",
        name: "TICKET DEVNET pNFT",
        sellerFeeBasisPoints: 500, // Represents 5.00%.
        creators: [{ address: provider.wallet.publicKey, share: 100 }],
        tokenStandard: TokenStandard.ProgrammableNonFungible,
    }, { commitment: "finalized" });

    console.log("SFT created (mint): " + nft.mint.address + "\n" + "NFT name: " + nft.name + "\n" + "NFT Metadata: " + nft.metadataAddress);

    const nftATA = await getAssociatedTokenAddress(nft.mint.address, valutPda, true);
    const myATA = await getAssociatedTokenAddress(nft.mint.address, testKeypair.publicKey);

    console.log("sft ata: " + nftATA);
    console.log("my ata: " + myATA);

    // const mint_tx = await metaplex.tokens().mint({
    //     mintAddress: nft.mint.address,
    //     amount: {
    //         basisPoints: toBigNumber(500), currency: {
    //             symbol: "TCKT",
    //             decimals: 0,
    //             namespace: "spl-token"
    //         }
    //     },
    //     toOwner: vaultPda
    // })
    // console.log("Mint tx: " +  mint_tx.response.signature);

    // const send_tx = await metaplex.tokens().send({
    //     mintAddress: sft.mint.address,
    //     amount: {
    //         basisPoints: toBigNumber(490), currency: {
    //             symbol: "TCKT",
    //             decimals: 0,
    //             namespace: "spl-token"
    //         }
    //     },
    //     toToken: nftATA
    // });

    // console.log(`Transfer to PDA transaction signature: ${send_tx.response.signature}`);

    const updatedSft = await metaplex.nfts().findByMint({
        mintAddress: nft.mint.address,
        tokenOwner: valutPda
    }) as Nft;

    console.log("NFT Token Account (PDA TA): " + nftATA + "\n" + "*--------------------*" + "\n");

    return [updatedSft, nftATA, myATA];
};

mintSftToPda().catch((error) => console.error(error));