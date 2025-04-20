// # ________________________________IMPORTS...______________________________________ # //
import typewriterAnimation from '../utils/typewriter';
import $ from 'jquery';
import { API_URL } from '../config';
import Globe from './mapbox.js';

class Printer {
  constructor() {
    $(window).on('resize', this._updateScrollAnimation.bind(this));
  }

  // Prints text in an error format
  async error(res) {
    const text = res.message
      .split('\n')
      .map(msg => `<small>${msg}</small>`)
      .join('');

    const markup = `<div class="terminal-alert terminal-alert-error d-flex flex-column align-items-center">${text}</div>`;

    await this._printAndTypewriter(markup);
  }

  // Prints the welcome message upon terminal opening
  async welcome(res) {
    const markup = this._messageMarkup(res.message);

    await this._printAndTypewriter(markup);
  }

  // Prints responses from questions with topic: "personal"
  async personal(data) {
    const markup = data.message
      .split('\n')
      .map(line => this._messageMarkup(line))
      .join('');

    const suggestion = this._suggestionsMarkup(data.suggestions);

    await this._printAndTypewriter(markup + suggestion);

    if (data.countries.length >= 1) Globe.render(data.countries);
  }

  // Prints response data with topic: "projects"
  async projects(data) {
    // get response message markup
    const message = this._messageMarkup(data.message);

    const suggestion = this._suggestionsMarkup(data.suggestions);

    // get projects markup
    const projects = data.documents
      .map(project => this._projectMarkup(project))
      .join('');

    // Wrap everyting together into a timeline for nice markup
    const markup =
      message +
      "<div class='terminal-timeline mt-2 pe-5'>" +
      (projects &&
        `<div class="terminal-alert text-center typewriter">Projects</div>`) +
      projects +
      '</div>' +
      suggestion;

    await this._printAndTypewriter(markup);

    // set attribute for each to apply CSS sheet styling
    $('.terminal-card').each((_, ele) =>
      ele.setAttribute('data-typewriter-done', 'true')
    );
  }

  // Prints response data with topic: "skills"
  async skills(data) {
    const message = this._messageMarkup(data.message);

    const skillsMarkup = data.documents
      .map(skill => this._skillMarkup(skill))
      .join('');

    const suggestion = this._suggestionsMarkup(data.suggestions);

    const markup =
      message +
      (skillsMarkup &&
        `<div class="terminal-alert text-center"><p>Software Skills` +
          "<div class='d-flex flex-row flex-wrap mt-2 gap-3 justify-content-center'>" +
          skillsMarkup +
          '</div></div>') +
      suggestion;
    await this._printAndTypewriter(markup);
  }

  // Prints response data with topic: "education"
  async education(data) {
    const message = this._messageMarkup(data.message);

    // Seperate the data into 2, 1 array for online education and 1 for regular
    const online = data.documents.filter(doc => doc.location.type === 'Online');
    const notOnline = data.documents.filter(doc => !online.includes(doc));

    // Get online education markup
    const onlineMarkup = online
      .map(c => this._onlineEducationMarkup(c))
      .join('');

    // Get regular education markup
    const notOnlineMarkup = notOnline
      .map(c => this._notOnlineEducationMarkup(c))
      .join('');

    const suggestion = this._suggestionsMarkup(data.suggestions);

    const markup =
      message +
      "<div class='terminal-timeline mt-2 pe-5'>" +
      (onlineMarkup &&
        `<div class="terminal-alert text-center typewriter">Online Education</div>`) +
      onlineMarkup +
      (notOnlineMarkup &&
        `<div class="terminal-alert text-center typewriter">Education</div>`) +
      notOnlineMarkup +
      '</div>' +
      suggestion;

    await this._printAndTypewriter(markup);
  }

  // Prints response data with topic: "experience"
  async experience(data) {
    const message = this._messageMarkup(data.message);

    // Sort the documents startDate ascening
    data.documents.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    const experiences = data.documents
      .map(doc => this._experienceMarkup(doc))
      .join('');

    const suggestion = this._suggestionsMarkup(data.suggestions);

    const markup =
      message +
      "<div class='terminal-timeline mt-2 pe-5'>" +
      (experiences &&
        `<div class="terminal-alert text-center typewriter">Work Experience</div>`) +
      experiences +
      '</div>' +
      suggestion;

    await this._printAndTypewriter(markup);
  }

  // Html markup for a education taken online document
  _onlineEducationMarkup(doc) {
    // Helper function to display the dates
    const markupDate = date =>
      `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

    return `
      <dl class="terminal-card p-1">
            <dt class="fw-light m-2 pb-0 fw-bold card-divider typewriter position-relative" data-typewriter="false">
              <div class="d-flex align-items-center">
                  <img class="experience-logo rounded" src="${doc.logo}" alt="${
      doc.institution
    } logo">
                  <p class="p-0 m-0 ms-2">${doc.institution}</p>
                </div>

                <div class="text-center mt-3">
                  <p class="small fw-light p-0 m-0">${doc.title}</p>
                </div>
    

