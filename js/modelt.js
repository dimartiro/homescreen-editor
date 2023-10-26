var Caman = require('caman');

const PREVIEW_HEIGHT = 240;
const PREVIEW_WIDTH = 240;

const OUTPUT_HEIGHT = 240;
const OUTPUT_WIDTH = 240;

var dataUrl = "";
var sharpen = 0;
var URL = window.URL || window.webkitURL;

$(function () {

  'use strict';



  // Demo
  // ---------------------------------------------------------------------------

    var $image = $('.img-container > img');

    var options = {
        aspectRatio: 1,
    //    preview: '.img-preview',
        crop: function(e) {
            setTimeout(function(){
                crop($image)
            }, 0);
        },
        strict: false
    };

    $image.cropper(options)
    .cropper('setDragMode', "move");

    // Import image
    var $inputImage = $('#inputImage');
    var blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files;
        var file;

        if (!$image.data('cropper')) {
          return;
        }

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);
            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
              $image.cropper('setDragMode', "move")
            })
            .cropper('reset')
            .cropper('replace', blobURL)

            $inputImage.val('');
            $("#rotate").slider("setValue", 0);
          } else {
            $body.tooltip('Please choose an image file.', 'warning');
          }
        }
      });
    } else {
      $inputImage.prop('disabled', true).parent().addClass('disabled');
    }

    $("#urlUpload").click(function(){
        var url = $("#url").val();
        convertToBlob(url).then(function(str){
            $("#url").val("");
            $image.one('built.cropper', function () {
              $image.cropper('setDragMode', "move")
            })
            .cropper('reset')
            .cropper('replace', str)
            .cropper('setDragMode', "move")

            $("#rotate").slider("setValue", 0);
        });
    });    

    $("#download").click(function(){
        var link = document.createElement("a");
        link.download = "homescreen.jpg";
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });


    $("#rotate").slider()
    .slider('on', 'change', function(arg) {
        var diff = arg.oldValue - arg.newValue;
        $image.cropper('rotate', -diff);
    })

    $('#blackBg').change(function() {
        blackBg = $(this).is(":checked");
        setTimeout(function() {
            crop($image)
        }, 0);
    })
    $('#shading').change(function() {
        shading = $(this).is(":checked");
        setTimeout(function() {
            crop($image)
        }, 0);
    })

    $('#inverted').change(function() {
        invert = $(this).is(":checked");
        setTimeout(function() {
            crop($image)
        }, 0);
    })
});

function convertToBlob(url) {

    var img = new Image();

    return new Promise(function(resolve) {
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/jpeg");
            canvas.remove();
            resolve(dataURL);
        };
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = "http://crossorigin.me/" + url;
    });
}

function cropCanvas(canvas) {
    var croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = PREVIEW_WIDTH;
    croppedCanvas.height = PREVIEW_HEIGHT;
    var sourceX = 2;
    var sourceY = 2;
    var sourceWidth = PREVIEW_WIDTH;
    var sourceHeight = PREVIEW_HEIGHT;
    var destWidth = sourceWidth;
    var destHeight = sourceHeight;
    var destX = 0;
    var destY = 0;
    var context = croppedCanvas.getContext('2d');
    context.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

    return croppedCanvas;

}

function camanChanges($image) {
    var canvas = $image.cropper('getCroppedCanvas', {
        width: PREVIEW_WIDTH+4,
        height: PREVIEW_HEIGHT+4
    });

    if (sharpen == 0) {
        return Promise.resolve(canvas);
    }
    return Caman.fromCanvas(canvas).then( function(caman) {
        return caman.pipeline(function() {
            this.sharpen(sharpen);
        })
    }).then(function() {
        return canvas;
    });  
}

function crop($image) {
    camanChanges($image).then(function(canvas) { 
        transformImage(cropCanvas(canvas))
    });
}

function transformImage(canvas) {
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, 240, 240);

    ctx.putImageData(imageData, 0, 0, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    dataUrl = canvas.toDataURL("image/jpeg");
    var bwImage = $("#preview-bw")[0];
    bwImage.onload = function(){
        URL.revokeObjectURL(dataUrl)        
    }
    bwImage.src = dataUrl;
    canvas.remove();
}
