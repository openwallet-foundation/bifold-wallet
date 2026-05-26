/**
 * Static switch for the OpenID refresh token implementation.
 *
 * When enabled, refresh uses agent.openid4vc.holder.refreshToken instead of the
 * legacy direct token endpoint request. Set this to false to force the legacy
 * flow while comparing behavior.
 */
export const USE_CREDO_OPENID_REFRESH_FLOW = true
