/**
 * Earth-side technology-transfer pointers: published fire-safety advances that
 * trace back to NASA crewed-spaceflight combustion research, shown alongside the
 * FlameScout catalog records that carry the underlying evidence.
 *
 * House rules apply here too:
 *  - No safe/unsafe claims, no product endorsements.
 *  - Entries are "transfer pointers" — they describe highlighted published
 *    applications, not new conclusions drawn from the catalog.
 *  - `strength` grades how well-documented the NASA → Earth link itself is,
 *    never the safety value of the technology.
 */

export type EarthTransferStrength = "Strong" | "Moderate" | "Limited";

export interface EarthApplication {
  id: string;
  title: string;
  /** Where the capability came from (NASA program / mission context). */
  spaceOrigin: string;
  /** How it is used terrestrially, per published transfer narratives. */
  earthUse: string;
  /** FlameScout catalog records carrying the related combustion evidence. */
  related: string[];
  /** Named NASA origin line for the pointer, kept general to stay verifiable. */
  sourceNote: string;
  strength: EarthTransferStrength;
}

export const EARTH_APPLICATIONS: EarthApplication[] = [
  {
    id: "water-mist",
    title: "Fine-water-mist extinguishment",
    spaceOrigin:
      "NASA developed fine-water-mist fire suppression for crewed spacecraft, where halon-based portable extinguishers raise toxicity and cleanup concerns in sealed cabins and every litre of extra water mass matters. Spacecraft fire research (e.g. the BASS / BASS-II suppression studies, cooling- and droplet-scale work at NASA Glenn) shaped how mist encounters flames without buoyancy.",
    earthUse:
      "Published transfer narratives describe the same fine-water-mist concept reaching terrestrial use — commercial buildings, marine and machinery-space protection, and self-contained extinguisher products — prized for using far less water than sprinklers while suppressing fires that gas agents cannot reach for long.",
    related: ["BASS", "BASS-II"],
    sourceNote: "NASA fine-water-mist extinguisher development for the ISS; NASA technology-transfer publications.",
    strength: "Strong",
  },
  {
    id: "smoke-detection",
    title: "Smoke detection & alarm discrimination",
    spaceOrigin:
      "The SAME / SAME-R PSI line measured smoke particle-size distributions from overheated spacecraft materials, showing material-specific behaviour that differs from the assumptions Earth-bound detectors inherit. DAFT / DAFT-2 added a second detection problem: discriminating real smoke from ambient airborne dust before an alarm is raised.",
    earthUse:
      "The same particle-size groundwork feeds terrestrial detector design themes — nuisance-alarm discrimination (cooking vs. fire), sensitivity tuning, and multi-sensor detectors — areas NASA has long published on and commercial detector development tracks.",
    related: ["SAME", "SAME-R", "DAFT", "DAFT-2"],
    sourceNote: "SAME / SAME-R smoke characterization and DAFT dust-background studies; NASA public reports and PSI records.",
    strength: "Strong",
  },
  {
    id: "scba",
    title: "Firefighter breathing-air cylinders & protective fabric",
    spaceOrigin:
      "Lightweight composite pressure vessels first matured for storing spacecraft breathing gas and propellants were later manufactured at terrestrial scale. NASA's Apollo-era materials program also drove development of inherently flame-resistant fiber (PBI) later adopted in protective clothing.",
    earthUse:
      "Documented firefighting uses include fibre-wrapped composite self-contained breathing apparatus (SCBA) air tanks — lighter than steel with higher working pressure — and PBI-blend turnout-gear fabric used by fire services worldwide.",
    related: [],
    sourceNote: "NASA Spinoff publications: composite SCBA cylinders; PBI gold protective fabric lineage.",
    strength: "Moderate",
  },
  {
    id: "materials-screening",
    title: "Material flammability screening practice",
    spaceOrigin:
      "Microgravity flammability studies (BASS, CSA, Saffire I–III) plus spacecraft materials-screening standards established how thin/thick geometry, forced flow and atmosphere shift what burns — evidence that material behavior near a flame is configuration-dependent, not a simple Earth-Grav constant.",
    earthUse:
      "Terrestrial practice already treats flammability as configuration-dependent (orientation, thickness, airflow) in test standards and screening regimes; the microgravity record supplies boundary-condition data for computational flammability models used in materials selection research.",
    related: ["BASS", "BASS-II", "SAFFIRE"],
    sourceNote: "SAFFIRE large-scale spacecraft fire experiments; NASA-STD-6001 flammability screening framework.",
    strength: "Moderate",
  },
  {
    id: "burner-design",
    title: "Cleaner, soot-aware burner design",
    spaceOrigin:
      "The FLEX-2 / Flame Design / SPICE lines measured smoke point and soot behaviour of diffusion flames in microgravity, showing that soot formation — not oxygen kinetics alone — sets a flame's practical limit, and that Earth correlations shift gravity-free.",
    earthUse:
      "Soot-aware burner design translates directly into cleaner industrial and residential combustion: reduced particulate output, better efficiency at fixed heat output, and lower-visibility flue — the Flame Design summary frames these microgravity measurements as bridging Earth design heuristics and flame behaviour.",
    related: ["Flame Design", "SPICE", "FLEX-2"],
    sourceNote: "Smoke-point / flame-stability measurements in the FLEX-2, Flame Design, SPICE catalog records.",
    strength: "Limited",
  },
];

/** Shared honesty note wording, kept in one place for reuse. */
export const EARTH_TRANSFER_NOTE =
  "These entries are technology-transfer pointers to published NASA spinoff narratives, not conclusions drawn from the FlameScout catalog. Strength grades how well-documented the NASA → Earth link itself is, and never implies a safe/unsafe finding. Rockets and propellants stay out of scope, as in the rest of FlameScout.";
