use anchor_lang::{prelude::*, solana_program::program::invoke, system_program};
use anchor_spl::token::Token;
use mpl_token_metadata::{instruction::burn_nft, ID as TOKEN_METADATA_PROGRAM_ID};

declare_id!("DruXG4fVzPmdsfMqjNyrUaBv5aTvLnP9G43jemUcX1J1");

#[program]
pub mod adoptcontract {
    use super::*;

    const ADDITIONAL_TX_FEE: u64 = 2_000_000; // 0.002 SOL per 1 NFT burn
    const FOUR: u64 = 4; // 4 accs in a chunk of remaining accounts per NFT

    pub fn burn<'info>(ctx: Context<'_, '_, '_, 'info, BurnNFT<'info>>) -> Result<()> {
        // Creates an iterator over the remaining accounts
        let mut remaining_accounts_iter = ctx.remaining_accounts.iter();
        let nfts_to_burn: u64 = ctx.remaining_accounts.len() as u64 / FOUR;

        // Since we need to iterate over 4 "remaining accounts" at once, we need to slice all of them by 4
        for chunk in remaining_accounts_iter
            .by_ref()
            .collect::<Vec<_>>()
            .chunks(4)
        {
            if chunk.len() != 4 {
                return err!(ErrorCode::WrongRemainingAccountsChunk);
            }

            // we don't need to check all of them, because Metaplex 
            // will do that for us and return an error if the layout is wrong
            let mint_account = chunk[0];
            let metadata_account = chunk[1];
            let edition_account = chunk[2];
            let ata = chunk[3];

            invoke(
                &burn_nft(
                    ctx.accounts.token_metadata_program.key(),
                    metadata_account.key(),
                    ctx.accounts.authority.key(),
                    mint_account.key(),
                    ata.key(),
                    edition_account.key(),
                    ctx.accounts.token_program.key(),
                    None,
                ),
                &[
                    ctx.accounts.token_metadata_program.to_account_info(),
                    metadata_account.to_account_info(),
                    ctx.accounts.authority.to_account_info(),
                    mint_account.to_account_info(),
                    ata.to_account_info(),
                    edition_account.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                ],
            )?;
        }

        // Charge additional fee
        let fee: u64 = nfts_to_burn * ADDITIONAL_TX_FEE;
        msg!("Transferring additional fee...");

        let cpi_accounts_fee = system_program::Transfer {
            from: ctx.accounts.authority.to_account_info().clone(),
            to: ctx.accounts.fees_receiver.to_account_info().clone(),
        };
        let cpi_program_fee = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_fee = CpiContext::new(cpi_program_fee, cpi_accounts_fee);
        system_program::transfer(cpi_ctx_fee, fee)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BurnNFT<'info> {
    pub authority: Signer<'info>,
    /// CHECK: we'll add a particular hard-coded address to the constraints
    #[account(
        mut,
        // TODO!  -  address = FEES_RECEIVER_ADDRESS
    )]
    pub fees_receiver: AccountInfo<'info>,
    /// CHECK: address check
    #[account(
        address = TOKEN_METADATA_PROGRAM_ID
    )]
    pub token_metadata_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wrong remaining accounts chunk (should be 4 in each one)")]
    WrongRemainingAccountsChunk,
}
