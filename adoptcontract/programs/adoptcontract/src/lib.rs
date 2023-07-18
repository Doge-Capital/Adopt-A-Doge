use anchor_lang::prelude::*;

declare_id!("GntfZtKwsEZyygp35RM5ooBuHirNBCEdcnGSGByAgEtF");

#[program]
pub mod adoptcontract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
