
/*
==================================================
  國小英文單字動態連連看
  使用 p5.js，完全不需要外部圖片或 GIF
  六題、拖曳配對、即時提示、成績結算、重新開始
==================================================
*/

// 1. 題庫
const questions = [
  { word: "Apple", meaning: "蘋果", type: "apple" },
  { word: "Cat", meaning: "貓", type: "cat" },
  { word: "Dog", meaning: "狗", type: "dog" },
  { word: "Fish", meaning: "魚", type: "fish" },
  { word: "Bird", meaning: "鳥", type: "bird" },
  { word: "Rabbit", meaning: "兔子", type: "rabbit" }
];

// 2. 遊戲變數
let wordCards = [];
let targets = [];
let draggedCard = null;

let correctCount = 0;
let attempts = 0;
let gameFinished = false;

let feedback = "將左側英文單字拖曳到右側正確的圖案！";
let feedbackColor = "#345b91";

let restartButton = { x: 0, y: 0, w: 180, h: 48 };

// 3. 初始化遊戲
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  textAlign(CENTER, CENTER);

  resetGame();
}

// 4. 建立或重設遊戲
function resetGame() {
  correctCount = 0;
  attempts = 0;
  gameFinished = false;
  draggedCard = null;

  feedback = "將左側英文單字拖曳到右側正確的圖案！";
  feedbackColor = "#345b91";

  // 左側英文卡片維持固定順序
  wordCards = questions.map(q => ({
    word: q.word,
    x: 0, y: 0, w: 0, h: 0,
    matched: false
  }));

  // 右側圖案隨機排序
  let shuffled = [...questions];
  shuffle(shuffled, true);

  targets = shuffled.map(q => ({
    word: q.word,
    type: q.type,
    x: 0, y: 0, w: 0, h: 0,
    matched: false
  }));

  updateLayout();
}

// 5. 根據視窗大小調整版面
function updateLayout() {
  if (!wordCards.length) return;

  let cardW = min(200, width * 0.39);
  let cardH = constrain((height - 175) / 6 * 0.78, 42, 68);

  // 左右兩欄的中心位置
  let leftCenter = width * 0.25;
  let rightCenter = width * 0.75;

  // 窄螢幕使用較窄的卡片
  if (width < 400) {
    cardW = width * 0.39;
    leftCenter = width * 0.25;
    rightCenter = width * 0.75;
  }

  let rowGap = (height - 175) / 6;
  let startY = 100;

  for (let i = 0; i < wordCards.length; i++) {
    wordCards[i].x = leftCenter - cardW / 2;
    wordCards[i].y = startY + i * rowGap;
    wordCards[i].w = cardW;
    wordCards[i].h = cardH;

    targets[i].x = rightCenter - cardW / 2;
    targets[i].y = startY + i * rowGap;
    targets[i].w = cardW;
    targets[i].h = cardH;
  }
}

// 6. 每一幀都會重新繪製，產生動畫
function draw() {
  background("#f3f7ff");

  // 遊戲標題
  noStroke();
  fill("#294a7a");
  textSize(min(27, width * 0.065));
  text("English Matching Game", width / 2, 27);

  fill("#60738f");
  textSize(14);
  text("英文單字動態連連看", width / 2, 59);

  // 欄位標題
  fill("#345b91");
  textSize(15);
  text("英文單字", width * 0.25, 81);
  text("動態圖案", width * 0.75, 81);

  // 左側單字
  for (let card of wordCards) {
    drawWordCard(card);
  }

  // 右側動態圖案
  for (let target of targets) {
    drawTarget(target);
  }

  // 底部成績與提示
  fill("#294a7a");
  textSize(16);
  text("答對 " + correctCount + " / 6 題", width / 2, height - 53);

  fill(feedbackColor);
  textSize(13);
  text(feedback, width / 2, height - 25);

  // 完成六題時顯示成績視窗
  if (gameFinished) {
    drawResult();
  }
}

