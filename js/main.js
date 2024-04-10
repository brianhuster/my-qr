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

window.onload = async function() {
    handleHashChange();
    if (!QrScanner.hasCamera()) {
        alert('Trình duyệt của bạn không hỗ trợ quét mã QR qua camera');
    }
}
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
                console.log(button.classList);
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
        var text=`WIFI:T:${security};S:${ssid};P:${pass};H:${hidden};`;
        var correction=document.getElementById("wifi_correction").value;
        createQrWithText(text, correction);
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
    var selectBox = document.getElementById('banks_list');
    for(var i = 0; i < list.length; i++){
        var option = document.createElement('option');
        option.value = list[i].shortName;
        selectBox.appendChild(option);
    }
} 

const camera = document.getElementById('camera');
const qrScanner = new QrScanner(
    camera,
    result => updateQrResult(result.data),
    {   
        maxScansPerSecond: 5,
        highlightScanRegion:true,
        highlightCodeOutline:true,
        returnDetailedScanResult:true,
    }
);
qrScanner.setInversionMode('both');
async function startScan() {
    QrScanner.listCameras().then(cameras => {
        cameras.forEach(camera => {
            console.log(camera);
        });
    })
    try {
        await qrScanner.start();
        camera.style.display = 'block';
        hide('scan_button');
        display('stop_scan');
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
    if (mediaStream instanceof MediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => {
            track.stop();
        });
        camera.srcObject = null;
    }
    camera.style.display = 'none';
    hide('stop_scan');
    display('scan_button');
}

document.getElementById('input_img').addEventListener('change', function() {
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
    var output = document.getElementById('result');
    if (result=="") result="Không tìm thấy mã QR";
    else result=`Kết quả quét QR : ${handle_result(result)}`;
    output.innerHTML = result;
    output.style.display = 'block';
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
        var wifiInfo = str.slice(5, -1); // Remove "WIFI:" prefix and ";" suffix
        var fields = wifiInfo.split(/;(T|P|H|S):/); // Split on field separators
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