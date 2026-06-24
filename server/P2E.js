/**
 * Play-to-earn token rewards.
 *
 * This module is the SINGLE seam between gameplay and any token economy. Today it
 * accrues an off-chain, custodial "claimable balance" on each Player (the standard,
 * safe pattern: players earn while playing, then settle to a wallet later). The
 * actual on-chain mint/transfer is intentionally NOT wired here — see settle().
 *
 * Keeping every token mutation behind P2E.grant()/P2E.settle() means the on-chain
 * integration (wallet address, signing key, contract call, gas handling) can be
 * added in exactly one place without touching the game loop.
 */
import GameServer from './GameServer'

var P2E = {};

P2E.isEnabled = function(){
    return !!(GameServer.p2eParameters && GameServer.p2eParameters.enabled);
};

P2E.symbol = function(){
    return (GameServer.p2eParameters && GameServer.p2eParameters.tokenSymbol) || 'WST';
};

/**
 * Credit a player's claimable token balance. Returns the amount actually granted
 * (0 if P2E is disabled, the player already claimed this quest, or the cap is hit).
 *
 * @param {Player} player - recipient
 * @param {number} amount - tokens to grant
 * @param {string} questKey - unique key (e.g. "region3:civkilled"); enforces claimOnce
 * @param {boolean} claimOnce - if true, only ever grant once per questKey per player
 * @param {string} reason - human-readable label for logs/notifications
 */
P2E.grant = function(player, amount, questKey, claimOnce, reason){
    if(!P2E.isEnabled()) return 0;
    if(!player || !amount || amount <= 0) return 0;

    if(claimOnce){
        if(!player.claimedQuests) player.claimedQuests = [];
        if(player.claimedQuests.indexOf(questKey) !== -1) return 0; // already earned
        player.claimedQuests.push(questKey);
        player.setOwnProperty('claimedQuests', player.claimedQuests);
    }

    var granted = player.gainTokens(amount);
    if(granted > 0){
        player.addNotif('Earned ' + granted + ' ' + P2E.symbol() + (reason ? ' (' + reason + ')' : '') + '!');
        // Audit trail; mirrors how XP/loot are logged elsewhere via Prism.
        console.log('[P2E] player', player.id, '+' + granted, P2E.symbol(), 'for', questKey, reason || '');
    }
    return granted;
};

/**
 * Settle a player's accrued balance on-chain. NOT IMPLEMENTED YET — this is the
 * documented integration point. A real implementation would:
 *   1. require a verified player.walletAddress,
 *   2. submit a mint/transfer to the reward token contract from a server signer,
 *   3. on confirmation, decrement player.tokens by the settled amount,
 *   4. record the tx hash (verifiable via Blockscout) against the player.
 * Until onChain is enabled and the contract/signer are configured, balances simply
 * remain claimable off-chain.
 */
P2E.settle = function(player){
    if(!GameServer.p2eParameters || !GameServer.p2eParameters.onChain){
        return {settled: false, reason: 'on-chain settlement not enabled'};
    }
    // TODO(p2e): wallet verification + contract call + tx-hash persistence.
    return {settled: false, reason: 'not implemented'};
};

export default P2E
