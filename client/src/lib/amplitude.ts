import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

let isInitialized = false;

export const initAmplitude = () => {
  if (!AMPLITUDE_API_KEY) {
    console.warn('Amplitude API key not found');
    return;
  }

  if (isInitialized) {
    return;
  }

  amplitude.add(sessionReplayPlugin({ sampleRate: 1 }));
  
  amplitude.init(AMPLITUDE_API_KEY, undefined, {
    fetchRemoteConfig: true,
    autocapture: {
      attribution: true,
      fileDownloads: true,
      formInteractions: true,
      pageViews: true,
      sessions: true,
      elementInteractions: true,
      networkTracking: true,
      webVitals: true,
      frustrationInteractions: true,
    },
  });

  isInitialized = true;
  console.log('Amplitude initialized');
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!isInitialized) return;
  
  amplitude.setUserId(userId);
  
  if (properties) {
    const identifyEvent = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identifyEvent.set(key, value);
    });
    amplitude.identify(identifyEvent);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!isInitialized) return;
  
  amplitude.track(eventName, properties);
};

export const resetUser = () => {
  if (!isInitialized) return;
  
  amplitude.reset();
};

export { amplitude };
