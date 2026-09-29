const messageText = document.getElementById('message-text');
const defeatRestart = document.getElementById('defeat-restart');
const defeatRestartYes = document.getElementById('defeat-restart-yes');
const slimeTarget = document.getElementById('slime-target');
const battleButton = document.querySelector('.battle');
const itemButton = document.querySelector('.item');
const magicButton = document.querySelector('.magic');
const restartButton = document.querySelector('.menu');
const playerName = document.querySelector('.player-name');
const equipmentScreen = document.getElementById('equipment-screen');
const equipmentClose = document.getElementById('equipment-close');

playerName.addEventListener('click', () => {
  equipmentScreen.hidden = !equipmentScreen.hidden;
  playerName.setAttribute('aria-expanded', String(!equipmentScreen.hidden));
});

function closeEquipment() {
  equipmentScreen.hidden = true;
  playerName.setAttribute('aria-expanded', 'false');
  playerName.focus();
}

equipmentClose.addEventListener('click', closeEquipment);
const restartConfirmation = document.getElementById('restart-confirmation');
const restartYes = document.getElementById('restart-yes');
const restartNo = document.getElementById('restart-no');
let turnBeforeRestart = 'player';
const menuScreen = document.getElementById('menu-screen');
const menuOptions = document.getElementById('menu-options');
const menuRestart = document.getElementById('menu-restart');
const menuClose = document.getElementById('menu-close');
const menuStatus = document.getElementById('menu-status');
const menuTitle = document.getElementById('menu-title');
const menuMonsterBook = document.getElementById('menu-monster-book');
const monsterBook = document.getElementById('monster-book');
const monsterBookBack = document.getElementById('monster-book-back');
const menuItemBook = document.getElementById('menu-item-book');
const itemBook = document.getElementById('item-book');
const itemBookList = document.getElementById('item-book-list');
const itemBookDetail = document.getElementById('item-book-detail');
const itemBookName = document.getElementById('item-book-name');
const itemBookDescription = document.getElementById('item-book-description');
const itemBookImage = document.getElementById('item-book-detail-image');
const itemBookBack = document.getElementById('item-book-back');
const itemBookEntries = itemBookList.querySelectorAll('button');
let selectedItemBookEntry = itemBookEntries[0];
const monsterList = document.getElementById('monster-list');
const monsterDetail = document.getElementById('monster-detail');
const monsterSelectSlime = document.getElementById('monster-select-slime');
const itemPanel = document.getElementById('item-panel');
const useYakusoButton = document.getElementById('use-yakuso');
const materialButton = document.getElementById('blue-material');
const usePotionButton = document.getElementById('use-potion');
const swordButton = document.getElementById('sword-item');
const equippedSword = document.getElementById('equipped-sword');
const equipmentSlots = {
  weapon: document.getElementById('equipped-weapon'),
  head: document.getElementById('equipped-head'),
  body: document.getElementById('equipped-body'),
  feet: document.getElementById('equipped-feet'),
};
const slotNames = { weapon: 'ぶき', head: 'あたま', body: 'からだ', feet: 'あし' };
const itemChoices = [swordButton, useYakusoButton, materialButton, usePotionButton];
const inventory = { yakuso: 1, material: 1, potion: 0, sword: 0 };
const equipment = { swordSlot: 'head' };
const discoveredItems = new Set();

function isUndiscoveredItem(button) {
  return ['potion', 'mpPotion', 'magicSword', 'magicHerb'].includes(button.dataset.item)
    && !discoveredItems.has(button.dataset.item);
}

