import { useUserProfile } from '../contexts/UserProfileContext';
import DesignSystemDemo from '../design-system/examples/DesignSystemDemo';

export default function DesignSystemDemoPage() {
  const { currentProfile } = useUserProfile();

  return (
    <DesignSystemDemo
      profileType={(currentProfile?.role.toLowerCase() as any) || 'empregado'}
    />
  );
}
