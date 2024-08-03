import { useAuth } from "@/hooks/useAuth";
import { checkAuthority } from "@/lib/security";

interface ProtectedComponentProps extends React.PropsWithChildren {
  permissions?: string[];
  roles?: string[];
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permissions,
  roles,
  children,
}) => {
  const { auth, isLoggedIn } = useAuth();
  const shouldCheckPermissions = permissions && permissions.length > 0;
  const shouldCheckRoles = roles && roles.length > 0;

  if (!isLoggedIn) {
    return null;
  }

  if (
    shouldCheckPermissions &&
    !checkAuthority(permissions, auth.user?.permissions || [])
  ) {
    return null;
  }

  if (shouldCheckRoles && !checkAuthority(roles, auth.user?.roles || [])) {
    return null;
  }

  return children;
};
