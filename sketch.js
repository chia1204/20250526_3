let video;
let facemesh, handpose;
let facePredictions = [];
let handPredictions = [];
let gesture = "";
let scissorsImg, stoneImg, paperImg;
let maskImg, mask2Img, mask3Img;

function preload() {
  scissorsImg = loadImage('scissors.png');
  stoneImg = loadImage('stone.png');
  paperImg = loadImage('paper.png');
  maskImg = loadImage('mask.png');
  mask2Img = loadImage('mask2.png');
  mask3Img = loadImage('mask3.png');
}

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, () => {});
  facemesh.on('predict', results => {
    facePredictions = results;
  });

  handpose = ml5.handpose(video, () => {});
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function draw() {
  image(video, 0, 0, width, height);

  // 臉部偵測，鼻子處畫圓與顯示圖片或文字
  if (facePredictions.length > 0) {
    const keypoints = facePredictions[0].scaledMesh;
    const [x, y] = keypoints[1]; // 鼻尖
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    // 計算兩眼距離，作為mask寬度依據
    const eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);
    const maskW = eyeDist * 2.2;
    const maskH = maskW * 0.8;

    // 先畫圓圈
    noFill();
    stroke(0, 0, 255);
    strokeWeight(4);
    ellipse(x, y, 50, 50);

    // 根據手勢顯示對應mask
    if (gesture === "剪刀" && maskImg) {
      image(maskImg, x - maskW / 2, y - maskH / 2, maskW, maskH);
    } else if (gesture === "石頭" && mask2Img) {
      image(mask2Img, x - maskW / 2, y - maskH / 2, maskW, maskH);
    } else if (gesture === "布" && mask3Img) {
      image(mask3Img, x - maskW / 2, y - maskH / 2, maskW, maskH);
    }

    // 你原本的剪刀石頭布圖示可視需求保留或移除
    /*
    if (gesture === "剪刀" && scissorsImg) {
      image(scissorsImg, x - 25, y - 25, 50, 50);
    } else if (gesture === "石頭" && stoneImg) {
      image(stoneImg, x - 25, y - 25, 50, 50);
    } else if (gesture === "布" && paperImg) {
      image(paperImg, x - 25, y - 25, 50, 50);
    }
    */
  }

  // 手勢辨識
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;
    gesture = recognizeGesture(landmarks);

    fill(0, 255, 0);
    noStroke();
    textSize(32);
    text(gesture, 20, 40);
  }
}

// 簡單判斷剪刀石頭布
function recognizeGesture(landmarks) {
  // 指尖座標
  const tips = [8, 12, 16, 20].map(i => landmarks[i][1]);
  const base = landmarks[0][1];
  let extended = tips.map(y => y < base - 40);

  if (extended[0] && extended[1] && !extended[2] && !extended[3]) return "剪刀";
  if (extended.every(e => e)) return "布";
  if (extended.every(e => !e)) return "石頭";
  return "";
}