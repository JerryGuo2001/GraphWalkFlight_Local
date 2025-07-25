function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// === CONFIG ===
generated_stimuli = []
let unshuffled_imageList,unshuffled_cityNameList,prefix

let fictionalorreal='real'
if (fictionalorreal=='real'){
  noprefix_imageList=['westpalmbeach.png','newhope.png','boulder.png','peoria.png','gatlinburg.png','shreveport.png','hotsprings.png','carmel.png','huntsville.png','racine.png','leesburg.png','cornwall.png','hanover.png'] // change last one

  unshuffled_imageList = noprefix_imageList.map(filename => {
  prefix = 'US_Cities_List/'
  return prefix + filename;
  });

  unshuffled_cityNameList=['West Palm Beach','New Hope','Boulder','Peoria','Gatlinburg','Shreveport','Hot Springs','Carmel','Huntsville','Racine','Leesburg','Cornwall','Hanover']
}else{
  noprefix_imageList=['westpalmbeach.png','newhope.png','boulder.png','peoria.png','gatlinburg.png','shreveport.png','hotsprings.png','carmel.png','huntsville.png','racine.png','leesburg.png','cornwall.png','hanover.png'] // change last one

  unshuffled_imageList = noprefix_imageList.map(filename => {
  prefix = 'US_Cities_List/';
  return prefix+filename;
  });

  unshuffled_cityNameList=['Riverlyn', 'North Arroya', 'Claywater', 'Orchard Bend', 'Juniper Creek', 'Hawthorne Bluffs', 'Sunmere', 'Hollendale', 'Cedarwyn', 'New Verdan', 'Baymarsh', 'Delaro Park', 'Granton Ridge']
}

let city_arr = [];
for (let i = 0;i<unshuffled_cityNameList.length;i++){
city_arr.push(i)
}
let list_images = []
let cityNameList = []
if (fictionalorreal!='real'){
  shuffle(city_arr)
}
for (let i = 0;i<unshuffled_cityNameList.length;i++){
list_images.push('../static/images/' + unshuffled_imageList[city_arr[i]])
cityNameList.push(unshuffled_cityNameList[city_arr[i]])
}
let imageFiles = list_images
let labels = cityNameList
let image_city_names = list_images.map(path => path.replace("../static/images/", ""));

const prefixOptions = ['', ''];

// === MAIN ===
const zip = new JSZip();
let completed = 0;

imageFiles.forEach((filename, i) => {
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = filename;

img.onload = function() {
    const targetWidth = 550;
    const targetHeight = 550;
    const topPadding = 200;
  
    // Resize canvas to hold label + resized image
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight + topPadding;
  
    const ctx = canvas.getContext('2d');
  
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw label text
    ctx.font = '70px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], canvas.width / 2, 130);
  
    // Draw image resized to 350×350 below the text
    ctx.drawImage(img, 0, topPadding, targetWidth, targetHeight);
  
    // Convert to base64
    const base64 = canvas.toDataURL('image/png');
    generated_stimuli.push({
      stimulus: base64,
      label: labels[i],
      filename: filename
    });
  
    completed++;
    if (completed === imageFiles.length) {
      console.log("All images formatted and loaded!");
    }
  };
});
console.log("test")

