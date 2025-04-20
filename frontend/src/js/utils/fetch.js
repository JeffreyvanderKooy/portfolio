/**
 *
 * @param {string} url Full API URL
 * @param {Object} body Payload in the form of a JS object to send with the request
 * @param {string} method HTTP Method e.g "POST", "GET", "PATCH" etc.
 * @returns {Object} Response object from API
 */
const getJSON = async (url, body, method = 'GET') => {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json', // Specify content type
    },
    credentials: 'include',
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  return data;
};

export default getJSON;
