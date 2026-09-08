let accessToken = null;
let unauthorizedHandlers = [];

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function onUnauthorized(handler) {
  unauthorizedHandlers.push(handler);
  return () => {
    unauthorizedHandlers = unauthorizedHandlers.filter((h) => h !== handler);
  };
}

export function notifyUnauthorized() {
  unauthorizedHandlers.forEach((handler) => handler());
}
