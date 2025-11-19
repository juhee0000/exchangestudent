import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

let isInitialized = false;

export const initAmplitude = () => {
  console.log('[Amplitude] Attempting to initialize...');
  console.log('[Amplitude] API Key exists:', !!AMPLITUDE_API_KEY);
  console.log('[Amplitude] API Key (first 10 chars):', AMPLITUDE_API_KEY?.substring(0, 10));
  
  if (!AMPLITUDE_API_KEY) {
    console.error('[Amplitude] ❌ API key not found - check VITE_AMPLITUDE_API_KEY');
    return;
  }

  if (isInitialized) {
    console.log('[Amplitude] Already initialized, skipping');
    return;
  }

  try {
    amplitude.add(sessionReplayPlugin({ sampleRate: 1 }));
    console.log('[Amplitude] Session replay plugin added');
    
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
    console.log('[Amplitude] ✅ Successfully initialized');
  } catch (error) {
    console.error('[Amplitude] ❌ Initialization error:', error);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  console.log('[Amplitude] identifyUser called');
  console.log('[Amplitude] isInitialized:', isInitialized);
  console.log('[Amplitude] userId:', userId);
  console.log('[Amplitude] properties:', properties);
  
  if (!isInitialized) {
    console.error('[Amplitude] ❌ Cannot identify user - Amplitude not initialized');
    return;
  }
  
  try {
    amplitude.setUserId(userId);
    console.log('[Amplitude] User ID set:', userId);
    
    if (properties) {
      const identifyEvent = new amplitude.Identify();
      Object.entries(properties).forEach(([key, value]) => {
        identifyEvent.set(key, value);
        console.log(`[Amplitude] Setting property: ${key} =`, value);
      });
      amplitude.identify(identifyEvent);
      console.log('[Amplitude] ✅ User identified with properties');
    } else {
      console.log('[Amplitude] ✅ User ID set (no properties)');
    }
  } catch (error) {
    console.error('[Amplitude] ❌ Error identifying user:', error);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!isInitialized) {
    console.warn('[Amplitude] ⚠️ Cannot track event - not initialized:', eventName);
    return;
  }
  
  console.log('[Amplitude] Tracking event:', eventName, properties);
  amplitude.track(eventName, properties);
};

export const resetUser = () => {
  if (!isInitialized) {
    console.warn('[Amplitude] ⚠️ Cannot reset user - not initialized');
    return;
  }
  
  console.log('[Amplitude] Resetting user');
  amplitude.reset();
};

export { amplitude };
