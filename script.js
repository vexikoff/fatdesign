document.addEventListener('DOMContentLoaded', function() {
    var srche = document.getElementById('srch');
    var srcce = document.getElementById('srcc');

    if (srche && srcce) {
        srche.addEventListener('mouseenter', function() {
            srcce.focus();
        });
    }
    var srche2 = document.getElementById('srch2');
    var srss = document.getElementById('srss');

    srss.addEventListener('mouseenter', function() {
        srche2.classList.add('active');
    });
    srss.addEventListener('mouseleave', function() {
        srche2.classList.remove('active');
    });
});

const disc = document.querySelector('.dkds')

function twsw() {
    var yaebalneironki = document.body.classList.toggle('dark')
    localStorage.setItem('yaebalneironki', yaebalneironki)
}

document.addEventListener('DOMContentLoaded', function () {
    var yaebalneironki = localStorage.getItem('yaebalneironki')

    if (yaebalneironki === 'true') {
        document.body.classList.add('dark')
    } else if (yaebalneironki === 'false') {
        document.body.classList.remove('dark')
    }
})

function closedisc() {
    disc.classList.add('hidden')
}