          ${
            doc.durationHours
              ? `<div class="position-absolute top-0 end-0 d-flex flex-column">
                  <small class="fw-light fst-italic d-flex gap-1">
                      <i class="bi bi-clock-history"></i>${doc.durationHours}hh
                  </small>
                  
                  ${
                    doc.certificate
                      ? `<a href="" data-link="${doc.certificate}" class="d-flex  justify-content-center">
                      <small class="fw-light">Cert. <i class="bi bi-mortarboard"></i></small>
                    </a>`
                      : ``
                  }
                     
                </div>`
              : `<div class="position-absolute top-0 end-0">
                  <small class="fw-light fst-italic">
                    ${markupDate(new Date(doc.startDate))} -> ${
                  new Date(doc.completionDate).getFullYear() == 2030
                    ? 'PRESENT'
                    : markupDate(new Date(doc.completionDate))
                }
                   </small> 
                </div>`
          }
        </dt>

        <dd class="fw-light m-2 typewriter fw-bold">
            <div class="m-0 d-flex flex-column">
              <small class="p-0 m-0">${doc.name}</small>
              <small class="fw-light fst-italic text-black-50">${
                doc.fieldOfStudy
              }</small>
            </div>
        </dd>

    
        <dd class="ms-2 fw-light fst-italic typewriter" data-typewriter="false">
          <a data-toggle-description="true" class="m-0 fw-light" >Description <i class="bi bi-caret-right"></i></i> <span style="display: none" class="fw-light"><small>${
            doc.description
          }</small></ul></span> </a>
        </dd>
      </dl>
    `;
  }

  // Html markup for a education NOT taken online document
  _notOnlineEducationMarkup(doc) {
    // Helper function to display the dates
    const markupDate = date =>
      `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

    // Address markup
    const address = `${doc.location.streetAddress}, ${doc.location.postalCode} ${doc.location.country}`;

    // Google maps link with the address coordinates
    const mapsLink = `https://www.google.com/maps?q=${doc.location.coordinates.join(
      ','
    )}`;

