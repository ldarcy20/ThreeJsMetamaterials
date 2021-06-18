function tab(id) {
  if (id == 'menuCtrlTab1') {
    toggle('menuCtrlTab1', id);
    toggle('menuCtrlTab2', id);
    toggle('menuCtrlTab3', id);
    toggle('menuCtrlTab4', id);
    show('menuCtrlForm1');
    hide('menuCtrlForm2');
    hide('menuCtrlForm3');
    hide('menuCtrlForm4');
  }
  else if (id == 'menuCtrlTab2') {
    toggle('menuCtrlTab1', id);
    toggle('menuCtrlTab2', id);
    toggle('menuCtrlTab3', id);
    toggle('menuCtrlTab4', id);
    hide('menuCtrlForm1');
    show('menuCtrlForm2');
    hide('menuCtrlForm3');
    hide('menuCtrlForm4');
  }
  else if (id == 'menuCtrlTab3') {
    toggle('menuCtrlTab1', id);
    toggle('menuCtrlTab2', id);
    toggle('menuCtrlTab3', id);
    toggle('menuCtrlTab4', id);
    hide('menuCtrlForm1');
    hide('menuCtrlForm2');
    show('menuCtrlForm3');
    hide('menuCtrlForm4');
  }
  else if (id == 'menuCtrlTab4') {
    toggle('menuCtrlTab1', id);
    toggle('menuCtrlTab2', id);
    toggle('menuCtrlTab3', id);
    toggle('menuCtrlTab4', id);
    hide('menuCtrlForm1');
    hide('menuCtrlForm2');
    hide('menuCtrlForm3');
    show('menuCtrlForm4');
  }
  else if (id == 'menuCtrlTabHide') {
    hide('menuCtrlTab1');
    hide('menuCtrlTab2');
    hide('menuCtrlTab3');
    hide('menuCtrlTab4');
    hide('menuCtrlFormDiv1');
    hide('menuCtrlFormDiv2');
    hide('menuCtrlFormDiv3');
    hide('menuCtrlFormDiv4');
    hide('menuCtrlTabHide');
    show('menuCtrlTabShow');
  }
  else if (id == 'menuCtrlTabShow') {
    show('menuCtrlTab1');
    show('menuCtrlTab2');
    show('menuCtrlTab3');
    show('menuCtrlTab4');
    show('menuCtrlFormDiv1');
    show('menuCtrlFormDiv2');
    show('menuCtrlFormDiv3');
    show('menuCtrlFormDiv4');
    hide('menuCtrlTabShow');
    show('menuCtrlTabHide');
  }
  else {
    console.log("Huh");
  }
}

function toggle(id, activateId) {
  if (activated(id)) {
    deactivate(id);
  }
  else {
    if(id == activateId) {
      activate(id);
    }
  }
}

function hide(id) {
  docAddClass(id, 'hidden');
}
function show(id) {
  docRemoveClass(id, 'hidden');
}

function activate(id) {
  docRemoveClass(id, 'inActive');
  docAddClass(id, 'active');
  docAddClass(id.concat("arrow"), 'arrowTransform');
}
function deactivate(id) {
  docRemoveClass(id, 'active');
  docAddClass(id, 'inActive');
  docRemoveClass(id.concat("arrow"), 'arrowTransform');
}

function activated(id) {
  var e = docGet(id);
  if (e.className.search('active') == -1) {
    return false;
  }
  return true;
}



function docGet(id) {
  return document.getElementById(id);
}
function docAddClass(id, classToAdd) {
  var e = docGet(id);
  if (e.className.length <= 0) {
    e.className = classToAdd;
  }
  else {
    if (e.className.search(classToAdd) == -1) {
      e.className = e.className + ' ' + classToAdd;
    }
  }
}

function docRemoveClass(id, classToRem) {
  var e = docGet(id);
  if (e.className.length > 0) {
    if (e.className.search(classToRem) != -1) {
      e.className = e.className.replace(classToRem, "");
    }
  }
}