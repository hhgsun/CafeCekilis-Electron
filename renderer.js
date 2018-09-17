// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// storage folder: C:\Users\hhgsu\AppData\Roaming\CafeCekilis\storage
const remote = require('electron').remote;
const storage = require('electron-json-storage');

var content_data = null;
contentDataGet(true);
function contentDataGet(firstLoad = false) {
      return new Promise(function (resolve, reject) {
            storage.get("app_data", function (err, res) {
                  if (err || !res.appSettings) {
                        content_data = require('./reset_data.js');
                        contentDataSave();
                        resolve(content_data);
                  }
                  else {
                        content_data = res;
                        resolve(content_data);
                  };
                  if (firstLoad)
                        startAppData();
            });
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
      $('#inputCekilisSonrasiBekleme').val(content_data.appSettings.appCekilisSonrasiBekleme);
      $('#settingsModal').modal("show");
});
$('#btnSettingSave').click(function () {
      content_data.appSettings.appTitle = $("#inputHeaderTitle").val();
      content_data.appSettings.appDesc = $("#inputHeaderDesc").val();
      content_data.appSettings.appHeadButton = $("#inputHeaderButtonTitle").val();
      content_data.appSettings.appMarginTop = $("#inputHeaderMarginTop").val();
      content_data.appSettings.appCekilisSonrasiBekleme = $('#inputCekilisSonrasiBekleme').val();
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

function giftBoxClickLoad() {
      $('.gift-box').click(function (event) {
            console.log("dblclick");
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
}


$('#btnCekilisModalAc').click(function () {
      cekilisModalAc();
});

function cekilisModalAc() {
      $('#inputMusterName').val(null);
      $('#cekilisModal').modal('show').modal({
            onApprove: function () { return false }
      });
}

$('#inputMusterName').keypress(function (e) {
      if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            cekilisStart();
      }
});
$('#btnCekiliseBasla').click(function () {
      cekilisStart();
});

function cekilisStart() {
      var musteriName = $('#inputMusterName').val() || "Müşteri";
      if (musteriName) {
            $('#cekilisModal').modal('hide'); //müşteri adı alınan modal kapanır
            $('#cekilisSonrasiSonuc h1').html(musteriName);/* .hide(); */ //dimmerde gözükecek müşteri adı
            /*  $('#cekilisSonrasiSonuc h2').hide(); */ //dimmer açıklama
            $('#cover').dimmer('show'); //dimmer aç
            /* $('#cekilisSonrasiSonuc div').html("Sonuç Bekleniyor").show(); */ //dimmerde loading kısmı
            hediyeCekilisCtrl().then(function (gift) {
                  var user = {
                        id: "user-" + Date.now() + "--" + Date.now().toLocaleString(),
                        name: musteriName,
                        giftId: gift.id,
                        date: new Date(),
                  }
                  content_data.pastUsage.push(user);
                  var openinBox = document.getElementById("present");
                  contentDataSave();
                  setTimeout(function () {
                        $('#cover').dimmer('hide');
                        $('#cekilisSonrasiSonuc div h2').html(gift.name);
                        $('#cekilisSonrasiSonuc span').html('<img src="' + gift.imageUrl + '" />');
                        $('#cekilisSonrasiSonuc div h1').html(musteriName);
                        /* $('#cekilisSonrasiSonuc div').hide();
                        $('#cover').dimmer('show'); */
                        openinBox.classList.toggle("open");
                        var beklemeSuresi = content_data.appSettings.appCekilisSonrasiBekleme;
                        setTimeout(function () {
                              contentDataGet().then(function (res) {
                                    content_data = res;
                                    pastUsageRender();
                                    if (beklemeSuresi > 1) {
                                          openinBox.classList.toggle("open");
                                    }
                                    /* $('#cover').dimmer('hide'); */
                              });
                        }, beklemeSuresi * 1000);
                  }, 2000);
            });
      } else alert("Lütfen isim belirtiniz");
}


$('#btnUsageReset').click(function () {
      var tf = confirm("Sıfırlamak istediğinize eminmisiniz, Tüm geçmiş kullanım kayıtları silinecektir");
      if (tf) {
            content_data.pastUsage = [];
            contentDataSave();
            yenileSayfa();
      } else {
            console.log(tf);
      }
});

$('#btnPastUsageModal').click(function () {
      $('#pastUsageBoxModal').modal('show').modal({
            onApprove: function () { return false }
      });
})

$('#btnQuit').click(function () {
      remote.getCurrentWindow().close(); //çıkış butonu
})
//jquery end

function giftsRender() {
      $('#gift-list').html("");
      var gifts = content_data.gifts;
      for (let i = 0; i < gifts.length; i++) {
            const gift = gifts[i];
            if (gift.name) {
                  $("#gift-list").append(
                        '<div class="item gift-box" id="' + gift.id + '">'
                        + '<div class="content">'
                        + '<div class="header">' + gift.name + '</div>'
                        + '</div>'
                        + '</div>'
                  )
            }
      }
      giftBoxClickLoad();
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
                        + '<div class="header">' + usage.name + '</div>' + selectGiftName
                        + '<small style="margin-left:5px;">' + new Date(usage.date).toLocaleDateString() + '</small>'
                        + '</div></div>'
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



/**
 * /////////////////////////////////////////////
 * OPENİNG BOX
 * /////////////////////////////////////////////
 * /////////////////////////////////////////////
 **/

var toText = 'Başla!';
var nametag = document.getElementById("nametag");
var present = document.getElementById("present");

function initOpeningBox() {
      var isBoxOpen = false;
      present.addEventListener("click", function (e) {
            if (isBoxOpen) {
                  isBoxOpen = false;
                  present.classList.toggle("open");
            } else {
                  isBoxOpen = true;
                  cekilisModalAc();
            }
      }, false);
      nametag.innerText = toText;
}
initOpeningBox();
