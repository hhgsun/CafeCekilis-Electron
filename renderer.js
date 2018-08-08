// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// storage folder: C:\Users\hhgsu\AppData\Roaming\CafeCekilis\storage
const remote = require('electron').remote;
const storage = require('electron-json-storage');

var content_data = null;
contentDataGet();
function contentDataGet() {
      storage.get("app_data", function (err, res) {
            if (err || !res.appSettings) {
                  content_data = require('./reset_data.js');
                  contentDataSave();
            }
            else content_data = res;
            startAppData();
      });
}
function contentDataSave() {
      storage.set("app_data", content_data, function (err, res) {
            console.log("contentDataSave", res);
      });
}

function startAppData() {
      //Gift Render html
      giftsRender();

      //PastUsage Render html
      pastUsageRender();

      //Site Setting Load
      settingRender();
}

$('#btnSetting').click(function () {
      $("#inputHeaderTitle").val(content_data.appSettings.appTitle);
      $("#inputHeaderDesc").val(content_data.appSettings.appDesc);
      $("#inputHeaderButtonTitle").val(content_data.appSettings.appHeadButton);
      $("#inputHeaderMarginTop").val(content_data.appSettings.appMarginTop);
      $('#settingsModal').modal("show");
});
$('#btnSettingSave').click(function () {
      content_data.appSettings.appTitle = $("#inputHeaderTitle").val();
      content_data.appSettings.appDesc = $("#inputHeaderDesc").val();
      content_data.appSettings.appHeadButton = $("#inputHeaderButtonTitle").val();
      content_data.appSettings.appMarginTop = $("#inputHeaderMarginTop").val();
      contentDataSave();
      settingRender();
});

//dropdown
$('.ui.dropdown').dropdown();

$("#btnUrunEkleModalAc").click(function () {
      setGiftInputs();
      $('#btnGiftCreate').show();
      $('#btnGiftDelete').hide();
      $('#btnGiftUpdate').hide();
      $('#urunEkleModal').modal('show').modal({
            onApprove: function () { return false }
      });
});

$('#btnRefreshApp').click(function () {
      location.reload();
});

$("#btnGiftCreate").click(function () {
      if ($("#inputGiftName").val() && $("#inputGiftPossibility").val() && $("#inputGiftImage").val()) {
            var giftItem = {
                  id: Date.now() + "--" + Date.now().toLocaleString(),
                  name: $("#inputGiftName").val(),
                  desc: $("#inputGiftDesc").val(),
                  imageUrl: $("#inputGiftImage").val(),
                  possibility: $("#inputGiftPossibility").val(),
            }
            content_data.gifts.push(giftItem);
            contentDataSave();
            setGiftInputs(null, null, null, null);
            $('#urunEkleModal').modal('hide');
            $('#dropdownMessage').html("Değişiklik Yapıldı Uygulamayı Yenileyiniz");
      } else alert("Lütfen ürün adı, olasılık değerini ve resim url'sini girin");
});

$(".gift-box").dblclick(function (event) {
      var gifts = content_data.gifts;
      var selectGiftId = event.currentTarget.id;
      var selectGiftListIndex = null;
      var selectGift = null;
      gifts.forEach((gift, index) => {
            if (gift.id == selectGiftId) {
                  selectGiftListIndex = index;
                  selectGift = gift;
            }
      });
      if (selectGift && (selectGiftListIndex || selectGiftListIndex == 0)) {
            setGiftInputs(selectGift.name, selectGift.desc, selectGift.imageUrl, selectGift.possibility);
            $('#btnGiftCreate').hide();
            $('#btnGiftDelete').show();
            $('#btnGiftUpdate').show();
            $('#urunEkleModal').modal('show').modal({
                  onApprove: function () { return false }
            });
            $('#btnGiftDelete').click(function () {
                  var tf = confirm("Silmek İstediğinize Eminmisiniz");
                  if (tf) {
                        gifts.splice(selectGiftListIndex, 1);
                        content_data.gifts = gifts;
                        contentDataSave();
                        $('#dropdownMessage').html("Değişiklik Yapıldı Uygulamayı Yenileyiniz");
                  } else console.log("silinmedi");
            });
            $('#btnGiftUpdate').click(function () {
                  gifts[selectGiftListIndex] = {
                        id: selectGift.id,
                        name: $("#inputGiftName").val(),
                        desc: $("#inputGiftDesc").val(),
                        imageUrl: $("#inputGiftImage").val(),
                        possibility: $("#inputGiftPossibility").val(),
                  };
                  content_data.gifts = gifts;
                  contentDataSave();
                  $('#dropdownMessage').html("Değişiklik Yapıldı Uygulamayı Yenileyiniz");
            });
      }
});

$('#btnCekilisModalAc').click(function () {
      $('#inputMusterName').val(null);
      $('#cekilisModal').modal('show').modal({
            onApprove: function () { return false }
      });
});

