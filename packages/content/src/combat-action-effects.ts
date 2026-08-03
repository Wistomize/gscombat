import { emblemOfSeveredFateCombatActionEffects } from "./artifacts/emblem-of-severed-fate/effects.js"
import { archaicPetraCombatActionEffects } from "./artifacts/archaic-petra/effects.js"
import { adventurerCombatActionEffects } from "./artifacts/adventurer/effects.js"
import { berserkerCombatActionEffects } from "./artifacts/berserker/effects.js"
import { blizzardStrayerCombatActionEffects } from "./artifacts/blizzard-strayer/effects.js"
import { bloodstainedChivalryCombatActionEffects } from "./artifacts/bloodstained-chivalry/effects.js"
import { braveHeartCombatActionEffects } from "./artifacts/brave-heart/effects.js"
import { deepwoodMemoriesCombatActionEffects } from "./artifacts/deepwood-memories/effects.js"
import { defendersWillCombatActionEffects } from "./artifacts/defenders-will/effects.js"
import { desertPavilionChronicleCombatActionEffects } from "./artifacts/desert-pavilion-chronicle/effects.js"
import { echoesOfAnOfferingCombatActionEffects } from "./artifacts/echoes-of-an-offering/effects.js"
import { flowerOfParadiseLostCombatActionEffects } from "./artifacts/flower-of-paradise-lost/effects.js"
import { gamblerCombatActionEffects } from "./artifacts/gambler/effects.js"
import { gildedDreamsCombatActionEffects } from "./artifacts/gilded-dreams/effects.js"
import { goldenTroupeCombatActionEffects } from "./artifacts/golden-troupe/effects.js"
import { gladiatorsFinaleCombatActionEffects } from "./artifacts/gladiators-finale/effects.js"
import { heartOfDepthCombatActionEffects } from "./artifacts/heart-of-depth/effects.js"
import { instructorCombatActionEffects } from "./artifacts/instructor/effects.js"
import { lavawalkerCombatActionEffects } from "./artifacts/lavawalker/effects.js"
import { martialArtistCombatActionEffects } from "./artifacts/martial-artist/effects.js"
import { aubadeOfMorningstarAndMoonCombatActionEffects } from "./artifacts/aubade-of-morningstar-and-moon/effects.js"
import { nightOfTheSkysUnveilingCombatActionEffects } from "./artifacts/night-of-the-skys-unveiling/effects.js"
import { noblesseObligeCombatActionEffects } from "./artifacts/noblesse-oblige/effects.js"
import { resolutionOfSojournerCombatActionEffects } from "./artifacts/resolution-of-sojourner/effects.js"
import { retracingBolideCombatActionEffects } from "./artifacts/retracing-bolide/effects.js"
import { scholarCombatActionEffects } from "./artifacts/scholar/effects.js"
import { scrollOfTheHeroOfCinderCityCombatActionEffects } from "./artifacts/scroll-of-the-hero-of-cinder-city/effects.js"
import { shimenawasReminiscenceCombatActionEffects } from "./artifacts/shimenawas-reminiscence/effects.js"
import { tenacityOfTheMillelithCombatActionEffects } from "./artifacts/tenacity-of-the-millelith/effects.js"
import { theExileCombatActionEffects } from "./artifacts/the-exile/effects.js"
import { thundersootherCombatActionEffects } from "./artifacts/thundersoother/effects.js"
import { thunderingFuryCombatActionEffects } from "./artifacts/thundering-fury/effects.js"
import { wanderersTroupeCombatActionEffects } from "./artifacts/wanderers-troupe/effects.js"
import { viridescentVenererCombatActionEffects } from "./artifacts/viridescent-venerer/effects.js"
import { aDayCarvedFromRisingWindsCombatActionEffects } from "./artifacts/a-day-carved-from-rising-winds/effects.js"
import { finaleOfTheDeepGalleriesCombatActionEffects } from "./artifacts/finale-of-the-deep-galleries/effects.js"
import { nighttimeWhispersInTheEchoingWoodsCombatActionEffects } from "./artifacts/nighttime-whispers-in-the-echoing-woods/effects.js"
import { obsidianCodexCombatActionEffects } from "./artifacts/obsidian-codex/effects.js"
import { disenchantmentInDeepShadowCombatActionEffects } from "./artifacts/disenchantment-in-deep-shadow/effects.js"
import { huskOfOpulentDreamsCombatActionEffects } from "./artifacts/husk-of-opulent-dreams/effects.js"
import { marechausseeHunterCombatActionEffects } from "./artifacts/marechaussee-hunter/effects.js"
import { paleFlameCombatActionEffects } from "./artifacts/pale-flame/effects.js"
import { vermillionHereafterCombatActionEffects } from "./artifacts/vermillion-hereafter/effects.js"
import { vourukashasGlowCombatActionEffects } from "./artifacts/vourukashas-glow/effects.js"
import { celestialGiftCombatActionEffects } from "./artifacts/celestial-gift/effects.js"
import { crimsonWitchOfFlamesCombatActionEffects } from "./artifacts/crimson-witch-of-flames/effects.js"
import { fragmentOfHarmonicWhimsyCombatActionEffects } from "./artifacts/fragment-of-harmonic-whimsy/effects.js"
import { longNightsOathCombatActionEffects } from "./artifacts/long-nights-oath/effects.js"
import { luckyDogCombatActionEffects } from "./artifacts/lucky-dog/effects.js"
import { nymphsDreamCombatActionEffects } from "./artifacts/nymphs-dream/effects.js"
import { silkenMoonsSerenadeCombatActionEffects } from "./artifacts/silken-moons-serenade/effects.js"
import { unfinishedReverieCombatActionEffects } from "./artifacts/unfinished-reverie/effects.js"
import type { CatalogWeaponType } from "./catalog-presentation.js"
import { characterCombatCoverageRegistry } from "./combat-registry.js"
import { listCombatElementOverrideEffects } from "./combat-effects.js"
import type {
  CombatActionEffect,
  CombatActionMetadata,
  CombatActionReactionKind,
  CombatElementOverrideEffect
} from "./combat/types.js"
import {
  listPublishedEquipmentCoverageClauses,
  type PublishedEquipmentCoverageClause
} from "./equipment-coverage-ledger.js"
import { isHexereiCharacter } from "./rules/hexerei.js"
import { aThousandFloatingDreamsCombatActionEffects } from "./weapons/a-thousand-floating-dreams/effects.js"
import { aquaSimulacraCombatActionEffects } from "./weapons/aqua-simulacra/effects.js"
import { aquilaFavoniaCombatActionEffects } from "./weapons/aquila-favonia/effects.js"
import { alleyHunterCombatActionEffects } from "./weapons/alley-hunter/effects.js"
import { balladOfTheBoundlessBlueCombatActionEffects } from "./weapons/ballad-of-the-boundless-blue/effects.js"
import { balladOfTheFjordsCombatActionEffects } from "./weapons/ballad-of-the-fjords/effects.js"
import { calamityOfEshuCombatActionEffects } from "./weapons/calamity-of-eshu/effects.js"
import { cinnabarSpindleCombatActionEffects } from "./weapons/cinnabar-spindle/effects.js"
import { deathmatchCombatActionEffects } from "./weapons/deathmatch/effects.js"
import { dawningFrostCombatActionEffects } from "./weapons/dawning-frost/effects.js"
import { dodocoTalesCombatActionEffects } from "./weapons/dodoco-tales/effects.js"
import { emeraldOrbCombatActionEffects } from "./weapons/emerald-orb/effects.js"
import { earthShakerCombatActionEffects } from "./weapons/earth-shaker/effects.js"
import { everlastingMoonglowCombatActionEffects } from "./weapons/everlasting-moonglow/effects.js"
import { engulfingLightningCombatActionEffects } from "./weapons/engulfing-lightning/effects.js"
import { elegyForTheEndCombatActionEffects } from "./weapons/elegy-for-the-end/effects.js"
import { etherlightSpindleluteCombatActionEffects } from "./weapons/etherlight-spindlelute/effects.js"
import { flameForgedInsightCombatActionEffects } from "./weapons/flame-forged-insight/effects.js"
import { skywardSpineCombatActionEffects } from "./weapons/skyward-spine/effects.js"
import { theCatchCombatActionEffects } from "./weapons/the-catch/effects.js"
import { wavebreakersFinCombatActionEffects } from "./weapons/wavebreakers-fin/effects.js"
import { festeringDesireCombatActionEffects } from "./weapons/festering-desire/effects.js"
import { fleuveCendreFerrymanCombatActionEffects } from "./weapons/fleuve-cendre-ferryman/effects.js"
import { fluteOfEzpitzalCombatActionEffects } from "./weapons/flute-of-ezpitzal/effects.js"
import { footprintOfTheRainbowCombatActionEffects } from "./weapons/footprint-of-the-rainbow/effects.js"
import { harbingerOfDawnCombatActionEffects } from "./weapons/harbinger-of-dawn/effects.js"
import { katsuragikiriNagamasaCombatActionEffects } from "./weapons/katsuragikiri-nagamasa/effects.js"
import { kitainCrossSpearCombatActionEffects } from "./weapons/kitain-cross-spear/effects.js"
import { kingsSquireCombatActionEffects } from "./weapons/kings-squire/effects.js"
import { luxuriousSeaLordCombatActionEffects } from "./weapons/luxurious-sea-lord/effects.js"
import { magicGuideCombatActionEffects } from "./weapons/magic-guide/effects.js"
import { messengerCombatActionEffects } from "./weapons/messenger/effects.js"
import { mouunsMoonCombatActionEffects } from "./weapons/mouuns-moon/effects.js"
import { oathswornEyeCombatActionEffects } from "./weapons/oathsworn-eye/effects.js"
import { ravenBowCombatActionEffects } from "./weapons/raven-bow/effects.js"
import { rustCombatActionEffects } from "./weapons/rust/effects.js"
import { skywardPrideCombatActionEffects } from "./weapons/skyward-pride/effects.js"
import { skyriderSwordCombatActionEffects } from "./weapons/skyrider-sword/effects.js"
import { starcallersWatchCombatActionEffects } from "./weapons/starcallers-watch/effects.js"
import { staffOfTheScarletSandsCombatActionEffects } from "./weapons/staff-of-the-scarlet-sands/effects.js"
import { sunnyMorningSleepInCombatActionEffects } from "./weapons/sunny-morning-sleep-in/effects.js"
import { tamayurateiNoOhanashiCombatActionEffects } from "./weapons/tamayuratei-no-ohanashi/effects.js"
import { theBlackSwordCombatActionEffects } from "./weapons/the-black-sword/effects.js"
import { theStringlessCombatActionEffects } from "./weapons/the-stringless/effects.js"
import { whiteTasselCombatActionEffects } from "./weapons/white-tassel/effects.js"
import { wanderingEvenstarCombatActionEffects } from "./weapons/wandering-evenstar/effects.js"
import { xiphosMoonlightCombatActionEffects } from "./weapons/xiphos-moonlight/effects.js"
import { solarPearlCombatActionEffects } from "./weapons/solar-pearl/effects.js"
import { tidalShadowCombatActionEffects } from "./weapons/tidal-shadow/effects.js"
import { akuoumaruCombatActionEffects } from "./weapons/akuoumaru/effects.js"
import { beaconOfTheReedSeaCombatActionEffects } from "./weapons/beacon-of-the-reed-sea/effects.js"
import { dragonsBaneCombatActionEffects } from "./weapons/dragons-bane/effects.js"
import { forestRegaliaCombatActionEffects } from "./weapons/forest-regalia/effects.js"
import { lionsRoarCombatActionEffects } from "./weapons/lions-roar/effects.js"
import { missiveWindspearCombatActionEffects } from "./weapons/missive-windspear/effects.js"
import { moonpiercerCombatActionEffects } from "./weapons/moonpiercer/effects.js"
import { rainslasherCombatActionEffects } from "./weapons/rainslasher/effects.js"
import { songOfStillnessCombatActionEffects } from "./weapons/song-of-stillness/effects.js"
import { theAlleyFlashCombatActionEffects } from "./weapons/the-alley-flash/effects.js"
import { toukabouShigureCombatActionEffects } from "./weapons/toukabou-shigure/effects.js"
import { wolfsGravestoneCombatActionEffects } from "./weapons/wolfs-gravestone/effects.js"
import { freedomSwornCombatActionEffects } from "./weapons/freedom-sworn/effects.js"
import { cranesEchoingCallCombatActionEffects } from "./weapons/cranes-echoing-call/effects.js"
import { crescentPikeCombatActionEffects } from "./weapons/crescent-pike/effects.js"
import { hamayumiCombatActionEffects } from "./weapons/hamayumi/effects.js"
import { mitternachtsWaltzCombatActionEffects } from "./weapons/mitternachts-waltz/effects.js"
import { prototypeCrescentCombatActionEffects } from "./weapons/prototype-crescent/effects.js"
import { kagotsurubeIsshinCombatActionEffects } from "./weapons/kagotsurube-isshin/effects.js"
import { mailedFlowerCombatActionEffects } from "./weapons/mailed-flower/effects.js"
import { makhairaAquamarineCombatActionEffects } from "./weapons/makhaira-aquamarine/effects.js"
import { prototypeArchaicCombatActionEffects } from "./weapons/prototype-archaic/effects.js"
import { sapwoodBladeCombatActionEffects } from "./weapons/sapwood-blade/effects.js"
import { songOfBrokenPinesCombatActionEffects } from "./weapons/song-of-broken-pines/effects.js"
import { wineAndSongCombatActionEffects } from "./weapons/wine-and-song/effects.js"
import { skywardHarpCombatActionEffects } from "./weapons/skyward-harp/effects.js"
import { skywardBladeCombatActionEffects } from "./weapons/skyward-blade/effects.js"
import { sacrificialJadeCombatActionEffects } from "./weapons/sacrificial-jade/effects.js"
import { talkingStickCombatActionEffects } from "./weapons/talking-stick/effects.js"
import { urakuMisugiriCombatActionEffects } from "./weapons/uraku-misugiri/effects.js"
import { aThousandBlazingSunsCombatActionEffects } from "./weapons/a-thousand-blazing-suns/effects.js"
import { mountainBracingBoltCombatActionEffects } from "./weapons/mountain-bracing-bolt/effects.js"
import { fruitfulHookCombatActionEffects } from "./weapons/fruitful-hook/effects.js"
import { azurelightCombatActionEffects } from "./weapons/azurelight/effects.js"
import { disasterAndRemorseCombatActionEffects } from "./weapons/disaster-and-remorse/effects.js"
import { crimsonMoonsSemblanceCombatActionEffects } from "./weapons/crimson-moons-semblance/effects.js"
import { athameArtisCombatActionEffects } from "./weapons/athame-artis/effects.js"
import { aTeaspoonOfTranscendenceCombatActionEffects } from "./weapons/a-teaspoon-of-transcendence/effects.js"
import { absolutionCombatActionEffects } from "./weapons/absolution/effects.js"
import { amosBowCombatActionEffects } from "./weapons/amos-bow/effects.js"
import { angelosHeptadesCombatActionEffects } from "./weapons/angelos-heptades/effects.js"
import { ashGravenDrinkingHornCombatActionEffects } from "./weapons/ash-graven-drinking-horn/effects.js"
import { astralVulturesCrimsonPlumageCombatActionEffects } from "./weapons/astral-vultures-crimson-plumage/effects.js"
import { blackcliffAgateCombatActionEffects } from "./weapons/blackcliff-agate/effects.js"
import { blackcliffLongswordCombatActionEffects } from "./weapons/blackcliff-longsword/effects.js"
import { blackcliffPoleCombatActionEffects } from "./weapons/blackcliff-pole/effects.js"
import { blackcliffSlasherCombatActionEffects } from "./weapons/blackcliff-slasher/effects.js"
import { blackcliffWarbowCombatActionEffects } from "./weapons/blackcliff-warbow/effects.js"
import { blackmarrowLanternCombatActionEffects } from "./weapons/blackmarrow-lantern/effects.js"
import { bloodsoakedRuinsCombatActionEffects } from "./weapons/bloodsoaked-ruins/effects.js"
import { calamityQuellerCombatActionEffects } from "./weapons/calamity-queller/effects.js"
import { cashflowSupervisionCombatActionEffects } from "./weapons/cashflow-supervision/effects.js"
import { chainBreakerCombatActionEffects } from "./weapons/chain-breaker/effects.js"
import { cloudforgedCombatActionEffects } from "./weapons/cloudforged/effects.js"
import { compoundBowCombatActionEffects } from "./weapons/compound-bow/effects.js"
import { dragonspineSpearCombatActionEffects } from "./weapons/dragonspine-spear/effects.js"
import { endOfTheLineCombatActionEffects } from "./weapons/end-of-the-line/effects.js"
import { eyeOfPerceptionCombatActionEffects } from "./weapons/eye-of-perception/effects.js"
import { fadingTwilightCombatActionEffects } from "./weapons/fading-twilight/effects.js"
import { fangOfTheMountainKingCombatActionEffects } from "./weapons/fang-of-the-mountain-king/effects.js"
import { finaleOfTheDeepCombatActionEffects } from "./weapons/finale-of-the-deep/effects.js"
import { flowerWreathedFeathersCombatActionEffects } from "./weapons/flower-wreathed-feathers/effects.js"
import { flowingPurityCombatActionEffects } from "./weapons/flowing-purity/effects.js"
import { fracturedHaloCombatActionEffects } from "./weapons/fractured-halo/effects.js"
import { frostbearerCombatActionEffects } from "./weapons/frostbearer/effects.js"
import { fruitOfFulfillmentCombatActionEffects } from "./weapons/fruit-of-fulfillment/effects.js"
import { gestOfTheMightyWolfCombatActionEffects } from "./weapons/gest-of-the-mighty-wolf/effects.js"
import { goldenFrostboundOathCombatActionEffects } from "./weapons/golden-frostbound-oath/effects.js"
import { hakushinRingCombatActionEffects } from "./weapons/hakushin-ring/effects.js"
import { haranGeppakuFutsuCombatActionEffects } from "./weapons/haran-geppaku-futsu/effects.js"
import { huntersPathCombatActionEffects } from "./weapons/hunters-path/effects.js"
import { ibisPiercerCombatActionEffects } from "./weapons/ibis-piercer/effects.js"
import { ironStingCombatActionEffects } from "./weapons/iron-sting/effects.js"
import { jadefallsSplendorCombatActionEffects } from "./weapons/jadefalls-splendor/effects.js"
import { kagurasVerityCombatActionEffects } from "./weapons/kaguras-verity/effects.js"
import { keyOfKhajNisutCombatActionEffects } from "./weapons/key-of-khaj-nisut/effects.js"
import { lightOfFoliarIncisionCombatActionEffects } from "./weapons/light-of-foliar-incision/effects.js"
import { lightbearingMoonshardCombatActionEffects } from "./weapons/lightbearing-moonshard/effects.js"
import { lithicBladeCombatActionEffects } from "./weapons/lithic-blade/effects.js"
import { lithicSpearCombatActionEffects } from "./weapons/lithic-spear/effects.js"
import { lostPrayerToTheSacredWindsCombatActionEffects } from "./weapons/lost-prayer-to-the-sacred-winds/effects.js"
import { lumidouceElegyCombatActionEffects } from "./weapons/lumidouce-elegy/effects.js"
import { mappaMareCombatActionEffects } from "./weapons/mappa-mare/effects.js"
import { masterKeyCombatActionEffects } from "./weapons/master-key/effects.js"
import { memoryOfDustCombatActionEffects } from "./weapons/memory-of-dust/effects.js"
import { mistsplitterReforgedCombatActionEffects } from "./weapons/mistsplitter-reforged/effects.js"
import { moonweaversDawnCombatActionEffects } from "./weapons/moonweavers-dawn/effects.js"
import { nightweaversLookingGlassCombatActionEffects } from "./weapons/nightweavers-looking-glass/effects.js"
import { nocturnesCurtainCallCombatActionEffects } from "./weapons/nocturnes-curtain-call/effects.js"
import { peakPatrolSongCombatActionEffects } from "./weapons/peak-patrol-song/effects.js"
import { polarStarCombatActionEffects } from "./weapons/polar-star/effects.js"
import { portablePowerSawCombatActionEffects } from "./weapons/portable-power-saw/effects.js"
import { predatorCombatActionEffects } from "./weapons/predator/effects.js"
import { primordialJadeCutterCombatActionEffects } from "./weapons/primordial-jade-cutter/effects.js"
import { primordialJadeWingedSpearCombatActionEffects } from "./weapons/primordial-jade-winged-spear/effects.js"
import { prospectorsDrillCombatActionEffects } from "./weapons/prospectors-drill/effects.js"
import { prospectorsShovelCombatActionEffects } from "./weapons/prospectors-shovel/effects.js"
import { prototypeRancourCombatActionEffects } from "./weapons/prototype-rancour/effects.js"
import { prototypeStarglitterCombatActionEffects } from "./weapons/prototype-starglitter/effects.js"
import { rainbowSerpentsRainBowCombatActionEffects } from "./weapons/rainbow-serpents-rain-bow/effects.js"
import { rangeGaugeCombatActionEffects } from "./weapons/range-gauge/effects.js"
import { redhornStonethresherCombatActionEffects } from "./weapons/redhorn-stonethresher/effects.js"
import { reliquaryOfTruthCombatActionEffects } from "./weapons/reliquary-of-truth/effects.js"
import { ringOfYaxcheCombatActionEffects } from "./weapons/ring-of-yaxche/effects.js"
import { royalBowCombatActionEffects } from "./weapons/royal-bow/effects.js"
import { royalGreatswordCombatActionEffects } from "./weapons/royal-greatsword/effects.js"
import { royalGrimoireCombatActionEffects } from "./weapons/royal-grimoire/effects.js"
import { royalLongswordCombatActionEffects } from "./weapons/royal-longsword/effects.js"
import { royalSpearCombatActionEffects } from "./weapons/royal-spear/effects.js"
import { sacrificersStaffCombatActionEffects } from "./weapons/sacrificers-staff/effects.js"
import { scionOfTheBlazingSunCombatActionEffects } from "./weapons/scion-of-the-blazing-sun/effects.js"
import { sequenceOfSolitudeCombatActionEffects } from "./weapons/sequence-of-solitude/effects.js"
import { serenitysCallCombatActionEffects } from "./weapons/serenitys-call/effects.js"
import { serpentSpineCombatActionEffects } from "./weapons/serpent-spine/effects.js"
import { silvershowerHeartstringsCombatActionEffects } from "./weapons/silvershower-heartstrings/effects.js"
import { skywardAtlasCombatActionEffects } from "./weapons/skyward-atlas/effects.js"
import { snareHookCombatActionEffects } from "./weapons/snare-hook/effects.js"
import { snowTombedStarsilverCombatActionEffects } from "./weapons/snow-tombed-starsilver/effects.js"
import { splendorOfTranquilWatersCombatActionEffects } from "./weapons/splendor-of-tranquil-waters/effects.js"
import { staffOfHomaCombatActionEffects } from "./weapons/staff-of-homa/effects.js"
import { sturdyBoneCombatActionEffects } from "./weapons/sturdy-bone/effects.js"
import { summitShaperCombatActionEffects } from "./weapons/summit-shaper/effects.js"
import { surfsUpCombatActionEffects } from "./weapons/surfs-up/effects.js"
import { swordOfDescensionCombatActionEffects } from "./weapons/sword-of-descension/effects.js"
import { symphonistOfScentsCombatActionEffects } from "./weapons/symphonist-of-scents/effects.js"
import { theBellCombatActionEffects } from "./weapons/the-bell/effects.js"
import { theDaybreakChroniclesCombatActionEffects } from "./weapons/the-daybreak-chronicles/effects.js"
import { theDockhandsAssistantCombatActionEffects } from "./weapons/the-dockhands-assistant/effects.js"
import { theFirstGreatMagicCombatActionEffects } from "./weapons/the-first-great-magic/effects.js"
import { theFluteCombatActionEffects } from "./weapons/the-flute/effects.js"
import { theUnforgedCombatActionEffects } from "./weapons/the-unforged/effects.js"
import { theWidsithCombatActionEffects } from "./weapons/the-widsith/effects.js"
import { thunderingPulseCombatActionEffects } from "./weapons/thundering-pulse/effects.js"
import { tomeOfTheEternalFlowCombatActionEffects } from "./weapons/tome-of-the-eternal-flow/effects.js"
import { tulaytullahsRemembranceCombatActionEffects } from "./weapons/tulaytullahs-remembrance/effects.js"
import { ultimateOverlordsMegaMagicSwordCombatActionEffects } from "./weapons/ultimate-overlords-mega-magic-sword/effects.js"
import { verdictCombatActionEffects } from "./weapons/verdict/effects.js"
import { vividNotionsCombatActionEffects } from "./weapons/vivid-notions/effects.js"
import { vortexVanquisherCombatActionEffects } from "./weapons/vortex-vanquisher/effects.js"
import { waveridingWhirlCombatActionEffects } from "./weapons/waveriding-whirl/effects.js"
import { whiteblindCombatActionEffects } from "./weapons/whiteblind/effects.js"
import { windblumeOdeCombatActionEffects } from "./weapons/windblume-ode/effects.js"
import { wolfFangCombatActionEffects } from "./weapons/wolf-fang/effects.js"
import { blackTasselCombatActionEffects } from "./weapons/black-tassel/effects.js"
import { bloodtaintedGreatswordCombatActionEffects } from "./weapons/bloodtainted-greatsword/effects.js"
import { coolSteelCombatActionEffects } from "./weapons/cool-steel/effects.js"
import { darkIronSwordCombatActionEffects } from "./weapons/dark-iron-sword/effects.js"
import { debateClubCombatActionEffects } from "./weapons/debate-club/effects.js"
import { ferrousShadowCombatActionEffects } from "./weapons/ferrous-shadow/effects.js"
import { skyriderGreatswordCombatActionEffects } from "./weapons/skyrider-greatsword/effects.js"
import { slingshotCombatActionEffects } from "./weapons/slingshot/effects.js"
import { thrillingTalesOfDragonSlayersCombatActionEffects } from "./weapons/thrilling-tales-of-dragon-slayers/effects.js"
import { twinNephriteCombatActionEffects } from "./weapons/twin-nephrite/effects.js"
import { sharpshootersOathCombatActionEffects } from "./weapons/sharpshooters-oath/effects.js"
import { filletBladeCombatActionEffects } from "./weapons/fillet-blade/effects.js"
import { halberdCombatActionEffects } from "./weapons/halberd/effects.js"

