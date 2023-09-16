export type Adoptcontract = {
  "version": "0.1.0",
  "name": "adoptcontract",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pdaAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnNfts",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feesReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnTokens",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feesReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferNftFromPda",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketsMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nftsValutAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumpSeed",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userBurnInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftsBurnt",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongBurnRemainingAccountsChunk",
      "msg": "Wrong remaining accounts chunk (should be 4 in each one)"
    },
    {
      "code": 6001,
      "name": "WrongTransferRemainingAccountsChunk",
      "msg": "Wrong remaining accounts chunk (should be 3 in each one)"
    },
    {
      "code": 6002,
      "name": "ZeroUserPdaBurns",
      "msg": "Can't receive a ticket, not enough burns"
    },
    {
      "code": 6003,
      "name": "WrongPDAAddress",
      "msg": "Wrong authority PDA address"
    },
    {
      "code": 6004,
      "name": "CannotGetBump",
      "msg": "Cannot get the bump of the Vault PDA"
    },
    {
      "code": 6005,
      "name": "WrongAdminAddress",
      "msg": "Wrong address for the Init ix"
    },
    {
      "code": 6006,
      "name": "WrongFeesReceiverAddress",
      "msg": "Wrong fees receiver address"
    },
    {
      "code": 6007,
      "name": "ZeroBurnsOccured",
      "msg": "No burns occured, reverting transaction"
    },
    {
      "code": 6008,
      "name": "WrongTicketsMint",
      "msg": "Wrong mint account of the kenl tickets"
    }
  ]
};

export const IDL: Adoptcontract = {
  "version": "0.1.0",
  "name": "adoptcontract",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pdaAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnNfts",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feesReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnTokens",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "feesReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferNftFromPda",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketsMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userBurnInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "nftsValutAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumpSeed",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userBurnInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftsBurnt",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongBurnRemainingAccountsChunk",
      "msg": "Wrong remaining accounts chunk (should be 4 in each one)"
    },
    {
      "code": 6001,
      "name": "WrongTransferRemainingAccountsChunk",
      "msg": "Wrong remaining accounts chunk (should be 3 in each one)"
    },
    {
      "code": 6002,
      "name": "ZeroUserPdaBurns",
      "msg": "Can't receive a ticket, not enough burns"
    },
    {
      "code": 6003,
      "name": "WrongPDAAddress",
      "msg": "Wrong authority PDA address"
    },
    {
      "code": 6004,
      "name": "CannotGetBump",
      "msg": "Cannot get the bump of the Vault PDA"
    },
    {
      "code": 6005,
      "name": "WrongAdminAddress",
      "msg": "Wrong address for the Init ix"
    },
    {
      "code": 6006,
      "name": "WrongFeesReceiverAddress",
      "msg": "Wrong fees receiver address"
    },
    {
      "code": 6007,
      "name": "ZeroBurnsOccured",
      "msg": "No burns occured, reverting transaction"
    },
    {
      "code": 6008,
      "name": "WrongTicketsMint",
      "msg": "Wrong mint account of the kenl tickets"
    }
  ]
};
