///////////////////  FireBsae SetUp ////////////////////////
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDMLSefA3R7f_FHT2gukMtru6uSbC9aUJ0',
  authDomain: 'text-editor-c2243.firebaseapp.com',
  databaseURL: 'https://text-editor-c2243-default-rtdb.firebaseio.com',
  projectId: 'text-editor-c2243',
  storageBucket: 'text-editor-c2243.appspot.com',
  messagingSenderId: '827510924291',
  appId: '1:827510924291:web:c3a67da0258cd5f0109a36',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allText = [];
let selectedText = null;
let selectedTextindex = null;
let undoStack = [];
let redoStack = [];

//////////////// Show Text Area On Canvas /////////////////////

function createTextArea(
  id,
  x,
  y,
  inputText,
  fontFamily,
  fontColor,
  fontSize,
  redraw
) {
  const textarea = document.createElement('textarea');
  textarea.classList.add('custom-textarea');
  textarea.id = `textarea${id}`;
  textarea.value = inputText;
  textarea.style.left = x + 'px';
  textarea.style.top = y + 'px';
  const styles = {
    fontFamily: fontFamily,
    fontSize: fontSize + 'px',
    color: fontColor,
  };
  Object.assign(textarea.style, styles);
  document.querySelector('.wrap').appendChild(textarea);

  if (!redraw) {
    allText.push({ id, x, y, inputText, fontFamily, fontSize, fontColor });
    undoStack.push(JSON.parse(JSON.stringify(allText)));
    console.log(undoStack.length);
    redoStack = [];
  }

  const element = document.getElementById(`textarea${id}`);

  element.addEventListener('click', () => {
    selectedText = element;
    selectedTextindex = id - 1;

    const stextarea = document.createElement('textarea');
    stextarea.classList.add('custom-textarea');
    stextarea.id = 'textInput';
    stextarea.value = selectedText.value;
    document.querySelector('#select').appendChild(stextarea);
    document.getElementById('textInput').addEventListener('input', function () {
      if (selectedText) {
        selectedText.value = this.value;
        element.value = selectedText.value;
        allText[selectedTextindex].inputText = selectedText.value;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
        undoStack.push(JSON.parse(JSON.stringify(allText)));
        console.log(undoStack.length);
        redoStack = [];
      }
    });
  });
  element.addEventListener('input', () => {
    allText[selectedTextindex].inputText = selectedText.value;
    document.getElementById('textInput').value = selectedText.value;
    undoStack.push(JSON.parse(JSON.stringify(allText)));
    console.log(undoStack.length);
    redoStack = [];
  });
  ///////////  dragging Logic  //////////////////////////
  element.addEventListener('mousedown', (e) => {
    let offsetX = e.clientX - element.getBoundingClientRect().left;
    let offsetY = e.clientY - element.getBoundingClientRect().top;

    document.addEventListener('mousemove', dragTextArea);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', dragTextArea);
    });

    function dragTextArea(e) {
      let x = e.clientX - offsetX - boundary.getBoundingClientRect().left;
      let y = e.clientY - offsetY - boundary.getBoundingClientRect().top;

      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      if (x > boundary.offsetWidth - element.offsetWidth) {
        x = boundary.offsetWidth - element.offsetWidth;
      }
      if (y > boundary.offsetHeight - element.offsetHeight) {
        y = boundary.offsetHeight - element.offsetHeight;
      }

      element.style.left = x + 'px';
      element.style.top = y + 'px';
    }
    updatePosition(id, element.style.left, element.style.top);
  });
  ////// uuto Resize The Text Area   ////////
  element.addEventListener('input', () => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  });
}

/////////////////  Add New Text Area //////////////////////////
document.querySelector('#addText').addEventListener('click', () => {
  const inputText = 'write blessing';
  if (inputText.trim() !== '') {
    const fontFamily =
      document.getElementById('fontFamilySelect').value || 'Arial';
    const fontSize =
      parseInt(document.getElementById('fontSizeSelect').value) || 36;
    const fontColor =
      document.getElementById('fontColorInput').value || '#000000';

    createTextArea(
      allText.length + 1,
      0,
      0,
      inputText,
      fontFamily,
      fontColor,
      fontSize,
      false
    );
  }
});
const boundary = document.querySelector('.wrap');

