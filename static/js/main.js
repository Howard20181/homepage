$('.menu a').click(function () {
    target = $(this).attr('goto');
    switchTo(target);
    $('.menu li a').each(function () {
        $(this).removeClass('active');
    });
    $(this).addClass('active');
});

function switchTo(target) {
    $('.right section').each(function () {
        $(this).removeClass('active');
    });
    $(target).addClass('active');
}

function getAchives() {
    t = ``;
    $.ajax({
        type: "GET",
        url: "https://howardshome.cn/wp-json/wp/v2/posts?per_page=8&page=1",
        referrerPolicy: 'no-referrer-when-downgrade',
        dataType: "json",
        success: function (json) {
            if (json.length != 0)
                for (var i = 0; i < json.length; i++) {
                    title = json[i].title.rendered;
                    link = json[i].link;
                    time = new Date(json[i].date).Format("yyyy-MM-dd");
                    t += `<li><a href="${link}" target="_blank">${title} <span class="meta">/ ${time}</span></a></li>`;
                    $('.archive-list').html(t);
                }
            else
                $('.archive-list').html("<p>什么都没有</p>");
        }
    })
}

function gethitokoto() {
    $.ajax({
        type: 'GET',
        url: 'https://v1.hitokoto.cn',
        dataType: 'json',
        jsonp: 'callback',
        jsonpCallback: 'hitokoto',
        success(data) {
            $('#hitokoto_text').attr('href', 'https://hitokoto.cn/?uuid=' + data.uuid)
            var author = !!data.from ? data.from : "无名氏";
            $('#hitokoto_text').attr('title', "—— " + (data.from_who || '') + "「" + author + "」");
            $('#hitokoto_text').text(data.hitokoto)
        },
        error(jqXHR, textStatus, errorThrown) {
            // 错误信息处理
            console.error(textStatus, errorThrown)
            $('#hitokoto').text("Error: Failed to get hitokoto.")
        }
    })
}

var ap = new APlayer({
    element: document.getElementById("ap-f"),
    fixed: true,
    loop: "all",
    order: "list",
    listFolded: true,
    showlrc: 3,
    theme: "#e6d0b2",
    listmaxheight: "200px",
});

function initAPlayer() {
    $.ajax({
        url: "https://api.injahow.cn/meting/?type=playlist&id=2955219036",
        success: function (e) {
            ap.list.add(eval(e))
            window.aplayers || (window.aplayers = []),
                window.aplayers.push(ap)
        }
    });
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
const slideFade = (elem) => {
    const fade = { opacity: 0, transition: 'opacity 0.5s' };
    elem.css(fade).delay(100).slideUp();
};
function getCookie(key) {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(key))
        ?.split("=")[1];
}
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}
var player_auto = storageAvailable("localStorage") ? localStorage.getItem('player_auto') : 'no';
$(document).ready(function () {
    getAchives()
    gethitokoto()
    initAPlayer()
});
window.onload = function () {
    $(".loading").hide();
    autoPlay()
    if (player_auto) {
        if (player_auto === "autod") {
            $("#success-alert").fadeTo("normal", 1)
            setTimeout(function () { slideFade($('#success-alert')) }, 3500)
        }
    }
}
function apPlay() {
    ap.play();
    document.removeEventListener('mousedown', apPlay)
    document.removeEventListener('keydown', apPlay)
}
function autoPlay() {
    if (player_auto) {
        if (player_auto === "autod") {
            document.addEventListener('mousedown', apPlay)
            document.addEventListener('keydown', apPlay)
        }
    } else {
        swal("是否允许播放音乐？", {
            buttons: {
                cancel: "拒绝",
                allow: "好的"
            }
        })
            .then(function (value) {
                if (value == "allow") {
                    localStorage.setItem('player_auto', 'autod');
                    apPlay()
                } else {
                    localStorage.setItem('player_auto', 'no');
                }
            });
    }
}
