/**
 * Given roles or permissions, checks if a user has access to a particular resouce
 * @param requiredPermissions roles or permissions that are required to access the resource
 * @param userPermissions roles or permissions that the user has
 * @returns
 */
export const checkAuthority = (
  requiredPermissions: string[],
  userPermissions: string[],
) => {
  return requiredPermissions.every((requiredPermission) =>
    userPermissions.includes(requiredPermission),
  );
};