function updateItemBook() {
  Object.entries(inventory).forEach(([item, count]) => {
    if (count > 0) discoveredItems.add(item);
  });
  itemBookEntries.forEach((button) => {
    button.querySelector('img').classList.toggle('undiscovered', isUndiscoveredItem(button));
  });
}
let draggedItem = null;
const commandButtons = document.querySelectorAll('.command button');
const hpText = document.getElementById('player-hp');
const mpText = document.getElementById('player-mp');
const player = { hp: 10, maxHp: 10, mp: 0 };
const slime = { hp: 50, maxHp: 50 };
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
  if (!equipmentScreen.hidden) closeEquipment();
  turn = 'slime';
  restartButton.disabled = true;
  commandButtons.forEach((button) => { button.disabled = true; });
  messageText.textContent = message;
  updateStatus();

  setTimeout(() => {
    if (slime.hp === 0) {
      turn = 'finished';
      messageText.textContent = 'すらいむを たおした！';
      restartButton.disabled = false;
      return;
    }
    player.hp = Math.max(0, player.hp - 3);
    updateStatus();
    messageText.textContent = 'すらいむの こうげき！ 3のだめーじ！';

    setTimeout(() => {
      if (player.hp === 0) {
        turn = 'finished';
        messageText.textContent = 'ゆうしゃは たおれてしまった！';
        restartButton.disabled = false;
        defeatRestart.hidden = false;
        defeatRestartYes.focus();
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
  battleButton.classList.remove('selected-command');
  magicButton.classList.remove('selected-command');
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
  (action === 'magic' ? magicButton : battleButton).classList.add('selected-command');
  slimeTarget.disabled = false;
  document.getElementById('slime-hp').textContent = `HP ${slime.hp} / ${slime.maxHp}`;
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
    slime.hp = Math.max(0, slime.hp - 10);
    performAction('ゆうしゃの まほう！ すらいむに 10のだめーじ！');
    return;
  }
  const damage = equipment.swordSlot === 'weapon' ? 5 : 1;
  slime.hp = Math.max(0, slime.hp - damage);
  performAction(`ゆうしゃの こうげき！ すらいむに ${damage}のだめーじ！`);
});

document.addEventListener('keydown', (event) => {
  if (menuScreen.open) return;
  if (event.key === 'Escape' && !equipmentScreen.hidden) {
    closeEquipment();
    return;
  }
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
  itemButton.classList.remove('selected-command');
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
  itemButton.classList.add('selected-command');
  itemButton.setAttribute('aria-expanded', 'true');
  messageText.textContent = '';
  const firstItem = itemChoices.find((button) => !button.hidden);
  if (firstItem) firstItem.focus();
});

function updateInventory() {
  updateItemBook();
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

useYakusoButton.addEventListener('click', () => useHealingItem('yakuso', 'やくそう', 3));
usePotionButton.addEventListener('click', () => useHealingItem('potion', 'かいふくやく', 10));

function clearItemDrag() {
  draggedItem = null;
  itemChoices.forEach((button) => button.classList.remove('dragging', 'drop-target'));
}

function canCombine(target) {
  return turn === 'player' && !itemPanel.hidden && inventory.yakuso > 0 && inventory.material > 0
    && ((draggedItem === 'yakuso' && target === 'material')
      || (draggedItem === 'material' && target === 'yakuso'));
}

[useYakusoButton, materialButton, swordButton].forEach((button) => {
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
    updateItemBook();
    clearItemDrag();
    updateInventory();
    usePotionButton.focus();
  });
  button.addEventListener('dragend', clearItemDrag);
});

equippedSword.addEventListener('dragstart', (event) => {
  if (turn !== 'player' || equipmentScreen.hidden || !equipment.swordSlot) {
    event.preventDefault();
    return;
  }
  draggedItem = 'equipped-sword';
  event.dataTransfer.setData('text/plain', draggedItem);
  event.dataTransfer.effectAllowed = 'move';
});

equippedSword.addEventListener('dragend', clearItemDrag);

function canUnequipSword() {
  return turn === 'player' && !itemPanel.hidden && !equipmentScreen.hidden
    && draggedItem === 'equipped-sword' && equipment.swordSlot !== null;
}

itemPanel.addEventListener('dragover', (event) => {
  if (!canUnequipSword()) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
});

itemPanel.addEventListener('drop', (event) => {
  if (!canUnequipSword()) return;
  event.preventDefault();
  equipment.swordSlot = null;
  inventory.sword += 1;
  clearItemDrag();
  updateInventory();
  updateEquipment();
});

function updateEquipment() {
  equippedSword.hidden = equipment.swordSlot === null;
  Object.entries(equipmentSlots).forEach(([slotName, slot]) => {
    const hasSword = equipment.swordSlot === slotName;
    slot.setAttribute('aria-label', `${slotNames[slotName]} ${hasSword ? 'けんをそうび' : 'そうびなし'}`);
    if (hasSword) slot.append(equippedSword);
  });
}

function canPlaceSword(slotName) {
  if (turn !== 'player' || equipmentScreen.hidden || equipment.swordSlot === slotName) return false;
  return (draggedItem === 'sword' && !itemPanel.hidden && inventory.sword > 0 && equipment.swordSlot === null)
    || (draggedItem === 'equipped-sword' && equipment.swordSlot !== null);
}

Object.entries(equipmentSlots).forEach(([slotName, slot]) => {
  slot.addEventListener('dragover', (event) => {
    if (!canPlaceSword(slotName)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });
  slot.addEventListener('drop', (event) => {
    if (!canPlaceSword(slotName)) return;
    event.preventDefault();
    if (draggedItem === 'sword') inventory.sword -= 1;
    equipment.swordSlot = slotName;
    clearItemDrag();
    updateInventory();
    updateEquipment();
  });
});

restartButton.addEventListener('click', () => {
  if (turn !== 'player' && turn !== 'finished') return;
  turnBeforeRestart = turn;
  clearItemDrag();
  turn = 'menu';
  menuOptions.hidden = false;
  monsterBook.hidden = true;
  menuTitle.textContent = 'めにゅー';
  restartConfirmation.hidden = true;
  menuStatus.textContent = '';
  restartButton.setAttribute('aria-expanded', 'true');
  menuScreen.showModal();
  menuRestart.focus();
});

menuMonsterBook.addEventListener('click', () => {
  if (turn !== 'menu') return;
  turn = 'monster-book';
  menuOptions.hidden = true;
  menuStatus.textContent = '';
  menuTitle.textContent = 'もんすたーずかん';
  monsterBook.hidden = false;
  monsterList.hidden = false;
  monsterDetail.hidden = true;
  monsterSelectSlime.focus();
});

monsterSelectSlime.addEventListener('click', () => {
  if (turn !== 'monster-book') return;
  turn = 'monster-detail';
  monsterList.hidden = true;
  monsterDetail.hidden = false;
  menuTitle.hidden = true;
  menuScreen.setAttribute('aria-labelledby', 'monster-name');
  monsterBookBack.focus();
});

function closeMonsterBook() {
  if (turn === 'monster-detail') {
    monsterDetail.hidden = true;
    monsterList.hidden = false;
    menuTitle.hidden = false;
    menuScreen.setAttribute('aria-labelledby', 'menu-title');
    turn = 'monster-book';
    monsterSelectSlime.focus();
    return;
  }
  if (turn !== 'monster-book') return;
  monsterBook.hidden = true;
  menuOptions.hidden = false;
  menuTitle.textContent = 'めにゅー';
  turn = 'menu';
  menuMonsterBook.focus();
}

monsterBookBack.addEventListener('click', closeMonsterBook);

menuItemBook.addEventListener('click', () => {
  if (turn !== 'menu') return;
  turn = 'item-book';
  menuOptions.hidden = true;
  menuStatus.textContent = '';
  menuTitle.textContent = 'あいてむずかん';
  itemBook.hidden = false;
  itemBookList.hidden = false;
  itemBookDetail.hidden = true;
  itemBookEntries[0].focus();
});

itemBookEntries.forEach((button) => {
  button.addEventListener('click', () => {
    if (turn !== 'item-book') return;
    selectedItemBookEntry = button;
    itemBookName.textContent = button.getAttribute('aria-label');
    const undiscovered = isUndiscoveredItem(button);
    itemBookDescription.textContent = undiscovered ? 'まだてにいれていません' : button.dataset.description;
    itemBookImage.classList.toggle('undiscovered', undiscovered);
    itemBookImage.src = button.querySelector('img').getAttribute('src');
    itemBookImage.alt = itemBookName.textContent;
    itemBookList.hidden = true;
    itemBookDetail.hidden = false;
    menuTitle.hidden = true;
    menuScreen.setAttribute('aria-labelledby', 'item-book-name');
    turn = 'item-book-detail';
    itemBookBack.focus();
  });
});

function closeItemBook() {
  if (turn === 'item-book-detail') {
    itemBookDetail.hidden = true;
    itemBookList.hidden = false;
    menuTitle.hidden = false;
    menuScreen.setAttribute('aria-labelledby', 'menu-title');
    turn = 'item-book';
    selectedItemBookEntry.focus();
    return;
  }
  if (turn !== 'item-book') return;
  itemBook.hidden = true;
  menuOptions.hidden = false;
  menuTitle.textContent = 'めにゅー';
  turn = 'menu';
  menuItemBook.focus();
}

itemBookBack.addEventListener('click', closeItemBook);

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
  menuTitle.hidden = false;
  menuScreen.setAttribute('aria-labelledby', 'menu-title');
  itemBook.hidden = true;
  monsterBook.hidden = true;
  restartConfirmation.hidden = true;
  restartButton.setAttribute('aria-expanded', 'false');
  turn = turnBeforeRestart;
  restartButton.focus();
}

menuClose.addEventListener('click', closeMenu);
menuScreen.addEventListener('cancel', (event) => {
  event.preventDefault();
  if (turn === 'confirming-restart') cancelRestart();
  else if (turn === 'monster-book' || turn === 'monster-detail') closeMonsterBook();
  else if (turn === 'item-book' || turn === 'item-book-detail') closeItemBook();
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
  resetBattle();
  turnBeforeRestart = 'player';
  turn = 'menu';
  menuStatus.textContent = 'はじめから やりなおしました！';
  menuClose.focus();
});

defeatRestartYes.addEventListener('click', () => {
  if (turn !== 'finished' || defeatRestart.hidden) return;
  resetBattle();
  battleButton.focus();
});

function resetBattle() {
  defeatRestart.hidden = true;
  restartButton.disabled = false;
  endTargetSelection();
  closeItems();
  if (!equipmentScreen.hidden) closeEquipment();
  player.hp = player.maxHp;
  slime.hp = slime.maxHp;
  player.mp = 0;
  Object.assign(inventory, { yakuso: 1, material: 1, potion: 0, sword: 0 });
  discoveredItems.clear();
  updateItemBook();
  equipment.swordSlot = 'head';
  updateEquipment();
  turn = 'player';
  messageText.textContent = '';
  commandButtons.forEach((button) => { button.disabled = false; });
  updateStatus();
  updateInventory();
}

updateStatus();
updateInventory();
updateEquipment();
updateItemBook();