$('#btnCekiliseBasla').click(function () {
      var musteriName = $('#inputMusterName').val() || "Müşteri";
      var sonucHediye = null;
      if (musteriName) {
            $('#cekilisModal').modal('hide'); //müşteri adı alınan modal kapanır
            $('#cekilisSonrasiSonuc h1').html(musteriName).hide(); //dimmerde gözükecek müşteri adı
            $('#cekilisSonrasiSonuc h2').hide(); //dimmer açıklama
            $('#cover').dimmer('show'); //dimmer aç
            $('#cekilisSonrasiSonuc div').html("Sonuç Bekleniyor").show(); //dimmerde loading kısmı
            hediyeCekilisCtrl().then(function (gift) {
                  var user = {
                        id: "user-" + Date.now() + "--" + Date.now().toLocaleString(),
                        name: musteriName,
                        giftId: gift.id,
                        date: new Date(),
                  }
                  content_data.pastUsage.push(user);
                  contentDataSave();
                  setTimeout(function () {
                        $('#cover').dimmer('hide');
                        $('#cekilisSonrasiSonuc h1').show();
                        $('#cekilisSonrasiSonuc h2').show();
                        $('#cekilisSonrasiSonuc h2 p').html(gift.name);
                        $('#cekilisSonrasiSonuc h2 span').html("Hediye Kazandı");
                        $('#cekilisSonrasiSonuc div').hide();
                        $('#cover').dimmer('show');
                        setTimeout(function () {
                              content_data = contentDataGet();
                              pastUsageRender();
                              $('#cover').dimmer('hide');
                        }, 4000);
                  }, 2000);
            });
      } else alert("Lütfen isim belirtiniz");
});

$('#btnUsageReset').click(function () {
      var tf = confirm("Sıfırlamak istediğinize eminmisiniz, Tüm geçmiş kullanım kayıtları silinecektir").valueOf;
      if (tf) {
            content_data.pastUsage = [];
            contentDataSave();
            yenileSayfa();
      }
});

$('#btnQuit').click(function(){
      remote.getCurrentWindow().close(); //çıkış butonu
})
//jquery end

function giftsRender() {
      var gifts = content_data.gifts;
      for (let i = 0; i < gifts.length; i++) {
            const gift = gifts[i];
            if (gift.name && gift.imageUrl) {
                  $("#slider1").append(
                        '<div><div class="ui fluid image gift-box" id="' + gift.id + '">'
                        + '<div class="ui top right attached label">' + gift.name + '</div>'
                        + '<img src="' + gift.imageUrl + '">' +
                        '</div></div>'
                  );
            }
      }
      //slider1
      $('#slider1').slick({
            autoplay: true,
            autoplaySpeed: 2000,
            speed: 300,
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            variableWidth: true
      });
}

function pastUsageRender() {
      $("#pastUsageBox div.list").html("");
      var reselve = content_data.pastUsage;
      var pastUsage = reselve.reverse();
      for (let i = 0; i < 5; i++) {
            const usage = pastUsage[i];
            var selectGift = null;
            if (usage) {
                  content_data.gifts.forEach(gift => {
                        if (gift.id == usage.giftId) selectGift = gift;
                  });
                  selectGiftName = selectGift ? selectGift.name : "Hediye Ürün";
                  $("#pastUsageBox div.list").append(
                        '<div id="' + usage.id + '" class="item"><div class="content">'
                        + '<div class="header">' + usage.name + '</div>' + selectGiftName +
                        '</div></div>'
                  );
            }
      }
}

function settingRender() {
      $('#appTitle div').html(content_data.appSettings.appTitle);
      $('#appDesc').html(content_data.appSettings.appDesc);
      $('#btnCekilisModalAc').html(content_data.appSettings.appHeadButton);
      $('#appheader').css("margin-top", content_data.appSettings.appMarginTop + "px");
}

function hediyeCekilisCtrl() {
      return new Promise(function (resolve, reject) {
            var gifts = content_data.gifts;
            var possibilityList = [];
            gifts.forEach(gift => {
                  for (let i = 0; i < gift.possibility; i++) {
                        possibilityList.push(gift.id);
                  }
            });
            var randomInt = getRndInteger(0, possibilityList.length);
            var secilenGiftId = possibilityList[randomInt];
            gifts.forEach(gift => {
                  if (gift.id == secilenGiftId)
                        resolve(gift);
            });
            if (gifts.length <= 1) {
                  alert("Birden Fazla Hediye ürünü olmalı");
                  resolve(null);
            }
      });
}
function getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
}

function setGiftInputs(name = null, desc = null, imageUrl = null, possibility = null) {
      $("#inputGiftName").val(name);
      $("#inputGiftDesc").val(desc);
      $("#inputGiftImage").val(imageUrl);
      $("#inputGiftPossibility").val(possibility);
}

function yenileSayfa() {
      location.reload();
}

// Asynchronous read
/* fs.readFile(contentDataFilePathAdress, function (err, data) {
   if (err) {
      return console.error(err);
   }
   console.log("DATALAR: ", JSON.parse(data));
});
 */


// bu şekilde olacak
/* {
   "pastUsage" : [
      {
         "id": 1,
         "name": "Hasan Hüseyin",
         "giftId": 1
      },
   ],
   "gifts": [
      {
         "id": 1,
         "name": "Çay",
         "desc": "Taze Çaykur"
      },
      {
         "id": 2,
         "name": "Tatlı",
         "desc": "Taze"
      }
   ]
} */