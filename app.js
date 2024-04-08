let imageURL = "";
function dropHandler(event) {
  event.stopPropagation();
  event.preventDefault();

  const image = event.dataTransfer.files[0];

  if (image.type.startsWith("image/")) {
    URL.revokeObjectURL(imageURL);
    imageURL = URL.createObjectURL(image);
    document.querySelector("#puzzle").src = imageURL;
    document.querySelector("#controls").style.visibility = "visible";
    setPieceSize(img.width, img.height);
  }
}

function uploadHandler(event) {
  const image = event.target.files[0];
  URL.revokeObjectURL(imageURL);
  imageURL = URL.createObjectURL(image);
  document.querySelector("#puzzle").src = imageURL;
  document.querySelector("#controls").style.visibility = "visible";
}

function cancel() {
  document.querySelector("#controls").style.visibility = "hidden";
  document.querySelector("#puzzle").src = "";
  document.querySelectorAll(".piece").forEach((piece) => piece.remove());
  document.querySelector("#puzzle").style.visibility = "visible";
}

function confirm() {
  document.querySelectorAll(".piece").forEach((piece) => piece.remove());
  const n = parseInt(document.querySelector("#n-range").value);
  const img = document.querySelector("#puzzle");
  const ratio = Math.max(img.width, img.height) / Math.min(img.width, img.height);
  //              Array from [0 ... n]            filter only divisors of n
  const factors = Array.from(Array(n + 1).keys()).filter((x) => n % x === 0);

  let [A, B] = findPair(factors, ratio, n);
  console.log(A, B);

  if (img.width < img.height) {
    A = A + B;
    B = A - B;
    A = A - B;
  }
  pieceWidth = img.width / A;
  pieceHeight = img.height / B;

  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.classList.add("piece");
    p.innerHTML = `
    <span class="image"></span>
    <span class="piece-side top"></span>
    <span class="piece-side bottom"></span>
    <span class="piece-side left"></span>
    <span class="piece-side right"></span>`;
    p.querySelector(".image").style.backgroundImage = "url(" + imageURL + ")";
    p.style.width = pieceWidth + "px";
    p.style.height = pieceHeight + "px";
    p.style.position = "absolute";

    p.dataset.index = i;
    const column = i % A;
    const row = parseInt(i / A);
    p.dataset.column = column;
    p.dataset.row = row;

    p.querySelector(".image").style.backgroundPositionX = -1 * column * pieceWidth + "px";
    p.querySelector(".image").style.backgroundPositionY = -1 * row * pieceHeight + "px";

    p.querySelector(".top").style.backgroundPositionX = -1 * (column * pieceWidth + 0.35 * pieceWidth) + "px";
    p.querySelector(".top").style.backgroundPositionY = -1 * (row * pieceHeight - 0.15 * pieceHeight) + "px";
    p.querySelector(".bottom").style.backgroundPositionX = -1 * (column * pieceWidth + 0.35 * pieceWidth) + "px";
    p.querySelector(".bottom").style.backgroundPositionY = -1 * (row * pieceHeight + 0.85 * pieceHeight) + "px";
    p.querySelector(".left").style.backgroundPositionX = -1 * (column * pieceWidth - 0.15 * pieceWidth) + "px";
    p.querySelector(".left").style.backgroundPositionY = -1 * (row * pieceHeight + 0.35 * pieceHeight) + "px";
    p.querySelector(".right").style.backgroundPositionX = -1 * (column * pieceWidth + 0.85 * pieceWidth) + "px";
    p.querySelector(".right").style.backgroundPositionY = -1 * (row * pieceHeight + 0.35 * pieceHeight) + "px";

    /*p.style.top = row * pieceHeight + "px";
    p.style.left = column * pieceWidth + "px";*/

    p.style.top = Math.random() * (document.querySelector("#puzzle").offsetHeight + 100) - 100 + "px";
    p.style.left = Math.random() * (document.querySelector("#puzzle").offsetWidth + 100) - 100 + "px";

    p.style.zIndex = Math.floor(Math.random() * n);

    document.querySelector("main").append(p);
    dragElement(p);
  }

  for (let i = 0; i < A; i++) {
    const puzzles = Array.from(document.querySelectorAll(`.piece[data-column="${i}"]`));
    for (let j = 0; j < puzzles.length; j++) {
      if (i === 0) {
        puzzles[j].querySelector(".left").classList.add("half");
        puzzles[j].querySelector(".left").style.backgroundImage = "url(" + imageURL + ")";
      }
      if (i === A - 1) {
        puzzles[j].querySelector(".right").classList.add("half");
        puzzles[j].querySelector(".right").style.backgroundImage = "url(" + imageURL + ")";
      }

      if (j === puzzles.length - 1) break;

      if (Math.random() > 0.5) {
        puzzles[j + 1].querySelector(".top").classList.add("full");
        puzzles[j + 1].querySelector(".top").style.backgroundImage = "url(" + imageURL + ")";
      } else {
        puzzles[j].querySelector(".bottom").classList.add("full");
        puzzles[j].querySelector(".bottom").style.backgroundImage = "url(" + imageURL + ")";
      }
    }
  }
  for (let i = 0; i < B; i++) {
    const puzzles = Array.from(document.querySelectorAll(`.piece[data-row="${i}"]`));
    for (let j = 0; j < puzzles.length; j++) {
      if (i === 0) {
        puzzles[j].querySelector(".top").classList.add("half");
        puzzles[j].querySelector(".top").style.backgroundImage = "url(" + imageURL + ")";
      }
      if (i === B - 1) {
        puzzles[j].querySelector(".bottom").classList.add("half");
        puzzles[j].querySelector(".bottom").style.backgroundImage = "url(" + imageURL + ")";
      }

      if (j === puzzles.length - 1) break;

      if (Math.random() > 0.5) {
        puzzles[j + 1].querySelector(".left").classList.add("full");
        puzzles[j + 1].querySelector(".left").style.backgroundImage = "url(" + imageURL + ")";
      } else {
        puzzles[j].querySelector(".right").classList.add("full");
        puzzles[j].querySelector(".right").style.backgroundImage = "url(" + imageURL + ")";
      }
    }
  }

  document.querySelector("#puzzle").style.visibility = "hidden";
}

function addPart(side) {
  return Math.random() > 0.5 ? side + "forward" : side + "backward";
}

function findPair(array, ratio, n) {
  let closestRatioDelta = Number.MAX_SAFE_INTEGER;
  let A;
  let B;
  for (let i = 0; i < array.length - 1; i++) {
    let a = array[i];
    for (let j = i + 1; j < array.length; j++) {
      let b = array[j];
      if (Math.min(Math.abs(a / b - ratio), Math.abs(b / a - ratio)) < closestRatioDelta && a * b === n) {
        closestRatioDelta = Math.min(Math.abs(a / b - ratio), Math.abs(b / a - ratio));
        A = Math.max(a, b);
        B = Math.min(a, b);

        if (closestRatioDelta < 0.1) return [A, B];
      }
    }
  }
  return [A, B];
}

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    document.querySelectorAll(".drag").forEach((dragged) => dragged.classList.remove("drag"));
    elmnt.classList.add("drag");
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
