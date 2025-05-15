let maxBar = 10
let currentBar = 7
let maxDeckSize = 8
let tripleElixir = false
const normalElixirRate = 0.036
const doubleElixirRate = 0.071
const tripleElixirRate = 0.107
let elixirInterval = 100
let matchDuration = 180
let timeLeft = matchDuration
let elixirRate = normalElixirRate
let deck = [null, null, null, null, null, null, null, null]
let timerInterval = null
let elixirIntervalId = null

function enableDoubleElixir() {
  elixirRate = 0.071
}

let doubleElixir = false

function startMatchTimer() {
  const timerElement = document.getElementById("time")

  if (timerInterval) clearInterval(timerInterval)

  timeLeft = matchDuration
  doubleElixir = false
  tripleElixir = false
  elixirRate = normalElixirRate

  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval)
      timerElement.textContent = "0:00"
      return
    }

    if (timeLeft === 60 && !doubleElixir) {
      doubleElixir = true
      elixirRate = doubleElixirRate
      showMessage("⚡ Double Elixir Activated!", 'black', timerElement)
    }

    if (timeLeft === 30 && !tripleElixir) {
      tripleElixir = true
      elixirRate = tripleElixirRate
      showMessage("🔥 Triple Elixir Activated!", 'orange', timerElement)
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    timerElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

    timeLeft--
  }, 1000)
}

function updateBar() {
  const barFill = document.getElementById("bar-fill")
  const barText = document.getElementById("bar-text")

  const percent = (currentBar / maxBar) * 100
  barFill.style.transition = "width 0.2s ease-in-out"
  barFill.style.width = `${percent}%`

  barText.textContent = `${Math.round(currentBar * 10) / 10} / ${maxBar}`

  updateCardStates()
}

function showMessage(message, color = 'red', messageArea = document.getElementById("message-area")) {
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
      cardContent.innerHTML = `<img src="${cardObj.imgSrc}"><strong>${cardObj.name}-(${cardObj.value})</strong>`
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
        currentBar -= cardObj.value
        updateCardStates()
        showMessage(`Used "${cardObj.name}" for -${cardObj.value}`, 'green')

        deck.splice(index, 1)
        deck.push(cardObj)

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
  })
}

function renderDeck() {
  const deckContainer = document.getElementById("deck-container")
  deckContainer.innerHTML = ""

  deck.slice(4, 8).forEach((cardObj) => {
    const card = document.createElement("div")
    card.className = "card"

    const cardContent = document.createElement("div")
    cardContent.className = "card-content"

    if (cardObj === null) {
      cardContent.innerHTML = "<strong>?</strong>"
      card.style.pointerEvents = "none"
    } else {
      cardContent.innerHTML = `<img src="${cardObj.imgSrc}"><strong>${cardObj.name} (-${cardObj.value})</strong>`
    }

    card.appendChild(cardContent)
    deckContainer.appendChild(card)
  })
}

function renderStarterOptions() {
  const starterList = cards
  const container = document.getElementById("starter-cards")
  container.innerHTML = ""

  starterList.forEach((cardData) => {
    const card = document.createElement("div")
    card.className = "starter-card"
    card.innerHTML = `<img src="${cardData.imgSrc}"><div>${cardData.name}</div>`

    card.onclick = () => {
      let lastNullIndex = deck.lastIndexOf(null)
      if (lastNullIndex === -1) {
        showMessage("Deck is full. All cards are set.", "red")
        document.body.style.justifyContent = "center"
        document.querySelector('.starter-options').style.display = 'none'
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

      card.style.pointerEvents = "none"
      card.style.opacity = 0.5

      lastNullIndex = deck.lastIndexOf(null)
      if (lastNullIndex === -1) {
        showMessage("Deck is full. All cards are set.", "red")
        document.body.style.justifyContent = "center"
        document.querySelector('.starter-options').style.display = 'none'
        return
      }
    }

    container.appendChild(card)
  })
}

function preloadDeck() {
  renderStarterOptions()
  renderHand()
  renderDeck()
  showMessage("Game initialized with starter options.", "green")
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
  if (elixirIntervalId) clearInterval(elixirIntervalId)

  elixirIntervalId = setInterval(() => {
    if (currentBar < maxBar) {
      currentBar = Math.min(currentBar + elixirRate, maxBar)
      updateBar()
    }
  }, elixirInterval)
}

document.addEventListener('keydown', (e) => {
  const key = e.key
  if (!['1', '2', '3', '4'].includes(key)) return

  const index = parseInt(key) - 1
  const cardObj = deck[index]

  if (cardObj && currentBar >= cardObj.value) {
    currentBar -= cardObj.value
    updateCardStates()
    showMessage(`Used "${cardObj.name}" for -${cardObj.value}`, 'green')

    deck.splice(index, 1)
    deck.push(cardObj)

    renderHand()
  } else if (cardObj) {
    showMessage(`Not enough energy for "${cardObj.name}".`, 'red')
  }
})

document.addEventListener('keydown', function(event) {
  if (event.key === 's' || event.key === 'S') {
    startGame()
  }
})

function startGame() {
  window.currentBar = 7
  const barFill = document.getElementById("bar-fill")
  const barText = document.getElementById("bar-text")
  if (barFill) barFill.style.width = "70%"
  if (barText) barText.textContent = "7/ 10"
  currentBar = 7

  const handContainer = document.getElementById("hand-container")
  const deckContainer = document.getElementById("deck-container")
  if (handContainer) handContainer.innerHTML = ""
  if (deckContainer) deckContainer.innerHTML = ""

  preloadDeck()
  startMatchTimer()
  autoRecharge()
}