const equipmentCombatActionEffects: readonly CombatActionEffect[] = [
  ...aThousandFloatingDreamsCombatActionEffects,
  ...aquaSimulacraCombatActionEffects,
  ...aquilaFavoniaCombatActionEffects,
  ...alleyHunterCombatActionEffects,
  ...balladOfTheBoundlessBlueCombatActionEffects,
  ...balladOfTheFjordsCombatActionEffects,
  ...calamityOfEshuCombatActionEffects,
  ...cinnabarSpindleCombatActionEffects,
  ...deathmatchCombatActionEffects,
  ...dawningFrostCombatActionEffects,
  ...dodocoTalesCombatActionEffects,
  ...emeraldOrbCombatActionEffects,
  ...earthShakerCombatActionEffects,
  ...everlastingMoonglowCombatActionEffects,
  ...engulfingLightningCombatActionEffects,
  ...elegyForTheEndCombatActionEffects,
  ...etherlightSpindleluteCombatActionEffects,
  ...flameForgedInsightCombatActionEffects,
  ...skywardSpineCombatActionEffects,
  ...theCatchCombatActionEffects,
  ...wavebreakersFinCombatActionEffects,
  ...festeringDesireCombatActionEffects,
  ...fleuveCendreFerrymanCombatActionEffects,
  ...fluteOfEzpitzalCombatActionEffects,
  ...footprintOfTheRainbowCombatActionEffects,
  ...harbingerOfDawnCombatActionEffects,
  ...katsuragikiriNagamasaCombatActionEffects,
  ...kitainCrossSpearCombatActionEffects,
  ...kingsSquireCombatActionEffects,
  ...luxuriousSeaLordCombatActionEffects,
  ...magicGuideCombatActionEffects,
  ...messengerCombatActionEffects,
  ...mouunsMoonCombatActionEffects,
  ...oathswornEyeCombatActionEffects,
  ...ravenBowCombatActionEffects,
  ...rustCombatActionEffects,
  ...skywardPrideCombatActionEffects,
  ...skyriderSwordCombatActionEffects,
  ...starcallersWatchCombatActionEffects,
  ...staffOfTheScarletSandsCombatActionEffects,
  ...sunnyMorningSleepInCombatActionEffects,
  ...tamayurateiNoOhanashiCombatActionEffects,
  ...theBlackSwordCombatActionEffects,
  ...theStringlessCombatActionEffects,
  ...whiteTasselCombatActionEffects,
  ...wanderingEvenstarCombatActionEffects,
  ...xiphosMoonlightCombatActionEffects,
  ...solarPearlCombatActionEffects,
  ...tidalShadowCombatActionEffects,
  ...akuoumaruCombatActionEffects,
  ...beaconOfTheReedSeaCombatActionEffects,
  ...dragonsBaneCombatActionEffects,
  ...forestRegaliaCombatActionEffects,
  ...lionsRoarCombatActionEffects,
  ...missiveWindspearCombatActionEffects,
  ...moonpiercerCombatActionEffects,
  ...rainslasherCombatActionEffects,
  ...songOfStillnessCombatActionEffects,
  ...theAlleyFlashCombatActionEffects,
  ...toukabouShigureCombatActionEffects,
  ...wolfsGravestoneCombatActionEffects,
  ...freedomSwornCombatActionEffects,
  ...cranesEchoingCallCombatActionEffects,
  ...crescentPikeCombatActionEffects,
  ...hamayumiCombatActionEffects,
  ...mitternachtsWaltzCombatActionEffects,
  ...prototypeCrescentCombatActionEffects,
  ...kagotsurubeIsshinCombatActionEffects,
  ...mailedFlowerCombatActionEffects,
  ...makhairaAquamarineCombatActionEffects,
  ...prototypeArchaicCombatActionEffects,
  ...sapwoodBladeCombatActionEffects,
  ...songOfBrokenPinesCombatActionEffects,
  ...wineAndSongCombatActionEffects,
  ...skywardHarpCombatActionEffects,
  ...skywardBladeCombatActionEffects,
  ...sacrificialJadeCombatActionEffects,
  ...talkingStickCombatActionEffects,
  ...urakuMisugiriCombatActionEffects,
  ...aThousandBlazingSunsCombatActionEffects,
  ...mountainBracingBoltCombatActionEffects,
  ...fruitfulHookCombatActionEffects,
  ...azurelightCombatActionEffects,
  ...disasterAndRemorseCombatActionEffects,
  ...crimsonMoonsSemblanceCombatActionEffects,
  ...athameArtisCombatActionEffects,
  ...aTeaspoonOfTranscendenceCombatActionEffects,
  ...absolutionCombatActionEffects,
  ...amosBowCombatActionEffects,
  ...angelosHeptadesCombatActionEffects,
  ...ashGravenDrinkingHornCombatActionEffects,
  ...astralVulturesCrimsonPlumageCombatActionEffects,
  ...blackcliffAgateCombatActionEffects,
  ...blackcliffLongswordCombatActionEffects,
  ...blackcliffPoleCombatActionEffects,
  ...blackcliffSlasherCombatActionEffects,
  ...blackcliffWarbowCombatActionEffects,
  ...blackmarrowLanternCombatActionEffects,
  ...bloodsoakedRuinsCombatActionEffects,
  ...calamityQuellerCombatActionEffects,
  ...cashflowSupervisionCombatActionEffects,
  ...chainBreakerCombatActionEffects,
  ...cloudforgedCombatActionEffects,
  ...compoundBowCombatActionEffects,
  ...dragonspineSpearCombatActionEffects,
  ...endOfTheLineCombatActionEffects,
  ...eyeOfPerceptionCombatActionEffects,
  ...fadingTwilightCombatActionEffects,
  ...fangOfTheMountainKingCombatActionEffects,
  ...finaleOfTheDeepCombatActionEffects,
  ...flowerWreathedFeathersCombatActionEffects,
  ...flowingPurityCombatActionEffects,
  ...fracturedHaloCombatActionEffects,
  ...frostbearerCombatActionEffects,
  ...fruitOfFulfillmentCombatActionEffects,
  ...gestOfTheMightyWolfCombatActionEffects,
  ...goldenFrostboundOathCombatActionEffects,
  ...hakushinRingCombatActionEffects,
  ...haranGeppakuFutsuCombatActionEffects,
  ...huntersPathCombatActionEffects,
  ...ibisPiercerCombatActionEffects,
  ...ironStingCombatActionEffects,
  ...jadefallsSplendorCombatActionEffects,
  ...kagurasVerityCombatActionEffects,
  ...keyOfKhajNisutCombatActionEffects,
  ...lightOfFoliarIncisionCombatActionEffects,
  ...lightbearingMoonshardCombatActionEffects,
  ...lithicBladeCombatActionEffects,
  ...lithicSpearCombatActionEffects,
  ...lostPrayerToTheSacredWindsCombatActionEffects,
  ...lumidouceElegyCombatActionEffects,
  ...mappaMareCombatActionEffects,
  ...masterKeyCombatActionEffects,
  ...memoryOfDustCombatActionEffects,
  ...mistsplitterReforgedCombatActionEffects,
  ...moonweaversDawnCombatActionEffects,
  ...nightweaversLookingGlassCombatActionEffects,
  ...nocturnesCurtainCallCombatActionEffects,
  ...peakPatrolSongCombatActionEffects,
  ...polarStarCombatActionEffects,
  ...portablePowerSawCombatActionEffects,
  ...predatorCombatActionEffects,
  ...primordialJadeCutterCombatActionEffects,
  ...primordialJadeWingedSpearCombatActionEffects,
  ...prospectorsDrillCombatActionEffects,
  ...prospectorsShovelCombatActionEffects,
  ...prototypeRancourCombatActionEffects,
  ...prototypeStarglitterCombatActionEffects,
  ...rainbowSerpentsRainBowCombatActionEffects,
  ...rangeGaugeCombatActionEffects,
  ...redhornStonethresherCombatActionEffects,
  ...reliquaryOfTruthCombatActionEffects,
  ...ringOfYaxcheCombatActionEffects,
  ...royalBowCombatActionEffects,
  ...royalGreatswordCombatActionEffects,
  ...royalGrimoireCombatActionEffects,
  ...royalLongswordCombatActionEffects,
  ...royalSpearCombatActionEffects,
  ...sacrificersStaffCombatActionEffects,
  ...scionOfTheBlazingSunCombatActionEffects,
  ...sequenceOfSolitudeCombatActionEffects,
  ...serenitysCallCombatActionEffects,
  ...serpentSpineCombatActionEffects,
  ...silvershowerHeartstringsCombatActionEffects,
  ...skywardAtlasCombatActionEffects,
  ...snareHookCombatActionEffects,
  ...snowTombedStarsilverCombatActionEffects,
  ...splendorOfTranquilWatersCombatActionEffects,
  ...staffOfHomaCombatActionEffects,
  ...sturdyBoneCombatActionEffects,
  ...summitShaperCombatActionEffects,
  ...surfsUpCombatActionEffects,
  ...swordOfDescensionCombatActionEffects,
  ...symphonistOfScentsCombatActionEffects,
  ...theBellCombatActionEffects,
  ...theDaybreakChroniclesCombatActionEffects,
  ...theDockhandsAssistantCombatActionEffects,
  ...theFirstGreatMagicCombatActionEffects,
  ...theFluteCombatActionEffects,
  ...theUnforgedCombatActionEffects,
  ...theWidsithCombatActionEffects,
  ...thunderingPulseCombatActionEffects,
  ...tomeOfTheEternalFlowCombatActionEffects,
  ...tulaytullahsRemembranceCombatActionEffects,
  ...ultimateOverlordsMegaMagicSwordCombatActionEffects,
  ...verdictCombatActionEffects,
  ...vividNotionsCombatActionEffects,
  ...vortexVanquisherCombatActionEffects,
  ...waveridingWhirlCombatActionEffects,
  ...whiteblindCombatActionEffects,
  ...windblumeOdeCombatActionEffects,
  ...wolfFangCombatActionEffects,
  ...blackTasselCombatActionEffects,
  ...bloodtaintedGreatswordCombatActionEffects,
  ...coolSteelCombatActionEffects,
  ...darkIronSwordCombatActionEffects,
  ...debateClubCombatActionEffects,
  ...ferrousShadowCombatActionEffects,
  ...skyriderGreatswordCombatActionEffects,
  ...slingshotCombatActionEffects,
  ...thrillingTalesOfDragonSlayersCombatActionEffects,
  ...twinNephriteCombatActionEffects,
  ...sharpshootersOathCombatActionEffects,
  ...filletBladeCombatActionEffects,
  ...halberdCombatActionEffects,
  ...archaicPetraCombatActionEffects,
  ...adventurerCombatActionEffects,
  ...emblemOfSeveredFateCombatActionEffects,
  ...berserkerCombatActionEffects,
  ...blizzardStrayerCombatActionEffects,
  ...bloodstainedChivalryCombatActionEffects,
  ...braveHeartCombatActionEffects,
  ...deepwoodMemoriesCombatActionEffects,
  ...defendersWillCombatActionEffects,
  ...desertPavilionChronicleCombatActionEffects,
  ...echoesOfAnOfferingCombatActionEffects,
  ...flowerOfParadiseLostCombatActionEffects,
  ...noblesseObligeCombatActionEffects,
  ...gamblerCombatActionEffects,
  ...gildedDreamsCombatActionEffects,
  ...goldenTroupeCombatActionEffects,
  ...gladiatorsFinaleCombatActionEffects,
  ...heartOfDepthCombatActionEffects,
  ...instructorCombatActionEffects,
  ...lavawalkerCombatActionEffects,
  ...martialArtistCombatActionEffects,
  ...aubadeOfMorningstarAndMoonCombatActionEffects,
  ...nightOfTheSkysUnveilingCombatActionEffects,
  ...resolutionOfSojournerCombatActionEffects,
  ...retracingBolideCombatActionEffects,
  ...scholarCombatActionEffects,
  ...scrollOfTheHeroOfCinderCityCombatActionEffects,
  ...shimenawasReminiscenceCombatActionEffects,
  ...tenacityOfTheMillelithCombatActionEffects,
  ...theExileCombatActionEffects,
  ...thundersootherCombatActionEffects,
  ...thunderingFuryCombatActionEffects,
  ...wanderersTroupeCombatActionEffects,
  ...viridescentVenererCombatActionEffects,
  ...aDayCarvedFromRisingWindsCombatActionEffects,
  ...finaleOfTheDeepGalleriesCombatActionEffects,
  ...nighttimeWhispersInTheEchoingWoodsCombatActionEffects,
  ...obsidianCodexCombatActionEffects,
  ...disenchantmentInDeepShadowCombatActionEffects,
  ...huskOfOpulentDreamsCombatActionEffects,
  ...marechausseeHunterCombatActionEffects,
  ...paleFlameCombatActionEffects,
  ...vermillionHereafterCombatActionEffects,
  ...vourukashasGlowCombatActionEffects,
  ...celestialGiftCombatActionEffects,
  ...crimsonWitchOfFlamesCombatActionEffects,
  ...fragmentOfHarmonicWhimsyCombatActionEffects,
  ...longNightsOathCombatActionEffects,
  ...luckyDogCombatActionEffects,
  ...nymphsDreamCombatActionEffects,
  ...silkenMoonsSerenadeCombatActionEffects,
  ...unfinishedReverieCombatActionEffects,
]

