import { Redirect } from 'expo-router';

import { HqDesignLab } from '@/components/design-lab/hq-design-lab';
import { SHOW_INTERNAL_TOOLS } from '@/lib/internal-test-tools';

export default function HqDesignLabRoute() {
  if (!SHOW_INTERNAL_TOOLS) {
    return <Redirect href="/" />;
  }

  return <HqDesignLab />;
}
