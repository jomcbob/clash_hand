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

        if (deck.length >= 4) {
          const newCard = deck.splice(3, 1)[0]
          deck.splice(index, 0, newCard)
        }

        renderHand()
        renderDeck()

      }
    }

    card.appendChild(cardContent)
    handContainer.appendChild(card)
  });
}

function renderDeck() {
  const deckContainer = document.getElementById("deck-container")
  deckContainer.innerHTML = ""

  deck.slice(4, 8).forEach((cardObj) => {
    const card = document.createElement("div")
    card.className = "card";

    const cardContent = document.createElement("div")
    cardContent.className = "card-content"

    if (cardObj === null) {
      cardContent.innerHTML = "<strong>?</strong>"
      card.style.pointerEvents = "none"
    } else {
      cardContent.innerHTML = `<strong>${cardObj.name}</strong><br/>-${cardObj.value}`
    }

    card.appendChild(cardContent)
    deckContainer.appendChild(card)
  })
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

  const container = document.getElementById("starter-cards")
  container.innerHTML = ""

  starterList.forEach((cardData) => {
    const card = document.createElement("div")
    card.className = "starter-card"
    card.textContent = `${cardData.name} (-${cardData.value})`

    card.onclick = () => {
      const lastNullIndex = deck.lastIndexOf(null);
      if (lastNullIndex === -1) {
        showMessage("Deck is full. All cards are set.", "red")
        return
      }
    
      if (currentBar < cardData.value) {
        showMessage(`Not enough energy to add "${cardData.name}".`, 'red')
        return
      }
    
      currentBar -= cardData.value
      updateBar()
      showMessage(`Added "${cardData.name}" to deck.`, 'green')
    
      deck.splice(lastNullIndex, 1)
      deck.push({ ...cardData })
    
      renderHand()
      renderDeck()
    
      card.style.pointerEvents = "none";
      card.style.opacity = 0.5;
    }
    

    container.appendChild(card)
  })
}

function preloadDeck() {
  renderStarterOptions()
  renderHand()
  renderDeck()
  showMessage("Deck initialized with starter options.", "green")
}

function updateCardStates() {
  const handCards = document.querySelectorAll("#hand-container .card")
  handCards.forEach((cardEl, i) => {
    const cardObj = deck[i]
    if (!cardObj) return

    if (currentBar >= cardObj.value) {
      cardEl.classList.remove("disabled-card")
      cardEl.style.pointerEvents = "auto"
    } else {
      cardEl.classList.add("disabled-card")
      cardEl.style.pointerEvents = "none"
    }
  })
}

function autoRecharge() {
  setInterval(() => {
    if (currentBar < maxBar) {
      currentBar = Math.min(currentBar + 0.1, maxBar);
      updateBar();
    }
  }, 200)
}

document.addEventListener('keydown', (e) => {
  const key = e.key
  if (!['1', '2', '3', '4'].includes(key)) return

  const index = parseInt(key) - 1
  const cardObj = deck[index]

  if (cardObj && currentBar >= cardObj.value) {
    currentBar -= cardObj.value
    updateCardStates()
    showMessage(`Used "${cardObj.name}" for -${cardObj.value}.`, 'green')

    deck.splice(index, 1)
    deck.push(cardObj)

    renderHand()
  } else if (cardObj) {
    showMessage(`Not enough energy for "${cardObj.name}".`, 'red')
  }
})

updateBar()
autoRecharge()
preloadDeck()