/** A JSON-safe source requirement that a UI can validate against the configured team. */
export type CombatActionEffectOptionSource =
  | {
      readonly characterId: string
      readonly kind: "character"
      readonly minimumSourceConstellation?: number
    }
  | { readonly holder?: "party_member" | "primary"; readonly kind: "weapon"; readonly weaponId: string }
  | {
      readonly holder?: "party_member" | "primary"
      readonly kind: "artifact_set"
      readonly minimumPieces: number
      readonly setId: string
    }

/** A JSON-safe active snapshot choice that a UI can validate against the configured team. */
export interface CombatActionEffectOption {
  readonly exclusiveGroup?: string
  readonly id: string
  readonly label: string
  readonly recipientSourceRelation?: "not_source" | "source"
  /** IDs whose active selection derives this option instead of exposing an independent snapshot toggle. */
  readonly requiredActiveEffectIds?: string[]
  readonly selectionMode?: "optional"
  readonly source: CombatActionEffectOptionSource
}

/** One audited passive clause for equipment exposed in the current catalog. */
export type CombatEquipmentEffectCoverage = PublishedEquipmentCoverageClause

/** Lists every explicitly audited equipment passive clause for the currently selectable catalog. */
export function listCombatEquipmentEffectCoverage(): readonly CombatEquipmentEffectCoverage[] {
  return listPublishedEquipmentCoverageClauses()
}

