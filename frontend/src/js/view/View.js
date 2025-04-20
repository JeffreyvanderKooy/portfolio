import $ from 'jquery';
import { DARKMODE_SPIN_DELAY_MS } from '../config';

/**
 * View class handles UI interactions for toggling dark mode,
 * managing popups, and conditionally enabling/disabling JeffBot
 * based on screen size.
 */
class View {
  _toggleDarkMode = $('#toggleDarkMode'); // Dark mode toggle button
  _downloadCV = $('#downloadCV'); // CV download button (not currently used)
  _jeffBotHtml = $('#toggleTerminal').html(); // Original HTML for JeffBot button
  _terminalHtml = $('#terminalWindow'); // Terminal window DOM element

  _fadeOutDelayMS = 3000;

  // Standard feedback messages
  succesFeedbackMessage =
    'Your feedback has succesfully been submitted! Thank you!';
  errorFeedbackMessage =
    'Oops, something went wrong submitting your feedback! Please try again';

  constructor() {
    this._toggleDarkMode.on('click', this.toggleDarkMode.bind(this));
    $('.overlay').on('click', this.togglePopups.bind(this));
    $(window).on('resize', this.toggleJeffBotFunctionality.bind(this));

    // Initial check on load
    this.toggleJeffBotFunctionality();
  }

  /**
   *
   * @param {string} status "error" or "succes" to indicate alert styling
   * @param {string} message message to display in the alert popup
   */
  alert(status = 'secondary', message) {
    // Remove existing alert if there is one
    $('.alert')?.remove();

    // Insert alert
    $('body').prepend(
      `<div class="alert alert-${status} position-fixed top-0 start-50 translate-middle-x z-1 mt-2" role="alert">${message}</div>`
    );

    // Fade out the alert and remove it after
    setTimeout(
      () =>
        $('.alert').fadeOut('slow', function () {
          this.remove();
        }),
      this._fadeOutDelayMS
    );
  }

  /**
   * Enables or disables JeffBot depending on screen width.
   * Disables below 600px for mobile UX sanity.
   */
  toggleJeffBotFunctionality() {
    const screenWidth = $(window).width();
    const enable = screenWidth > 600;

    const html = enable
      ? this._jeffBotHtml
      : 'JeffBot is not available for this device! <i class="bi bi-emoji-frown"></i>';

    $('#toggleTerminal').prop('disabled', !enable).html(html);

    enable
      ? $('#terminal').append(this._terminalHtml)
      : this._terminalHtml.remove();

    $('#jeffBot-disclaimer').toggle($('#terminalWindow').is(':visible'));
  }

  /**
   * Toggles between dark and light themes. Also spins the toggle icon.
   */
  toggleDarkMode() {
    const darkmode = $('body').attr('data-bs-theme') === 'dark';

    // Set new theme
    $('body').attr('data-bs-theme', darkmode ? 'light' : 'dark');

    // Spin animation on toggle button
    this._toggleDarkMode.toggleClass('spin');

    // Swap the icon
    const icon = darkmode
      ? `<i class="bi bi-sun-fill">`
      : `<i class="bi bi-moon-fill">`;

    this._toggleDarkMode.html(icon);

    // Swap background + bootstrap-style classes
    if (!darkmode) {
      $('#background')
        .removeClass('background-light')
        .addClass('background-dark');

      $('.bg-light').each((_, el) =>
        $(el).removeClass('bg-light').addClass('bg-dark')
      );
    } else {
      $('#background')
        .removeClass('background-dark')
        .addClass('background-light');

      $('.bg-dark').each((_, el) =>
        $(el).removeClass('bg-dark').addClass('bg-light')
      );
    }

    // Remove spin after delay
    setTimeout(
      () => this._toggleDarkMode.toggleClass('spin'),
      DARKMODE_SPIN_DELAY_MS
    );
  }

  /**
   * Closes all open popups when overlay is clicked.
   */
  togglePopups() {
    $('.overlay').toggle();

    if ($('#jeffBot-lifecycle').is(':visible'))
      $('#jeffBot-lifecycle').slideToggle('fast');

    if ($('#feedbackPopup').is(':visible')) $('#feedbackPopup').toggle();
  }
}

export default new View();
