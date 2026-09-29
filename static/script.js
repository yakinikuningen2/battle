const messageText = document.getElementById('message-text');
const slimeTarget = document.getElementById('slime-target');
const battleButton = document.querySelector('.battle');
const itemButton = document.querySelector('.item');
const magicButton = document.querySelector('.magic');
const restartButton = document.querySelector('.menu');
const restartConfirmation = document.getElementById('restart-confirmation');
const restartYes = document.getElementById('restart-yes');
const restartNo = document.getElementById('restart-no');
let turnBeforeRestart = 'player';
const menuScreen = document.getElementById('menu-screen');
const menuOptions = document.getElementById('menu-options');
const menuRestart = document.getElementById('menu-restart');
const menuClose = document.getElementById('menu-close');
const menuStatus = document.getElementById('menu-status');
const itemPanel = document.getElementById('item-panel');
const useYakusoButton = document.getElementById('use-yakuso');
const materialButton = document.getElementById('blue-material');
const usePotionButton = document.getElementById('use-potion');
const itemChoices = [useYakusoButton, materialButton, usePotionButton];
const inventory = { yakuso: 1, material: 1, potion: 0 };
let draggedItem = null;
const commandButtons = document.querySelectorAll('.command button');
const hpText = document.getElementById('player-hp');
const mpText = document.getElementById('player-mp');
const player = { hp: 30, maxHp: 30, mp: 10 };
let choosingTarget = false;
let selectedAction = null;
const magicMpCost = 10;
let turn = 'player';

function updateStatus() {
  hpText.textContent = player.hp;
  mpText.textContent = player.mp;
}

function performAction(message) {
  endTargetSelection();
  closeItems();
  turn = 'slime';
  restartButton.disabled = true;
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
        restartButton.disabled = false;
        return;
      }
      turn = 'player';
      restartButton.disabled = false;
      commandButtons.forEach((button) => { button.disabled = false; });
      battleButton.focus();
    }, 1200);
  }, 1200);
}

function endTargetSelection() {
  choosingTarget = false;
  selectedAction = null;
  messageText.hidden = false;
  slimeTarget.disabled = true;
  slimeTarget.hidden = true;
}

function startTargetSelection(action) {
  if (turn !== 'player') return;
  endTargetSelection();
  closeItems();
  if (action === 'magic' && player.mp < magicMpCost) {
    messageText.textContent = 'MPが たりない！';
    return;
  }
  selectedAction = action;
  choosingTarget = true;
  slimeTarget.disabled = false;
  slimeTarget.hidden = false;
  messageText.textContent = '';
  messageText.hidden = true;
  slimeTarget.focus();
}

battleButton.addEventListener('click', () => startTargetSelection('attack'));
magicButton.addEventListener('click', () => startTargetSelection('magic'));

slimeTarget.addEventListener('click', () => {
  if (turn !== 'player' || !choosingTarget) return;
  if (selectedAction === 'magic') {
    if (player.mp < magicMpCost) {
      endTargetSelection();
      messageText.textContent = 'MPが たりない！';
      return;
    }
    player.mp -= magicMpCost;
    performAction('ゆうしゃの まほう！ すらいむに 10のだめーじ！');
    return;
  }
  performAction('ゆうしゃの こうげき！ すらいむに 5のだめーじ！');
});

document.addEventListener('keydown', (event) => {
  if (menuScreen.open) return;
  if (event.key === 'Escape' && !itemPanel.hidden) {
    cancelItems();
    return;
  }
  if (event.key === 'Escape' && choosingTarget) {
    const wasMagic = selectedAction === 'magic';
    endTargetSelection();
    messageText.textContent = wasMagic ? 'まほうを やめた！' : 'こうげきを やめた！';
    (wasMagic ? magicButton : battleButton).focus();
  }
});

function closeItems() {
  clearItemDrag();
  itemPanel.hidden = true;
  itemButton.setAttribute('aria-expanded', 'false');
}

function cancelItems() {
  closeItems();
  messageText.textContent = '';
  itemButton.focus();
}

itemButton.addEventListener('click', () => {
  if (turn !== 'player') return;
  if (!itemPanel.hidden) {
    cancelItems();
    return;
  }
  endTargetSelection();
  itemPanel.hidden = false;
  itemButton.setAttribute('aria-expanded', 'true');
  messageText.textContent = '';
  const firstItem = itemChoices.find((button) => !button.hidden);
  if (firstItem) firstItem.focus();
});

