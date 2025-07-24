import jwtDecode from 'jwt-decode';

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    // exp is in seconds, Date.now() is in ms
    if (Date.now() >= decoded.exp * 1000) return false;
    return true;
  } catch (e) {
    return false;
  }
} 