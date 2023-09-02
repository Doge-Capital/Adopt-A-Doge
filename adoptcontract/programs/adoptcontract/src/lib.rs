use anchor_lang::{prelude::*, solana_program::program::invoke, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Token, TransferChecked},
};
use mpl_token_metadata::{instruction::burn_nft, ID as TOKEN_METADATA_PROGRAM_ID};

declare_id!("AADPftBL56zsjQZcCU6XhCKGpq3C2eSLeWcW26rjmjnG");

#[program]
pub mod adoptcontract {
    use super::*;

    const ADDITIONAL_TX_FEE: u64 = 100_000_000; // 0.1 SOL per 1 NFT burn
    const FOUR: u64 = 4;
    const THREE: u64 = 3;
    const ONE: u64 = 1;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let bump = *ctx
            .bumps
            .get("pda_account")
            .ok_or(ErrorCode::CannotGetBump)?;
        ctx.accounts.pda_account.bump_seed = bump;

        Ok(())
    }

    pub fn burn<'info>(ctx: Context<'_, '_, '_, 'info, BurnNFT<'info>>) -> Result<()> {
        msg!("Burning NFTs...");
        let user_info = &mut ctx.accounts.user_burn_info;
        user_info.nfts_burnt = 0;

        // Creates an iterator over the remaining accounts
        let mut remaining_accounts_iter = ctx.remaining_accounts.iter();
        let nfts_to_burn: u64 = (ctx.remaining_accounts.len() as u64)
            .checked_div(FOUR)
            .unwrap();

        // Since we need to iterate over 4 "remaining accounts" at once, we need to slice all of them by 4
        for chunk in remaining_accounts_iter
            .by_ref()
            .collect::<Vec<_>>()
            .chunks(FOUR as usize)
        {
            if chunk.len() != FOUR as usize {
                return err!(ErrorCode::WrongBurnRemainingAccountsChunk);
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

            user_info.nfts_burnt = user_info.nfts_burnt.checked_add(ONE).unwrap();
        }

        msg!("NFTs burnt: {}", user_info.nfts_burnt);
        if user_info.nfts_burnt <= 0 {
            return err!(ErrorCode::ZeroBurnsOccured);
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

    pub fn transfer_nft_from_pda<'info>(
        ctx: Context<'_, '_, '_, 'info, SendTicket<'info>>,
    ) -> Result<()> {
        msg!("Transferring tickets...");
        let user_info = &mut ctx.accounts.user_burn_info;

        // allowed number of tickets to receive validation
        if user_info.nfts_burnt <= 0 as u64 {
            return err!(ErrorCode::ZeroUserPdaBurns);
        }

        // PDA's bump validation
        let bump = *ctx.bumps.get("authority").ok_or(ErrorCode::CannotGetBump)?;
        assert_eq!(bump, ctx.accounts.authority.bump_seed);

        // Creates an array of seeds to sign on behalf of the authority PDA
        let seeds = &[
            "authority".as_bytes(),
            &[*ctx.bumps.get("authority").unwrap()],
        ];
        let signer = [&seeds[..]];

        // Creates an iterator over the remaining accounts
        let mut remaining_accounts_iter = ctx.remaining_accounts.iter();
        let tickets_to_send: u64 = (ctx.remaining_accounts.len() as u64)
            .checked_div(THREE)
            .unwrap();

        if user_info.nfts_burnt as u64 != tickets_to_send {
            return err!(ErrorCode::BurnsNotEqualToTicketsToReceive);
        }

        // Since we need to iterate over 3 "remaining accounts" at once, we need to slice all of them by 3
        for chunk in remaining_accounts_iter
            .by_ref()
            .collect::<Vec<_>>()
            .chunks(THREE as usize)
        {
            if chunk.len() != THREE as usize {
                return err!(ErrorCode::WrongTransferRemainingAccountsChunk);
            }

            // We don't need to check all of them, because Token Program
            // will do that for us and return an error if the layout or authority is wrong
            let mint_account = chunk[0];
            let pda_ata = chunk[1];
            let user_pda = chunk[2];

            // Create context for the transfer instruction
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: pda_ata.to_account_info(),
                    mint: mint_account.to_account_info(),
                    to: user_pda.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &signer,
            );

            transfer_checked(cpi_ctx, 1, 0)?;

            user_info.nfts_burnt = user_info.nfts_burnt.checked_sub(ONE).unwrap();
        }

        // Reset to 0 after a transfer is completed just in case
        user_info.nfts_burnt = 0;
        msg!("{} tickets were transferred", tickets_to_send);
        msg!(
            "Remaining burns after the transfer IX: {}",
            user_info.nfts_burnt
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        mut,
        address = Pubkey::try_from("SDCcPraNtvK4XPk5XASqYExWyEPrH9YAnEwm6Hcuz3U").unwrap() @ ErrorCode::WrongAdminAddress
    )]
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
pub struct BurnNFT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: we'll add a particular hard-coded address to the constraints
    #[account(
        mut,
        address = Pubkey::try_from("SDCcPraNtvK4XPk5XASqYExWyEPrH9YAnEwm6Hcuz3U").unwrap() @ ErrorCode::WrongFeesReceiverAddress
    )]
    pub fees_receiver: AccountInfo<'info>,
    /// CHECK: address check
    #[account(
        address = TOKEN_METADATA_PROGRAM_ID
    )]
    pub token_metadata_program: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = UserBurnInfo::SIZE,
        seeds = [b"burnstate".as_ref(), authority.key.as_ref()],
        bump,
    )]
    pub user_burn_info: Account<'info, UserBurnInfo>,
    pub token_program: Program<'info, Token>,
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
        seeds = [b"burnstate".as_ref(), payer.key.as_ref()],
        bump,
    )]
    pub user_burn_info: Account<'info, UserBurnInfo>,
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
    const SIZE: usize = 8 + 1; // 8 - descriminator, 1 - u8;
}

#[account]
pub struct UserBurnInfo {
    pub nfts_burnt: u64,
}

impl UserBurnInfo {
    const SIZE: usize = 8 + 8; // 8 - descriminator, 8 - u8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wrong remaining accounts chunk (should be 4 in each one)")]
    WrongBurnRemainingAccountsChunk,
    #[msg("Wrong remaining accounts chunk (should be 3 in each one)")]
    WrongTransferRemainingAccountsChunk,
    #[msg("Can't receive a ticket, not enough burns")]
    ZeroUserPdaBurns,
    #[msg("Burns number isn't equal to number of tickets to receive")]
    BurnsNotEqualToTicketsToReceive,
    #[msg("Wrong authority PDA address")]
    WrongPDAAddress,
    #[msg("Cannot get the bump of the Vault PDA")]
    CannotGetBump,
    #[msg("Wrong address for the Init ix")]
    WrongAdminAddress,
    #[msg("Wrong fees receiver address")]
    WrongFeesReceiverAddress,
    #[msg("No burns occured, reverting transaction")]
    ZeroBurnsOccured,
}