function updatePosition(id, x, y) {
  const index = allText.findIndex((item) => item.id === id);
  allText[index].x = parseInt(x);
  allText[index].y = parseInt(y);
  undoStack.push(JSON.parse(JSON.stringify(allText)));
  console.log(undoStack.length);
  redoStack = [];
}

/////////////  change the TextAreaProperties ///////
function updateTextAreaProperties() {
  if (selectedText && selectedTextindex !== -1) {
    const fontFamily =
      document.getElementById('fontFamilySelect').value || 'Arial';
    const fontSize =
      parseInt(document.getElementById('fontSizeSelect').value) || 36;
    const fontColor =
      document.getElementById('fontColorInput').value || '#000000';

    selectedText.style.fontFamily = fontFamily;
    selectedText.style.fontSize = fontSize + 'px';
    selectedText.style.color = fontColor;

    allText[selectedTextindex].fontFamily = fontFamily;
    allText[selectedTextindex].fontSize = fontSize;
    allText[selectedTextindex].fontColor = fontColor;
    undoStack.push(JSON.parse(JSON.stringify(allText)));
    console.log(undoStack.length);
    redoStack = [];
  }
}

document
  .getElementById('fontFamilySelect')
  .addEventListener('change', updateTextAreaProperties);
document
  .getElementById('fontSizeSelect')
  .addEventListener('change', updateTextAreaProperties);
document
  .getElementById('fontColorInput')
  .addEventListener('change', updateTextAreaProperties);

////////////////// Undo /////////////////////////////
document.querySelector('#undo').addEventListener('click', () => {
  if (undoStack.length > 0) {
    const undostate = undoStack.pop();
    redoStack.push(undostate);
    if (undoStack.length > 0) {
      allText = undoStack[undoStack.length - 1];
    } else {
      allText = [];
    }

    redrawText();
  } else {
    alert('No prev state');
  }
});
///////////////// Redo /////////////////////////////
document.querySelector('#redo').addEventListener('click', () => {
  selectedText = null;
  selectedTextindex = null;
  document.getElementById('textInput').value = null;
  if (redoStack.length > 0) {
    const redostate = redoStack.pop();
    undoStack.push(redostate);
    console.log(undoStack.length);
    allText = redostate;
    redrawText();
  } else {
    alert('No next state');
  }
});
function redrawText() {
  const elementsToRemove = document.querySelectorAll('.custom-textarea');

  elementsToRemove.forEach((element) => {
    element.remove();
  });

  allText.forEach((item) => {
    createTextArea(
      item.id,
      item.x,
      item.y,
      item.inputText,
      item.fontFamily,
      item.fontColor,
      item.fontSize,
      true
    );
  });
}

////////// Save the State in Fire Base  /////////////////////
document.querySelector('#save').addEventListener('click', async () => {
  const docRef = await doc(db, 'blessing', '8QQFgr3MZfcJEwiP6hcy');

  const saveState = { data: allText };

  await updateDoc(docRef, saveState);

  alert('Save Succ');
});

///////////////  Fecth the state from FireBase //////////////
const defultTextSetup = async () => {
  const docRef = await doc(db, 'blessing', '8QQFgr3MZfcJEwiP6hcy');
  const data = await getDoc(docRef);

  const defult = data.data().data;
  allText = defult || [];
  console.log(allText);
  if (allText) {
    undoStack.push(JSON.parse(JSON.stringify(allText)));
    redrawText();
  }
};
defultTextSetup();

document.body.addEventListener('click', function (event) {
  var specificDiv1 = document.querySelector('.edit');
  var specificDiv2 = document.querySelector('.wrap');
  var specificDiv3 = document.querySelector('#textInput');
  var specificDiv4 = document.querySelector('#unre');

  if (
    event.target !== specificDiv1 &&
    !specificDiv1.contains(event.target) &&
    event.target !== specificDiv2 &&
    !specificDiv2.contains(event.target) &&
    event.target !== specificDiv3 &&
    !specificDiv3.contains(event.target) &&
    event.target !== specificDiv4 &&
    !specificDiv4.contains(event.target)
  ) {
    selectedText = null;
    selectedTextindex = null;
    document.getElementById('textInput').value = null;
    const elementsToRemove = document.querySelectorAll('#textInput');

    elementsToRemove.forEach((element) => {
      element.remove();
    });
  }
});
