/**
 * Real GELDS codes, transcribed from DECAL's own published sample lesson plans.
 *
 * Source PDFs: docs/reference/decal/sample-plans/
 *
 * These are not invented. Every code below appears on a lesson plan DECAL
 * publishes, which makes this the closest thing we have to a conformance suite
 * for `FULL_CODE_PATTERN` until the full indicator export is loaded (T-0.6).
 *
 * PROJECT-INSTRUCTIONS §11 open question 8 asked us to confirm the CD subdomain
 * code shape against every age band, not just 48–60 months. These plans cover
 * bands 0, 2, 3 and 4, and all five CD subdomains appear. Band 1 (12–24 months,
 * "Flowers") is still unverified — that PDF has no text layer, see the README in
 * docs/reference.
 */

export interface SamplePlanFixture {
  plan: string
  /** The classroom age band the plan is written for. */
  ageBand: 0 | 1 | 2 | 3 | 4
  codes: readonly string[]
}

export const DECAL_SAMPLE_PLANS: readonly SamplePlanFixture[] = [
  {
    plan: 'By the Farm (0–12 months)',
    ageBand: 0,
    codes: [
      'APL1.0c',
      'APL3.0b',
      'CD-CR4.0c',
      // These three carry an age digit that is not this classroom's band.
      // They are on DECAL's own published plan. See OFF_BAND_CODES below.
      'CD-CR4.3c',
      'CD-MA2.4a',
      'CD-SC4.4b',
      'CD-MA3.0a',
      'CD-MA3.0b',
      'CD-MA4.0b',
      'CD-SC1.0c',
      'CD-SC3.0a',
      'CD-SS5.0a',
      'CLL1.0a',
      'CLL1.0b',
      'CLL2.0b',
      'CLL4.0b',
      'CLL5.0a',
      'CLL8.0a',
      'CLL9.0a',
      'PDM2.0a',
      'PDM2.0b',
      'PDM4.0b',
      'PDM5.0a',
      'SED1.0b',
      'SED2.0b',
      'SED3.0a',
      'SED3.0b',
      'SED3.0d',
      'SED5.0a',
    ],
  },
  {
    plan: 'Arctic Animals (24–36 months)',
    ageBand: 2,
    codes: [
      'APL1.2b',
      'APL1.2c',
      'APL2.2c',
      'APL3.2a',
      'APL3.2d',
      'APL5.2c',
      'CD-CP2.2b',
      'CD-CR1.2a',
      'CD-CR2.2a',
      'CD-CR4.2b',
      'CD-MA1.2d',
      'CD-MA2.2b',
      'CD-MA4.2b',
      'CD-MA4.2c',
      'CD-MA5.2a',
      'CD-MA6.2a',
      'CD-SC1.2a',
      'CD-SC1.2b',
      'CD-SC2.2a',
      'CD-SC3.2b',
      'CD-SC4.2c',
      'CD-SS1.2a',
      'CD-SS2.2a',
      'CLL1.2b',
      'CLL2.2a',
      'CLL4.2a',
      'CLL4.2d',
      'CLL5.2a',
      'CLL5.2b',
      'CLL5.2c',
      'CLL6.2a',
      'CLL7.2a',
      'CLL8.2c',
      'PDM3.2a',
      'PDM3.2b',
      'PDM4.2a',
      'PDM5.2a',
      'PDM6.2a',
      'SED2.2a',
      'SED3.2a',
      'SED3.2c',
      'SED3.2d',
    ],
  },
  {
    plan: 'Community Helpers (36–48 months)',
    ageBand: 3,
    codes: [
      'APL3.3c',
      'CD-CP2.3a',
      'CD-CR2.3c',
      'CD-CR3.3a',
      'CD-MA3.3c',
      'CD-MA4.3b',
      'CD-MA4.3c',
      'CD-MA5.3b',
      'CD-SC1.3b',
      'CD-SC1.3c',
      'CD-SC3.3a',
      'CD-SC3.3c',
      'CD-SC5.3a',
      'CD-SS2.3b',
      'CD-SS2.3c',
      'CD-SS3.3b',
      'CD-SS4.3b',
      'CD-SS4.3d',
      'CLL2.3b',
      'CLL3.3a',
      'CLL4.3d',
      'PDM3.3a',
      'PDM4.3b',
      'SED1.3c',
      'SED5.3b',
    ],
  },
  {
    plan: 'Animals in Winter (48–60 months)',
    ageBand: 4,
    codes: [
      'CD-CR1.4a',
      'CD-CR2.4a',
      'CD-CR3.4a',
      'CD-CR4.4c',
      'CD-MA1.4a',
      'CD-MA3.4a',
      'CD-SC1.4a',
      'CD-SC2.4c',
      'CD-SC2.4d',
      'CD-SC3.4a',
      'CD-SC3.4c',
      'CD-SC4.4b',
      'CLL5.4b',
      'CLL5.4c',
      'CLL5.4d',
      'CLL6.4a',
      'CLL6.4b',
      'CLL6.4c',
      'CLL7.4a',
      'CLL8.4a',
      'CLL8.4d',
      'PDM1.4b',
      'PDM3.4a',
      'SED1.4a',
      'SED2.4d',
      'SED4.4a',
      'SED5.4b',
    ],
  },
] as const

/**
 * Codes that appear on a plan written for a different age band than the code's
 * own age digit. All three are on the 0–12 month plan.
 *
 * These are almost certainly errors in DECAL's document — the other three plans
 * are 100% single-band — but they are errors DECAL published, and a Pre-K
 * Specialist evidently did not reject the plan over them.
 *
 * The product consequence: **an off-band code must never be a hard error.** The
 * chooser filters to the classroom's band by default and offers "show nearby
 * ages"; anything stricter would reject a plan DECAL itself publishes.
 */
export const OFF_BAND_CODES = ['CD-CR4.3c', 'CD-MA2.4a', 'CD-SC4.4b'] as const

export const ALL_SAMPLE_CODES: readonly string[] = Array.from(
  new Set(DECAL_SAMPLE_PLANS.flatMap((p) => p.codes))
)
