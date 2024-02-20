// import semver from 'semver';
import { init, trackEvent } from '@aptabase/web';
import { uuid } from '@comflowy/common';
import { isWindow } from 'ui/utils/is-window';

if (isWindow) {
  init("A-US-4906357803", {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    isDebug: process.env.NODE_ENV === "development",
  });
}

/**
 * Track a new user enter app
 * 1) if app version large than 0.0.8-alpha then track new user
 * 2) if there is a new user, then track new user, set localstorage to record userId, if there is already a userId, skip tracking
 */
// const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

export function track(eventName: string, extra?: any) {
  trackEvent(eventName, extra);
}

export function trackNewUser() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    const newUserId = "u" + uuid(); // Generate a unique ID for the new user
    localStorage.setItem('userId', newUserId);
    trackEvent('new-user', {
      userId: newUserId
    });
  }
}

/**
 * if there is a new user entered, then track whether the new user bootstrap successed
 * 1) if the user bootstrap successed, set localstorage to record bootstrap successed
 * 2) if the user already bootstrap successed, skip tracking
 */
export function trackNewUserBootstrapSuccess() {
  const userId = localStorage.getItem('userId');
  const bootstrapSuccessed = localStorage.getItem('bootstrapSuccessed');
  if (userId && !bootstrapSuccessed) {
    trackEvent('new-user-bootstrap-success', {
      userId
    });
    localStorage.setItem('bootstrapSuccessed', 'true');
  }
}