/** Lists every maintained automatic or explicit current-action effect declaration. */
export function listCombatActionEffects(): readonly CombatActionEffect[] {
  return [...equipmentCombatActionEffects, ...characterCombatCoverageRegistry.flatMap((coverage) => coverage.actionEffects ?? [])]
}

/**
 * Checks whether an action matches the content-owned target restrictions for one action effect.
 *
 * Callers evaluating an elemental override may supply the final elements of every damage event. An action-scoped
 * effect may contribute only when its element filter covers every resulting event, preventing a partial override
 * from incorrectly buffing unrelated hits in the same selected action.
 */
export function isCombatActionEffectApplicable(
  effect: CombatActionEffect,
  action: CombatActionMetadata,
  effectiveElements: readonly CombatActionMetadata["element"][] = [action.element],
  recipientWeaponType?: CatalogWeaponType,
  candidateAmplifyingReactionKinds: readonly NonNullable<CombatActionMetadata["amplifyingReaction"]>["kind"][] = [],
  candidateReactionKinds: readonly CombatActionReactionKind[] = []
): boolean {
  const filter = effect.targetFilter
  if (!filter) return true
  if (filter.actionIds && !filter.actionIds.includes(action.id)) return false
  if (filter.recipientCharacterIds && !filter.recipientCharacterIds.includes(action.characterId)) return false
  if (filter.recipientHexereiRequired && !isHexereiCharacter(action.characterId)) return false
  if (filter.excludedActionIds?.includes(action.id)) return false
  if (filter.recipientWeaponTypes && (!recipientWeaponType || !filter.recipientWeaponTypes.includes(recipientWeaponType))) {
    return false
  }
  const attackKind = action.attackKind ?? (action.talentSlot === "normal" ? "normal" : undefined)
  if (filter.attackKinds && (!attackKind || !filter.attackKinds.includes(attackKind))) return false
  if (
    filter.amplifyingReactionKinds &&
    ![...(action.amplifyingReaction ? [action.amplifyingReaction.kind] : []), ...candidateAmplifyingReactionKinds].some((kind) =>
      filter.amplifyingReactionKinds!.includes(kind)
    )
  ) {
    return false
  }
  if (
    filter.reactionKinds &&
    ![
      ...(action.additiveReaction ? [action.additiveReaction.kind] : []),
      ...(action.transformativeReaction ? [action.transformativeReaction.kind] : []),
      ...candidateReactionKinds
    ].some((kind) => filter.reactionKinds!.includes(kind))
  ) {
    return false
  }
  if (
    filter.specialReactionKinds &&
    (!action.specialReaction || !filter.specialReactionKinds.includes(action.specialReaction.kind))
  ) {
    return false
  }
  const actionElements = effectiveElements.length > 0 ? effectiveElements : [action.element]
  const filterElements = filter.elements
  if (filterElements && !actionElements.every((element) => filterElements.includes(element))) return false
  return !filter.talentSlots || filter.talentSlots.includes(action.talentSlot)
}

