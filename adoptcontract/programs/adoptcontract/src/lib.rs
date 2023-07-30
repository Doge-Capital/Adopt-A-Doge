use anchor_lang::{prelude::*, solana_program::program::invoke, system_program};
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::{instruction::burn_nft, ID as TOKEN_METADATA_PROGRAM_ID};

declare_id!("DruXG4fVzPmdsfMqjNyrUaBv5aTvLnP9G43jemUcX1J1");

#[program]
pub mod adoptcontract {
    use super::*;

    // Since we're gonna burn NFTs, we don't need to provide any bigger number for the "approve_token" ix per ATA
    // const ONE: u64 = 1;

    const ADDITIONAL_TX_FEE: u64 = 8_000_000; // 0.008 SOL

    pub fn burn_nfts(ctx: Context<BurnNFTs>) -> Result<()> {
        msg!("Burning NFT...");

        invoke(
            &burn_nft(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.authority.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.from.key(),
                ctx.accounts.master_edition.key(),
                ctx.accounts.token_program.key(),
                None,
            ),
            &[
                ctx.accounts.token_metadata_program.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.from.to_account_info(),
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        msg!("NFT was burnt: {}", ctx.accounts.mint.key());

        // Charge additional fee
        msg!("Transferring additional fee...");

        let cpi_accounts_fee = system_program::Transfer {
            from: ctx.accounts.authority.to_account_info().clone(),
            to: ctx.accounts.fees_receiver.to_account_info().clone(),
        };
        let cpi_program_fee = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_fee = CpiContext::new(cpi_program_fee, cpi_accounts_fee);
        system_program::transfer(cpi_ctx_fee, ADDITIONAL_TX_FEE)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BurnNFTs<'info> {
    /// CHECK: checks with constraints
    #[account(
        mut,
        seeds = [b"metadata", TOKEN_METADATA_PROGRAM_ID.as_ref(), mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    #[account(
        mut, 
        mint::decimals = 0
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = authority
    )]
    pub from: Account<'info, TokenAccount>,
    /// CHECK: we'll add a particular hard-coded address to the constraints
    #[account(
        mut,
        // TODO!  -  address = FEES_RECEIVER_ADDRESS
    )]
    pub fees_receiver: AccountInfo<'info>,
    /// CHECK: checks with constraints
    #[account(
        mut,
        seeds = [b"metadata", TOKEN_METADATA_PROGRAM_ID.as_ref(), mint.key().as_ref(), b"edition"],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK: Metaplex checks this
    pub token_metadata_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("")]
    ErrorName,
}
