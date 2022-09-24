const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', //黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', //紅心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', //方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' //梅花
]

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p> ${number}</p>
    <img src="${symbol}" alt="">
    <p>${number}</p>`
  },
  getCardElement(index) {
    return `
    <div class="card back" data-id="${index}">
    </div>`
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains("back")) {
        //回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.id))
      }
      else {
        //回傳背面
        card.classList.add('back')
        card.innerHTML = ``
      }
    })
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  pairCards(...cards) {
    cards.map(card => card.classList.add('paired'))
  },
  renderScore(score) {
    document.querySelector('#score').textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('#tried').textContent = `You have tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.className = 'completed'
    div.innerHTML = `
      <h2 class="completed">Complete</h2>
      <p class="completed">Score: ${model.score}</p>
      <p class="completed">You've tried: ${model.triedTimes} times</p>`
    const body = document.querySelector('body')
    body.append(div)
  },
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomNum = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomNum]] = [number[randomNum], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.id % 13 === this.revealedCards[1].dataset.id % 13
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  dispatchCardAction(target) {
    const card = target.closest('.card')
    if (!card.matches('.back')) return

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        this.currentState = GAME_STATE.SecondCardAwaits
        view.flipCards(card)
        model.revealedCards.push(card)
        return
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(++model.triedTimes)

        if (model.isRevealedCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          } else {
            this.currentState = GAME_STATE.FirstCardAwaits
          }
        }
        else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(controller.resetCards, 1000)
        }
        return
    }
  },
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(event.target)
  })
})