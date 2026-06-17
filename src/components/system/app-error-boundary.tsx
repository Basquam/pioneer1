import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { reportError } from '@/lib/crash/crash-service';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      feature: 'error_boundary',
      action: 'render',
      screenName: 'root',
      reason: info.componentStack ? 'component_stack_available' : 'unknown',
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const devDetail =
      __DEV__ && this.state.error
        ? `${this.state.error.name}: ${this.state.error.message}`
        : null;

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>QUESTORY</Text>
          <Text style={styles.title}>Questory hit a snag.</Text>
          <Text style={styles.body}>
            Your progress is stored locally. Try reopening this screen.
          </Text>
          {devDetail ? <Text style={styles.devDetail}>{devDetail}</Text> : null}
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonLabel}>TRY AGAIN</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050308',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#2a2438',
    backgroundColor: '#0d0a14',
    padding: 20,
    gap: 12,
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 3,
    color: '#D4AF37',
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 24,
    color: '#f5f0e6',
  },
  body: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    lineHeight: 20,
    color: '#9a93a8',
  },
  devDetail: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    color: '#c4a35a',
  },
  button: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 2,
    color: '#D4AF37',
  },
});
