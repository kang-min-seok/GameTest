
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const maxDots = 5;
const dots = [];
let clickedDots = 0;
let totalClicks = 0;

let redScreenStartTime = null;
let redScreenEndTime = null;
let redScreenClicks = 0;
let totalReactionTime = 0;

let gameStartTime = null;
let gameEndTime = null;

const redScreenMoments = new Set();
redScreenMoments.add(Math.floor(Math.random() * (15 - 8 + 1) + 8));
redScreenMoments.add(Math.floor(Math.random() * (28 - 23 + 1) + 23));
redScreenMoments.add(Math.floor(Math.random() * (40 - 33 + 1) + 33));

let redScreenActive = false;

let emptyClicks = 0;
let emptyFlag = true;
let spacebarFlag = false;
function createDot() {
    const radius = 20;
    let newDot;
    let isValid = false;

    while (!isValid) {
        isValid = true;
        newDot = {
            x: radius + Math.random() * (canvas.width - radius * 2),
            y: radius + Math.random() * (canvas.height - radius * 2),
            radius: radius,
        };

        for (const dot of dots) {
            const distance = Math.sqrt((newDot.x - dot.x) ** 2 + (newDot.y - dot.y) ** 2);
            if (distance <= newDot.radius + dot.radius) {
                isValid = false;
                break;
            }
        }
    }

    return newDot;
}
function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function isDotClicked(dot, mouseX, mouseY) {
    const distance = Math.sqrt((mouseX - dot.x) ** 2 + (mouseY - dot.y) ** 2);
    return distance <= dot.radius;
}

for (let i = 0; i < maxDots; i++) {
    dots.push(createDot());
}
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let elapsedTime = 0;
    if (gameStartTime) {
        if (clickedDots < 50) {
            elapsedTime = ((new Date().getTime() - gameStartTime) / 1000).toFixed(2);
        } else {
            if (!gameEndTime) {
                gameEndTime = new Date().getTime();
            }
            elapsedTime = ((gameEndTime - gameStartTime) / 1000).toFixed(2);
        }
    }
    for (const dot of dots) {
        drawDot(dot);
    }
    if (redScreenActive) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (clickedDots === 50) {
        showResult();
    }
    if (emptyClicks === 3) {
        emptyClickFail();
    }
    if (spacebarFlag) {
        spacebarFail();
    }
    if (clickedDots < 50 && emptyFlag) {
        requestAnimationFrame(gameLoop);
    }
}
document.getElementById('restartButton').addEventListener('click', () => {
    resetGame();
});

canvas.addEventListener('click', (event) => {
    if (clickedDots >= 50 || emptyClicks >= 3 || gameStartTime === null) return;
    totalClicks++;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let isDotClickedFlag = false;
    for (let i = 0; i < dots.length; i++) {
        if (isDotClicked(dots[i], mouseX, mouseY)) {
            dots.splice(i, 1);
            dots.push(createDot());
            clickedDots++;
            if (redScreenMoments.has(clickedDots) && clickedDots >= 7) {
                redScreenActive = true;
                redScreenStartTime = new Date().getTime();
            }
            isDotClickedFlag = true;
            break;
        }
    }
    if (!isDotClickedFlag) {
        emptyClicks++;
    }

});
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (redScreenActive) {
            redScreenActive = false;
            redScreenEndTime = new Date().getTime();
            totalReactionTime += redScreenEndTime - redScreenStartTime;
            redScreenClicks++;
        } else if (gameStartTime && !redScreenActive && clickedDots < 50 && emptyClicks < 3) {
            spacebarFlag = true;
        }
    }

});
function startGame() {
    emptyClicks = 0;
    emptyFlag = true;
    document.getElementById('startButton').style.display = 'none';
    gameStartTime = new Date().getTime();
    gameLoop();
}

function resetGame() {
    clickedDots = 0;
    totalClicks = 0;
    redScreenClicks = 0;
    totalReactionTime = 0;
    gameStartTime = null;
    gameEndTime = null;
    redScreenActive = false;
    emptyClicks = 0;
    spacebarFlag = false;
    // 새로운 랜덤 위치의 점 생성
    for (let i = 0; i < maxDots; i++) {
        dots[i] = createDot();
    }

    // 빨간 화면의 랜덤 순간 설정
    redScreenMoments.clear();
    redScreenMoments.add(Math.floor(Math.random() * (15 - 8 + 1) + 8));
    redScreenMoments.add(Math.floor(Math.random() * (28 - 23 + 1) + 23));
    redScreenMoments.add(Math.floor(Math.random() * (40 - 33 + 1) + 33));

    // 다시 시작 버튼을 숨깁니다
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'none';

    // 게임 시작 버튼을 다시 표시
    const startButton = document.getElementById('startButton');
    startButton.style.display = 'block';

    // 게임 루프를 멈추고 캔버스를 초기 상태로 지워 빈 화면이 나오도록 합니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cancelAnimationFrame(gameLoop);
}

function showResult() {
    document.getElementById("progressBar").style.display = "block";
    document.getElementById("measuringText").style.display = "block";
    startProgressBarAnimation();
    // document.getElementById("loadingSpinner").style.display = "inline-block";
    gameEndTime = new Date().getTime();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    setTimeout(() => {
        //document.getElementById("loadingSpinner").style.display = "none";
        document.getElementById("progressBar").style.display = "none";
        document.getElementById("measuringText").style.display = "none";
        const averageReactionTime = (totalReactionTime / redScreenClicks).toFixed(2);
        const totalElapsedTime = ((gameEndTime - gameStartTime) / 1000).toFixed(2);

        setTimeout(() => {
            ctx.fillText(`평균 반응 시간: ${averageReactionTime}ms`, 50, 100);
        }, 500);

        setTimeout(() => {
            ctx.fillText(`총 경과 시간: ${totalElapsedTime}초`, 50, 150);
        }, 1000);
        setTimeout(() => {
            document.getElementById('restartButton').style.display = 'block';
        }, 1500);
    }, 2000);
}

function emptyClickFail() {
    emptyFlag = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`빈화면을 3번 이상 클릭하셨습니다.`, 15, 150);
    document.getElementById('restartButton').style.display = 'block';
}

function spacebarFail() {
    emptyFlag = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`빈화면에서 스페이스바를 누르셨습니다.`, 18, 150);
    document.getElementById('restartButton').style.display = 'block';
}

function startProgressBarAnimation() {
    const progressBarInner = document.getElementById("progressBarInner");
    progressBarInner.style.animation = "progress-animation 2s linear forwards";
}
$(document).keydown(function (event) {
    if (event.keyCode == 32) {
        event.preventDefault();
    }
});
