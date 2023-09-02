import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Adoptcontract } from "../target/types/adoptcontract";
import { Metaplex, Nft, keypairIdentity } from "@metaplex-foundation/js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import * as fs from 'fs';

const mintNftToPda = async (): Promise<[Nft, anchor.web3.PublicKey, anchor.web3.PublicKey]> => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;

    const decodedKey = new Uint8Array(JSON.parse(fs.readFileSync("/Users/elijah/Adopt-A-Doge/adoptcontract/tests/testKeypair.json").toString()));
    const testKeypair = await anchor.web3.Keypair.fromSecretKey(decodedKey);

    const metaplex = Metaplex.make(provider.connection)
        .use(keypairIdentity(testKeypair));

    const valutPda = anchor.web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("authority")
        ],
        program.programId
    )[0];

    console.log("Minting an NFT...");
    const { nft } = await metaplex.nfts().create({
        uri: "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json",
        name: "TICKET",
        sellerFeeBasisPoints: 500, // Represents 5.00%.
        creators: [{ address: provider.wallet.publicKey, share: 100 }],

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
    });

    console.log(`Transfer to PDA transaction signature: ${await send_tx.response.signature}`);

    const updatedNft = await metaplex.nfts().findByMint({
        mintAddress: nft.address,
        tokenOwner: valutPda
    }) as Nft;

    console.log("NFT Token Account (PDA TA): " + nftATA + "\n" + "*--------------------*" + "\n");

    return [updatedNft, nftATA, myATA];
};

const mintNfts = async() => {
    const nftToMint: number = 2;

    for (let i = 0; i < nftToMint; i++) {
        await mintNftToPda();
    }
}

mintNfts().catch((error) => console.error(error));