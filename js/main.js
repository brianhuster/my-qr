
const text_button = document.getElementById('text_button');
const bank_button = document.getElementById('bank_button');
const wifi_button = document.getElementById('wifi_button');
const textarea = document.getElementById('textarea');
const text_correction = document.getElementById('text_correction');
const ngan_hang = document.getElementById('ngan_hang');
const bank = document.getElementById('bank');
const banks_list = document.getElementById('banks_list');
const STK = document.getElementById('STK');
const hovaten = document.getElementById('hovaten');
const ndck = document.getElementById('ndck');
const sotien = document.getElementById('sotien');
const ssid = document.getElementById('ssid');
const pass = document.getElementById('pass');
const security = document.getElementById('security');
const hidden = document.getElementById('hidden');
const wifi_correction = document.getElementById('wifi_correction');
const scan_button = document.getElementById('scan_button');
const stop_scan = document.getElementById('stop_scan');
const switchCamera = document.getElementById('switchCamera');
const camera = document.getElementById('camera');
const input_img = document.getElementById('input_img');
const output = document.getElementById('output');
const download = document.getElementById('download');
const scanner=document.getElementById('scanner');
const qrScanner = new QrScanner(
    camera,
    result => updateQrResult(result.data),
    {   
        maxScansPerSecond: 5,
        highlightScanRegion:true,
        highlightCodeOutline:true,
        returnDetailedScanResult:true
    }
);
qrScanner.setInversionMode('both');
let gotAllBanks = false;
//Bắt đầu viết các hàm
function handleHashChange() { //hàm xử lý khi có thay đổi đường link
    var hash = window.location.hash.substr(1);
    if (!hash) {
        hash = 'text';
        window.location.hash = hash;
    }
    else if (hash == 'bank' && !gotAllBanks) {
        getAllBanks();
    }
    console.log("add hash 'text' to url");
    chooseMode(hash);
}

window.onload = async function() {
    handleHashChange();
}
window.addEventListener('hashchange', function() {
    handleHashChange();
});

function display(element)
{
    if (element.style.display == 'none') {
        element.style.display = 'block';
    }
}
function hide(element)
{   
    if (element.style.display !== 'none') {
        element.style.display = 'none';
    }
}

function chooseMode(id){
    hide(output); hide(download); 
    if (id!="scanner"){
        hide(scanner);
        display(maker);
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
                display(form);
            } else {
                hide(form);
            }
        });
        document.title = 'Tạo mã QR miễn phí';
    }
    else{
        display(scanner);
        hide(maker);
        document.title = 'Quét mã QR';
    }
}

textarea.addEventListener('input', function() {
    this.style.height = this.scrollHeight + 'px';
});

function createQrWithText(content, correction){
    if (correction=="L") correctLevel=QRCode.CorrectLevel.L;
    else if (correction=="M") correctLevel=QRCode.CorrectLevel.M;
    else if (correction=="Q") correctLevel=QRCode.CorrectLevel.Q;
    else if (correction=="H") correctLevel=QRCode.CorrectLevel.H;
    else correctLevel=QRCode.CorrectLevel.M;
    var output = new QRCode("output", {
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
    display(output);
    output.innerHTML='';
    if (option=="text"){
        createQrWithText(textarea.value, text_correction.value);
    }
    else if (option=="bank"){
        const link=`https://img.vietqr.io/image/${ngan_hang.value}-${STK.value}-print.png?amount=${sotien.value}&addInfo=${ndck.value}&accountName=${hovaten.value}`;
        console.log(link);
        output.innerHTML=`<img src="${link}" alt="QR code">`;
    }
    else if (option=="wifi"){
        var text=`WIFI:S:${ssid.value};P:${pass.value};T:${security.value};H:${hidden.checked};`;
        createQrWithText(text, wifi_correction.value);
    }
    display(output);
    output.querySelector('img').onload = function() {
        display(download);
        download.scrollIntoView({behavior: "smooth"});
    }
}
function downloadQR()
{
    var canvas = output.querySelector('canvas');
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
    }
}   
async function getAllBanks(){
    var response= await getJSON('https://api.vietqr.io/v2/banks');
    list=response.data;
    console.log(list);
    list.sort((a, b) => a.shortName.localeCompare(b.shortName));
    for(var i = 0; i < list.length; i++){
        var option = document.createElement('option');
        option.value = list[i].shortName;
        banks_list.appendChild(option);
    }
    gotAllBanks = true;
} 

async function startScan() {
    try {
        await qrScanner.start();
        hide(scan_button);
        display(stop_scan);
        display(camera);
    }
    catch (error) {
        alert("Không thể mở camera");
        return;
    }
    window.addEventListener('hashchange', function() {
        stopScan();
    }); 
}
async function stopScan(){
    await qrScanner.stop();
    const mediaStream = camera.srcObject;
    console.log('mediaStream:', mediaStream);
    if (mediaStream instanceof MediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => {
            track.stop();
        });
        camera.srcObject = null;
    }
    hide(camera);
    hide(stop_scan);
    display(scan_button);
}

input_img.addEventListener('change', function() {
    var file = this.files[0]; 
    var reader = new FileReader();

    reader.onloadend = function() {
        var uploaded_img = document.createElement("img");
        uploaded_img.src = reader.result;
        QrScanner.scanImage(uploaded_img)
        .then(result => updateQrResult(result))
        .catch(error => updateQrResult(''));
    }
    if (file) {
        reader.readAsDataURL(file); 
    }
});

function updateQrResult(result){
    if (result=="") result="Không tìm thấy mã QR";
    else result=`Kết quả quét QR : ${handle_result(result)}`;
    output.innerHTML = result;
    display(output);
    output.scrollIntoView({ behavior: 'smooth' });
}

function isURL(str){
    var urlRegex = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?'+ // port
        '(\\/[-a-z\\d%_.~+]*)*'+ // path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return urlRegex.test(str);
}

function handle_result(str) {
    if (str.startsWith("WIFI:") && str.endsWith(";")) {
        var wifiInfo = str.slice(5, -1);
        var fields = wifiInfo.split(/;(T|P|H|S):/); 
        var wifi = {
            T: null,
            P: null,
            H: null,
            S: null
        };

        for (var i = 1; i < fields.length; i += 2) {
            wifi[fields[i]] = fields[i + 1];
        }
        if (wifi['S'] === '' ) {
            return `<pre><code>${str}</code></pre>`;
        }
        return `<pre><code>${str}</code></pre>
                <p>Đây có vẻ là một mã QR wifi. Thông tin chi tiết như sau</p>
                <p>Tên đăng nhập : <code>${wifi.S}</code></p>
                <p>Mật khẩu : <code>${wifi.P}</code></p>
                <p>Bảo mật : ${wifi.T}</p>
                <p>Mạng ẩn : ${wifi.H === 'true' ? 'Có' : 'Không'}</p>`;
    } 
    else if (isURL(str)) {
        var url = str;
        if (!/^https?:\/\//i.test(str)) {
            url = 'https://' + str;
        }
        return `<code><a href="${url}" target="_blank">${str}</a></code>`;
    }
    else {
        return `<pre><code>${str}</code></pre>`;
    }
}