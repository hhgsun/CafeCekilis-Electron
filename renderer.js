// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require("fs");


var contentDataFilePathAdress = "app_data/content_data.json";
var content_data = contentDataGet();
function contentDataGet() {
   var data = fs.readFileSync(contentDataFilePathAdress);
   return JSON.parse(data.toString());
}
function contentDataSave() {
   return fs.writeFileSync(contentDataFilePathAdress, JSON.stringify(content_data));
}

var appSettingFilePathAdress = "app_data/app_settings.json";
var app_settings = settingDataGet()
function settingDataGet() {
   var data = fs.readFileSync(appSettingFilePathAdress);
   return JSON.parse(data.toString());
}
function settingDataSave() {
   return fs.writeFileSync(appSettingFilePathAdress, JSON.stringify(app_settings));
}


$(document).ready(function () {
   console.log("JQuery Ready !!!");

   //Gift Render html
   giftsRender();

   //PastUsage Render html
   pastUsageRender();


   //Site Setting Load
   settingRender();
   $('#btnSetting').click(function () {
      $("#inputHeaderTitle").val(app_settings.appTitle);
      $("#inputHeaderDesc").val(app_settings.appDesc);
      $("#inputHeaderButtonTitle").val(app_settings.appHeadButton);
      $("#inputHeaderMarginTop").val(app_settings.appMarginTop);
      $('#settingsModal').modal("show");
   });
   $('#btnSettingSave').click(function(){
      app_settings.appTitle = $("#inputHeaderTitle").val();
      app_settings.appDesc = $("#inputHeaderDesc").val();
      app_settings.appHeadButton = $("#inputHeaderButtonTitle").val();
      app_settings.appMarginTop = $("#inputHeaderMarginTop").val();
      settingDataSave();
      settingRender();
   });

   //dropdown
   $('.ui.dropdown').dropdown();

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
});

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

function settingRender() {
   $('#appTitle div').html(app_settings.appTitle);
   $('#appDesc').html(app_settings.appDesc);
   $('#btnCekilisModalAc').html(app_settings.appHeadButton);
   $('#appheader').css("margin-top", app_settings.appMarginTop + "px");
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
      {
         "id": 2,
         "name": "Ahmet",
         "giftId": 2
      },
      {
         "id": 3,
         "name": "Mehmet",
         "giftId": 1
      }
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