function updateInventory() {
  itemChoices.forEach((button) => {
    button.hidden = inventory[button.dataset.item] === 0;
  });
}

function useHealingItem(item, name, amount) {
  if (turn !== 'player' || itemPanel.hidden || draggedItem || !inventory[item]) return;
  inventory[item] -= 1;
  updateInventory();
  const healing = Math.min(amount, player.maxHp - player.hp);
  player.hp += healing;
  performAction(`${name}を つかった！ HPが ${amount} かいふくした！`);
}

useYakusoButton.addEventListener('click', () => useHealingItem('yakuso', 'やくそう', 10));
usePotionButton.addEventListener('click', () => useHealingItem('potion', 'かいふくやく', 20));

function clearItemDrag() {
  draggedItem = null;
  itemChoices.forEach((button) => button.classList.remove('dragging', 'drop-target'));
}

function canCombine(target) {
  return turn === 'player' && !itemPanel.hidden && inventory.yakuso > 0 && inventory.material > 0
    && ((draggedItem === 'yakuso' && target === 'material')
      || (draggedItem === 'material' && target === 'yakuso'));
}

[useYakusoButton, materialButton].forEach((button) => {
  button.addEventListener('dragstart', (event) => {
    if (turn !== 'player' || itemPanel.hidden || !inventory[button.dataset.item]) {
      event.preventDefault();
      return;
    }
    draggedItem = button.dataset.item;
    event.dataTransfer.setData('text/plain', draggedItem);
    event.dataTransfer.effectAllowed = 'move';
    button.classList.add('dragging');
  });
  button.addEventListener('dragover', (event) => {
    if (!canCombine(button.dataset.item)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    button.classList.add('drop-target');
  });
  button.addEventListener('dragleave', () => button.classList.remove('drop-target'));
  button.addEventListener('drop', (event) => {
    event.preventDefault();
    if (!canCombine(button.dataset.item)) return;
    inventory.yakuso -= 1;
    inventory.material -= 1;
    inventory.potion += 1;
    clearItemDrag();
    updateInventory();
    usePotionButton.focus();
  });
  button.addEventListener('dragend', clearItemDrag);
});

restartButton.addEventListener('click', () => {
  if (turn !== 'player' && turn !== 'finished') return;
  turnBeforeRestart = turn;
  clearItemDrag();
  turn = 'menu';
  menuOptions.hidden = false;
  restartConfirmation.hidden = true;
  menuStatus.textContent = '';
  restartButton.setAttribute('aria-expanded', 'true');
  menuScreen.showModal();
  menuRestart.focus();
});

menuRestart.addEventListener('click', () => {
  if (turn !== 'menu') return;
  turn = 'confirming-restart';
  menuOptions.hidden = true;
  menuStatus.textContent = '';
  restartConfirmation.hidden = false;
  restartNo.focus();
});

function closeMenu() {
  if (!menuScreen.open) return;
  menuScreen.close();
  restartConfirmation.hidden = true;
  restartButton.setAttribute('aria-expanded', 'false');
  turn = turnBeforeRestart;
  restartButton.focus();
}

menuClose.addEventListener('click', closeMenu);
menuScreen.addEventListener('cancel', (event) => {
  event.preventDefault();
  if (turn === 'confirming-restart') cancelRestart();
  else closeMenu();
});

function cancelRestart() {
  if (turn !== 'confirming-restart') return;
  restartConfirmation.hidden = true;
  menuOptions.hidden = false;
  turn = 'menu';
  menuRestart.focus();
}

restartNo.addEventListener('click', cancelRestart);
restartYes.addEventListener('click', () => {
  if (turn !== 'confirming-restart') return;
  restartConfirmation.hidden = true;
  menuOptions.hidden = false;
  restartButton.disabled = false;
  endTargetSelection();
  closeItems();
  player.hp = player.maxHp;
  player.mp = 10;
  Object.assign(inventory, { yakuso: 1, material: 1, potion: 0 });
  turnBeforeRestart = 'player';
  turn = 'menu';
  messageText.textContent = '';
  commandButtons.forEach((button) => { button.disabled = false; });
  updateStatus();
  updateInventory();
  menuStatus.textContent = 'はじめから やりなおしました！';
  menuClose.focus();
});

updateStatus();
updateInventory();
