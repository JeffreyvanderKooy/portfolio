import $ from 'jquery';
import { API_URL, RE_ATTEMPT_FETCH_RPOJECTS } from '../config';

/**
 * Handles rendering of project data into the carousel and
 * manages error handling when project fetching fails.
 */
class projectsView {
  _carousel_markup = $('#carousel').html(); // Stores initial carousel HTML
  _projects;
  _fetchProjectsInterval;

  /**
   * Renders the list of project cards and corresponding carousel controls.
   * Clears retry interval if active, restores carousel HTML, and populates new content.
   * @param {Array<Object>} projects - List of project objects to display
   */
  renderProjects(projects) {
    this._projects = projects;

    // Clear retry interval and reset the original carousel markup
    if (this._fetchProjectsInterval) {
      clearInterval(this._fetchProjectsInterval);
      $('#carousel').html(this._carousel_markup);
    }

    // Generate HTML for all projects
    const markup = this._projects
      .map((project, i) => this._projectsMarkup(project, i))
      .join('');

    // Inject project markup into the carousel
    $('.carousel-inner').get(0).insertAdjacentHTML('afterbegin', markup);

    // Generate carousel navigation buttons
    const markupButtons = this._projects
      .map((_, i) => this._buttonMarkup(i))
      .join('');

    // Insert navigation buttons
    $('.carousel-indicators')
      .get(0)
      .insertAdjacentHTML('afterbegin', markupButtons);

    // Show the carousel and hide the loading state
    $('#carousel').parent('div').toggleClass('d-none');
    $('#fetchingProjects').parent('div').toggleClass('d-none');
  }

  /**
   * Displays an error message if fetching projects fails and starts a retry interval.
   * @param {Function} reAttemptToFetch - Callback to retry fetching projects
   */
  errFetching(reAttemptToFetch) {
    $('#fetchingProjects').html(this._errMarkup());

    // If retry interval isn't already running, start it
    if (!this._fetchProjectsInterval)
      this._fetchProjectsInterval = setInterval(
        () => reAttemptToFetch(),
        RE_ATTEMPT_FETCH_RPOJECTS
      );
  }

  /**
   * Generates the HTML markup for an individual project card.
   * @param {Object} project - The project data
   * @param {number} index - Index used to set the active carousel item
   * @returns {string} - HTML string for the project
   */
  _projectsMarkup(project, index) {
    return `<div class="carousel-item ${index === 0 && 'active'}">
                <div
                  class="w-100 p-5 d-flex justify-content-center flex-column align-items-center gap-0 rounded"
                >
                <div class="w-75 border  rounded d-flex flex-column project-thumbnail justify-content-end shadow-lg" style="background-image: url('${API_URL}/img/${
      project.image
    }');"> 
                  <div
                    class="w-100  text-center p-2 pb-4 bg-transparent-filter"
                  >
                    <h5 class="fw-bold">${project.name.toUpperCase()}</h5>
                    <small class="fst-italic fw-light">[ ${project.stack
                      .map(skill => skill.name)
                      .join(', ')} ]</small>
                    <hr/>
                    <p style="height: 100px" class="overflow-auto p-1">
                      ${project.description}
                    </p>
                    <div class="d-flex justify-content-evenly">
                      <a
                        target="_blank"
                        role="button"
                        href="${project.githubUrl}"
                        class="btn btn-yellow neo-btn rounded-pill fw-bold"
                      >
                        Github Repo
                        <i class="bi bi-github"></i>
                      </a>
                      <a
                        target="_blank"
                        role="button"
                        href="${project.demoUrl}"
                        class="btn btn-yellow neo-btn rounded-pill fw-bold"
                      >
                        Demo Link
                        <i class="bi bi-link"></i>
                      </a>
                    </div>
                  </div>
                </div>
                </div>
              </div>`;
  }

  /**
   * Returns the HTML markup shown when there's an error fetching project data.
   * @returns {string} - HTML string for error message
   */
  _errMarkup() {
    return `
  <div class="text-center">
    <h3 class="fst-italic mb-2">Looks like something went wrong fetching the projects</h3>
    <hr class="error-divider">
    <h3 class="fst-italic">— Sit tight, I'm trying again!</h3>
  </div>
    `;
  }

  /**
   * Generates the HTML for the carousel navigation button.
   * @param {number} index - Index of the button/slide
   * @returns {string} - HTML string for navigation button
   */
  _buttonMarkup(index) {
    return ` <button
                type="button"
                data-bs-target="#carouselExampleCaptions"
                data-bs-slide-to="${index}"
                class="${index === 0 && 'active'}"
                aria-current="true"
                aria-label="Slide ${index}"
              ></button>`;
  }
}

export default new projectsView();
