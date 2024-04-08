function handleHashChange() {
    var hash = window.location.hash.substr(1);
    if (!hash) {
        hash = 'text';
        window.location.hash = hash;
    }
    else if (hash == 'bank') {
        getAllBanks();
    }
    console.log("add hash 'text' to url");
    chooseMode(hash);
}

let lastFocusedButton = null;

window.onload = function() {
    if (!QrScanner.hasCamera()) hide('scanButton');
    handleHashChange();
};

window.addEventListener('hashchange', function() {
    handleHashChange();
});

function display(ID)
{
    var element = document.getElementById(ID);
    if (element.style.display == 'none') {
        element.style.display = 'block';
    }
}
function hide(ID)
{   
    var element = document.getElementById(ID);
    if (element.style.display !== 'none') {
        element.style.display = 'none';
    }
}

function chooseMode(id){
    hide('result'); hide('download'); 
    if (id!="scanner"){
        hide('scanner');
        display("maker");
        display(id);
        const buttons = document.querySelectorAll('#modes button');
        buttons.forEach(button => {
            if (button.id === id + '_button') {
                button.classList.add('checked');
                button.classList.remove('unchecked');
            } else {
                button.classList.add('unchecked');
                button.classList.remove('checked');
            }
        });
        const forms = document.querySelectorAll('#input div');
        forms.forEach(form => {
            if (form.id === id) {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        });
        document.title = 'Tạo mã QR miễn phí'
    }
    else{
        display("scanner");
        hide("maker");
        document.title = 'Quét mã QR'
    }
}

function createQrWithText(content, correction){
    if (correction=="L") correctLevel=QRCode.CorrectLevel.L;
    else if (correction=="M") correctLevel=QRCode.CorrectLevel.M;
    else if (correction=="Q") correctLevel=QRCode.CorrectLevel.Q;
    else correctLevel=QRCode.CorrectLevel.H;
    var result = new QRCode("result", {
        text: content,
        width:480,
        height:480,
        colorDark:"#000000",
        colorLight:"#ffffff",
        correctLevel:correctLevel
    });
}
function createQR(option)
{
    display("result");
    var img=document.getElementById("result");
    img.innerHTML='';
    if (option=="text"){
        var content=document.getElementById("input_text").value;
        var correction=document.getElementById("correction").value;
        createQrWithText(content, correction);
    }
    else if (option=="bank"){
        var ngan_hang=document.getElementById("ngan_hang").value;
        var STK=document.getElementById("STK").value;
        var hovaten=document.getElementById("hovaten").value;
        var ndcl=document.getElementById("ndcl").value;
        var sotien=document.getElementById("sotien").value;
        var link=`https://img.vietqr.io/image/${ngan_hang}-${STK}-print.png?amount=${sotien}&addInfo=${ndcl}&accountName=${hovaten}`;
        console.log(link);
        img.innerHTML=`<img src="${link}" alt="QR code">`;
        console.log(img);
    }
    else if (option=="wifi"){
        var ssid=document.getElementById("ssid").value;
        var pass=document.getElementById("pass").value;
        var security=document.getElementById("security").value;
        var hidden=document.getElementById("hidden").checked;
        var text=`WIFI:S:${ssid};T:${security};P:${pass};H:${hidden};`;
        var correction=document.getElementById("wifi_correction").value;
        createQrWithText(content, correction);
    }
    display("result");
    display("download");
    img.querySelector('img').onload = function() {
        document.getElementById("download").scrollIntoView({behavior: "smooth"});
    }
}
function downloadQR()
{
    var canvas = document.getElementById("result").querySelector('canvas');
    var img = canvas.toDataURL("image/png");
    var a = document.createElement('a');
    a.href = img;
    a.download = 'QRcode.png';
    a.click();
}

async function getJSON(link){
    try {
        const response = await fetch(link);
        if (response.status !== 200) {
            alert("Error");
        } else {
            const x = await response.json();
            return x;
        }
    }
    catch (error) {
        throw new Error("Cannot connect to " + link);
        alert("Cannot connect to "+link);
    }
}   
async function getAllBanks(){
    var response= await getJSON('https://api.vietqr.io/v2/banks');
    list=response.data;
    console.log(list);
    list.sort((a, b) => a.shortName.localeCompare(b.shortName));
    var selectBox = document.getElementById('ngan_hang');
    for(var i = 0; i < list.length; i++){
        var option = list[i].shortName;
        selectBox.options.add(new Option(option, option, false));
    }
} 

function startScan() {
    QrScanner.listCameras().then(cameras => {
        cameras.forEach(camera => {
            console.log(camera);
        });
    })
    var video = document.getElementById('camera');
    video.style.display = 'block';

    const qrScanner = new QrScanner(
        video,
        result => alert('decoded qr code:', result),
        {   
            maxScansPerSecond: 10,
            highlightScanRegion:true,
            highlightCodeOutline:true,
            returnDetailedScanResult:true,
        }
    );
    qrScanner.setInversionMode('both');

    qrScanner.start();
    var button = document.getElementById('scan_button');
    button.classList.add('checked');
    button.classList.remove('unchecked');
    button.innerHTML="Tắt camera";

    function stopScan(){
        qrScanner.stop();
        video.style.display = 'none';
        hide('switchCamera');
        button.classList.add('unchecked');
        button.classList.remove('checked');
        button.innerHTML="Bắt đầu quét qua camera";
        button.onclick=function(){startScan()}
    }
    button.onclick=function(){
        stopScan();
    }
    window.addEventListener('hashchange', function() {
        stopScan();
    }); 
}

document.getElementById('input_img').addEventListener('change', function() {
    var file = this.files[0]; 
    var reader = new FileReader();

    reader.onloadend = function() {
        var uploaded_img = document.createElement("img");
        uploaded_img.src = reader.result;
        QrScanner.scanImage(uploaded_img)
        .then(result => updateQrResult("Mã QR có nội dung : "+result))
        .catch(error => updateQrResult('Không tìm thấy QR'));
    }
    if (file) {
        reader.readAsDataURL(file); 
    }
});

function updateQrResult(result){
    var output = document.getElementById('result');
    output.style.display = 'block';
    output.innerHTML = result;
    output.scrollIntoView({ behavior: 'smooth' });
}