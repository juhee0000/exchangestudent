import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export const initAmplitude = (): Promise<void> => {
  if (initPromise) {
    console.log('[Amplitude] Initialization already in progress, returning existing promise');
    return initPromise;
  }

  if (isInitialized) {
    console.log('[Amplitude] Already initialized, skipping');
    return Promise.resolve();
  }

  console.log('[Amplitude] Attempting to initialize...');
  console.log('[Amplitude] API Key exists:', !!AMPLITUDE_API_KEY);
  console.log('[Amplitude] API Key (first 10 chars):', AMPLITUDE_API_KEY?.substring(0, 10));
  
  if (!AMPLITUDE_API_KEY) {
    console.error('[Amplitude] ❌ API key not found - check VITE_AMPLITUDE_API_KEY');
    return Promise.reject(new Error('API key not found'));
  }

  initPromise = new Promise<void>((resolve, reject) => {
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
      resolve();
    } catch (error) {
      console.error('[Amplitude] ❌ Initialization error:', error);
      reject(error);
    }
  });

  return initPromise;
};

export const identifyUser = async (userId: string, properties?: Record<string, any>) => {
  console.log('[Amplitude] identifyUser called');
  console.log('[Amplitude] isInitialized:', isInitialized);
  console.log('[Amplitude] userId:', userId);
  console.log('[Amplitude] properties:', properties);
  
  if (!isInitialized) {
    console.log('[Amplitude] Not initialized yet, waiting for initialization...');
    try {
      await initAmplitude();
    } catch (error) {
      console.error('[Amplitude] ❌ Failed to initialize before identifying user:', error);
      return;
    }
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
