/**
 * Static switch for the OpenID refresh token implementation.
 *
 * Keep this disabled until the Credo refresh path is wired and verified. When
 * enabled, refresh should use agent.openid4vc.holder.refreshToken instead of
 * the legacy direct token endpoint request.
 */
export const USE_CREDO_OPENID_REFRESH_FLOW = false
