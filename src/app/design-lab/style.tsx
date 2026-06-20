import { Redirect } from 'expo-router';

import { StyleLab } from '@/components/design-lab/style-lab';
import { SHOW_INTERNAL_TOOLS } from '@/lib/internal-test-tools';

export default function StyleLabRoute() {
  if (!SHOW_INTERNAL_TOOLS) {
    return <Redirect href="/" />;
  }

  return <StyleLab />;
}
