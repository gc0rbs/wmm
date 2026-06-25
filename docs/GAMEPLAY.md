# Westward — Gameplay Map & Reference

> A complete map of the implemented gameplay, drawn from the actual code and data
> (`assets/data/*.json`, `config/default.json5`, `server/*`, `shared/*`). Numbers
> are pulled from the source, not invented. Use this as the basis for player docs,
> a wiki, and marketing copy. Sections flagged **(thin/unfinished)** are areas the
> original author left as stubs — opportunities, not promises.

---

## 1. The pitch (one paragraph)

**Westward** is a browser-based, collaborative MMORPG about taming a frontier. You
and other players drop into a vast, untamed continent and must **settle it
together** — building towns from scratch, crafting the tools of civilization,
defending your claims from hostile natives and wildlife, and trading in a
player-run economy. There are no solo heroes here: every shop, every wall, every
loaf of bread is made by a real player, and a region only grows because its
community makes it grow. The march is always **westward** — as resources deplete,
the frontier pushes on.

**Genre:** 2D top-down collaborative MMORPG (survival + settlement + economy).
**Platform:** Browser (Phaser/WebGL client, authoritative Node.js server, MongoDB).
**Tone:** Frontier survival; build, trade, defend, expand.

---

## 2. The world

- **One continuous shared world**, not instanced rooms. Size: **1,500 × 1,140 tiles**
  (50×57 chunks of 30×20 tiles each — `maps/master.json`).
- **23 named regions** (`regions.json`) — e.g. *New Beginning*, *Saarinen*,
  *Mawllyn*, *Bachplaen* — the persistent political/objective units of the map.
- **Fog of war:** the map starts hidden and is revealed by exploration. Discovering
  terrain, resources, and enemy camps is itself a tracked activity.
- **Area-of-Interest (AOI) streaming:** the server only sends each player the slice
  of the world around them, which is how a single large world supports many players.
- **Resource depletion + respawn:** harvestable nodes deplete as players extract
  them and respawn on a **24-hour cycle** (86,400 turns), driving the constant
  expansion outward.

### Region lifecycle — the heartbeat of the world

Every region moves through **three phases**, and the phase determines which
objectives ("missions") are active for everyone in it:

| Phase | Name | Trigger | Theme |
|------|------|---------|-------|
| **0** | Wild | default, no enemy presence | **Settle** — raise the first buildings, explore, find resources |
| **1** | Occupied | enemy (Civ) buildings present | **Defend** — scout, fortify, repel the natives |
| **2** | Settled | >10 player buildings, no enemies | **Develop** — shops, workshops, a real economy |

This is the macro-arc of the game: **wild land → contested frontier → thriving
settlement → push further west.**

---

## 3. Core gameplay loop

1. **Explore** the fog-shrouded frontier; reveal land, resources, and threats.
2. **Gather** raw materials (wood, stone, ore, plants, pelts from wildlife).
3. **Build** production, crafting, trade, defense, and rest structures.
4. **Craft** tools, weapons, armor, ammo, and potions up a multi-tier recipe tree.
5. **Trade** with other players through shops and workshops (player-run economy).
6. **Fight** wildlife and hostile Civs in tactical, turn-based battles.
7. **Progress** four independent class paths, unlocking abilities.
8. **Contribute** to region missions and **earn** rewards (XP — and now **WST tokens**).
9. **Rest** to recover, then push the frontier further west and repeat.

Survival pressure (vigor + food) and resource depletion keep the loop turning.

---

## 4. The four classes ("paths")

Players develop **all four classes simultaneously** (separate XP/levels each) — you
choose where to invest, you're never locked out.

| ID | Class | Path | Fantasy |
|----|-------|------|---------|
| 0 | **Soldier** | The Path of War | Battle bonuses, defend settlements, secure trade routes |
| 1 | **Merchant** | The Path of Coin | Better trades, run caravans and multiple shops |
| 2 | **Craftsman** | The Path of Creation | The *only* class that crafts weapons, gear & potions |
| 3 | **Explorer** | The Path of Discovery | Travel farther, dodge fights, harvest more from plants & animals |

