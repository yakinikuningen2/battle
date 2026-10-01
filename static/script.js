const messageText = document.getElementById('message-text');
const slimeTarget = document.getElementById('slime-target');
const slimeHp = document.getElementById('slime-hp');
const slimeDisplay = document.querySelector('.slime-display');
const messagePanel = document.querySelector('.message');
const gameClear = document.getElementById('game-clear');
const gameClearRestart = document.getElementById('game-clear-restart');
const gameOver = document.getElementById('game-over');
const gameOverRestart = document.getElementById('game-over-restart');
const battleButton = document.querySelector('.battle');
const itemButton = document.querySelector('.item');
const magicButton = document.querySelector('.magic');
const spellOptions = document.getElementById('spell-options');
const spellThunder = document.getElementById('spell-thunder');
const spellFire = document.getElementById('spell-fire');
const restartButton = document.querySelector('.menu');
const playerName = document.querySelector('.player-name');
const equipmentScreen = document.getElementById('equipment-screen');
const equipmentClose = document.getElementById('equipment-close');

playerName.addEventListener('click', () => {
  if (turn === 'slime') return;
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
const useMpPotionButton = document.getElementById('use-mp-potion');
const swordButton = document.getElementById('sword-item');
const equippedSword = document.getElementById('equipped-sword');
const equipmentSlots = {
  weapon: document.getElementById('equipped-weapon'),
  head: document.getElementById('equipped-head'),
  body: document.getElementById('equipped-body'),
  feet: document.getElementById('equipped-feet'),
};
const slotNames = { weapon: 'ぶき', head: 'あたま', body: 'からだ', feet: 'あし' };
const itemChoices = [swordButton, useYakusoButton, materialButton, usePotionButton, useMpPotionButton];
const inventory = { yakuso: 1, material: 1, potion: 0, mpPotion: 0, sword: 0 };
const equipment = { swordSlot: 'head' };
const sword = { attacks: 0, isMagic: false };
const discoveredItems = new Set();

function isUndiscoveredItem(button) {
  return ['potion', 'mpPotion', 'magicSword'].includes(button.dataset.item)
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
const player = { hp: 20, maxHp: 20, mp: 0, maxMp: 20 };
const slime = { hp: 50, maxHp: 50 };
let choosingTarget = false;
let selectedAction = null;
const spells = {
  thunder: { name: 'さんだー', mpCost: 10, damage: 10 },
  fire: { name: 'ふぁいあ', mpCost: 20, damage: 99 },
};
let turn = 'player';

function updateStatus() {
  hpText.textContent = player.hp;
  mpText.textContent = player.mp;
  slimeHp.textContent = `HP ${slime.hp} / ${slime.maxHp}`;
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
      slimeDisplay.classList.add('defeated');
      setTimeout(() => {
        restartButton.disabled = false;
        gameClear.showModal();
        gameClearRestart.focus();
      }, 1200);
      return;
    }
    player.hp = Math.max(0, player.hp - 4);
    updateStatus();
    messageText.textContent = 'すらいむの こうげき！ 4のだめーじ！';

    setTimeout(() => {
      if (player.hp === 0) {
        turn = 'finished';
        messageText.textContent = 'ゆうしゃは たおれてしまった！';
        setTimeout(() => {
          restartButton.disabled = false;
          gameOver.showModal();
          gameOverRestart.focus();
        }, 1200);
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
  spellOptions.hidden = true;
  magicButton.setAttribute('aria-expanded', 'false');
  battleButton.classList.remove('selected-command');
  magicButton.classList.remove('selected-command');
  messageText.hidden = false;
  slimeTarget.disabled = true;
  slimeTarget.hidden = true;
}

function startTargetSelection(action) {
  if (turn !== 'player') return;
  if (choosingTarget && selectedAction === action) {
    slimeTarget.focus();
    return;
  }
  endTargetSelection();
  closeItems();
  if (spells[action] && player.mp < spells[action].mpCost) {
    messageText.textContent = 'MPが たりない！';
    magicButton.focus();
    return;
  }
  selectedAction = action;
  choosingTarget = true;
  (spells[action] ? magicButton : battleButton).classList.add('selected-command');
  slimeTarget.disabled = false;
  slimeTarget.hidden = false;
  messageText.hidden = true;
  slimeTarget.focus();
}

battleButton.addEventListener('click', () => startTargetSelection('attack'));
magicButton.addEventListener('click', () => {
  if (turn !== 'player') return;
  if (!spellOptions.hidden) {
    spellThunder.focus();
    return;
  }
  endTargetSelection();
  closeItems();
  spellOptions.hidden = false;
  magicButton.classList.add('selected-command');
  magicButton.setAttribute('aria-expanded', 'true');
  messageText.hidden = true;
  spellThunder.focus();
});
spellThunder.addEventListener('click', () => startTargetSelection('thunder'));
spellFire.addEventListener('click', () => startTargetSelection('fire'));

slimeTarget.addEventListener('click', () => {
  if (turn !== 'player' || !choosingTarget) return;
  if (spells[selectedAction]) {
    const spell = spells[selectedAction];
    if (player.mp < spell.mpCost) {
      endTargetSelection();
      messageText.textContent = 'MPが たりない！';
      return;
    }
    player.mp -= spell.mpCost;
    slime.hp = Math.max(0, slime.hp - spell.damage);
    performAction(`ゆうしゃの ${spell.name}！ すらいむに ${spell.damage}のだめーじ！`);
    return;
  }
  const damage = equipment.swordSlot === 'weapon' ? (sword.isMagic ? 5 : 3) : 1;
  slime.hp = Math.max(0, slime.hp - damage);
  if (equipment.swordSlot === 'weapon' && !sword.isMagic) {
    sword.attacks += 1;
    if (sword.attacks === 3) {
      sword.isMagic = true;
      discoveredItems.add('magicSword');
      updateEquipment();
      updateItemBook();
    }
  }
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
  if (event.key === 'Escape' && !spellOptions.hidden) {
    endTargetSelection();
    messageText.textContent = 'まほうを やめた！';
    magicButton.focus();
    return;
  }
  if (event.key === 'Escape' && choosingTarget) {
    const wasMagic = Boolean(spells[selectedAction]);
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
  itemButton.focus();
}

itemButton.addEventListener('click', () => {
  if (turn !== 'player') return;
  if (!itemPanel.hidden) {
    const firstItem = itemChoices.find((button) => !button.hidden);
    if (firstItem) firstItem.focus();
    return;
  }
  endTargetSelection();
  itemPanel.hidden = false;
  itemButton.classList.add('selected-command');
  itemButton.setAttribute('aria-expanded', 'true');
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
  player.hp = Math.min(player.maxHp, player.hp + amount);
  performAction(`${name}を つかった！ HPが ${amount} かいふくした！`);
}

useYakusoButton.addEventListener('click', () => useHealingItem('yakuso', 'やくそう', 10));
usePotionButton.addEventListener('click', () => useHealingItem('potion', 'かいふくやく', 20));
function useMpItem(item, name, amount) {
  if (turn !== 'player' || itemPanel.hidden || draggedItem || !inventory[item]) return;
  inventory[item] -= 1;
  updateInventory();
  player.mp = Math.min(player.maxMp, player.mp + amount);
  performAction(`${name}を つかった！ MPが ${amount} かいふくした！`);
}

useMpPotionButton.addEventListener('click', () => useMpItem('mpPotion', 'まほうやく', 20));

function clearItemDrag() {
  draggedItem = null;
  itemChoices.forEach((button) => button.classList.remove('dragging', 'drop-target'));
}

function canCombine(target) {
  if (turn !== 'player' || itemPanel.hidden) return false;
  const potionRecipe = inventory.yakuso > 0 && inventory.material > 0
    && ((draggedItem === 'yakuso' && target === 'material')
      || (draggedItem === 'material' && target === 'yakuso'));
  const magicSwordInItems = draggedItem === 'sword' && inventory.sword > 0;
  const magicSwordEquipped = draggedItem === 'equipped-sword'
    && !equipmentScreen.hidden && equipment.swordSlot !== null;
  const mpPotionRecipe = inventory.material > 0 && sword.isMagic
    && ((draggedItem === 'material' && target === 'sword' && inventory.sword > 0)
      || ((magicSwordInItems || magicSwordEquipped) && target === 'material'));
  return potionRecipe || mpPotionRecipe;
}

function combineMagicSwordAndWater() {
  inventory.material -= 1;
  inventory.mpPotion += 1;
  sword.isMagic = false;
  sword.attacks = 0;
  clearItemDrag();
  updateEquipment();
  updateInventory();
  useMpPotionButton.focus();
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
    if (button.dataset.item === 'sword' || draggedItem === 'sword' || draggedItem === 'equipped-sword') {
      combineMagicSwordAndWater();
      return;
    }
    inventory.yakuso -= 1;
    inventory.material -= 1;
    inventory.potion += 1;
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

equippedSword.addEventListener('dragover', (event) => {
  if (turn !== 'player' || equipmentScreen.hidden || equipment.swordSlot === null || !sword.isMagic
    || draggedItem !== 'material' || itemPanel.hidden || inventory.material === 0) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
});

equippedSword.addEventListener('drop', (event) => {
  if (turn !== 'player' || equipmentScreen.hidden || equipment.swordSlot === null || !sword.isMagic
    || draggedItem !== 'material' || itemPanel.hidden || inventory.material === 0) return;
  event.preventDefault();
  combineMagicSwordAndWater();
});

function canUnequipSword() {
  return turn === 'player' && !equipmentScreen.hidden
    && draggedItem === 'equipped-sword' && equipment.swordSlot !== null;
}

function moveSwordToInventory() {
  equipment.swordSlot = null;
  inventory.sword += 1;
  clearItemDrag();
  updateInventory();
  updateEquipment();
}

[itemPanel, messagePanel].forEach((dropZone) => {
  dropZone.addEventListener('dragover', (event) => {
    if (!canUnequipSword() || (dropZone === messagePanel && !itemPanel.hidden)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

  dropZone.addEventListener('drop', (event) => {
    if (!canUnequipSword() || (dropZone === messagePanel && !itemPanel.hidden)) return;
    event.preventDefault();
    moveSwordToInventory();
  });
});

function updateEquipment() {
  const swordName = sword.isMagic ? 'まけん' : 'けん';
  const swordImage = sword.isMagic
    ? 'static/tsurugi_bronze_sabi_blue.png'
    : 'static/tsurugi_bronze_blue.png';
  equippedSword.src = swordImage;
  equippedSword.alt = swordName;
  swordButton.querySelector('img').src = swordImage;
  swordButton.setAttribute('aria-label', swordName);
  equippedSword.hidden = equipment.swordSlot === null;
  Object.entries(equipmentSlots).forEach(([slotName, slot]) => {
    const hasSword = equipment.swordSlot === slotName;
    slot.setAttribute('aria-label', `${slotNames[slotName]} ${hasSword ? `${swordName}をそうび` : 'そうびなし'}`);
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

gameOverRestart.addEventListener('click', () => {
  resetBattle();
  battleButton.focus();
});

gameClearRestart.addEventListener('click', () => {
  resetBattle();
  battleButton.focus();
});

function resetBattle() {
  if (gameClear.open) gameClear.close();
  if (gameOver.open) gameOver.close();
  restartButton.disabled = false;
  endTargetSelection();
  closeItems();
  if (!equipmentScreen.hidden) closeEquipment();
  player.hp = player.maxHp;
  slime.hp = slime.maxHp;
  slimeDisplay.classList.remove('defeated');
  player.mp = 0;
  Object.assign(inventory, { yakuso: 1, material: 1, potion: 0, mpPotion: 0, sword: 0 });
  discoveredItems.clear();
  updateItemBook();
  equipment.swordSlot = 'head';
  sword.attacks = 0;
  sword.isMagic = false;
  updateEquipment();
  turn = 'player';
  messageText.textContent = 'すらいむ　があらわれた!';
  commandButtons.forEach((button) => { button.disabled = false; });
  updateStatus();
  updateInventory();
}

updateStatus();
updateInventory();
updateEquipment();
updateItemBook();
