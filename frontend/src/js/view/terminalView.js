import $ from 'jquery';
import Printer from '../utils/terminalMarkup';

/**
 * Handles the UI logic for the JeffBot terminal window, including user input,
 * bot response rendering, animations, and event delegation.
 */
class terminalView {
  _openend = false; // Tracks if terminal has been opened at least once
  _fetchResponse; // Handler to fetch AI response
  _fetchWelcome; // Handler to fetch welcome message

  constructor() {
    // Toggle terminal window
    $('#toggleTerminal').on('click', this.toggleJeffBot.bind(this));

    // Allows mobile users to also use the application
    $('body').on('click', '.terminal-prompt', () => $('#realInput').focus());

    // Fakes the terminal prompt being "selected" on focus of the real input field
    $(document).on(
      'focus',
      '#realInput',
      e => $('.terminal-prompt').addClass('focus') && e.preventDefault()
    );
    $(document).on('blur', '#realInput', e =>
      $('.terminal-prompt').removeClass('focus')
    );
    $(document).on('keydown', '#realInput', this._registerSubmit.bind(this));
    $(document).on('input', '#realInput', this._registerInput.bind(this));

    // Handle internal anchor clicks in terminal
    $('body').on('click', '.terminal a', this._handleAnchorClick.bind(this));

    // Toggle lifecycle explanation panel
    $('body').on('click', '.toggleLifecycle', this.toggleLifecycle.bind(this));

    // Auto-scroll to bottom when content updates
    $('body').on('contentChanged', '.terminal', this._scrollBottom);
  }

  /**
   * Sets the handler used to fetch the welcome message.
   * @param {Function} handler - Callback to fetch welcome content
   */
  setWelcomeHandler(handler) {
    this._fetchWelcome = handler;
  }

  /**
   * Sets the handler used to fetch AI responses to user input.
   * @param {Function} handler - Callback to fetch AI response
   */
  setResponseHandler(handler) {
    this._fetchResponse = handler;
  }

  /**
   * Called when the controller receives an AI response.
   * Removes loading animation and prints the result.
   * @param {Object} res - Response object from the AI
   */
  async respond(res) {
    $('#thinking').remove();

    if (!res.topic) res.topic = 'error';

    await Printer[res.topic](res);

    // Show prompt again after response
    $('.terminal-prompt').toggle();

    $('.terminal').trigger('contentChanged');
  }

  /**
   * Inserts the "thinking" animation into the terminal.
   */
  _insertThinkingAnimation() {
    $('.terminal-prompt').text('').toggle();
    $('#realInput').val('');

    const markup = `
    <h5 class="m-0 fw-light text-jeffBot fw-lighter d-flex gap-1" id="thinking">
      <span class="me-1">
        <i class="bi bi-robot"></i>
      </span> 
      <div class="robot-think">...</div> 
    </h5>`;

    $('.response').get(0).insertAdjacentHTML('beforeend', markup);
    $('.terminal').trigger('contentChanged');
  }

  /**
   * Handles click events on anchor elements inside the terminal.
   * Routes logic based on anchor data attributes.
   * @param {Event} e - Click event
   */
  _handleAnchorClick(e) {
    e.preventDefault();

    // If user already submitted or bot is typing, block input
    if ($('.terminal-prompt').is(':hidden') || $('.typewriter').length) return;

    // Handle links with special data attributes
    if (Object.entries(e.currentTarget.dataset).length)
      return this._delegateAnchorClick(e);

    const topic = $(e.target).text();
    $('.terminal-prompt').text(topic);
    this._sendPrompt(topic);
  }

  /**
   * Delegates logic for anchors with data attributes like external links or toggles.
   * @param {Event} e - Click event
   */
  _delegateAnchorClick(e) {
    const dataset = e.currentTarget.dataset;

    if (dataset.link) return window.open(dataset.link, '_blank');

    if (dataset.toggleDescription)
      return $(e.currentTarget).children('span').toggle();
  }

  /**
   * Handles sending user prompt to the AI system and animates thinking response.
   * @param {string} prompt - The user's input prompt
   */
  _sendPrompt(prompt) {
    if (!prompt) return;

    const markup = `<p class="m-0 mt-3 mb-3 fw-lighter"> > ${prompt}</p>`;
    $('.response').get(0).insertAdjacentHTML('beforeend', markup);

    this._insertThinkingAnimation();
    this._fetchResponse(prompt);
  }

  /**
   *
   * @param {*} e Keydown event
   * @returns
   */
  _registerSubmit(e) {
    if (e.key.toLowerCase() === 'c' && e.originalEvent.ctrlKey) {
      e.preventDefault();
      return $('.response').html('');
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      return this._sendPrompt($('.terminal-prompt').text());
    }
  }

  /**
   * Captures and processes user keyboard input inside the terminal window.
   * @param {KeyboardEvent} e - Input event
   */
  _registerInput(e) {
    e.preventDefault();

    $('.terminal-prompt').text($('#realInput').val());
    this._scrollBottom();
  }

  /**
   * Toggles the visibility of the JeffBot terminal window and welcome screen.
   */
  async toggleJeffBot() {
    $('#terminalWindow').slideToggle();
    $('.bounce').each((_, ele) => $(ele).removeClass('bounce'));
    $('#toggleTerminalChevron').toggleClass('rotate-180');
    $('#jeffBot-disclaimer').slideToggle();

    if (!this._openend) await this._welcomeUser();
  }

  /**
   * Called the first time the JeffBot terminal is opened.
   * Shows a welcome message.
   */
  async _welcomeUser() {
    this._insertThinkingAnimation();
    this._fetchWelcome();
    this._openend = true;
  }

  /**
   * Scrolls the terminal view to the bottom.
   * Triggered after content updates.
   */
  _scrollBottom() {
    setTimeout(
      () =>
        $('#terminalScroll').animate(
          {
            scrollTop: $('#terminalScroll')[0].scrollHeight,
          },
          300
        ),
      1000
    );
  }

  /**
   * Toggles the visibility of the JeffBot lifecycle overlay.
   */
  toggleLifecycle() {
    $('.overlay').toggle();
    $('#jeffBot-lifecycle').slideToggle('fast');
  }
}

export default new terminalView();
