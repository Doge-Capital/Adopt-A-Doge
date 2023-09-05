import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Adoptcontract } from "../target/types/adoptcontract";

async function initVaultPda() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Adoptcontract as Program<Adoptcontract>;

    const vaultPDA = anchor.web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode("authority"),
        ],
        program.programId
    )[0];

    const initIx = await program.methods.initialize()
        .accounts({
            signer: provider.wallet.publicKey,
            pdaAccount: vaultPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

    console.log("Transaction hash: ", initIx);
}

initVaultPda().catch((error) => console.error(error));
