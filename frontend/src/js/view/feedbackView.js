import $ from 'jquery';

/**
 * Handles the feedback form UI interactions and submission logic.
 */
class feedbackView {
  _submitHandler;

  constructor() {
    // Bind click handler to toggle feedback form visibility
    $('.toggle-feedback').on('click', this.toggleFeedback);

    // Bind form submission to internal submit handler
    $('#feedbackPopup form').on('submit', this._submitFeedback.bind(this));
  }

  /**
   * Sets the external handler to be called when feedback form is submitted.
   * This method should be called from the controller.
   * @param {Function} handler - The callback to handle form submission logic
   */
  setSubmitHandler(handler) {
    this._submitHandler = handler;
  }

  /**
   * Internal method triggered on form submission.
   * Prevents default behavior, gathers form data,
   * defaults name to 'Anonymous' if not provided,
   * logs the data, and hides the form.
   * @param {Event} e - The form submit event
   */
  _submitFeedback(e) {
    e.preventDefault();

    // Get data object from new FormData
    const dataEntries = new FormData(e.target).entries();
    const dataObject = Object.fromEntries(dataEntries);

    // Sends the data
    this._submitHandler(dataObject);

    // Reset text values in feedback form
    $('input[name="name"]').val('');
    $('#feedback').val('');

    // Hides the form again
    this.toggleFeedback();
  }

  /**
   * Toggles the visibility of the feedback overlay and popup form.
   * Can be triggered by clicking a button or after submitting the form.
   */
  toggleFeedback() {
    $('.overlay').toggle();
    $('#feedbackPopup').toggle();
  }
}

export default new feedbackView();
