const R = 6371e3; // earth's mean radius in metres
const BURMESE_NUBMERS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];

export const toBurmeseNumber = (value) =>
  value
    .toString()
    .split('')
    .map((n) => BURMESE_NUBMERS[parseInt(n)])
    .join('');

export const calculateDistance = (a, b) =>
  Math.acos(
    Math.sin((a.latitude * Math.PI) / 180) *
      Math.sin((b.latitude * Math.PI) / 180) +
      Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.cos((a.longitude * Math.PI) / 180 - (b.longitude * Math.PI) / 180)
  ) * R;

export const getRadius = (radius, { latitude, longitude }) => ({
  min_lat: latitude - ((radius / R) * 180) / Math.PI,
  max_lat: latitude + ((radius / R) * 180) / Math.PI,
  min_lng:
    longitude -
    ((radius / R) * 180) / Math.PI / Math.cos((latitude * Math.PI) / 180),
  max_lng:
    longitude +
    ((radius / R) * 180) / Math.PI / Math.cos((latitude * Math.PI) / 180),
});
