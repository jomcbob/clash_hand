let maxBar = 10
let currentBar = 10
let maxDeckSize = 8

const deck = [null, null, null, null, null, null, null, null]

function updateBar() {
  const barFill = document.getElementById("bar-fill")
  const barText = document.getElementById("bar-text")

  const percent = (currentBar / maxBar) * 100
  barFill.style.transition = "width 0.2s ease-in-out"
  barFill.style.width = `${percent}%`

  barText.textContent = `${Math.round(currentBar * 10) / 10} / ${maxBar}`

  updateCardStates()
}

function showMessage(message, color = 'red') {
  const messageArea = document.getElementById("message-area")
  messageArea.textContent = message
  messageArea.style.color = color
}

function renderHand() {
  const handContainer = document.getElementById("hand-container")
  handContainer.innerHTML = ""

  deck.slice(0, 4).forEach((cardObj, index) => {
    const card = document.createElement("div")
    card.className = "card"

    const cardContent = document.createElement("div")
    cardContent.className = "card-content"

    if (cardObj === null) {
      cardContent.innerHTML = "<strong>?</strong>"
      card.style.pointerEvents = "none"
    } else {
      cardContent.innerHTML = `<strong>${cardObj.name}</strong><br/>-${cardObj.value}`
      const affordable = currentBar >= cardObj.value

      if (affordable) {
        card.classList.remove("disabled-card")
        card.style.pointerEvents = "auto"
      } else {
        card.classList.add("disabled-card")
        card.style.pointerEvents = "none"
      }

      card.onclick = () => {
        if (currentBar < cardObj.value) return
        currentBar -= cardObj.value;
        updateCardStates()
        showMessage(`Used "${cardObj.name}" for -${cardObj.value}.`, 'green')

        deck.splice(index, 1)

        deck.push(cardObj);

        // Insert a new card from the back into this hand position (if available)
        if (deck.length >= 4) {
          const newCard = deck.splice(3, 1)[0]; // Take the next card after top 3
          deck.splice(index, 0, newCard);       // Put it in the current index
        }

        renderHand();
        renderDeck();

      };
    }

    card.appendChild(cardContent);
    handContainer.appendChild(card);
  });
}

function renderDeck() {
  const deckContainer = document.getElementById("deck-container");
  deckContainer.innerHTML = ""; // Clear current deck display

  // Show the remaining cards in the deck (positions 4–7)
  deck.slice(4, 8).forEach((cardObj, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    // If the card is null, display it as ?
    if (cardObj === null) {
      cardContent.innerHTML = "<strong>?</strong>";
      card.style.pointerEvents = "none";  // Can't click a null card
    } else {
      cardContent.innerHTML = `<strong>${cardObj.name}</strong><br/>-${cardObj.value}`;
    }

    card.appendChild(cardContent);
    deckContainer.appendChild(card);
  });
}

function renderStarterOptions() {
  const starterList = [
    { name: "Strike", value: 2 },
    { name: "Block", value: 1 },
    { name: "Fireball", value: 4 },
    { name: "Dash", value: 1 },
    { name: "Heal", value: 3 },
    { name: "Shield", value: 2 },
    { name: "Bomber", value: 3 },
    { name: "Charge", value: 2 },
    { name: "Lightning", value: 5 },
  ]

  const container = document.getElementById("starter-cards");
  container.innerHTML = "";

  starterList.forEach((cardData) => {
    const card = document.createElement("div");
    card.className = "starter-card";
    card.textContent = `${cardData.name} (-${cardData.value})`;

    card.onclick = () => {
      // Don't allow selection if deck is full
      const lastNullIndex = deck.lastIndexOf(null);
      if (lastNullIndex === -1) {
        showMessage("Deck is full. All cards are set.", "red");
        return;
      }
    
      // Don't allow selection if not enough energy
      if (currentBar < cardData.value) {
        showMessage(`Not enough energy to add "${cardData.name}".`, 'red');
        return;
      }
    
      // Subtract energy and update
      currentBar -= cardData.value;
      updateBar();
      showMessage(`Added "${cardData.name}" to deck.`, 'green');
    
      // Add card to deck
      deck.splice(lastNullIndex, 1);  
      deck.push({ ...cardData });
    
      renderHand();
      renderDeck();
    
      // Visually disable this card
      card.style.pointerEvents = "none";
      card.style.opacity = 0.5;
    };
    

    container.appendChild(card);
  });
}

// Initialize the deck with `null` values
function preloadDeck() {
  renderStarterOptions();
  renderHand();
  renderDeck();
  showMessage("Deck initialized with starter options.", "green");
}

// Update the visual state of cards
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

// Auto-recharge bar every 200ms (just for demonstration)
function autoRecharge() {
  setInterval(() => {
    if (currentBar < maxBar) {
      currentBar = Math.min(currentBar + 0.1, maxBar);
      updateBar();
    }
  }, 200);
}

document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (!['1', '2', '3', '4'].includes(key)) return;

  const index = parseInt(key) - 1;
  const cardObj = deck[index];

  if (cardObj && currentBar >= cardObj.value) {
    currentBar -= cardObj.value;
    updateCardStates()
    showMessage(`Used "${cardObj.name}" for -${cardObj.value}.`, 'green');

    // Remove from hand and add to bottom of deck
    deck.splice(index, 1);
    deck.push(cardObj);

    renderHand();
  } else if (cardObj) {
    showMessage(`Not enough energy for "${cardObj.name}".`, 'red');
  }
});

// Initialize
updateBar();
autoRecharge();
preloadDeck();
