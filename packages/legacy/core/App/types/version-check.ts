import { VersionInfo } from '../types/state'

/**
 * Interface defining the version check service capabilities
 */
export interface IVersionCheckService {
  /**
   * The date when the version was last checked
   */
  readonly lastChecked: Date | undefined

  /**
   * Checks if an update is available for the application
   * @param forceCheck If true, checks for update regardless of when last check occurred
   * @returns Current version information
   */
  checkForUpdate(forceCheck?: boolean): Promise<VersionInfo | undefined>
}
