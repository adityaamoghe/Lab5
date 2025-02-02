// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const myCanvas = document.getElementById("user-image"); // reference to HTML canvas element
const context = myCanvas.getContext('2d');  //gets the context

const imageInp = document.getElementById('image-input'); // referes to user image input
const botTXT = document.getElementById('text-bottom'); //refers to bottom-text input
const topTXT = document.getElementById('text-top'); // refers to top-text input
const myForm = document.getElementById('generate-meme'); //refers to actual form implementation
const vGroup = document.getElementById('volume-group'); //refers to volume groupse
const vSelect = document.getElementById('voice-selection'); //refers to voices we can select

const clearBTN = document.querySelector("[type='reset']");  //Selects element with type "reset"
const readtextBTN = document.querySelector("[type='button']"); //Selects element with type "button"
const generateBTN = document.querySelector("[type='submit']"); //Selects element with type "submit"
const vSlider = document.querySelector("[type='range']"); //Selects element with type "range"

let speechSynth = window.speechSynthesis; //variale used for Speech Synthesis
let vLevel = 1; //Temp variable used for volume adjustment
let vArr = [];  //Empty array that stores the voices


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  /* Clearing the Canvas first so we can apply pictures on top */
  context.clearRect(0,0, myCanvas.width, myCanvas.width);
  context.fillStyle = 'black';  //fill square in with black
  context.fillRect(0,0, myCanvas.width, myCanvas.height); //fill back cleared rect

  /* Getting the Dimensions to Draw */
  const imageDims = getDimmensions(myCanvas.width, myCanvas.height, img.width, img.height); //Image dimensions
  context.drawImage(img, imageDims.startX, imageDims.startY, imageDims.width, imageDims.height); //Draws Image

  /* Button Toggling: */
  clearBTN.disabled = false;
  readtextBTN.disabled = true;
  generateBTN.disabled = false;
  vSelect.disabled = true;

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

});

imageInp.addEventListener('change', () => {

  img.src  = URL.createObjectURL(imageInp.files[0]);  //Creates a DOMString containing a URL representing the object given in the parameter
  myCanvas.setAttribute('alt', imageInp.files[0].name); //Sets the attribute

});

myForm.addEventListener('submit', (event) => {
  
  /* Tells user that if the event does not get explicitly handled, its default action should not be taken as it normally would be. */
  event.preventDefault(); 

  /* Stylistic Elements of meme text */
  context.font = '50px Impact';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.lineWidth = 2.5;

  /* Fill + Stroke of Bottom Text */
  context.textBaseline = 'bottom';
  context.fillText(botTXT.value , 0.5 * (myCanvas.width), myCanvas.width);
  context.strokeText(botTXT.value , 0.5 * (myCanvas.width), myCanvas.width);

  /* Fill + Stroke of Top Text */
  context.textBaseline = 'top';
  context.fillText(topTXT.value , 0.5 * (myCanvas.width), (myCanvas.width - myCanvas.width));
  context.strokeText(topTXT.value , 0.5 * (myCanvas.width), (myCanvas.width - myCanvas.width));

  /* Button Toggling: */
  clearBTN.disabled = false;
  readtextBTN.disabled = false;
  generateBTN.disabled = true;
  vSelect.disabled = false;

});

clearBTN.addEventListener('click' , () => {

  /* Clearing the Canvas first so we can apply pictures on top */
  context.clearRect(0,0, myCanvas.width, myCanvas.width);

  /* Button Toggling: */
  clearBTN.disabled = true;
  readtextBTN.disabled = true;
  generateBTN.disabled = false;
  vSelect.disabled = true;

  myForm.reset();

});

readtextBTN.addEventListener('click' , () => {

  /* Create a new speech request for top text and bottom text*/
  let topUtterance = new SpeechSynthesisUtterance(topTXT.value);
  let botUtterance = new SpeechSynthesisUtterance(botTXT.value);

  /* Fix the volumes */
  topUtterance.volume = vLevel;
  botUtterance.volume = vLevel;

  var opt = vSelect.selectedOptions[0].getAttribute('data-name'); //gets the user selected option

  /* Loops thrugh our voices array and assigns the top and bottom voice to the one user chose */
  for(var iterator = 0; iterator < vArr.length; iterator++){
    if(vArr[iterator].name === opt){    
      topUtterance.voice = vArr[iterator];
      botUtterance.voice = vArr[iterator];
    }
  }

  speechSynth.speak(topUtterance);  //Speak top text
  speechSynth.speak(botUtterance);  //Speak bottom text
  
});

vSlider.addEventListener('input', () => {
  
  vLevel = vSlider.value / 100; //adjust the volume level
  let pic = vGroup.childNodes[1]; //variable that stores the sound icon pic

  /* Cases for 4 possible sound icons */
  if(vSlider.value <= 33 && vSlider.value >= 1){
    pic.src = 'icons/volume-level-1.svg';
  }
  else if(vSlider.value <= 66 && vSlider.value >= 34){
    pic.src = 'icons/volume-level-2.svg';
  }
  else if(vSlider.value >= 67){
    pic.src = 'icons/volume-level-3.svg';
  }
  else{
    pic.src = 'icons/volume-level-0.svg';
  }

});  

function populateVoiceList() {
  
  vArr = speechSynth.getVoices()  //Stores voices into arr
  vSelect.innerHTML = '';

  /* Lops through our voices array */
  for(let iterator = 0; iterator < vArr.length; iterator++) {
    var opt = document.createElement('option'); 
    opt.textContent = vArr[iterator].name + ' (' + vArr[iterator].lang + ')';
    opt.setAttribute('data-lang', vArr[iterator].lang);
    opt.setAttribute('data-name', vArr[iterator].name);
    vSelect.appendChild(opt);
  }

};

populateVoiceList(); //function call

if (speechSynth.onvoiceschanged !== undefined && typeof speechSynth !== 'undefined') {
  speechSynth.onvoiceschanged = populateVoiceList;
}
 
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
