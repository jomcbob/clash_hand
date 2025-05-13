let maxBar = 10;
let currentBar = 10;

const deck = []; // All cards go here

function updateBar() {
  const barFill = document.getElementById("bar-fill");
  const barText = document.getElementById("bar-text");

  const percent = (currentBar / maxBar) * 100;
  barFill.style.transition = "width 0.2s ease-in-out";
  barFill.style.width = `${percent}%`;

  barText.textContent = `${Math.round(currentBar * 10) / 10} / ${maxBar}`;

  updateCardStates(); // Just update visuals, not DOM
}

function showMessage(message, color = 'red') {
  const messageArea = document.getElementById("message-area");
  messageArea.textContent = message;
  messageArea.style.color = color;
}

function renderHand() {
  const handContainer = document.getElementById("hand-container");
  const deckContainer = document.getElementById("deck-container");

  handContainer.innerHTML = "";
  deckContainer.innerHTML = "";

  const handSize = 4;

  // Show top 4 as hand
  deck.slice(0, handSize).forEach((cardObj, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.innerHTML = `<strong>${cardObj.name}</strong><br/>-${cardObj.value}`;
    card.appendChild(cardContent);

    const affordable = currentBar >= cardObj.value;

    if (affordable) {
      card.classList.remove("disabled-card");
      card.style.pointerEvents = "auto";
    } else {
      card.classList.add("disabled-card");
      card.style.pointerEvents = "none";
    }

card.onclick = () => {
  if (currentBar < cardObj.value) return; // Make sure the player has enough energy

  // Subtract the card value from the bar
  currentBar -= cardObj.value;
  updateBar();
  showMessage(`Used "${cardObj.name}" for -${cardObj.value}.`, 'green');

  // Animate the card out (for UI effect)
  card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  card.style.transform = "scale(0)";
  card.style.opacity = 0;
  card.style.pointerEvents = "none";
  card.style.visibility = "hidden";

  // After the animation completes, update the deck and hand
  setTimeout(() => {
    // Remove the used card from the hand (top 4 cards)
    const usedCard = deck.splice(index, 1)[0];

    // Add the played card to the bottom of the deck
    deck.push(usedCard);

    // Now update the hand (first 4 cards)
    renderHand();
  }, 300); // Wait for animation to finish before re-rendering
};

    
    
    

    handContainer.appendChild(card);
  });

  // Show remaining deck
  deck.slice(handSize).forEach((cardObj, idx) => {
    const card = document.createElement("div");
    card.className = "card";
  
    const positionLabel = document.createElement("div");
    positionLabel.className = "deck-position-label";
    positionLabel.textContent = (idx + 1).toString(); // 1-based position
    card.appendChild(positionLabel);
  
    const cardContent = document.createElement("div");
    cardContent.className = "card-content";
    cardContent.innerHTML = `<strong>${cardObj.name}</strong><br/>-${cardObj.value}`;
    card.appendChild(cardContent);
  
    deckContainer.appendChild(card);
  });
}

function updateCardStates() {
  const handCards = document.querySelectorAll("#hand-container .card");
  handCards.forEach((cardEl, i) => {
    const cardObj = deck[i];
    if (!cardObj) return;

    if (currentBar >= cardObj.value) {
      cardEl.classList.remove("disabled-card");
      cardEl.style.pointerEvents = "auto";
    } else {
      cardEl.classList.add("disabled-card");
      cardEl.style.pointerEvents = "none";
    }
  });
}

function preloadDeck() {
  const sampleCards = [
    { name: "Strike", value: 2 },
    { name: "Block", value: 1 },
    { name: "Fireball", value: 4 },
    { name: "Dash", value: 1 },
    { name: "Heal", value: 3 },
    { name: "Shield", value: 2 },
    { name: "Poison", value: 3 },
    { name: "Charge", value: 2 }
  ];

  deck.push(...sampleCards);
  renderHand();
  showMessage("Preloaded 8 test cards.", "green");
}

function addCard() {
  const nameInput = document.getElementById("card-name");
  const valueInput = document.getElementById("card-value");

  const name = nameInput.value.trim();
  const value = parseInt(valueInput.value);

  if (!name) {
    showMessage("Please enter a card name.");
    return;
  }

  if (isNaN(value) || value < 1 || value > 10) {
    showMessage("Enter a valid number between 1 and 10.");
    return;
  }

  if (deck.length >= 8) {
    showMessage("Deck is full. Max 8 cards allowed.");
    return;
  }

  deck.push({ name, value });
  nameInput.value = "";
  valueInput.value = "";

  showMessage(`Card "${name}" added.`, 'green');
  renderHand();
}

function autoRecharge() {
  setInterval(() => {
    if (currentBar < maxBar) {
      currentBar = Math.min(currentBar + 0.1, maxBar);
      updateBar();
    }
  }, 200);
}

document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (!["1", "2", "3", "4"].includes(key)) return;

  const index = parseInt(key) - 1;
  const handCards = document.querySelectorAll("#hand-container .card");

  if (handCards[index]) {
    const card = handCards[index];
    if (!card.classList.contains("disabled-card")) {
      card.click();
      card.classList.add("key-pressed");
      setTimeout(() => card.classList.remove("key-pressed"), 150);
    } else {
      showMessage(`Not enough energy for card ${key}.`, 'red');
    }
  }
});

// Initialize
updateBar();
autoRecharge();
preloadDeck();
