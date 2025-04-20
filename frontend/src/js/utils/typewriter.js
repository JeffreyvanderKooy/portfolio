import $ from 'jquery';
const speed = 4;

const typewriterEffect = async () => {
  const elements = [...document.querySelectorAll('.typewriter')]; // array of all elements that need the typewriter effect
  const textArr = elements.map(ele => ele.innerHTML); // array of all texts inside the elements

  // remove text for all elements
  elements.forEach(ele => (ele.innerHTML = ''));

  // Call typewriter for each element
  for (let i = 0; i < elements.length; i++) {
    const animate = elements[i].dataset.typewriter !== 'false';

    if (animate) await typewriter(textArr[i], elements[i], speed);
    else elements[i].innerHTML = textArr[i];

    $(elements[i]).removeClass('typewriter');
  }

  $('.terminal').trigger('contentChanged');
};

const typewriter = (text, element, speed) => {
  let html = [];
  let i = 0;

  const interval = setInterval(() => {
    html.push(text[i]);
    element.innerHTML = html.join('');
    i++;

    if (i === text.length) clearInterval(interval);
  }, speed);

  return new Promise(resolve => setTimeout(resolve, speed * text.length));
};

export default typewriterEffect;
