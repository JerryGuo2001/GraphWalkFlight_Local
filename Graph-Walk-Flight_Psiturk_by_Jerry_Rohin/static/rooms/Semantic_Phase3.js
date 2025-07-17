let semanticHTML =
    "<div id='semanticInstructions' style='display:none'><br><p>For each location, click and drag each city image onto a map. The image will convert to a point so you can precisely place the point onto the map provided. When you have placed all locations onto the map, you can finish the experiment. We strongly encourage you to make your best guess even if you are unsure of where the city is located, but there is a box at the bottom of the screen if you have no guess for any of the cities.</p>" +
    "<div id='cityMapWrapper' style='display: none;'>" +
    "<div id='semanticMain'><div id='cityList' style='width: 1300px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa;'>" +
    [...Array(13)].map((_, i) => {
    const id = i + 1 < 10 ? `semantic0${i + 1}` : `semantic${i + 1}`;
    const city = [
        "Aliance", "Boulder", "Cornwall", "Custer", "DelawareCity", "Medora", "Newport",
        "ParkCity", "Racine", "Sitka", "WestPalmBeach", "Yukon", "Yukon"
    ][i];
    return `<img id='${id}' src='../static/images/${city}.png' alt='${city}' width='100' height='100' draggable='true' ondragstart='event.dataTransfer.setData("text/plain", event.target.id)'>`;
    }).join("") +
    "</div>" +  // closes #cityList
    "<div id='semanticZone' style='width: 1300px; height: 650px; margin: 0 auto; position: relative; bottom: 10%; border: 1px solid #aaaaaa; background: url(\"../static/images/blankUSmap.png\") no-repeat center center; background-size: contain;' ondrop='dropSemanticEvent(event)' ondragover='allowSemanticDrop(event)'>" +
    "<div id='cityOverlay' style='width: 1300px; height: 650px; margin: 0 auto; position: relative;'></div>" +
    "</div></div></div>" +
    "<button id='confirmsemantic' style='display: none;margin: 0 auto;padding: 10px 20px;background-color: #4CAF50;color: black;border: none;border-radius: 8px;font-size: 16px;cursor: pointer;box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);transition: background-color 0.3s ease;'>Submit</button>";

let semanticImagePositions = {};  // Global store
let unknownImages = new Set();




