function display(ID)
{
    document.getElementById(ID).style.display = 'block';
}
function hide(ID)
{
    document.getElementById(ID).style.display = 'none';
}
function createQR(option)
{
    var img=document.getElementById("qrcode");
    img.innerHTML='';
    if (option=="text"){
        var content=document.getElementById("input_text").value;
        var qrcode = new QRCode("qrcode", {
            text: content,
            width:480,
            height:480,
            colorDark:"#000000",
            colorLight:"#ffffff",
            correctLevel:QRCode.CorrectLevel.H
        });
        console.log("Successful");
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
    display("qrcode");
    display("download");
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
    var selectBox = document.getElementById('ngan_hang');
    for(var i = 0; i < list.length; i++){
        var option = list[i].shortName;
        selectBox.options.add(new Option(option, option, false));
    }
} 
