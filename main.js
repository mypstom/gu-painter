

//先宣告變數給大家使用
let canvas;
let ctx;
let oldImg;
let drawMode = false;
let toolMode = "pen";
let mouseX, mouseY;
let isMoving = false;

//拖曳圖形的起點
let oriX, oriY;


//儲存用的陣列
let imgHistoryIndex = 0;
let imgHistory = [];
let shapeList = [];

//各種狀態預設值
let fillColor = "#FF0000";
let borderColor = "#FF0000";
let lineWidth = 3;
let lineCap = "round";
let lineJoin = "round";
let bgColor = "#D7C4BB";


//網頁都載入時候執行
$(window).ready(function(){
    console.log("Author: JienHuaGoo 2019/04/22 V1.0");
    //使用 Jquery 取得 canvas 元素
    canvas = $("#canvas").get(0);
    //從 canvas 取得渲染物件(可以當作畫筆)
    ctx = canvas.getContext('2d');

    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //先記錄原始畫面一次
    recordNewCanvas();

    $("#canvas").on("mousemove", onMouseMove);
    $("#canvas").on("mousedown", onMouseDown);
    $("#canvas").on("mouseup", onMouseUp);

    //給滑鼠游標使用
    $("html").on("mousemove", onWindowMouseMove);

    //設定工具列的功能
    toolSetting();
    stylePanelSetting();
    mainToolsSetting();
});

