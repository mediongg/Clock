let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let radius = canvas.clientHeight / 2;
let timer = null;
let times = [];
let maxDate = new Date();
maxDate.setHours(23, 59);

ctx.translate(radius, radius);
radius = radius * 0.90;

draw();
generalInit();
initDate();

function generalInit() {
    $('.fileUploader').on('change', (e) => {
        let form = new FormData();
        form.append('photo', e.target.files[0]);

        $.ajax('/upload', {
            method: 'POST',
            data: form,
            processData: false,
            contentType: false,
            'mimeType': 'multipart/form-data',
        })
        .done(() => {
            window.location.reload();
        });
    });
}

function initDate() {
    $('#note').on('input', (event) => {
        $('#count').text(`(${event.target.value.length} 字)`);
    });
    $('.ui.modal').modal({
        closable: false,
        onApprove: (btn) => {
            const note = $('#note').val();
            const id = btn.data('id');

            if (note.length < 100) {
                return false;
            }
            $.post('/finish', {
                id: id,
                note: note
            })
            .done(() => {
                $.get('/gettimer', (data) => {
                    $('#task').html(data);
                    initBtnListener();
                    draw();
                });
            });
        },
    });
    $('#start').calendar({
        ampm: false,
        type: 'time',
        onChange: (date, text, mode) => {
            maxDate = new Date(date);
            let hours = maxDate.getHours() + 8 > 23 ? 23 : maxDate.getHours() + 8;
            maxDate.setHours(hours);
            maxDate.setMinutes(59);
            $('#end').calendar({
                ampm: false,
                type: 'time',
                maxDate: maxDate,
                startCalendar: $('#start')
            });
            $('#end').calendar('set date', '');
        },
    });
    $('#end').calendar({
        ampm: false,
        type: 'time',
        maxDate: maxDate,
        startCalendar: $('#start')
    });
    initBtnListener();
    $('#submit').on('click', () => {
        let start = $('#start').calendar('get date');
        let end = $('#end').calendar('get date');
        let today = new Date();
        let color = $('.jscolor').css("background-color");
        color = color
            .replace(/[^\d,]/g, '')
            .split(',')
            .map((item) => parseInt(item, 10).toString('16').padStart(2, 0))
            .join('');

        start.setDate(today.getDate());
        start.setMonth(today.getMonth());
        end.setDate(today.getDate());
        end.setMonth(today.getMonth());
            
        if (start !== null && end !== null && end > start) {
            $.post('/addtimer', {
                start: getFormattedHM(start),
                end: getFormattedHM(end),
                color: color
            })
            .done(() => {
                $.get('/gettimer', (data) => {
                    $('#task').html(data);
                    initBtnListener();
                    draw();
                });
            })
            .fail(() => { console.log('not ok');});
        } else {
            console.log('add time failed');
        }
    });
}

function initBtnListener() {
    const delBtns = $('.task-del');
    const finBtns = $('.task-finish');
    for (let i = 0; i < delBtns.length; ++i) {
        $(delBtns[i]).off('click');
        $(finBtns[i]).off('click');
    }
    for (let i = 0; i < delBtns.length; ++i) {
        $(finBtns[i]).on('click', function() {
            const id = $(this).data('id');
            const note = $(this).data('note');
            $('#count').text(`(${note.length} 字)`);
            $('#note').val(note);
            $('.ui.modal .actions .ui.positive').data('id', id);

            $('.ui.modal').modal('show');
        });
        $(delBtns[i]).on('click', function() {
            const id = $(this).data('id');
            $.post('/deltimer', {
                id: id,
            })
            .done(() => {
                $.get('/gettimer', (data) => {
                    $('#task').html(data);
                    initBtnListener();
                    draw();
                });
            });
        });
    }
}

function getFormattedHM(date) {
    const hStr = date.getHours().toString().padStart(2, '0');
    const mStr = date.getMinutes().toString().padStart(2, '0');

    return `${hStr}:${mStr}`;
}

function draw() {
    clearInterval(timer);
    $.get('/gettimerAPI', (data) => {
        times = data.times;
        timer = setInterval(drawClock, 1000);
    });
}

function drawClock() {
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawStartEndInterval(ctx);
    drawTime(ctx, radius);
}

function drawStartEndInterval(ctx) {
    const current = new Date();
    const dates = times.map((time) => {
        let s = time.start.split(':');
        let e = time.end.split(':');
        let color = time.color;
        let startDate = new Date();
        let endDate = new Date();
        startDate.setHours(parseInt(s[0], 10), parseInt(s[1], 10), parseInt(s[2], 10));
        endDate.setHours(parseInt(e[0], 10), parseInt(e[1], 10), parseInt(e[2], 10));
        time.startDate = startDate;
        time.endDate = endDate;
        return time;
    });
    dates.sort((a, b) => {
        if (a.startDate < b.startDate) {
            return -1;
        } else if (a.startDate > b.startDate) {
            return 1;
        }
        return 0;
    });
    const index = dates.findIndex((date) => {
        return (date.startDate <= current && date.endDate >= current) 
        || date.startDate > current;
    });

    dates.forEach((time, idx) => {
        const sr = getTimeToHourRadian(time.startDate);
        const er = getTimeToHourRadian(time.endDate);
        const r = parseInt(time.color.substring(0, 2), 16);
        const g = parseInt(time.color.substring(2, 4), 16);
        const b = parseInt(time.color.substring(4, 6), 16);
        let opacity;
        if (idx === index) {
            opacity = 1;
        } else if (idx < index) {
            opacity = 0;
        } else if (idx > index) {
            opacity = 0.05;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.rotate(-0.5 * Math.PI);
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius * 0.7, sr, er);
        ctx.rotate(0.5 * Math.PI);
        ctx.fill();
    });

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