use anchor_lang::{prelude::*, solana_program::program::invoke, system_program};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        burn, close_account, transfer_checked, Burn, CloseAccount, Mint, Token, TokenAccount,
        TransferChecked,
    },
};
use mpl_token_metadata::{instruction::burn_nft, ID as TOKEN_METADATA_PROGRAM_ID};

declare_id!("AADPftBL56zsjQZcCU6XhCKGpq3C2eSLeWcW26rjmjnG");

#[program]
pub mod adoptcontract {
    use super::*;

    const ADDITIONAL_TX_FEE: u64 = 100_000_000; // 0.1 SOL per 1 NFT burn
    const ONE: u64 = 1;
    const TWO: u64 = 2;
    const FOUR: u64 = 4;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let bump = *ctx
            .bumps
            .get("pda_account")
            .ok_or(ErrorCode::CannotGetBump)?;
        ctx.accounts.pda_account.bump_seed = bump;

        Ok(())
    }

    pub fn burn_nfts<'info>(ctx: Context<'_, '_, '_, 'info, BurnNFT<'info>>) -> Result<()> {
        msg!("Burning NFTs...");
        let user_info = &mut ctx.accounts.user_burn_info;

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

    pub fn burn_tokens<'info>(ctx: Context<'_, '_, '_, 'info, BurnToken<'info>>) -> Result<()> {
        msg!("Burning Tokens...");
        let user_info = &mut ctx.accounts.user_burn_info;

        // Creates an iterator over the remaining accounts
        let mut remaining_accounts_iter = ctx.remaining_accounts.iter();
        let mints_to_burn: u64 = (ctx.remaining_accounts.len() as u64)
            .checked_div(TWO)
            .unwrap();

        // Since we need to iterate over 4 "remaining accounts" at once, we need to slice all of them by 4
        for chunk in remaining_accounts_iter
            .by_ref()
            .collect::<Vec<_>>()
            .chunks(TWO as usize)
        {
            if chunk.len() != TWO as usize {
                return err!(ErrorCode::WrongBurnRemainingAccountsChunk);
            }

            // we don't need to check all of them, because Metaplex
            // will do that for us and return an error if the layout is wrong
            let mint_account = chunk[0];
            let from = chunk[1];

            let from_data =
                TokenAccount::try_deserialize(&mut &**from.try_borrow_data().unwrap()).unwrap();

            let burn_cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: mint_account.to_account_info(),
                    from: from.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            );

            let close_ata_cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: from.to_account_info(),
                    destination: ctx.accounts.authority.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            );

            burn(burn_cpi_ctx, from_data.amount)?;
            close_account(close_ata_cpi_ctx)?;

            user_info.nfts_burnt = user_info.nfts_burnt.checked_add(ONE).unwrap();
        }

        if user_info.nfts_burnt <= 0 {
            return err!(ErrorCode::ZeroBurnsOccured);
        }

        // Charge additional fee
        let fee: u64 = mints_to_burn * ADDITIONAL_TX_FEE;
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

        msg!("Current burns: {}", &ctx.accounts.user_burn_info.nfts_burnt);

        // allowed number of tickets to receive validation
        if ctx.accounts.user_burn_info.nfts_burnt <= 0 as u64 {
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

        // Create context for the transfer instruction
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.from.to_account_info(),
                mint: ctx.accounts.tickets_mint.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            &signer,
        );

        let amount_to_send: u64 = ctx.accounts.user_burn_info.nfts_burnt;
    
        transfer_checked(cpi_ctx, amount_to_send, 0)?;

        // refresh the state
        let user_info = &mut ctx.accounts.user_burn_info;
        user_info.nfts_burnt = 0;
        msg!(
            "Remaining burns after the transfer IX: {}",
            ctx.accounts.user_burn_info.nfts_burnt
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
        // address = Pubkey::try_from("C326k1ZK43BPfLGVzSBc8991L94a3X7XUvX9BSmJZLbb").unwrap() @ ErrorCode::WrongFeesReceiverAddress
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
pub struct BurnToken<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: we'll add a particular hard-coded address to the constraints
    #[account(
        mut,
        // address = Pubkey::try_from("C326k1ZK43BPfLGVzSBc8991L94a3X7XUvX9BSmJZLbb").unwrap() @ ErrorCode::WrongFeesReceiverAddress
    )]
    pub fees_receiver: AccountInfo<'info>,
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
    #[account(
        mut,
        seeds = [b"authority".as_ref()],
        bump
        // address = "address" @ WrongPDAAddress
    )]
    pub authority: Account<'info, NftsValutAccount>,
    #[account(
        mut,
        // address = Pubkey::try_from("Ha8S2T77GegYpcWh3L9REjx4pPYpy6hdu3zW4ERgdsmP").unwrap() @ ErrorCode::WrongTicketsMint
    )]
    pub tickets_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = tickets_mint,
        associated_token::authority = authority,
    )]
    pub from: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tickets_mint,
        associated_token::authority = payer,
    )]
    pub to: Account<'info, TokenAccount>,
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
    #[msg("Wrong mint account of the kenl tickets")]
    WrongTicketsMint,
}