/** Lists active snapshot choices that can affect the selected action before source-build validation. */
export function listActiveCombatActionEffectsForAction(action: CombatActionMetadata): readonly CombatActionEffect[] {
  return listCombatActionEffects().filter(
    (effect) => effect.activation === "active" && isCombatActionEffectApplicable(effect, action)
  )
}

/** Returns whether content declares an active effect as established by the selected action. */
export function isCombatActionEffectDeterministicallyActive(
  effect: CombatActionEffect,
  action: CombatActionMetadata
): boolean {
  const activation = effect.deterministicSnapshotActivation
  if (effect.activation !== "active" || activation === undefined) return false
  const actionCapabilities = action.deterministicSnapshotCapabilities ?? []
  return activation.requiredActionSnapshotCapabilities.every((capability) => actionCapabilities.includes(capability))
}

/** Projects maintained source-owned snapshots into UI choices for the selected action. */
export function listActiveCombatActionEffectOptionsForAction(
  action: CombatActionMetadata
): readonly CombatActionEffectOption[] {
  return listActiveCombatActionEffectsForAction(action)
    .filter((effect) => effect.deterministicSnapshotActivation === undefined)
    .map((effect) => ({
      ...(effect.exclusivity === undefined ? {} : { exclusiveGroup: effect.exclusivity.group }),
      id: effect.id,
      label: effect.label,
      ...(effect.requiredActiveEffectIds === undefined
        ? {}
        : { requiredActiveEffectIds: [...effect.requiredActiveEffectIds] }),
      ...(effect.targetFilter?.recipientSourceRelation === undefined
        ? {}
        : { recipientSourceRelation: effect.targetFilter.recipientSourceRelation }),
      ...(effect.selectionMode === undefined ? {} : { selectionMode: effect.selectionMode }),
      source: projectCombatActionEffectOptionSource(effect.source)
    }))
}