// 7. 繪製英文單字卡片
function drawWordCard(card) {
  let x = card.x;
  let y = card.y;

  // 拖曳時，卡片跟著滑鼠移動
  if (draggedCard === card) {
    x = mouseX - draggedCard.offsetX;
    y = mouseY - draggedCard.offsetY;
  }

  // 依照狀態設定顏色
  if (card.matched) {
    fill("#d9f4df");
    stroke("#52ad70");
  } else if (draggedCard === card) {
    fill("#fff0c9");
    stroke("#e6a23c");
  } else {
    fill("#ffffff");
    stroke("#91afd9");
  }

  strokeWeight(2);
  rect(x, y, card.w, card.h, 12);

  noStroke();
  fill("#294a7a");
  textSize(min(21, card.w * 0.17));
  text(card.word, x + card.w / 2, y + card.h / 2);
}

// 8. 繪製右側目標卡片
function drawTarget(target) {
  if (target.matched) {
    fill("#e0f8e5");
    stroke("#52ad70");
  } else {
    fill("#ffffff");
    stroke("#b3c5df");
  }

  strokeWeight(2);
  rect(target.x, target.y, target.w, target.h, 12);

  // 讓圖案在卡片中間偏左的位置持續動畫
  let iconX = target.x + target.w * 0.34;
  let iconY = target.y + target.h / 2;
  let iconSize = min(target.h * 0.72, target.w * 0.34);

  push();
  translate(iconX, iconY);
  drawAnimatedAnimal(target.type, iconSize);
  pop();

  // 配對成功後顯示單字
  if (target.matched) {
    noStroke();
    fill("#247642");
    textSize(min(13, target.w * 0.11));
    text(
      target.word + " ✓",
      target.x + target.w * 0.72,
      target.y + target.h / 2
    );
  }
}

// 9. 根據種類繪製會動的圖案
function drawAnimatedAnimal(type, s) {
  // sin(frameCount) 讓圖案上下或左右移動
  let bob = sin(frameCount * 0.08) * s * 0.08;

  push();
  translate(0, bob);
  scale(s / 50);

  if (type === "apple") drawApple();
  if (type === "cat") drawCat();
  if (type === "dog") drawDog();
  if (type === "fish") drawFish();
  if (type === "bird") drawBird();
  if (type === "rabbit") drawRabbit();

  pop();
}

// 10. 蘋果動畫
function drawApple() {
  noStroke();

  // 蘋果本體
  fill("#ef4545");
  ellipse(-8, 5, 28, 30);
  ellipse(8, 5, 28, 30);
  ellipse(0, 12, 32, 22);

  // 葉子
  push();
  rotate(-0.25);
  fill("#3aab57");
  ellipse(8, -16, 19, 9);
  pop();

  // 果梗
  stroke("#79502b");
  strokeWeight(4);
  line(0, -8, 2, -18);
}

// 11. 貓咪動畫
function drawCat() {
  noStroke();

  // 尾巴搖動
  push();
  translate(16, 12);
  rotate(sin(frameCount * 0.12) * 0.35);
  noFill();
  stroke("#d89b62");
  strokeWeight(7);
  arc(5, 0, 23, 28, PI, TWO_PI);
  pop();

  noStroke();
  fill("#f0b36e");

  // 身體與頭
  ellipse(0, 14, 29, 22);
  ellipse(0, -5, 34, 30);

  // 耳朵
  triangle(-15, -13, -13, -29, -3, -16);
  triangle(15, -13, 13, -29, 3, -16);

  // 眼睛
  fill("#ffffff");
  ellipse(-7, -7, 9, 11);
  ellipse(7, -7, 9, 11);

  fill("#26394c");
  ellipse(-6, -6, 4, 6);
  ellipse(8, -6, 4, 6);

  // 鼻子
  fill("#e76f91");
  triangle(-3, 0, 3, 0, 0, 4);

  // 嘴巴
  stroke("#714b38");
  strokeWeight(1.5);
  line(0, 4, -3, 7);
  line(0, 4, 3, 7);
}