function onMouseDown(event) {
    getCurrentMousePosition(event);
    $(".cursorImg").addClass("active");

    if(toolMode == "pen" || toolMode == "eraser" || toolMode == "writingPen" || toolMode == "star" || toolMode == "brush"){
        
        //初始化現在的基礎樣式
        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;
        ctx.lineJoin = lineJoin;
        ctx.strokeStyle = borderColor;

        if(toolMode == "eraser"){
            //橡皮擦填入背景色
            ctx.strokeStyle = bgColor;
        }

        if(toolMode == "writingPen"){
            //讓他會有沾水的感覺
            ctx.shadowBlur = 5;
            //加上後面數字是讓 #FF000005 加上透明度數值
            // ctx.strokeStyle = borderColor + "05";
            ctx.shadowColor = borderColor + "04";

        }else if(toolMode == "brush"){
            //刷子加入透明感
            ctx.shadowBlur = 0;
            ctx.strokeStyle = borderColor + "05";
        }else if(toolMode == "pen"){
            ctx.shadowBlur = 0;
            
        }
        
        
        if(toolMode == "star"){
            ctx.shadowBlur = 0;
            drawStar(mouseX, mouseY);
        }else{
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
            
        drawMode = true;

    }else if(toolMode == "circle" || toolMode == "rect" || toolMode == "tri"){
        oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
        oriX = mouseX;
        oriY = mouseY;
        drawMode = true;
    }
}

function onMouseMove(event) {
    
    getCurrentMousePosition(event);
    if(drawMode){
        if(toolMode == "pen" || toolMode == "eraser" || toolMode == "writingPen" || toolMode == "star" || toolMode == "brush"){
            
            if(toolMode == "star"){
                drawStar(mouseX, mouseY);
            }else{
                //筆以及橡皮擦在移動時，不斷畫線
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }
            
        }else if(toolMode == "circle" || toolMode == "rect" || toolMode == "tri"){
            //如果是要拖拉變化大小的形狀，必須要不斷清除畫布，重新繪製，就可以有拖拉變形的效果
            drawShapeByToolMode();
        }
    }
}

function onMouseUp(event) {
    $(".cursorImg").removeClass("active");
    if(drawMode && (toolMode == "circle" || toolMode == "rect" || toolMode == "tri")){
        getCurrentMousePosition(event);
        //放開時候，直接畫出形狀的結果
        drawShapeByToolMode();
    }
    recordNewCanvas();
    drawMode = false;
}

function drawShapeByToolMode(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(oldImg, 0, 0);
    if(toolMode == "circle"){
        drawCircle(oriX, oriY, dist(oriX,oriY,mouseX,mouseY), fillColor);
    }else if(toolMode == "rect"){
        drawRect(oriX, oriY, mouseX-oriX, mouseY-oriY, fillColor);
    }else if(toolMode == "tri"){
        drawTri(oriX, oriY, mouseX-oriX, -(mouseY-oriY), fillColor);
    }
}

function recordNewCanvas(){
    //紀錄新的畫面
    oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if(imgHistoryIndex>imgHistory.length){
        imgHistory.push(oldImg);
    }else{
        imgHistory[imgHistoryIndex] = oldImg;
    }
    imgHistoryIndex++;
}

function getCurrentMousePosition(event){
    mouseX = event.clientX - $("#canvas").offset().left;
    mouseY = event.clientY - $("#canvas").offset().top;
}

function onWindowMouseMove(event){
    $(".cursorImg img").attr("src", "./image/"+toolMode+".png");
    $(".cursorImg").css("left", event.clientX - 15 + "px");
    $(".cursorImg").css("top", event.clientY - 20 + "px");
}

function toolSetting(){

    $(".pen").on("click", function(){
        toolMode = "pen";
        updateToolBox( $(this) );
    });

    $(".writingPen").on("click", function(){
        toolMode = "writingPen";
        updateToolBox( $(this) );
    });

    $(".brush").on("click", function(){
        toolMode = "brush";
        updateToolBox( $(this) );
    });

    $(".star").on("click", function(){
        toolMode = "star";
        updateToolBox( $(this) );
    });

    $(".eraser").on("click", function(){
        toolMode = "eraser";
        updateToolBox( $(this) );
    });

    $(".circle").on("click", function(){
        toolMode = "circle";
        updateToolBox( $(this) );
    });

    $(".rect").on("click", function(){
        toolMode = "rect";
        updateToolBox( $(this) );
    });

    $(".tri").on("click", function(){
        console.log("TY");
        toolMode = "tri";
        updateToolBox( $(this) );
    });

    function updateToolBox(targetObj){
        $(".toolBox div").removeClass("active");
        targetObj.addClass("active");
    }

}


function stylePanelSetting(){
    
    $( "#width-slider" ).slider({
        orientation: "horizontal",
        range: "min",
        max: 40,
        min: 1,
        value: 3,
        slide: watchLineWidth,
        change: watchLineWidth
    });

    $(".roundLine").on("click", function(){
        lineCap = "round";
        lineJoin = "round";
    });

    $(".hardLine").on("click", function(){
        lineCap = "butt";
        lineJoin = "bevel";
    });
    
    var fillPicker = new CP($(".fiil-color").get(0));
    fillPicker.on("change", function(color) {
        let targetColor = "#" + color;
        fillColor = targetColor;
        $(".fiil-color").css("background-color", targetColor)
    });

    
    var linePicker = new CP($(".show-line").get(0));
    linePicker.on("change", function(color) {
        let targetColor = "#" + color;
        borderColor = targetColor;
        $(".inner-line").css("background-color", targetColor)
    });   



}

function watchLineWidth() {
    let _w = $( "#width-slider" ).slider( "value" );
    lineWidth = _w;
    $(".inner-line").css("height", lineWidth+'px');
    //   hex = hexFromRGB( red, green, blue );
}


function mainToolsSetting(){
    $(".save").on("click", function(){
        let link = document.createElement('a');
        link.download = 'canvas.jpg';
        link.href = $("#canvas").get(0).toDataURL();
        link.click();
    });

    $(".uploadInput").on("change", function(e){
        openImage( $(this).get(0) );
    });

    $(".undo").on("click", undo);
    $(".redo").on("click", redo);
}



//Utils
function openImage(inputElement) {
    var file    = inputElement.files[0];
    var reader  = new FileReader();
  
    reader.addEventListener("load", function () {
        console.log(reader.result)
        //清除所有步驟，讀入新圖片
        imgHistoryIndex = 0;
        imgHistory = [];
        let img = new Image();
        img.onload = function(){
            
            ctx.drawImage(img, 0, 0);
        };
        img.src = reader.result;
    }, false);
  
    if (file) {
      reader.readAsDataURL(file);
    }
}


function drawCircle(x, y, r, color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.fill();
}

function drawRect(x, y, w, h,color){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.rect(x, y, w, h);
    ctx.fill();
}

function drawTri(x, y, w, h, color){
    console.log("TRI!!");
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x, y);
    ctx.lineTo(x-w/2, y-h);
    ctx.lineTo(x+w/2, y-h);
    ctx.lineTo(x, y);
    ctx.fill();
}


function drawStar(x, y) {
    var length = getRandomInt(5, 15);
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.rotate((Math.PI * 1 / 10));
    for (var i = 5; i--;) {
      ctx.lineTo(0, length);
      ctx.translate(0, length);
      ctx.rotate((Math.PI * 2 / 10));
      ctx.lineTo(0, -length);
      ctx.translate(0, -length);
      ctx.rotate(-(Math.PI * 6 / 10));
    }
    ctx.lineTo(0, length);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dist(x1, y1, x2, y2){
    //計算距離用
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


function redo(){
    imgHistoryIndex++;
    if(imgHistoryIndex > imgHistory.length){
        imgHistoryIndex = imgHistory.length;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgHistory[imgHistoryIndex-1], 0, 0);
}

function undo(){
    imgHistoryIndex--;
    if(imgHistoryIndex<1){
        imgHistoryIndex=1;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgHistory[imgHistoryIndex-1], 0, 0);
}