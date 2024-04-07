function handleHashChange() {
    var hash = window.location.hash.substr(1);
    if (!hash) {
        hash = 'text';
    }
    else if (hash == 'bank') {
        getAllBanks();
    }
    setTimeout(function() {
        chooseMode(hash + "_button");
    }, 50); 
}
window.onload = function() {
    
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
    const buttons = document.querySelectorAll('#modes button');
    hide('qrcode'); hide('download');
    buttons.forEach(button => {
        button.classList.remove('active');
        str=button.id.replace("button","form");
        hide(str);
    });
    display(id.replace("button","form"));
    window.location.hash = id.replace("_button","");
    document.getElementById(id).classList.add('active');
}

function createQrWithText(content){
    var qrcode = new QRCode("qrcode", {
        text: content,
        width:480,
        height:480,
        colorDark:"#000000",
        colorLight:"#ffffff",
        correctLevel:QRCode.CorrectLevel.L
    });
}
function createQR(option)
{
    var img=document.getElementById("qrcode");
    img.innerHTML='';
    if (option=="text"){
        var content=document.getElementById("input_text").value;
        createQrWithText(content);
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
        var text=`WIFI:S:${ssid};T:${security};P:${pass};H:${hidden};`
        createQrWithText(text);
    }
    display("qrcode");
    display("download");
    img.querySelector('img').onload = function() {
        document.getElementById("download").scrollIntoView({behavior: "smooth"});
    }
}
function downloadQR()
{
    var canvas = document.getElementById("qrcode").querySelector('canvas');
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
