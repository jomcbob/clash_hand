
function playCard(cardName) {
  console.log(`🧠 pretend we're placing the card: ${cardName}`);
  // TODO: Actually do something with this card
}

const cardNames = [
  "Archer Queen", "Archers", "Arrows", "Baby Dragon", "Bandit", "Barbarian Barrel", 
  "Barbarian Hut", "Balloon", "Barbarians", "Battle Healer", "Battle Ram", "Bats", 
  "Bomber", "Bomb Tower", "Bowler", "Cannon", "Cannon Cart", "Clone", "Dark Prince", 
  "Dart Goblin", "Earthquake", "Electro Dragon", "Electro Giant", "Electro Spirit", 
  "Electro Wizard", "Elite Barbarians", "Elixir Collector", "Executioner", "Fireball", 
  "Firecracker", "Fire Spirit", "Fisherman", "Flying Machine", "Freeze", "Furnace", 
  "Giant", "Giant Skeleton", "Giant Snowball", "Goblin Barrel", "Goblin Cage", 
  "Goblin Drill", "Goblin Gang", "Goblin Giant", "Goblin Hut", "Goblins", 
  "Golden Knight", "Golem", "Graveyard", "Guards", "Heal Spirit", "Hog Rider", 
  "Hunter", "Ice Golem", "Ice Spirit", "Ice Wizard", "Inferno Dragon", 
  "Inferno Tower", "Knight", "Lava Hound", "Lightning", "Lumberjack", 
  "Magic Archer", "Mega Minion", "Mega Knight", "Miner", "Mighty Miner", 
  "Mini P.E.K.K.A", "Minions", "Minion Horde",
];

function startVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("🎤 You said:", transcript);

    const triggerWords = ["play", "use", "drop", "cast", "place"];
    let matchedCard = null;

    for (const card of cardNames) {
      const lowerCard = card.toLowerCase();

      // Full phrase match (e.g. "play bandit")
      if (triggerWords.some(trigger => transcript.includes(`${trigger} ${lowerCard}`))) {
        matchedCard = card;
        break;
      }

      // Exact match
      if (transcript === lowerCard) {
        matchedCard = card;
        break;
      }

      // Loose match (e.g. "i want bandit")
      if (transcript.includes(lowerCard)) {
        matchedCard = card;
      }
    }

    if (matchedCard) {
      console.log("🎮 Playing card:", matchedCard);
      playCardFromHand(matchedCard);
    } else {
      console.log("❌ No matching card found for:", transcript);
    }
  };

  recognition.onerror = (event) => {
    console.error("⚠️ Voice recognition error:", event.error);
  };

  recognition.onend = () => {
    console.log("🔄 Voice recognition ended. Restarting...");
    recognition.start(); // restart automatically
  };

  recognition.start();
}

function playCardFromHand(cardObj) {
  // Convert card name string to full object if needed
  if (typeof cardObj === 'string') {
    const matched = cards.find(c => c.name.toLowerCase() === cardObj.toLowerCase());
    if (!matched) {
      showMessage(`Card "${cardObj}" not found in card list.`, 'red');
      return;
    }
    cardObj = matched;
  }

  console.log("Final cardObj to play:", cardObj);

  if (!cardObj || !cardObj.name) {
    showMessage(`Invalid card object received.`, 'red');
    return;
  }

  if (currentBar < cardObj.value) {
    showMessage(`Not enough elixir to play ${cardObj.name}.`, 'red');
    return;
  }

  // Safe check to prevent crashing if a deck entry is null
  const index = deck.findIndex(card => card && card.name === cardObj.name);
  if (index === -1 || index > 3) {
    showMessage(`${cardObj.name} is not in your current hand.`, 'red');
    return;
  }

  currentBar -= cardObj.value;
  updateCardStates();
  showMessage(`Used "${cardObj.name}" for -${cardObj.value}`, 'green');

  deck.splice(index, 1);
  deck.push(cardObj);

  if (deck.length >= 4) {
    const newCard = deck.splice(3, 1)[0];
    deck.splice(index, 0, newCard);
  }

  renderHand();
  renderDeck();
}






