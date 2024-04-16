"use strict";
/* Autogenerated file. Do not edit manually. */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountBalanceAbi__factory = void 0;
/* tslint:disable */
/* eslint-disable */
/*
  Fuels version: 0.77.0
  Forc version: 0.51.1
  Fuel-Core version: 0.22.1
*/
const fuels_1 = require("fuels");
const _abi = {
    "types": [
        {
            "typeId": 0,
            "type": "()",
            "components": [],
            "typeParameters": null
        },
        {
            "typeId": 1,
            "type": "(_, _)",
            "components": [
                {
                    "name": "__tuple_element",
                    "type": 13,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 11,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 2,
            "type": "(_, _)",
            "components": [
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 3,
            "type": "(_, _)",
            "components": [
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 4,
            "type": "(_, _, _, _)",
            "components": [
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "__tuple_element",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 5,
            "type": "b256",
            "components": null,
            "typeParameters": null
        },
        {
            "typeId": 6,
            "type": "bool",
            "components": null,
            "typeParameters": null
        },
        {
            "typeId": 7,
            "type": "enum Error",
            "components": [
                {
                    "name": "AccessDenied",
                    "type": 0,
                    "typeArguments": null
                },
                {
                    "name": "NotEnoughFreeCollateralByImRatio",
                    "type": 0,
                    "typeArguments": null
                },
                {
                    "name": "NoMarketFound",
                    "type": 0,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 8,
            "type": "generic T",
            "components": null,
            "typeParameters": null
        },
        {
            "typeId": 9,
            "type": "raw untyped ptr",
            "components": null,
            "typeParameters": null
        },
        {
            "typeId": 10,
            "type": "str",
            "components": null,
            "typeParameters": null
        },
        {
            "typeId": 11,
            "type": "struct AccountBalance",
            "components": [
                {
                    "name": "taker_position_size",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "taker_open_notional",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "last_tw_premium_growth_global",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 12,
            "type": "struct Address",
            "components": [
                {
                    "name": "value",
                    "type": 5,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 13,
            "type": "struct AssetId",
            "components": [
                {
                    "name": "value",
                    "type": 5,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 14,
            "type": "struct I64",
            "components": [
                {
                    "name": "value",
                    "type": 17,
                    "typeArguments": null
                },
                {
                    "name": "negative",
                    "type": 6,
                    "typeArguments": null
                }
            ],
            "typeParameters": null
        },
        {
            "typeId": 15,
            "type": "struct RawVec",
            "components": [
                {
                    "name": "ptr",
                    "type": 9,
                    "typeArguments": null
                },
                {
                    "name": "cap",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "typeParameters": [
                8
            ]
        },
        {
            "typeId": 16,
            "type": "struct Vec",
            "components": [
                {
                    "name": "buf",
                    "type": 15,
                    "typeArguments": [
                        {
                            "name": "",
                            "type": 8,
                            "typeArguments": null
                        }
                    ]
                },
                {
                    "name": "len",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "typeParameters": [
                8
            ]
        },
        {
            "typeId": 17,
            "type": "u64",
            "components": null,
            "typeParameters": null
        }
    ],
    "functions": [
        {
            "inputs": [
                {
                    "name": "sell_trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "buy_trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                },
                {
                    "name": "trade_amount",
                    "type": 17,
                    "typeArguments": null
                },
                {
                    "name": "trade_value",
                    "type": 17,
                    "typeArguments": null
                },
                {
                    "name": "seller_fee",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "buyer_fee",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "matcher",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "execute_trade",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_account_balance",
            "output": {
                "name": "",
                "type": 11,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_all_pending_funding_payment",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_all_trader_positions",
            "output": {
                "name": "",
                "type": 16,
                "typeArguments": [
                    {
                        "name": "",
                        "type": 1,
                        "typeArguments": null
                    }
                ]
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_base_tokens",
            "output": {
                "name": "",
                "type": 16,
                "typeArguments": [
                    {
                        "name": "",
                        "type": 13,
                        "typeArguments": null
                    }
                ]
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_funding",
            "output": {
                "name": "",
                "type": 2,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "market_twap",
                    "type": 17,
                    "typeArguments": null
                },
                {
                    "name": "index_twap",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "name": "get_funding_delta",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_funding_growth_global",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_funding_rate",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                },
                {
                    "name": "account_value",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "name": "get_liquidatable_position_size",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_margin_requirement",
            "output": {
                "name": "",
                "type": 17,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "buffer",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "name": "get_margin_requirement_for_liquidation",
            "output": {
                "name": "",
                "type": 17,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_pending_funding_payment",
            "output": {
                "name": "",
                "type": 3,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_pnl",
            "output": {
                "name": "",
                "type": 3,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_settlement_token_balance_and_unrealized_pnl",
            "output": {
                "name": "",
                "type": 3,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_taker_open_notional",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_taker_position_size",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "get_total_abs_position_value",
            "output": {
                "name": "",
                "type": 17,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "get_total_position_value",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "amount",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "name": "modify_owed_realized_pnl",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                },
                {
                    "name": "exchanged_position_size",
                    "type": 14,
                    "typeArguments": null
                },
                {
                    "name": "exchanged_position_notional",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "name": "modify_position",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "register_base_token",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "settle_all_funding",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "settle_bad_debt",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "settle_funding",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                }
            ],
            "name": "settle_owed_realized_pnl",
            "output": {
                "name": "",
                "type": 14,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                }
            ],
            "name": "settle_position_in_closed_market",
            "output": {
                "name": "",
                "type": 4,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "insurance_fund_fee_share",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "name": "update_insurance_fund_fee_share",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "max_funding_rate",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "name": "update_max_funding_rate",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "protocol_fee_rate",
                    "type": 17,
                    "typeArguments": null
                }
            ],
            "name": "update_protocol_fee_rate",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "write"
                    ]
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "trader",
                    "type": 12,
                    "typeArguments": null
                },
                {
                    "name": "base_token",
                    "type": 13,
                    "typeArguments": null
                },
                {
                    "name": "last_tw_premium_growth_global",
                    "type": 14,
                    "typeArguments": null
                }
            ],
            "name": "update_tw_premium_growth_global",
            "output": {
                "name": "",
                "type": 0,
                "typeArguments": null
            },
            "attributes": [
                {
                    "name": "storage",
                    "arguments": [
                        "read",
                        "write"
                    ]
                }
            ]
        }
    ],
    "loggedTypes": [
        {
            "logId": 0,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 1,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 2,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 3,
            "loggedType": {
                "name": "",
                "type": 10,
                "typeArguments": null
            }
        },
        {
            "logId": 4,
            "loggedType": {
                "name": "",
                "type": 10,
                "typeArguments": null
            }
        },
        {
            "logId": 5,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 6,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 7,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 8,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 9,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 10,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 11,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 12,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 13,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 14,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        },
        {
            "logId": 15,
            "loggedType": {
                "name": "",
                "type": 7,
                "typeArguments": []
            }
        }
    ],
    "messagesTypes": [],
    "configurables": [
        {
            "name": "DUST",
            "configurableType": {
                "name": "",
                "type": 17,
                "typeArguments": null
            },
            "offset": 241036
        },
        {
            "name": "PROXY_ADDRESS",
            "configurableType": {
                "name": "",
                "type": 12,
                "typeArguments": []
            },
            "offset": 240900
        },
        {
            "name": "FULLY_CLOSED_RATIO",
            "configurableType": {
                "name": "",
                "type": 17,
                "typeArguments": null
            },
            "offset": 241148
        },
        {
            "name": "SETTLEMENT_TOKEN",
            "configurableType": {
                "name": "",
                "type": 13,
                "typeArguments": []
            },
            "offset": 241268
        }
    ]
};
const _storageSlots = [
    {
        "key": "02dac99c283f16bc91b74f6942db7f012699a2ad51272b15207b9cc14a70dbae",
        "value": "0000000005f5e100000000000000000000000000000000000000000000000000"
    },
    {
        "key": "6294951dcb0a9111a517be5cf4785670ff4e166fb5ab9c33b17e6881b48e964f",
        "value": "0000000000001388000000000000000000000000000000000000000000000000"
    },
    {
        "key": "7f91d1a929dce734e7f930bbb279ccfccdb5474227502ea8845815c74bd930a7",
        "value": "0000000000030d40000000000000000000000000000000000000000000000000"
    },
    {
        "key": "94b2b70d20da552763c7614981b2a4d984380d7ed4e54c01b28c914e79e44bd5",
        "value": "000000000007a120000000000000000000000000000000000000000000000000"
    }
];
class AccountBalanceAbi__factory {
    static createInterface() {
        return new fuels_1.Interface(_abi);
    }
    static connect(id, accountOrProvider) {
        return new fuels_1.Contract(id, _abi, accountOrProvider);
    }
    static deployContract(bytecode_1, wallet_1) {
        return __awaiter(this, arguments, void 0, function* (bytecode, wallet, options = {}) {
            const factory = new fuels_1.ContractFactory(bytecode, _abi, wallet);
            const { storageSlots } = AccountBalanceAbi__factory;
            const contract = yield factory.deployContract(Object.assign({ storageSlots }, options));
            return contract;
        });
    }
}
exports.AccountBalanceAbi__factory = AccountBalanceAbi__factory;
AccountBalanceAbi__factory.abi = _abi;
AccountBalanceAbi__factory.storageSlots = _storageSlots;
//# sourceMappingURL=AccountBalanceAbi__factory.js.map