    return `
        <dl class="terminal-card p-1">
              <dt class="fw-light m-2 pb-0 fw-bold card-divider typewriter position-relative" data-typewriter="false">
          
                <div class="d-flex align-items-center pt-2">
                  <img class="experience-logo rounded" src="${doc.logo}" alt="${
      doc.institution
    } logo">
                  <p class="p-0 m-0 ms-2">${doc.institution}</p>
                </div>

                <div class="text-center mt-3">
                  <p class="small fw-light p-0 m-0">${doc.title}</p>
                </div>
    
      
  
          <div class="position-absolute top-0 end-0 ">
                    <small class="fw-light fst-italic">
                      ${markupDate(new Date(doc.startDate))} -> ${
      new Date(doc.completionDate).getFullYear() == 2030
        ? 'PRESENT'
        : markupDate(new Date(doc.completionDate))
    }
                     </small> 
                  </div>
          </dt>
  
          <dd class="fw-light m-2 typewriter fw-bold">
              <div class="m-0 d-flex flex-column">
                <small class="p-0 m-0">${doc.name}</small>
                <small class="fw-light fst-italic text-black-50">${
                  doc.fieldOfStudy
                }</small>
              </div>
          </dd>
  
      
          <dd class="ms-2 fw-light fst-italic typewriter" data-typewriter="false">
            <a data-toggle-description="true" class="m-0 fw-light" >Description <i class="bi bi-caret-right"></i></i> <span style="display: none" class="fw-light"><small>${
              doc.description
            }</small></ul></span> </a>
  
              <dd class="ms-2 typewriter text-center" data-typewriter="false">
      <small><a href="${mapsLink}" data-link="${mapsLink}" class="fw-light fst-italic">${address}</a></small>
    </dd>
          </dd>
        </dl>
      `;
  }

  // Html markup for a single experience document
  _experienceMarkup(experience) {
    // Create a string of list elements for the tasks performed at this job
    const tasks = experience.tasks
      .map(task => `<li><small class="fw-light">${task}</small></li>`)
      .join('');

    // Employment type based on the fulltime boolean in the document
    const employment = experience.fulltime ? 'full-time' : 'part-time';

    // Address markup
    const address = `${experience.location.streetAddress}, ${experience.location.postalCode} ${experience.location.country}`;

    // Google maps link with the address coordinates
    const mapsLink = `https://www.google.com/maps?q=${experience.location.coordinates.join(
      ','
    )}`;

    // Helper function to display the dates
    const markupDate = date =>
      `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

    return `
  <dl class="terminal-card p-1">
    <dt class="fw-light m-2 fw-bold card-divider typewriter d-flex align-items-center gap-2 position-relative" data-typewriter="false">
      <img class="experience-logo rounded" src="${experience.logo}" alt="${
      experience.institution
    } logo">
      <p class="p-0 m-0">${experience.institution}</p>
 

      ${
        experience.recommendationLink
          ? `<a href="" class="position-absolute top-0 end-0" data-link="${API_URL}/${experience.recommendationLink}"><i class="bi bi-envelope-heart fs-1"></i></a>`
          : ''
      }
    </dt>

    <dd class="fw-light m-2 typewriter fw-bold d-flex justify-content-between">
        <div class="m-0">
          <p class="p-0 m-0">${experience.title}</p>
          <small class="fw-light fst-italic text-black-50">${
            experience.industry
          }</small>
        </div>
        <small class="fw-light fst-italic">${employment}</small>
    </dd>

    <dd class="typewriter ms-5">
      <small class="fw-light fst-italic">
    ${markupDate(new Date(experience.startDate))} -> ${
      new Date(experience.completionDate).getFullYear() == 2030
        ? 'PRESENT'
        : markupDate(new Date(experience.completionDate))
    }
      </small>
    </dd>
    <dd class="ms-5 fw-light fst-italic typewriter" data-typewriter="false">
      <a data-toggle-description="true" class="m-0 fw-light" >TASKS <i class="bi bi-caret-right"></i></i> <span style="display: none" class="fw-light"><ul class="mt-0">${tasks}</ul></span> </a>
    </dd>

    <dd class="ms-2 typewriter text-center" data-typewriter="false">
      <small><a href="${mapsLink}" data-link="${mapsLink}" class="fw-light fst-italic">${address}</a></small>
    </dd>
  </dl>`;
  }

  // Html markup for a single project document
  _projectMarkup(project) {
    return `
      <dl class="terminal-card p-1">
      <dt class="fw-light m-2 typewriter fw-bold">${project.name}</dt>
      <dd class="ms-5 fw-light typewriter">
        <a data-link="${project.githubUrl}" href="GITHUB">GITHUB</a> |
        <a data-link="${project.demoUrl}" href="DEMO-SITE">DEMO</a>
      </dd>
      <dd class="ms-5 fst-italic typewriter fs-4 d-flex align-items-center stack-scrollbar pb-1 gap-3 overflow-auto" data-typewriter="false">
       <small class="fw-light fst-italic fs-6"><kbd>Stack:</kbd></small> 
       ${project.stack.map(s => s.icon).join(' ')} 
      </dd>
      <span class="typewriter" data-typewriter="false"><hr class="m-1"/></span>
      <dd class="ms-5 fw-light fst-italic typewriter" data-typewriter="false">
        <a data-toggle-description="true" >Description <i class="bi bi-caret-right"></i></i> <span style="display: none" class="fw-light"><small>${
          project.description
        }</small></span> </a>
      </dd>
    </dl>`;
  }

  // Html markup for a single skill document
  _skillMarkup(skill) {
    const listItems = skill.tags
      .map(
        tag =>
          `<li class="text-dark fw-light ms-3"><small class="fw-light">${tag}</small></li>`
      )
      .join('');

    return `
      <div class="m-0 mt-3 mb-1 skill w-50 me-1">
        <p class="typewriter m-0"><span class="fw-bold">${skill.name}</span></p>
        <a data-toggle-description="true" class="typewriter m-0 ms-2" data-typewriter="false"><small>${skill.level}</small> <i class="bi bi-list-nested"></i>
          <span style="display: none">
            <ul class="fw-light m-0">
            ${listItems}
            </ul>
          </span>
        </a>
      </div>
    `;
  }

  // Inserts the markup into the DOM and inits the typewriter animation
  async _printAndTypewriter(markup) {
    // insert markup
    try {
      $('.response').get(0).insertAdjacentHTML('beforeend', markup);

      this._updateScrollAnimation();

      await typewriterAnimation();
    } catch (error) {
      console.log('Error in typewriter animation:', error);
    }
  }

  // Dynamically controls the scroll animation on suggestion query's
  _updateScrollAnimation() {
    if (!$('.scroll-wrapper').length) return;

    if ($('.scroll-wrapper').length >= 2) $('.scroll-wrapper').get(0).remove();

    const container = document.querySelector('.scroll-wrapper');
    const content = document.querySelector('.auto-scroll');

    if (!container) return;

    const overflowAmount = content.scrollWidth - container.clientWidth;
    const keyframes = `
      @keyframes scroll-to-overflow {
        0% { transform: translateX(0); }
        10% { transform: translateX(0); }

        90% { transform: translateX(-${overflowAmount}px); }
        100% { transform: translateX(-${overflowAmount}px); }
      }
    `;

    $('style').remove();

    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
  }

  // returns markup for a single line of message
  _messageMarkup(message) {
    if (!message) return '';

    // split the AI response by the new lines
    const lines = message.split('\n').filter(str => str);

    lines.forEach(line => line.replaceAll('\\n', ''));

    // create a markup for each line
    const markup = lines
      .map(line => `<p class="typewriter m-0 text-jeffBot"> > ${line}</p>`)
      .join('');

    return markup;
  }

  // Markup for suggestion querys provided by JeffBot
  _suggestionsMarkup(suggestions) {
    if (!suggestions) return '';

    return `
      <div class="typewriter scroll-wrapper" data-typewriter="false" style="white-space: nowrap">
        <hr class="m-0 mt-2"/>
        <small class="fw-light fst-italic">You might be interested in:</small>
        <small class="auto-scroll d-flex gap-2 p-2">${suggestions
          .map(s => `<a href="#">${s}</a>`)
          .join('|')}</small>
      </div>
    `;
  }
}

export default new Printer();
