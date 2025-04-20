// # ________________________________IMPORTS______________________________________ # //
import {
  API_URL,
  TIMEOUT_FETCH_PROJECTS,
  TIMEOUT_FETCH_QUERY,
  TIMEOUT_FETCH_QUERY_MSG,
  TIMEOUT_FETCH_WELCOME,
  TIMEOUT_FETCH_WELCOME_MSG,
} from '../config';
import getJSON from '../utils/fetch';
import uniqid from 'uniqid';
import promiseRacer from '../utils/promiseRacer';

// # ________________________________STATE TO USE ACROSS APPLICATION______________________________________ # //

export const state = {
  chatId: undefined,
  projects: [],
};

// # ________________________________FUNCTIONS______________________________________ # //

/**
 * @description Fetches the chatId from localStorage and sets one if its the users first visit
 * @returns {void}
 */
export const getChatId = () => {
  const chatId = localStorage.getItem('chatId') || null;

  if (!chatId) {
    localStorage.setItem('chatId', uniqid());
    return getChatId();
  }

  state.chatId = chatId;
};

/**
 * @description Fetches projects from API and stores them to the state
 * @returns {void}
 */
export const fetchProjects = async () => {
  // Define URL
  const url = `${API_URL}/api/v1/data/projects`;

  try {
    // Get response
    const res = await Promise.race([
      getJSON(url),
      promiseRacer(TIMEOUT_FETCH_PROJECTS),
    ]);

    state.projects = res.data;
    return res;
  } catch (err) {
    throw err;
  }
};

/**
 *
 * @param {string} prompt Users question to the Gemini model
 * @returns {Object} Returns the response object from the API
 */
export const fetchAI = async prompt => {
  // Define URL
  const url = `${API_URL}/api/v1/assistant/query`;

  /// Define BODY
  const body = { query: prompt, chatId: state.chatId };

  // get response data
  try {
    const res = await Promise.race([
      getJSON(url, body, 'POST'),
      promiseRacer(TIMEOUT_FETCH_QUERY, TIMEOUT_FETCH_QUERY_MSG),
    ]);

    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Fetches the welcome message from the API, only called once when the user opens the chatbot window
 * @returns {Object} returns the response object from the API
 */
export const fetchWelcomeMessageAI = async () => {
  // Define URL
  const url = `${API_URL}/api/v1/assistant/welcome`;

  // get response data
  try {
    const res = await Promise.race([
      getJSON(url, { chatId: state.chatId }, 'POST'),
      promiseRacer(TIMEOUT_FETCH_WELCOME, TIMEOUT_FETCH_WELCOME_MSG),
    ]);
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {Object} feedback Payload containg user feedback in the formof a JS Object to send to the backend server
 * @returns {Object} returns the response object from the API
 */
export const submitFeedback = async feedback => {
  // Define URL
  const url = `${API_URL}/api/v1/data/feedback`;

  // Define payload to send to server
  const payload = { ...feedback, chatId: state.chatId };

  try {
    // Send payload to the server
    const res = await getJSON(url, payload, 'POST');

    // Return the response
    return res;
  } catch (error) {
    // Bubble the error up to the controller
    throw error;
  }
};
