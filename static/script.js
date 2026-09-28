const messageText = document.getElementById('message-text');
const slimeTarget = document.getElementById('slime-target');
const battleButton = document.querySelector('.battle');
const commandButtons = document.querySelectorAll('.command button');
const hpText = document.getElementById('player-hp');
const mpText = document.getElementById('player-mp');
const player = { hp: 30, maxHp: 30, mp: 10 };
let choosingTarget = false;
let turn = 'player';

function updateStatus() {
  hpText.textContent = player.hp;
  mpText.textContent = player.mp;
}

function performAction(message) {
  endTargetSelection();
  turn = 'slime';
  commandButtons.forEach((button) => { button.disabled = true; });
  messageText.textContent = message;
  updateStatus();

  setTimeout(() => {
    player.hp = Math.max(0, player.hp - 3);
    updateStatus();
    messageText.textContent = 'すらいむの こうげき！ 3のだめーじ！';

    setTimeout(() => {
      if (player.hp === 0) {
        turn = 'finished';
        messageText.textContent = 'ゆうしゃは たおれてしまった！';
        return;
      }
      turn = 'player';
      commandButtons.forEach((button) => { button.disabled = false; });
      battleButton.focus();
    }, 1200);
  }, 1200);
}

function endTargetSelection() {
  choosingTarget = false;
  messageText.hidden = false;
  slimeTarget.disabled = true;
  slimeTarget.hidden = true;
}

battleButton.addEventListener('click', () => {
  if (turn !== 'player') return;
  choosingTarget = true;
  slimeTarget.disabled = false;
  slimeTarget.hidden = false;
  messageText.textContent = '';
  messageText.hidden = true;
  slimeTarget.focus();
});

slimeTarget.addEventListener('click', () => {
  if (turn !== 'player' || !choosingTarget) return;
  performAction('ゆうしゃの こうげき！ すらいむに 5のだめーじ！');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && choosingTarget) {
    endTargetSelection();
    messageText.textContent = 'こうげきを やめた！';
    battleButton.focus();
  }
});

document.querySelector('.item').addEventListener('click', () => {
  if (turn !== 'player') return;
  const healing = Math.min(10, player.maxHp - player.hp);
  player.hp += healing;
  performAction(`やくそうを つかった！ HPが ${healing} かいふくした！`);
});

document.querySelector('.flee').addEventListener('click', () => {
  if (turn !== 'player') return;
  performAction('にげようとした！ でも すらいむに まわりこまれた！');
});

updateStatus();
