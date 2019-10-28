

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let radius = canvas.clientHeight / 2;
ctx.translate(radius, radius);
radius = radius * 0.90;


setInterval(drawClock, 1000);
function drawClock() {
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawStartEndInterval(ctx);
    drawTime(ctx, radius);
}

function drawStartEndInterval(ctx, start, end) {
    var s = new Date();
    var e = new Date();
    s.setHours(12, 30, 0, 0);
    e.setHours(20, 0, 0, 0);

    const sr = getTimeToHourRadian(s);
    const er = getTimeToHourRadian(e);

    console.log(s);
    console.log(e);
    console.log(sr * 180 / Math.PI);
    console.log(er * 180 / Math.PI);
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
    ctx.rotate(-0.5 * Math.PI);
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius * 0.7, sr, er);
    ctx.rotate(0.5 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#333';
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
    ctx.fill();
}

function drawFace(ctx, radius) {
    var grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();
}

function drawNumbers(ctx, radius) {
    var ang;
    var num;
    ctx.font = radius * 0.15 + "px arial";
    ctx.fillStyle = '#333';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (num = 1; num < 13; num++) {
        ang = num * Math.PI / 6;
        ctx.save();
        ctx.rotate(ang); // put drawing number at the top of clock
        ctx.translate(0, -radius * 0.85); // move origin to the top of clock
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.restore();
    }
}

function drawTime(ctx, radius) {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var hour = getTimeToHourRadian(now);
    //hour
    drawHand(ctx, hour, radius * 0.5, radius * 0.07);
    //minute
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.8, radius * 0.07);
    // second
    second = (second * Math.PI / 30);
    drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function getTimeToHourRadian(time) {
    var hour = time.getHours();
    var minute = time.getMinutes();
    var second = time.getSeconds();

    console.log(time, hour);
    hour = (hour * Math.PI / 6) +
        (minute * Math.PI / (6 * 60)) +
        (second * Math.PI / (360 * 60));
    
    return hour;
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}