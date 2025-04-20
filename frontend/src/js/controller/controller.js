// # ________________________________IMPORTS...______________________________________ # //

// polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

// Views
import View from '../view/View';
import projectsView from '../view/projectsView';
import terminalView from '../view/terminalView';
import feedbackView from '../view/feedbackView';

// Model
import * as model from '../model/model';

// # ________________________________CONTROLLER FUNCTIONS______________________________________ # //

/**
 * @description Fetches the response data from the Gemini Model trough the API and renders the response
 * @param {string} prompt Question from the user to the Gemini Model
 */
const controlFetchResponse = async prompt => {
  let res = {};

  try {
    // Fetch response from backend
    res = await model.fetchAI(prompt);

    // Error catching
    if (!res.ok) throw new Error(res.message);
  } catch (err) {
    // set the response to the error message if an error has occured
    console.log(err);
    res.message = err.message;
  } finally {
    // Render the response in the terminal
    if (res.message) return terminalView.respond(res);

    console.log('No response data to display.');
  }
};

/**
 * @description Fetches the welcome message from the Gemini Model trough the API and renders it in the terminal
 * @returns {void}
 */
const controlFetchWelcome = async () => {
  let res = {};

  try {
    // Get welcome message
    res = await model.fetchWelcomeMessageAI();

    // Error catching
    if (!res.ok) throw new Error(res.message);
  } catch (err) {
    // set the response to the error message if an error has occured
    console.log(err);
    res.message = err.message;
  } finally {
    // Render the response in the terminal
    if (res.message) return terminalView.respond(res);

    console.log('No response data to display.');
  }
};

/**
 *
 * @param {Object} feedback Payload containg user feedback in the formof a JS Object to send to the backend server
 * @description Submits the feedback to the backend server for storage in the database, notifies the user upon completions or failure
 * @returns {void}
 */
const controlSubmitFeedback = async feedback => {
  try {
    // Submit the feedback, awaiting the response from the server
    const res = await model.submitFeedback(feedback);

    // Failure to submit feedback, throw an error with the server message
    if (!res.ok) throw new Error(res.message);

    // Show an alert to the user their indicating feedback has succesfully been received
    View.alert('success', View.succesFeedbackMessage);
  } catch (error) {
    // Log error for development
    console.log(error);

    // Show an alert to the user indicating there was an error submitting the feedback
    View.alert('danger', View.errorFeedbackMessage);
  }
};

/**
 * @description Attempts to fetch the projects from the backend to rener dynamically here on the frontend,
 * If the server times out, there will be an attempt made to fetch projects in intervals untill succes
 */
const controlFetchProjects = async () => {
  // Get projects
  model
    .fetchProjects()
    .then(_ => projectsView.renderProjects(model.state.projects))
    .catch(_ => projectsView.errFetching(controlFetchProjects));
};

// # ________________________________INIT FUNCTION______________________________________ # //

// Called on page load
const init = (async () => {
  // checks if the user has visited the site before
  model.getChatId();

  // Get projects
  controlFetchProjects();

  // Set response handler for chatting with AI
  terminalView.setResponseHandler(controlFetchResponse);

  // Set handler for welcome message from AI
  terminalView.setWelcomeHandler(controlFetchWelcome);

  // Set handler for submitting feedback to the server
  feedbackView.setSubmitHandler(controlSubmitFeedback);
})();
