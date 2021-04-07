init();
function init() {
    var fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');

    var selectDialogueLink = document.createElement('a');
    selectDialogueLink.setAttribute('href', '');
    selectDialogueLink.innerText = "Select File";

    selectDialogueLink.onclick = function () {
        fileSelector.click();
        return false;
    }

    document.body.appendChild(selectDialogueLink);
}

function test() {
    
    var things = localStorage.getItem("Save State");
    console.log(JSON.stringify(things));
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load(things, function ( obj ) {
    scene.add(obj);
    });
}