function initiatesemanticMap() {
    
    semanticHTML =
        // Submit button (very top)
        "<button id='confirmsemantic' style='display: none; margin: 30px auto; padding: 10px 20px; background-color: #4CAF50; color: black; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s ease;'>Submit</button>" +

    "<div id='semanticWrapper'>" +
  
      // Instructions block
      "<div id='semanticInstructions' style='display: none; margin: 20px auto; max-width: 900px; text-align: center;'>" +
        "<p>Drag the city object towards what you think it belonged to on this US map. When finished, the submit button will appear at the bottom.</p>" +
      "</div>" +
  
      "<div id='cityMapWrapper' style='display: none;'>" +
  
        "<div id='semanticMain' style='display: flex; flex-direction: column; align-items: center;'>" +
  
          // City list (top)
          "<div id='cityList' style='width: 1000px; display: flex; flex-wrap: wrap; border: 1px solid #aaaaaa; padding: 10px; gap: 10px; margin-bottom: 20px;'></div>" +
  
          // Map drop zone (middle)
          "<div id='semanticZone' style='width: 1300px; height: 650px; margin: 0 auto; position: relative; border: 1px solid #aaaaaa; background: url(\"../static/images/blankUSmap.png\") no-repeat center center; background-size: contain;' ondrop='dropSemanticEvent(event)' ondragover='allowSemanticDrop(event)'>" +
            "<div id='cityOverlay' style='width: 1300px; height: 650px; margin: 0 auto; position: relative;'></div>" +
          "</div>" +
  
  
        "</div>" +  // close semanticMain
  
      "</div>" +  // close cityMapWrapper
        // Unknown zone (bottom)
        "<div id='unknownZone' style='width: 1000px; display: flex; flex-wrap: wrap; border: 1px dashed #aaa; background-color: #f9f9f9; padding: 10px; gap: 10px; margin: 20px auto 10px auto;'>" +
        "<div style='width: 100%; text-align: center; font-weight: bold; font-size: 14px;'>No Idea <br>Drop Here</div>" +
        "</div>" +
  
    "</div>";  // close semanticWrapper
  

    let cityNames = [];

    for (i=0;i<generated_stimuli.length;i++){
        cityNames.push(generated_stimuli[i]['label'])
    }
    let droppedImages = new Set();
    let wrapper = document.getElementById('semanticWrapper');
    if (wrapper) wrapper.remove();  // Remove old if exists
    
    wrapper = document.createElement('div');
    wrapper.id = 'semanticWrapper';
    wrapper.innerHTML = semanticHTML;
    document.body.appendChild(wrapper);

    
    document.getElementById('unknownZone').addEventListener('dragover', ev => ev.preventDefault());

    document.getElementById('unknownZone').addEventListener('drop', function (ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    const city = ev.dataTransfer.getData("text/city");
    const img = document.getElementById(id);
    if (!img) return;

    img.remove();

    const label = document.createElement('div');
    label.textContent = city;
    label.style.fontSize = '12px';
    label.style.padding = '4px 8px';
    label.style.border = '1px solid #ccc';
    label.style.borderRadius = '4px';
    label.style.background = '#f1f1f1';

    document.getElementById('unknownZone').appendChild(label);
    droppedImages.add(id);
    unknownImages.add(city);

    if (droppedImages.size === 13) {
        activateSemanticSubmitButton();
    }
    });


    // Add drop event for "No Idea" box
    document.getElementById('unknownZone').addEventListener('drop', function (ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    const city = ev.dataTransfer.getData("text/city");
    const img = document.getElementById(id);
    if (!img) return;

    img.remove(); // Remove from original list

    const label = document.createElement('div');
    label.textContent = city;
    label.style.fontSize = '12px';
    label.style.padding = '4px 8px';
    label.style.border = '1px solid #ccc';
    label.style.borderRadius = '4px';
    label.style.background = '#f1f1f1';

    document.getElementById('unknownZone').appendChild(label);
    droppedImages.add(id);
    unknownImages.add(city);

    if (droppedImages.size === 13) {
        activateSemanticSubmitButton();
    }
    });

    document.getElementById('semanticInstructions').style.display = 'block';
    const startBtn = document.getElementById("launchMap");
    if (startBtn) startBtn.style.display = "none";
    document.getElementById("cityMapWrapper").style.display = "block";

    const cityListContainer = document.getElementById('cityList');
    cityListContainer.innerHTML = '';

    cityNames.forEach((city, i) => {
        const id = i + 1 < 10 ? `semantic0${i + 1}` : `semantic${i + 1}`;
    
        const img = document.createElement('img');
        img.id = id;
        img.src = generated_stimuli[i]['stimulus'];
        img.alt = city;
        img.draggable = true;
        img.style.width = '80px';
        img.style.height = '100px';
        img.style.margin = '8px';
    
        img.addEventListener('dragstart', function (ev) {
            ev.dataTransfer.setData("text/plain", id);
            ev.dataTransfer.setData("text/city", city); // store city name too
        });
    
        cityListContainer.appendChild(img);
    });

    window.allowSemanticDrop = function (ev) {
        ev.preventDefault();
    };

    window.dropSemanticEvent = function (ev) {
        ev.preventDefault();
        const id = ev.dataTransfer.getData("text/plain");
        let city = ev.dataTransfer.getData("text/city");
        if (!city && document.getElementById(id)) {
            city = document.getElementById(id).dataset.city;
        }
        const original = document.getElementById(id);
        const dropZone = document.getElementById("semanticZone");
    
        if (original && dropZone) {
            // Remove the original image
            original.remove();
    
            // Create dot-wrapper in place of image
            const dotWrapper = document.createElement('div');
            dotWrapper.dataset.city = city; // <-- Store city name on the element
            dotWrapper.id = id;
            dotWrapper.style.width = '80px';
            dotWrapper.style.height = '80px';
            dotWrapper.style.position = 'absolute';
            dotWrapper.style.cursor = 'grab';
    
            const label = document.createElement('div');
            label.textContent = city;
            label.style.textAlign = 'center';
            label.style.fontWeight = 'bold';
            label.style.fontSize = '12px';
    
            const dot = document.createElement('div');
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.backgroundColor = 'black';
            dot.style.borderRadius = '50%';
            dot.style.margin = '0 auto';
    
            match = generated_stimuli.find(obj => obj.label === city);
            const preview = document.createElement('img');
            preview.src = match.stimulus;
            preview.alt = city;
            preview.style.position = 'absolute';
            preview.style.width = '80px';
            preview.style.height = '100px';
            preview.style.left = '110%';
            preview.style.top = '50%';
            preview.style.transform = 'translateY(-50%)';
            preview.style.display = 'none';
            preview.style.border = '1px solid #333';
            preview.style.background = '#fff';
            preview.style.zIndex = '10';
    
            dotWrapper.appendChild(label);
            dotWrapper.appendChild(dot);
            dotWrapper.appendChild(preview);
    
            // Hover events for image preview
            dotWrapper.addEventListener('mouseenter', () => preview.style.display = 'block');
            dotWrapper.addEventListener('mouseleave', () => preview.style.display = 'none');
    
            // Enable dragging after drop
            dotWrapper.draggable = true;
            dotWrapper.addEventListener('dragstart', function (ev) {
                ev.dataTransfer.setData("text/plain", dotWrapper.id);
                ev.dataTransfer.setData("text/city", dotWrapper.dataset.city); // <-- Make sure this is set again
            });
    
            // Position dotWrapper where dropped
            const dropRect = dropZone.getBoundingClientRect();
            const dotWidth = 80;
            const dotHeight = 80;
            let x = ev.clientX - dropRect.left - dotWidth / 2;
            let y = ev.clientY - dropRect.top - dotHeight / 2;
            x = Math.max(0, Math.min(x, dropRect.width - dotWidth));
            y = Math.max(0, Math.min(y, dropRect.height - dotHeight));
            dotWrapper.style.left = `${x}px`;
            dotWrapper.style.top = `${y}px`;
    
            dropZone.appendChild(dotWrapper);
            droppedImages.add(id);
    
            if (droppedImages.size === 13) {
                activateSemanticSubmitButton();
            }
        }
    };
}

let unknowncity=[]
function activateSemanticSubmitButton() {
    const submitBtn = document.getElementById('confirmsemantic');
    if (!submitBtn) return;

    submitBtn.style.display = 'block';

    submitBtn.addEventListener('click', function () {
        semanticImagePositions = {}; // Reset before storing new data

        for (let i = 1; i <= 13; i++) {
            const imgID = i < 10 ? `semantic0${i}` : `semantic${i}`;
            const img = document.getElementById(imgID);

            if (img && img.parentElement.id === 'semanticZone') {
                const left = parseFloat(img.style.left) || 0;
                const top = parseFloat(img.style.top) || 0;
                semanticImagePositions[imgID] = { x: left, y: top };
            }
        }

        const semanticWrapper = document.getElementById('semanticWrapper');
        if (semanticWrapper) {
            semanticWrapper.remove();
        }
        unknowncity = Array.from(unknownImages); // list of city names

        jsPsych.finishTrial(); // This ends the trial
    });
}
var match = []