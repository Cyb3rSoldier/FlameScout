import type { Experiment } from "../types";

/**
 * Real NASA microgravity combustion investigations surfaced through the
 * Physical Science Informatics (PSI) database and NASA public reports.
 *
 *  - `oxygen` / `pressure` are representative anchors, not every run value.
 *  - `approx: true` marks conditions that are approximate / summarized.
 *  - `oxygenNote` / `pressureNote` / `keyFindings` carry the exact hedge
 *    wording that is shown in the UI ("published summaries describe…").
 *  - No record makes a safe/unsafe claim. See /methodology.
 *
 * The only full run-level dataset is FLEX Table IX (see flexTests.ts).
 * psi (PSI dataset identifiers) are given as pointers where publicly known.
 */

export const EXPERIMENTS: Experiment[] = [
  /* ── Prevention: solid material flammability (spacecraft fire safety) ── */

  {
    id: "BASS",
    title: "Burning and Suppression of Solids (BASS)",
    fuel: "Cotton / PMMA (solid)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Opposed & concurrent flow ≤ ~5 cm/s (fan duct)",
    outcome:
      "Published summaries describe sustained opposed-flow flame spread over thin cotton-fiberglass fabric in microgravity at cabin-like atmosphere, with concurrent-flow spread continuing after flow changes.",
    evidenceStrength: "Strong",
    sourceId: "SRC-BASS",
    objective:
      "Determine how solid-material flame spread and suppression differ in microgravity versus Earth gravity, with an eye to spacecraft cabin atmospheres.",
    project: "Spacecraft Fire Safety / MSG",
    hardware: "ISS · Microgravity Science Glovebox (MSG) fan-driven flow duct",
    years: "2010–2012 (approx.)",
    materials: ["Cotton-fiberglass fabric", "PMMA (Plexiglas)", "Thick/thin solid samples"],
    oxygenNote: "≈21% O₂ (cabin-like atmosphere)",
    pressureNote: "≈101 kPa (cabin-like)",
    variables: ["Opposed vs concurrent airflow", "Flow speed", "Sample configuration (thin/thick)", "Fuel material"],
    measurements: ["Video flame spread", "Flame shape & brightness", "Suppression attempts (aerosol/flow)", "Sample regression"],
    keyFindings: [
      "Flame spread over thin fabric persists in microgravity at cabin-like atmosphere — materials selection must assume forced-flow dependence [1].",
      "Suppression behaviour studied in-flight: spread responds to flow direction changes (published summaries describe geometry-dependent burns) [1].",
    ],
    fireFocus: ["prevention", "suppression"],
    keywords: ["solid", "fabric", "cotton", "pmma", "spread", "flammability", "suppression"],
  },

  {
    id: "BASS-II",
    title: "Burning and Suppression of Solids – II (BASS-II)",
    fuel: "Cotton / PMMA (solid)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Very low forced flow; long-duration burns",
    outcome:
      "Published summaries describe very long-duration flame spread in extremely low flow, with fabric samples burning for many minutes and spreading behaviour changing slowly over time.",
    evidenceStrength: "Strong",
    sourceId: "SRC-BASS",
    objective:
      "Extend BASS to the low-flow / long-duration regime, where the balance between forced flow and buoyancy changes most dramatically in microgravity.",
    project: "Spacecraft Fire Safety / MSG",
    hardware: "ISS · MSG fan-driven flow duct (BASS hardware)",
    years: "2014–2017 (approx.)",
    materials: ["Cotton-fiberglass fabric", "PMMA", "Additional fabric/plastic samples"],
    oxygenNote: "≈21% O₂ (cabin-like atmosphere)",
    pressureNote: "≈101 kPa (cabin-like)",
    variables: ["Very low airflow speeds", "Extended burn durations", "Fuel form & size", "Material type"],
    measurements: ["Long-duration video", "Surface regression rate", "Flame spread rate vs flow", "Extinction behaviour"],
    keyFindings: [
      "Long-duration burns are supported in microgravity low flow; the evidence describes continued spread where shallow quiescent regions were historically assumed self-extinguishing [1].",
      "Spread-rate trends over the very-low-flow regime inform how spacecraft ventilation interacts with material flammability [1].",
    ],
    fireFocus: ["prevention", "suppression"],
    keywords: ["solid", "fabric", "long burn", "low flow", "spread", "flammability", "quiescent"],
  },

  /* ── Prevention: largest-ever spacecraft fire experiments ── */

  {
    id: "SAFFIRE-I",
    title: "Spacecraft Fire Safety Demonstration (Saffire-I)",
    fuel: "Cotton-fiberglass fabric (solid)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Duct flow ≈ 10–20 cm/s (approx.)",
    outcome:
      "Published summaries describe the largest intentional spacecraft fire ever conducted, with the large fabric sample burning inside the enclosed instrumented flow duct.",
    evidenceStrength: "Strong",
    sourceId: "SRC-SAFFIRE",
    objective:
      "Study large-scale fire growth on a single ~0.4 × 1 m fabric sample in microgravity, at an overall size impossible to achieve inside the ISS, to enable prediction of fire growth in habitable volumes.",
    project: "Spacecraft Fire Safety",
    hardware: "Uncrewed Cygnus cargo spacecraft · instrumented flow duct",
    years: "2016 (approx.)",
    materials: ["Cotton-fiberglass blend fabric (0.41 × 0.94 m, approx.)"],
    oxygenNote: "≈21% O₂ (cabin-like atmosphere)",
    pressureNote: "≈101 kPa (cabin-like)",
    variables: ["Sample size (large scale)", "Flow speed", "Duration of burn"],
    measurements: ["Cinematic video imagery", "Flame-spread extent", "Heat release estimate", "Temperature profiles"],
    keyFindings: [
      "Large-scale fire growth in microgravity was demonstrated and offered for material-response modeling [2].",
      "Saffire's scale bridges ISS bench-top fabric data to spacecraft-volume fire scenarios for model validation [2].",
    ],
    fireFocus: ["prevention"],
    keywords: ["large-scale", "fire growth", "fabric", "model", "spacecraft", "saffire"],
  },

  {
    id: "SAFFIRE-II",
    title: "Spacecraft Fire Safety Demonstration (Saffire-II)",
    fuel: "Mixed material samples (solid)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Duct flow (instrumented)",
    outcome:
      "Published summaries describe multiple smaller material samples burning in a single duct, allowing direct comparison between different spacecraft-relevant materials under identical conditions.",
    evidenceStrength: "Strong",
    sourceId: "SRC-SAFFIRE",
    objective:
      "Burn nine distinct material samples (various spacecraft materials and thicknesses) in the same flow field so flammability can be compared across materials and related to small-scale tests.",
    project: "Spacecraft Fire Safety",
    hardware: "Uncrewed Cygnus cargo spacecraft · instrumented flow duct",
    years: "2016 (approx.)",
    materials: ["Cotton-fiberglass fabric", "Nomex-type fabric", "Kapton-type film", "PTFE-type material", "Other spacecraft polymers (mixed set of 9)"],
    oxygenNote: "≈21% O₂ (cabin-like atmosphere)",
    pressureNote: "≈101 kPa (cabin-like)",
    variables: ["Material identity", "Thickness", "Sample orientation", "Shared flow field"],
    measurements: ["Video of each sample", "Heat flux & temperature estimates", "Flame behavior per material"],
    keyFindings: [
      "Direct flammability comparison between multiple spacecraft-relevant materials was collected under a single flow condition [2].",
      "Results connect individual small-scale material samples to large-scale fire-growth modeling for crewed volumes [2].",
    ],
    fireFocus: ["prevention"],
    keywords: ["materials", "comparison", "fabric", "nomex", "polymers", "saffire"],
  },

  {
    id: "SAFFIRE-III",
    title: "Spacecraft Fire Safety Demonstration (Saffire-III)",
    fuel: "Cotton-fiberglass fabric (solid)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Duct flow (varied across phases, approx.)",
    outcome:
      "Published summaries describe a final large-sample spacecraft fire with varied conditions phases, extending the Saffire-I evidence into deliberately changing upstream flow scenarios.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-SAFFIRE",
    objective:
      "Extend Saffire-I with a fire able to interact with changing conditions, providing evidence for how fires respond in scenarios closer to an unattended spacecraft fire.",
    project: "Spacecraft Fire Safety",
    hardware: "Uncrewed Cygnus cargo spacecraft · instrumented flow duct",
    years: "2017 (approx.)",
    materials: ["Cotton-fiberglass fabric (large sample)"],
    oxygenNote: "≈21% O₂ (cabin-like atmosphere)",
    pressureNote: "≈101 kPa (cabin-like)",
    variables: ["Condition phases over burn", "Flow variations", "Sample scale"],
    measurements: ["Video", "Heat-release trend", "Pressure/temperature telemetry"],
    keyFindings: [
      "Large-fire response to changing test conditions was demonstrated at serial scale [2].",
      "Completes the Saffire trilogy's data pool for spacecraft fire-growth modeling effort [2].",
    ],
    fireFocus: ["prevention"],
    keywords: ["large-scale", "phases", "fire dynamics", "saffire", "spacecraft"],
  },

  /* ── Detection: smoke and aerosol measurements ── */

  {
    id: "SAME",
    title: "Smoke and Aerosol Measurement Experiment (SAME)",
    fuel: "Overheated spacecraft materials (smoke)",
    oxygen: null,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent smoke sampling",
    outcome:
      "Published summaries report particle size distributions from overheated spacecraft materials, showing smoke particle sizes vary strongly by source material and differ from Earth-based detector assumptions.",
    evidenceStrength: "Strong",
    sourceId: "SRC-SAME",
    objective:
      "Characterize outgoing smoke particle sizes from overheated spacecraft materials to design next-generation smoke detectors that detect fires early in microgravity without false alarms.",
    project: "Spacecraft Fire Safety / detection",
    hardware: "ISS modal facility · smoke-generation sample oven + Fire Detection Modules (FDM)",
    years: "2006–2012 (approx.)",
    materials: ["Teflon (PTFE)", "Kapton", "Cotton", "Cellulose", "Silicone rubber (as smoke sources)"],
    oxygenNote: "Not applicable (smoke/aerosol generation, not flame combustion)",
    pressureNote: "≈101 kPa cabin environment",
    variables: ["Smoke source material", "Overheating condition", "Detector type"],
    measurements: ["Particle size distribution (FDM)", "Count median diameter", "Detector response comparison"],
    keyFindings: [
      "Smoke particle size differs strongly by source material (published summaries give material-specific distributions) [6].",
      "Direct evidence supports re-designing smoke-detection thresholds around actual spacecraft smoke instead of Earth detector legacy [6].",
    ],
    fireFocus: ["detection"],
    keywords: ["detection", "smoke", "aerosol", "detector", "particle size", "alarm"],
  },

  {
    id: "SAME-R",
    title: "Smoke and Aerosol Measurement Experiment – R (SAME-R)",
    fuel: "Overheated spacecraft materials (smoke)",
    oxygen: null,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent smoke sampling",
    outcome:
      "Published summaries repeat the SAME measurements with updated instruments and additional materials, refining the particle-size evidence used for spacecraft detector design.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-SAME",
    objective:
      "Re-run SAME with refinements to gather a broader and more accurate dataset of smoke particle characteristics for spacecraft fire detection design.",
    project: "Spacecraft Fire Safety / detection",
    hardware: "ISS modal facility · SAME follow-on hardware",
    years: "Follow-on to SAME (approx.)",
    materials: ["Additional/same spacecraft materials as smoke sources (incl. reported ABS)"],
    oxygenNote: "Not applicable (smoke/aerosol generation)",
    pressureNote: "≈101 kPa cabin environment",
    variables: ["Smoke source material", "Detector configuration", "Sampling conditions"],
    measurements: ["Particle size distributions", "Detector response curves"],
    keyFindings: [
      "Repeat campaign confirms the material-specific variance of outgoing smoke size (published summaries describe refined distributions) [6].",
      "Direct input for next-generation spacecraft fire detectors [6].",
    ],
    fireFocus: ["detection"],
    keywords: ["detection", "smoke", "follow-on", "repeat", "particle", "alarm"],
  },

  /* ── Suppression: droplet flame extinction ── */

  {
    id: "FLEX",
    title: "Flame Extinguishment Experiment (FLEX)",
    fuel: "Methanol / heptane (droplets)",
    oxygen: 20,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent (still chamber)",
    outcome:
      "276 tests charted droplet-burning extinction, burn time and burning rate across pressure, oxygen and gas-diluent conditions (Table IX of NASA/TP-2015-216046).",
    evidenceStrength: "Strong",
    sourceId: "SRC-FLEX",
    objective:
      "Map how droplet flames extinguish in atmospheres diluted with N₂, CO₂ and He, providing the extinction-limit evidence needed to design flame-suppression atmospheres.",
    project: "FLEX",
    hardware: "ISS · Combustion Integrated Rack (CIR) · Multi-user Droplet Combustion Apparatus (MDCA)",
    years: "2009–2011 (Table IX span)",
    materials: ["Methanol droplets", "Heptane droplets"],
    oxygenNote: "12–34% O₂ across diluents (median 20%)",
    pressureNote: "70–309 kPa (526–2320 mmHg); 266 of 275 tests at or below about 107 kPa",
    oxygenRange: [12, 34],
    pressureRange: [70, 309],
    jointTests: { "lunar-base": 0, "pressurized-rover": 0 },
    variables: ["Fuel (methanol/heptane)", "Ambient pressure", "O₂ concentration", "Diluent (N₂ / CO₂ / He)", "Droplet diameter"],
    measurements: ["Droplet diameter vs time (video)", "Extinction diameter", "Burning rate", "Burn duration", "End-state classification"],
    keyFindings: [
      "Extinction boundaries measured across diluents — CO₂ and He show distinct suppression potency relative to N₂ [3].",
      "Cool-flame behaviour observed in some methanol droplets after visible-flame extinction (published FLEX summaries describe 'cool flames') [3].",
    ],
    fireFocus: ["suppression", "combustion-physics"],
    keywords: ["droplet", "extinction", "suppression", "cool flame", "n2", "co2", "he", "diluent"],
  },

  {
    id: "FLEX-2",
    title: "Flame Extinguishment Experiment – 2 (FLEX-2)",
    fuel: "Methanol / ethanol / heptane mixtures (droplets)",
    oxygen: 18,
    pressure: 80,
    gravity: "Microgravity",
    airflow: "Quiescent (still chamber)",
    outcome:
      "Follow-on droplet campaign examined fuel mixtures and stricter diluent controls, extending extinction-limit evidence beyond FLEX's single-fuel scope.",
    evidenceStrength: "Strong",
    sourceId: "SRC-FLEX2",
    objective:
      "Extend FLEX droplet extinction work to binary fuel mixtures and reconsider the role of the gas environment in droplet-flame survival, especially near-limit behaviour.",
    project: "FLEX",
    hardware: "ISS · CIR · MDCA",
    years: "Follow-on to FLEX (approx.)",
    materials: ["Methanol", "Ethanol", "Heptane", "Binary mixtures of the above"],
    oxygenNote: "Reduced-O₂ diluent sweeps (real values vary per run)",
    pressureNote: "Chamber pressure sweeps (values vary per run)",
    variables: ["Fuel mixtures", "O₂", "Diluent type & amount", "Droplet size"],
    measurements: ["Diameter history", "Extinction diameter", "Cool-flame observations", "Burning rate"],
    keyFindings: [
      "Mixture droplets show distinct cool-flame and survival windows not present in single-fuel droplets (published summaries describe these regimes) [4].",
      "Extends the extinction-limit map relevant to gaseous-suppression and atmospherically diluted environments [4].",
    ],
    fireFocus: ["suppression", "combustion-physics"],
    keywords: ["droplet", "mixture", "extinction", "suppression", "cool flame", "diluent"],
  },

  /* ── ACME: modular gaseous-fuel investigations (CIR) ── */

  {
    id: "BRE",
    title: "Burning Rate Emulator (BRE)",
    fuel: "Gaseous (emulating solid burning)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent (still atmosphere)",
    outcome:
      "Published summaries describe gaseous burner flames set to emulate a burning solid surface in still air, so material-property-based flammability can be probed without dealing with sample variability.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-ACME",
    objective:
      "Estimate the burning rates of solid materials by placing a gas burner flame that reproduces the heat-feedback of a burning solid — turning material flammability into a well-controlled gas-flame study.",
    project: "ACME",
    hardware: "ISS · CIR · ACME modular chamber hardware",
    years: "2010s (approx.)",
    materials: ["Gas flames emulating solid-fuel burning rates (material properties input)"],
    oxygenNote: "Still-atmosphere sweeps incl. near-limit O₂ values",
    pressureNote: "Ambient-to-elevated pressure sweeps (approx.)",
    variables: ["Emulated solid material properties", "O₂", "Pressure", "Still vs forced flow"],
    measurements: ["Burning rate", "Flame strength", "Extinction onset", "Heat release (reported by O₂ consumption)"],
    keyFindings: [
      "Provides a materials-flammability bridge for spacecraft atmospheres without burning solid samples directly — usable as a proxy for the crew-environment relevance ranking (see Mission Fit) [5].",
      "Still-atmosphere burning-rate data directly inform the ventilation-dependence of spacecraft fire risk [5].",
    ],
    fireFocus: ["prevention", "combustion-physics"],
    keywords: ["burning rate", "solid", "emulation", "flammability", "still atmosphere", "acme", "materials"],
  },

  {
    id: "CLD-FLAME",
    title: "Cooled Laminar Diffusion Flames (CLD Flame)",
    fuel: "Gaseous hydrocarbon (ethylene / fuel gas, approx.)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Co-flowing laminar diffusion flame",
    outcome:
      "Published summaries describe soot formation and elimination in a cooled, co-flowing diffusion flame, linking burner temperature and dilution to soot production.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-ACME",
    objective:
      "Develop and study a laminar diffusion flame in which soot formation can be controlled (via a cooled burner), informing how flames produce smoke and how smoke generation limits might be designed.",
    project: "ACME",
    hardware: "ISS · CIR · ACME modular chamber hardware",
    years: "2010s (approx.)",
    materials: ["Hydrocarbon gas fuel (ethylene-class, approximate)", "N₂ / diluent streams"],
    oxygenNote: "≈21% O₂ baseline with diluted sweeps (approx.)",
    pressureNote: "≈101 kPa ambient range",
    variables: ["Burner temperature", "Fuel/diluent mix", "Co-flow setting"],
    measurements: ["Soot volume fraction", "Flame structure video", "Temperature field"],
    keyFindings: [
      "Soot-free (or soot-controlled) diffusion flames were demonstrated, informing how flame temperature and dilution drive smoke production [5].",
      "Furnishes smoke-generation evidence relevant to the SAME/R-particulate line (detection calibration) [5].",
    ],
    fireFocus: ["combustion-physics", "detection"],
    keywords: ["soot", "smoke", "diffusion flame", "cooled", "ethylene", "acme", "detection"],
  },

  {
    id: "E-FIELD",
    title: "Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames)",
    fuel: "Methane (gas)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent laminar diffusion flame",
    outcome:
      "Published summaries describe electric-field forcing of ions within buoyancy-free flames, driving flame-shape and motion change analogous to partial-gravity effects.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-ACME",
    objective:
      "Use flame ions themselves as an actuator: apply an electric field to spherically rounded microgravity diffusion flames to test flame-shape and soot control, and to mimic partial-gravity dynamics.",
    project: "ACME",
    hardware: "ISS · CIR · ACME modular chamber hardware (with electric-field electrodes)",
    years: "2010s (approx.)",
    materials: ["Methane fuel (jet diffusion flames)"],
    oxygenNote: "≈21% O₂ baseline (approx.)",
    pressureNote: "≈101 kPa ambient range",
    variables: ["Electric-field strength & polarity", "Fuel flow", "Flame geometry (spherical/normally tube-shape)"],
    measurements: ["Flame shape vs field", "Ion-driven motion", "Soot/CH* intensity (est.)"],
    keyFindings: [
      "Ion-mediated 'electric wind' can change flame position and shape without any forced flow — a non-flow way to emulate gravity-like behaviour (relevant to partial-g modeling, see LUCI note) [5].",
      "Supports the idea that electric fields might someday serve as non-mechanical soot/risk control on crewed spacecraft (conceptual, not hardware-ready) [5].",
    ],
    fireFocus: ["combustion-physics", "prevention"],
    keywords: ["electric field", "partial gravity", "mimic", "spherical flame", "acme", "ions"],
  },

  {
    id: "FLAME-DESIGN",
    title: "Flame Design",
    fuel: "Ethylene / fuel gas (approx.)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Laminar diffusion flame with enriched-O₂/diluent flow",
    outcome:
      "Published summaries describe O₂-enriched and diluent-swept diffusion flames that decouple soot formation from flame temperature and stoichiometry in microgravity.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-ACME",
    objective:
      "Test the hypothesis that soot production in flames depends on the flame's oxidative/dilution environment (not just chemistry), directly informing how elevated-O₂ atmospheres change spacecraft fire risk.",
    project: "ACME",
    hardware: "ISS · CIR · ACME modular chamber hardware",
    years: "2020s (approx.)",
    materials: ["Ethylene-class hydrocarbon gas fuels", "O₂-enriched and He/N₂-diluent atmospheres"],
    oxygenNote: "O₂-enriched sweeps (values vary per run, approx.)",
    pressureNote: "≈101 kPa ambient range",
    variables: ["O₂ enrichment", "Diluent (He/N₂)", "Fuel flow", "Smoke point"],
    measurements: ["Smoke point", "Soot production", "Heat-release behavior", "Flame structure"],
    keyFindings: [
      "Directly probes the elevated-O₂ regime — the atmospheric knob that makes materials more flammable on a Moon Base (per the plan to use ≥30% O₂ atmospheres there) [5].",
      "Provides smoke-point evidence at O₂ enrichment relevant to upcoming spacecraft atmospheres [5].",
    ],
    fireFocus: ["prevention", "combustion-physics"],
    keywords: ["elevated oxygen", "enriched", "smoke point", "diluent", "soot", "moon", "acme"],
  },

  /* ── Cool-flames gas program (highest-O₂ microgravity data) ── */

  {
    id: "CFI",
    title: "Cool Flames Investigation (CFI)",
    fuel: "Heptane-class fuel (droplets)",
    oxygen: 18,
    pressure: 80,
    gravity: "Microgravity",
    airflow: "Quiescent droplet burning",
    outcome:
      "Published summaries describe continued droplet cool-flame research using the MDCA, extending FLEX-2's cool-flame discovery toward a dedicated investigation.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-CFI",
    objective:
      "Dedicated cool-flame droplet-burning study — understand low-temperature chemistry regimes that can burn invisibly ('cool flames') after visible flame extinction.",
    project: "ACME",
    hardware: "ISS · CIR · MDCA (per droplet-combustion line)",
    years: "2015–2019 (approx.)",
    materials: ["Heptane-class liquid fuels (possibly mixtures)"],
    oxygenNote: "Reduced-O₂ chamber atmosphere sweeps (approx.)",
    pressureNote: "Chamber sweeps (approx.)",
    variables: ["Fuel identity/mixtures", "O₂", "Pressure", "Droplet diameter"],
    measurements: ["Droplet history", "Cool-flame diagnostics", "Extinction diameters"],
    keyFindings: [
      "Cool-flame combustion — a combustion mode invisible to the eye and to many alarms — is a confirmed microgravity phenomenon with real fire-detection implication [7].",
      "Extends FLEX's extinction-limit evidence toward next-generation droplet fire models [7].",
    ],
    fireFocus: ["suppression", "detection", "combustion-physics"],
    keywords: ["cool flame", "droplet", "extinction", "invisible flame", "detection", "suppression"],
  },

  {
    id: "CFI-G",
    title: "Cool Flames Investigation with Gases (CFI-G)",
    fuel: "Gaseous fuel (e.g. propane) + O₂/N₂ burner stream",
    oxygen: 85,
    pressure: null,
    gravity: "Microgravity",
    airflow: "Low-speed flow from a spherical burner",
    outcome:
      "The challenge text describes chamber atmospheres of N₂ + fuel gas with an O₂/N₂ mixture supplied by the spherical burner reaching up to ≈85% O₂ — the highest-O₂ microgravity combustion tests reported.",
    evidenceStrength: "Limited",
    sourceId: "SRC-CFI",
    objective:
      "Spherical-burner cool-flame study using the highest-O₂ atmospheres in microgravity, probing the fuel-oxidation chemistry that spans visible flame double-diffusion through cool-flame regimes.",
    project: "SoFIE / grouped with ACME in the Space Apps text",
    hardware: "ISS · combustion chamber with spherical burner",
    years: "2020s (approx.)",
    materials: ["Flammable gas (e.g. propane)", "O₂/N₂ burner stream", "N₂-diluted chamber"],
    oxygenNote: "Up to ≈85% O₂ in the burner stream (challenge text); chamber diluted with N₂ + fuel gas",
    pressureNote: "Not specified in the public summary — treat as approximate",
    variables: ["Burner O₂/N₂ ratio", "Fuel gas choice", "Chamber dilution", "Flow rate"],
    measurements: ["Flame structure video", "Cool-flame chemistry diagnostics", "Extinction/limits"],
    keyFindings: [
      "Highest-O₂ microgravity combustion evidence available in PSI class — approaches spacesuit-like O₂ levels (though at a fixed geometry) [8].",
      "Data bridge the FLEX/CFI line toward fire-safety assessment of the elevated-O₂ crewed atmospheres needed for Moon Base and rovers [8].",
    ],
    fireFocus: ["combustion-physics", "prevention"],
    keywords: ["cool flame", "oxygen", "high oxygen", "spherical burner", "propane", "moon", "spacesuit", "enriched"],
  },

  /* ── Smoke point / liftoff gas-flame line (SPICE duct hardware lineage) ── */

  {
    id: "SPICE",
    title: "Smoke Point In Co-flow Experiment (SPICE)",
    fuel: "Hydrocarbon gas jets (methane / ethylene class, approx.)",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Co-flow duct (low flow)",
    outcome:
      "Published summaries measure smoke points of gas flames in microgravity co-flow, showing smoke-point behaviour differs from Earth-bound correlations used in design.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-SPICE",
    objective:
      "Determine how smoke points (the fuel flow / O₂ condition at which a flame first puts out soot) change in microgravity, providing a soot-production baseline for spacecraft flames.",
    project: "SPICE / MSG",
    hardware: "ISS · MSG fan-driven flow duct (SPICE hardware, shared by BASS/SLICE)",
    years: "2010s (approx.)",
    materials: ["Hydrocarbon gas fuels (methane/ethylene-class, approximate)", "Diluted/N₂ gas sets"],
    oxygenNote: "≈21% O₂ baseline and diluted sweeps (approx.)",
    pressureNote: "≈101 kPa ambient range",
    variables: ["Fuel gas identity/mixture", "Co-flow speed", "Jet exit velocity"],
    measurements: ["Smoke point height", "Soot formation onset", "Flame shape video"],
    keyFindings: [
      "Smoke-point measurements collected in microgravity bridge Earth design heuristics to spacecraft flame behaviour [9].",
      "Feed the same flow-duct hardware lineage as BASS solid-sample studies, letting gas-flame soot and solid-flame spread share a common baseline [9].",
    ],
    fireFocus: ["combustion-physics", "detection"],
    keywords: ["smoke point", "soot", "co-flow", "gas", "mass-to-spacecraft", "smoke generation"],
  },

  {
    id: "SLICE",
    title: "Structure & Liftoff In Combustion Experiment (SLICE)",
    fuel: "Methane / ethylene gas jets",
    oxygen: 21,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Co-flow duct (variable flow)",
    outcome:
      "Published summaries track flame liftoff, stability and reattachment behaviour in microgravity co-flow across a range of jet velocities — the same hardware lineage as SPICE.",
    evidenceStrength: "Moderate",
    sourceId: "SRC-SPICE",
    objective:
      "Measure flame liftoff and stability boundaries in microgravity — the conditions under which flames detach from their supply or restabilize, important for understanding fire spread along fuel lines.",
    project: "SPICE / MSG",
    hardware: "ISS · MSG fan-driven flow duct (SPICE hardware lineage)",
    years: "2010s (approx.)",
    materials: ["Methane", "Ethylene jets", "Optional dilution gas sets"],
    oxygenNote: "≈21% O₂ baseline (approx.)",
    pressureNote: "≈101 kPa ambient range",
    variables: ["Jet velocity", "Co-flow speed", "Fuel type"],
    measurements: ["Liftoff height", "Stability boundaries", "Flame structure video"],
    keyFindings: [
      "Liftoff/stability evidence in microgravity differs from Earth-consistent correlations (published summaries describe the deviation) [9].",
      "Feeds the ventilation-and-flow chapter of spacecraft fire models (how flame attachment changes with airflow) [9].",
    ],
    fireFocus: ["combustion-physics"],
    keywords: ["liftoff", "stability", "jet", "co-flow", "ventilation", "gas flame"],
  },

  /* ── Ambient-dust line (non-combustion, same detection family) ── */

  {
    id: "DAFT",
    title: "Dust and Aerosol Measurement Feasibility Test (DAFT)",
    fuel: "Ambient ISS dust (no combustion fuel)",
    oxygen: null,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent ambient sampling",
    outcome:
      "Published summaries use a smoke-detection instrument (the SAME family) on ambient cabin dust instead of combustion smoke, characterizing dust particle sizes in microgravity.",
    evidenceStrength: "Limited",
    sourceId: "SRC-DAFT",
    objective:
      "Re-use the SAME-line detection hardware to characterize ambient spacecraft dust and aerosols — a feasibility test of the instrument's broader use beyond combustion smoke detection.",
    project: "DAFT / detection line",
    hardware: "ISS · MSG-reuse of smoke-detection instruments (dust variant)",
    years: "2010s (approx.)",
    materials: ["Ambient ISS cabin dust & aerosols"],
    oxygenNote: "Not applicable (dust measurement, not combustion)",
    pressureNote: "≈101 kPa cabin environment",
    variables: ["Dust source environment", "Sampling duration", "Particle size range"],
    measurements: ["Particle size distribution", "Counts over time"],
    keyFindings: [
      "Detection hardware capability extended beyond combustion smoke — but dust is not a fire signal, and DAFT evidence is not directly about flammability [10].",
      "Useful as a baseline for distinguishing alarm-relevant smoke from everyday cabin aerosols (detection false-alarm context) [10].",
    ],
    fireFocus: ["detection"],
    keywords: ["dust", "detection", "aerosol", "false alarm", "particle", "ambient"],
  },

  {
    id: "DAFT-2",
    title: "Dust and Aerosol Measurement Feasibility Test – 2 (DAFT-2)",
    fuel: "Ambient ISS dust (no combustion fuel)",
    oxygen: null,
    pressure: 101,
    gravity: "Microgravity",
    airflow: "Quiescent ambient sampling",
    outcome:
      "Published summaries describe the DAFT-2 follow-on dust measurement campaign, again using the SAME-line instrument family in ambient cabin air.",
    evidenceStrength: "Limited",
    sourceId: "SRC-DAFT",
    objective:
      "Extend the dust/aerosol feasibility measurement with refined settings and longer sampling, closing out the ambient-dust background record against which fire alarms must discriminate.",
    project: "DAFT / detection line",
    hardware: "ISS · MSG-reuse of smoke-detection instruments (dust variant)",
    years: "Follow-on to DAFT (approx.)",
    materials: ["Ambient ISS cabin dust & aerosols"],
    oxygenNote: "Not applicable (dust measurement)",
    pressureNote: "≈101 kPa cabin environment",
    variables: ["Sampling conditions", "Particle size range"],
    measurements: ["Particle size distributions", "Counts over time"],
    keyFindings: [
      "Completes the ambient-background dataset that SAME-derived detectors must distinguish from fire smoke [10].",
      "Not directly flammability-related, but relevant for alarm-threshold design in crewed volumes [10].",
    ],
    fireFocus: ["detection"],
    keywords: ["dust", "detection", "background", "alarm threshold", "particle"],
  },

  /* ── Planned partial-gravity capability (no PSI data yet) ── */

  {
    id: "LUCI",
    title: "Lunar-g Combustion Investigation (LUCI) — planned",
    fuel: "Solid & gas fuels (planned)",
    oxygen: 30,
    pressure: 70,
    gravity: "Lunar-g",
    airflow: "Planned ventilated chamber flows",
    outcome:
      "Planned investigation — no data in PSI yet. Expected to deliver the first micro-/partial-gravity bridge dataset for lunar-surface fire safety.",
    evidenceStrength: "Limited",
    sourceId: "SRC-PSI",
    objective:
      "Conduct combustion experiments at lunar gravity (≈1/6 g) to fill the partial-gravity gap between microgravity data and Earth-normal data, tailoring results for Moon Base fire safety.",
    project: "Planned (not yet in PSI)",
    hardware: "Lunar-surface-capable combustion facility (planned)",
    years: "Future",
    materials: ["To be specified (planned)"],
    oxygenNote: "Expected Moon-regime O₂ (≥30% per the challenge text); not yet tested",
    pressureNote: "Expected Moon-regime pressure (≤10.2 psi / ≈70 kPa per the challenge text)",
    variables: ["Gravity (lunar)", "O₂", "Pressure", "Fuels"],
    measurements: ["To be specified (planned)"],
    keyFindings: [
      "The partial-gravity gap: no PSI dataset yet spans microgravity → lunar-g → Mars-g; LUCI is the expected future bridge [11].",
      "Until partial-g data exist, microgravity and normal-gravity results are all PSI can bound for Moon/Mars scenarios (see Coverage Map's top gap) [11].",
    ],
    fireFocus: ["prevention", "combustion-physics"],
    keywords: ["partial gravity", "lunar", "planned", "moon", "gap", "future"],
  },

  {
    id: "FM2",
    title: "Flammability of Materials on the Moon (FM²) — planned",
    fuel: "Solid spacecraft materials (planned)",
    oxygen: 30,
    pressure: 70,
    gravity: "Lunar-g",
    airflow: "Planned chamber conditions",
    outcome:
      "Planned flammability study targeting the exact atmosphere expected in the Moon Base / pressurized rovers (≥30% O₂, ≤10.2 psi) at lunar gravity — currently absent from PSI.",
    evidenceStrength: "Limited",
    sourceId: "SRC-PSI",
    objective:
      "Measure material flammability under lunar surface conditions — the combined case of partial gravity AND an elevated-O₂, reduced-pressure atmosphere — to directly protect the Moon Base and rovers.",
    project: "Planned (not yet in PSI)",
    hardware: "Lunar-surface-capable flammability facility (planned)",
    years: "Future",
    materials: ["Spacecraft material set (to be specified)"],
    oxygenNote: "Expected ≥30% O₂ (Moon Base / rover atmosphere) — no direct PSI data yet",
    pressureNote: "Expected ≤10.2 psi / ≈70 kPa — no direct PSI data yet",
    variables: ["Gravity (lunar)", "O₂ ≥30%", "Pressure ≤10.2 psi", "Material set"],
    measurements: ["To be specified (planned)"],
    keyFindings: [
      "The Moon-regime gap: current PSI solid-material flammability evidence sits at ≈21% O₂ / ≈101 kPa — not the ≥30% O₂ / ≤70 kPa regime planned for the Moon Base [11].",
      "Bridging this specific gap is arguably the highest-priority fire-safety data need for the Artemis era (see Mission Fit ranking) [11].",
    ],
    fireFocus: ["prevention"],
    keywords: ["moon", "flammability", "planned", "elevated oxygen", "gap", "future", "materials"],
  },
];

/** Fuel names seen in the catalog (for filters and Assistant retrieval). */
export const ALL_FUELS = Array.from(new Set(EXPERIMENTS.map((e) => e.fuel))).sort();