The class split enforces **interdependence**: a Craftsman needs an Explorer's
materials and a Soldier's protection; everyone needs the Merchant's market. That's
the social engine of the game.

---

## 5. Progression

- **Per-class XP & levels** (4 tracks), **max level 101**, XP cap **999,999**.
  XP-to-level curve is exponential: `exp(level/10) * 100` (~110 XP for level 1,
  ~2,350 for level 50).
- **Ability Points (AP):** **+3 AP per class level-up**, spent on abilities
  (cost 2–5 AP each). Separate AP pool per class, plus a **civic AP** pool **(thin/unfinished)**.
- **Abilities (9 implemented)** — permanent upgrades, e.g.:
  - *Healthy* (Soldier): +100 max HP
  - *Grit* (Soldier): +90 respawn HP
  - *Traveller* (Explorer): −50% walking fatigue
  - *Forager* (Explorer): +30% bonus plant ingredients
  - *Scavenger* (Explorer): +30% bonus from animal carcasses
  - *Hustler* (Merchant): −50% trade fatigue
  - *Haggler* (Merchant): +30% chance of a price discount
  - *Leatherwork* / *Apothecary* (Craftsman): unlock recipe families
- **Core stats:** Vitality (HP, start 300 max via config), Damage (start 19),
  Defense (start 7), Accuracy (start 50), plus hidden luck/fatigue stats fed by abilities.

---

## 6. Survival systems

Two meters create constant, low-grade pressure:

- **Vigor (0–100):** fatigue. Drains from actions — **walking (~2 per 100 steps)**,
  **crafting (−3 per craft)**, trading, etc. When vigor falls **>30 below max**, a
  scaling **malus hits all your stats** (e.g. vigor 50 → ~20% weaker everywhere),
  making you vulnerable. Restored by **resting inside buildings you own** (shacks),
  which also heals HP — **and works even while you're offline.**
- **Food (0–100):** decays over time (**−1.5 per ~10-min cycle**). The lower your
  food, the **faster vigor drains** (up to 2× at empty). Replenished by eating
  consumables (e.g. Caor berries, Food).
- **Death:** you respawn (with `respawnhp`, boostable via the *Grit* ability). On a
  battlefield where a player falls, a **death marker** is placed.

This is the survival spine: act → tire → rest → eat → keep going.

---

## 7. Building & settlement (6 building types)

| Type | Building | Role | Cost | Notes |
|------|----------|------|------|-------|
| 1 / 11 | **Shack** | Rest / housing | (1) free / (11) 5 Timber | Restore vigor + HP; works offline; HP 500, def 20 |
| 2 | **Tower** | Defense | 30 Timber | **Fights back** — HP 2,500, dmg 8, def 30, auto-aggro |
| 3 | **Workshop** | Crafting | 20 Timber + 10 Stone | Where *all* crafting happens; HP 700 |
| 4 | **Shop** | Trade | 10 Timber | Player-run store; holds 100 item types |
| 6 | **Lumber camp** | Production | (free) | Must be **next to forest**; auto-produces Timber & Wood every 60 turns; **output doubles if stocked with Food** |