/** Lists source-owned elemental override snapshots that can target one declared normal-attack action. */
export function listActiveCombatElementOverrideEffectOptionsForAction(
  action: CombatActionMetadata,
  targetWeaponType: CatalogWeaponType
): readonly CombatActionEffectOption[] {
  if (!action.timeline?.damageEvents.some((event) => event.elementOverrideTarget === "normal_attack")) return []
  return listCombatElementOverrideEffects()
    .filter((effect) => effect.eligibleWeaponTypes.some((weaponType) => weaponType === targetWeaponType))
    .map(projectCombatElementOverrideEffectOption)
}

/** Lists every active snapshot that the scenario can select for the target action and weapon family. */
export function listActiveScenarioEffectOptionsForAction(
  action: CombatActionMetadata,
  targetWeaponType: CatalogWeaponType
): readonly CombatActionEffectOption[] {
  const options = [
    ...listActiveCombatActionEffectOptionsForAction(action),
    ...listActiveCombatElementOverrideEffectOptionsForAction(action, targetWeaponType)
  ]
  return options.filter((option, index) => options.findIndex((candidate) => candidate.id === option.id) === index)
}

function projectCombatActionEffectOptionSource(
  source: CombatActionEffect["source"]
): CombatActionEffectOptionSource {
  switch (source.kind) {
    case "artifact_set":
      return {
        ...(source.holder === undefined ? {} : { holder: source.holder }),
        kind: source.kind,
        minimumPieces: source.minimumPieces,
        setId: source.setId
      }
    case "character":
      return {
        characterId: source.characterId,
        kind: source.kind,
        ...(source.minimumSourceConstellation === undefined
          ? {}
          : { minimumSourceConstellation: source.minimumSourceConstellation })
      }
    case "weapon":
      return {
        ...(source.holder === undefined ? {} : { holder: source.holder }),
        kind: source.kind,
        weaponId: source.weaponId
      }
  }
}

function projectCombatElementOverrideEffectOption(effect: CombatElementOverrideEffect): CombatActionEffectOption {
  return {
    id: effect.id,
    label: effect.label,
    ...(effect.requiredActiveEffectIds === undefined
      ? {}
      : { requiredActiveEffectIds: [...effect.requiredActiveEffectIds] }),
    source: {
      characterId: effect.sourceCharacterId,
      kind: "character",
      ...(effect.minimumSourceConstellation === undefined
        ? {}
        : { minimumSourceConstellation: effect.minimumSourceConstellation })
    }
  }
}
