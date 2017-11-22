import axios from 'axios';

const config = {
  headers: {
    'X-API-KEY': 'AIzaSyAIQY0vVWIMVh366RaGzd5yP8_y3IpKFbE',
  },
}

export const subscribeTrustedDevice = (data) => {
  return axios.post('http://172.16.17.193:4040/webfsmmobile/trusted-device/subscribe-fingerprint', data, config);
}

export const unsubscribeTrustedDevice = (data) => {
  return axios.post('http://172.16.17.193:4040/webfsmmobile/trusted-device/unsubscribe-fingerprint', data, config);
}

export const requestNonce = (data) => {
  return axios.post('http://172.16.17.193:4040/webfsmmobile/trusted-device/request-fingerprint-nonce', data, config);
}

export const authenticateFingerprint = (data) => {
  return axios.post('http://172.16.17.193:4040/webfsmmobile/trusted-device/authenticate-fingerprint', data, config);
}

export const listSubscribedDevice = (data) => {
  return axios.post('http://172.16.17.193:4040/webfsmmobile/trusted-device/list-fingerprint-subscribed-device', data, config);
}
