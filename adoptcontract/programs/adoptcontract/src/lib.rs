use anchor_lang::{prelude::*, solana_program::program::invoke, system_program};
use anchor_spl::{token::{Token, TokenAccount, Transfer, transfer, Mint}, associated_token::AssociatedToken};
use mpl_token_metadata::{instruction::burn_nft, ID as TOKEN_METADATA_PROGRAM_ID};

declare_id!("WK2HDpKKafvGms55U4WgeD9RkgshRcHsddndja4ooeY");

#[program]
pub mod adoptcontract {
    use super::*;

    const ADDITIONAL_TX_FEE: u64 = 100_000_000; // 0.1 SOL per 1 NFT burn
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

        // Transfer a ticket

        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let bump = *ctx.bumps.get("pda_account").ok_or(ErrorCode::CannotGetBump)?;
        ctx.accounts.pda_account.bump_seed = bump;

        Ok(())
    }

    pub fn transfer_nft_from_pda(ctx: Context<SendTicket>) -> Result<()> {
        // bump check 
        let bump = *ctx.bumps.get("authority").ok_or(ErrorCode::CannotGetBump)?;
        assert_eq!(bump, ctx.accounts.authority.bump_seed);

        // creates an array of seeds to sign on behalf of the PDA
        let seeds = &["authority".as_bytes(), &[*ctx.bumps.get("authority").unwrap()]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.ata_to_send_from.to_account_info(),
                to: ctx.accounts.ata_to_receive_ticket.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            &signer,
        );

        transfer(cpi_ctx, 1)?;

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

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        seeds = [b"authority".as_ref()],
        space = NftsValutAccount::SIZE,
        bump,
        payer = signer,
    )]
    pub pda_account: Account<'info, NftsValutAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendTicket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: constraint checks
    #[account(
        mut,
        seeds = [b"authority".as_ref()],
        bump
        // address = "address" @ WrongPDAAddress
    )]
    pub authority: Account<'info, NftsValutAccount>,
    #[account(
        mut,
        token::mint = mint,
        token::authority = authority
    )]
    pub ata_to_send_from: Account<'info, TokenAccount>,
    #[account(
        mut,
        mint::decimals = 0
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub ata_to_receive_ticket: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct NftsValutAccount {
    pub bump_seed: u8,
}
impl NftsValutAccount {
    const SIZE: usize = 8 + 8; // 8 - descriminator, 8 - u64;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wrong remaining accounts chunk (should be 4 in each one)")]
    WrongRemainingAccountsChunk,
    #[msg("Wrong PDA address, must be 'address'.")]
    WrongPDAAddress,
    #[msg("Cannot get the bump of the Vault PDA")]
    CannotGetBump
}