// 12. 狗狗動畫
function drawDog() {
  noStroke();

  // 搖尾巴
  push();
  translate(18, 9);
  rotate(sin(frameCount * 0.18) * 0.5);
  fill("#b97b48");
  ellipse(3, 0, 17, 7);
  pop();

  // 身體
  fill("#d69a5e");
  ellipse(0, 12, 33, 24);

  // 耳朵
  fill("#8b593a");
  ellipse(-15, -5, 10, 21);
  ellipse(15, -5, 10, 21);

  // 頭
  fill("#d69a5e");
  ellipse(0, -5, 33, 31);

  // 嘴部
  fill("#fff0d9");
  ellipse(0, 3, 20, 15);

  // 眼睛
  fill("#26394c");
  ellipse(-7, -8, 4, 5);
  ellipse(7, -8, 4, 5);

  // 鼻子
  fill("#39302c");
  ellipse(0, 0, 7, 5);
}

// 13. 魚兒動畫
function drawFish() {
  // 魚尾左右擺動
  let tailMove = sin(frameCount * 0.18) * 5;

  noStroke();

  fill("#f2a23a");
  triangle(-17, 0, -31, -12 + tailMove, -31, 12 + tailMove);

  // 魚身
  fill("#ffbc55");
  ellipse(0, 0, 40, 26);

  // 魚鰭
  fill("#e88732");
  triangle(-2, -9, 7, -19, 13, -7);

  // 眼睛
  fill("#ffffff");
  ellipse(11, -3, 9, 9);

  fill("#26394c");
  ellipse(13, -3, 4, 5);

  // 嘴巴
  stroke("#a85d29");
  strokeWeight(2);
  line(18, 3, 22, 1);
}

// 14. 小鳥動畫
function drawBird() {
  let wingMove = sin(frameCount * 0.22) * 9;

  noStroke();

  // 身體
  fill("#59b8e8");
  ellipse(0, 3, 33, 26);

  // 翅膀拍動
  push();
  translate(-2, 1);
  rotate(radians(wingMove));
  fill("#318ac5");
  ellipse(-5, -2, 20, 12);
  pop();

  // 頭
  fill("#73d0f3");
  ellipse(8, -9, 23, 22);

  // 嘴巴
  fill("#f3a33d");
  triangle(18, -8, 28, -4, 18, -1);

  // 眼睛
  fill("#ffffff");
  ellipse(11, -12, 7, 7);

  fill("#26394c");
  ellipse(12, -12, 3, 4);

  // 腳
  stroke("#d68a37");
  strokeWeight(2);
  line(-4, 15, -4, 20);
  line(5, 15, 5, 20);
}

// 15. 兔子動畫
function drawRabbit() {
  noStroke();

  // 耳朵輕微擺動
  push();
  translate(-7, -11);
  rotate(sin(frameCount * 0.1) * 0.15);
  fill("#ffffff");
  ellipse(0, -11, 10, 27);
  fill("#f3a9bd");
  ellipse(0, -11, 5, 19);
  pop();

  push();
  translate(7, -11);
  rotate(-sin(frameCount * 0.1) * 0.15);
  fill("#ffffff");
  ellipse(0, -11, 10, 27);
  fill("#f3a9bd");
  ellipse(0, -11, 5, 19);
  pop();

  // 身體與頭
  fill("#ffffff");
  ellipse(0, 12, 29, 24);
  ellipse(0, -4, 31, 29);

  // 眼睛
  fill("#26394c");
  ellipse(-7, -7, 4, 5);
  ellipse(7, -7, 4, 5);

  // 鼻子
  fill("#ed91ae");
  triangle(-3, 0, 3, 0, 0, 4);

  // 腮紅
  fill("#ffc9d9");
  ellipse(-11, 1, 6, 4);
  ellipse(11, 1, 6, 4);
}

