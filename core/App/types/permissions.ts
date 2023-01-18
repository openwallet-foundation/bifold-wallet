import { Permission, PermissionStatus } from 'react-native-permissions'
export type PermissionContract = (permission: Permission) => Promise<PermissionStatus>