- **Construction** consumes materials brought to the site (a collaborative act —
  the tutorial literally teaches you to donate materials to a neighbor's build).
- **Buildings can be destroyed in battle** and repaired with Timber.
- Building inventories hold **100 items**; gold cap **99,999**.

---

## 8. Crafting & the resource chain (52 items)

Crafting happens at a **Workshop** (free in your own, pay the owner in someone
else's). Crafting costs vigor and grants **Craftsman XP (5/craft)**.

**Item families:** melee weapons, ranged weapons, ammunition, armor, ammo
containers, consumables/potions, raw materials, and intermediate materials.

**The tree has real depth** — e.g. the steel weapon chain:

```
Wood → Coal (5 wood) → Carbon (5 coal) → Steel ingot (1 carbon + 4 iron ingot) → Sword (3 steel)
```

Other notable recipes:
- **Leather** = 1 Pelt → **5 Leather** (the backbone of armor)
- **Bow** = Wood + String; **Arrows** = Wood + Iron ore + Feathers → **5 arrows**
- **Gun** = Wood + Iron ore; **Bullets** = Iron ore + Black powder → **5 bullets**
- **Dawn** potion (+100 HP in battle); **Dusk** potion (+30 vigor)
- **Bomb** = Iron ore + Black powder (AoE explosive)

**Equipment slots (7):** melee weapon, ranged weapon, armor, belt, boots, ammo
container, active ammo.

---

## 9. The player-run economy

- **Everything tradable is player-made.** Shops are owned and priced by players.
- **Buy/sell** at owner-set prices; default prices float off a **live market
  average** across all shops (`buy ≈ avg/2`, `sell ≈ avg`).
- **Gold** is the currency (player cap 100,000). Earned by selling; spent buying or
  paying to craft in others' workshops.
- The tutorial's climax is explicitly economic: to craft a weapon you must **buy an
  ingredient another player produced and sold** — the economy is the content.

---

## 10. Combat (tactical, turn-based)

Battles trigger when an aggressive entity comes within **12 tiles** and snap into a
**turn-based tactical mode** on a grid:

- **Turns:** 5 seconds each; one **action** per turn — *attack, bomb, move
  (up to 3 tiles), or pass*.
- **Attack types & feel:**
  - **Melee:** adjacent only; `dmg = 10·√dmg − 5·√def`.
  - **Bow:** 30 tiles/sec; accuracy drops **0.1 per tile** of range.
  - **Gun:** 50 tiles/sec; punchier ranged option.
  - **Thrown / Bombs:** bombs deal a **flat 100 dmg in a 3×3 area**.
  - Damage has ±20% variance; clamped 1–10,000.
- **Rewards:** XP is pooled and split among all surviving players; enemies drop
  **loot** (pelts, bones, food, materials, sometimes ammo).

### Enemies

**Wildlife (4 types, ~155 packs spawned):**

| Animal | HP | Dmg | XP | Pack | Notes |
|--------|----|-----|----|------|-------|
| Gray wolf | 100 | 4 | 10 | 2–4 | common |
| Black wolf | 130 | 6 | 15 | 2–4 | |
| White wolf | 200 | 8 | 20 | 2–4 | dangerous |
| Arth (bear) | 300 | 6 | 30 | 1 | **2×2**, dangerous |

**Hostile Civs (2 types, in 4 camps):**

| Civ | HP | Dmg | XP | Kit |
|-----|----|-----|----|-----|
| Warrior | 100 | 11 | 50 | sword |
| Archer | 80 | 15 | 60 | sword + bow |

Civs are **sentient** (they retreat/strategize, speak battle barks) and respawn
from camps on a long cycle. Their presence is what flips a region into its
**Defend** phase.

---

## 11. Quests & challenges

There are three layers of "things to do." **Important honesty for marketing: the
narrative layer is essentially unbuilt** — see below.

### A. Tutorial (onboarding) — *complete*
A scripted ~41-step walkthrough in a private instance that teaches movement,
entering builds, building a lumber camp, gathering & donating materials, crafting a
weapon, buying from another player's shop, and resting. Themed around helping a
small frontier town (NPC neighbors named Jon, Danny, Tyrion, Arya).

### B. Region missions — *the live "quest" system, working*
**Collaborative, region-wide objectives** — every player in a region contributes to
shared goals, and contributors earn class XP. They rotate by region phase:

**Phase 0 — Settle:** Build 10 buildings · Discover N resources · Explore the region
**Phase 1 — Defend:** Scout enemy buildings · Build 5 Towers · Destroy enemy
buildings · Slay 100 Civs · Gather/Store Food
**Phase 2 — Develop:** Build 3 Shops · Build 2 Workshops · Build 3 Lumber camps

### C. Play-to-earn quests (WST) — *new, working*
Three milestone quests layered onto the region system that pay a **claimable WST
token reward** (earned once per region, so you re-earn them as you expand):

| Quest | Phase | Earn |
|-------|-------|------|
| **Pioneer's Stake** | Settle | help raise a new region's first buildings → **10 WST** |
| **Frontline Bounty** | Defend | help cut down the Civ raiders → **25 WST** |
| **Free Market Pioneer** | Develop | help open the region's first shop → **20 WST** |

### D. Story / chapters — **(thin/unfinished)**
The engine has a `chapters` slot clearly intended for narrative arcs, but it
currently contains a single **"Lorem ipsum" placeholder**. **There is no story
content yet** — personal quests, NPC dialogue, and branching arcs are greenfield
design work (and a major opportunity).

---

## 12. Multiplayer & collaboration (the core pillar)

This isn't an MMO where multiplayer is a backdrop — **collaboration is the
mechanic**:

- Buildings are **shared infrastructure**; you can donate materials to others' builds.
- The **class system forces interdependence** (no one can do everything).
- **Missions are collective** — the region advances because the community advances.
- The **economy is entirely player-supplied**.
- Rest/production even continue **while you're offline**, so the settlement is a
  living, shared place.

Marketing line that's *true to the design*: *"You can't conquer the frontier alone —
and you're not meant to."*

---

## 13. Play-to-earn layer (WST) — current state

- Players accrue a **claimable, off-chain WST balance** by completing the P2E
  quests above; it's **persisted** to their account and visible in-game.
- **Anti-farm by design:** each P2E quest pays **once per region**, and rewards are
  tied to **collective** objectives, not solo-grindable counters.
- **On-chain settlement is intentionally not wired yet** — there's a single,
  documented integration seam (`server/P2E.js → settle()`) where a real
  mint/transfer to a player wallet would plug in once the chain, token contract,
  and custody model are chosen. **Today no real cryptocurrency moves** — WST is an
  in-game balance with a token's plumbing behind it.

---

## 14. Marketing angles & taglines (grounded in real features)

**Unique selling points (all backed by implemented systems):**
- A **truly collaborative MMO** — settle a continent *together*, not solo.
- A **100% player-run economy** — every item is player-made and player-priced.
- **Tactical turn-based combat** on a frontier of wolves, bears, and hostile natives.
- **Four parallel class paths** that make players need each other.
- **Persistent, living settlements** that grow and rest even while you're away.
- **Play-to-earn** rewards tied to genuine, collaborative achievement (not grind).
- **The eternal march west** — depletion and expansion keep the world moving.

**Tagline candidates:**
- *"Tame the frontier. Together."*
- *"Every brick, every blade, every loaf — made by a player."*
- *"Settle. Defend. Prosper. Push West."*
- *"An honest day's work on the frontier — now it pays."* (P2E angle)

**Elevator pitch (marketing):**
> *Westward is a collaborative frontier MMO where players settle an untamed
> continent from nothing — building towns, crafting everything, defending their
> claims in tactical battles, and trading in a fully player-run economy. No one
> survives the frontier alone, and now the work pays: contribute to your region's
> rise and earn on-chain rewards.*

---

## 15. Honest gaps & opportunities (for internal planning)

- **No narrative/story** — `chapters` is a stub. Biggest content opportunity.
- **Quests are collective-only** — no personal/branching quests yet (the framework
  supports adding them).
- **Civic progression** exists in the data model but is largely unimplemented.
- **Art is low-resolution & not HiDPI-aware** — the look needs a crispness pass
  and/or higher-res assets (separate from gameplay).
- **P2E is off-chain only** — on-chain settlement, wallet connect, and a "claim"
  flow are not built yet.
- The original author flagged the codebase as messy/undocumented — this map is the
  start of fixing the documentation gap.

---

*Source of truth: `assets/data/{missions,items,buildings,abilities,classes,animals,civs,regions,camps,tutorials,chapters}.json`, `config/default.json5`, `server/{GameServer,Region,Battle,Player,Building,P2E}.js`, `shared/{Formulas,Stats}.js`, `maps/master.json`. Figures current as of this branch.*