// 16. 按下滑鼠：選取單字
function mousePressed() {
  // 結算畫面只處理重新開始按鈕
  if (gameFinished) {
    if (
      mouseX >= restartButton.x &&
      mouseX <= restartButton.x + restartButton.w &&
      mouseY >= restartButton.y &&
      mouseY <= restartButton.y + restartButton.h
    ) {
      resetGame();
    }
    return;
  }

  // 由後往前檢查，避免重疊時選錯卡片
  for (let i = wordCards.length - 1; i >= 0; i--) {
    let card = wordCards[i];

    if (
      !card.matched &&
      mouseX >= card.x &&
      mouseX <= card.x + card.w &&
      mouseY >= card.y &&
      mouseY <= card.y + card.h
    ) {
      draggedCard = card;

      // 記錄滑鼠在卡片上的抓取位置
      draggedCard.offsetX = mouseX - card.x;
      draggedCard.offsetY = mouseY - card.y;
      return;
    }
  }
}

// 17. 放開滑鼠：判斷配對
function mouseReleased() {
  if (!draggedCard || gameFinished) {
    draggedCard = null;
    return;
  }

  let droppedTarget = null;

  // 找出滑鼠放開時所在的目標
  for (let target of targets) {
    if (
      !target.matched &&
      mouseX >= target.x &&
      mouseX <= target.x + target.w &&
      mouseY >= target.y &&
      mouseY <= target.y + target.h
    ) {
      droppedTarget = target;
      break;
    }
  }

  // 放到圖片卡上才算一次作答
  if (droppedTarget) {
    attempts++;

    if (draggedCard.word === droppedTarget.word) {
      // 答對：鎖定配對
      draggedCard.matched = true;
      droppedTarget.matched = true;
      correctCount++;

      feedback = "答對了！Great job!";
      feedbackColor = "#218347";
    } else {
      // 答錯：保留重新作答的機會
      feedback = "不太對喔，再試一次！Try again!";
      feedbackColor = "#d64b4b";
    }
  }

  // 沒有答對的卡片會回到原位
  draggedCard = null;

  // 全部六題完成
  if (correctCount === questions.length) {
    gameFinished = true;
    feedback = "恭喜完成所有題目！";
    feedbackColor = "#218347";
  }
}

// 18. 成績結算視窗
function drawResult() {
  // 半透明遮罩
  noStroke();
  fill(20, 35, 60, 190);
  rect(0, 0, width, height);

  // 成績卡片
  let panelW = min(350, width - 30);
  let panelH = 270;
  let panelX = (width - panelW) / 2;
  let panelY = (height - panelH) / 2;

  fill("#ffffff");
  stroke("#dbe5f4");
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 22);

  noStroke();
  fill("#294a7a");
  textSize(26);
  text("測驗完成！", width / 2, panelY + 38);

  fill("#218347");
  textSize(20);
  text(
    "答對題數：" + correctCount + " / 6",
    width / 2,
    panelY + 85
  );

  // 每題約 16.67 分，滿分 100 分
  let score = Math.round(correctCount / 6 * 100);

  fill("#e6a23c");
  textSize(35);
  text(score + " 分", width / 2, panelY + 135);

  fill("#60738f");
  textSize(14);
  text(
    "總配對次數：" + attempts,
    width / 2,
    panelY + 176
  );

  // 重新開始按鈕
  restartButton = {
    x: width / 2 - 85,
    y: panelY + 205,
    w: 170,
    h: 45
  };

  fill("#4386dc");
  noStroke();
  rect(
    restartButton.x,
    restartButton.y,
    restartButton.w,
    restartButton.h,
    12
  );

  fill("#ffffff");
  textSize(17);
  text(
    "再玩一次",
    width / 2,
    restartButton.y + restartButton.h / 2
  );
}

// 19. 視窗尺寸改變時重新排版
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}
