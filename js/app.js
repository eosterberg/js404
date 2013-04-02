/*jslint browser:true */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */

drummachine = (function () {
  "use strict";

  /* ------------ GLOBAL VARIABLES: ------------*/
  var context;
  var soundPads = [];
  var sequencer = {
    beat: 0,
    notes: [],
    isPlaying: false
  };
  var latestPadPushed = 0;
  var tempo = 120;
  var soundSelect; //reference to the sound select dropdown
  var padNum; //reference to the element indicating the latest pad played


  /* ------------ ONLOAD: ------------*/
  document.addEventListener("DOMContentLoaded", function () {
    try {
      context = new webkitAudioContext();
    } catch (e) {
      alert('Web Audio API is not supported in this browser. Get Chrome, Safari or iOS6 Safari to use this app.');
    }

    soundSelect = document.getElementById("soundSelect");
    padNum = document.getElementById("padNum");
    createSequencerElements();
    readSession(getDefaultSession());


    /* --------------------- EVENT LISTENERS: -------------------------*/

    /* ------------ SWITCHING SOUNDS: ------------*/
    document.querySelector("#soundSelect").addEventListener("change", function () {
      this.blur();
      loadPatch(this.value, latestPadPushed);
    }, false);
    /* ------------ PRESSING PLAY/STOP BUTTON: ------------*/
    document.getElementById('play').addEventListener(clickOrTouchDown, function () {
      someOnePressedPlayStopButton();
    }, false);
    /* ------------ TEMPO SWITCH: ------------*/
    document.getElementById("tempo").addEventListener("change", function () {
      setTempoTo(this.value);
    }, false);
    if (desktop) {
      document.querySelector("#toggleKeyBind").addEventListener(clickOrTouchDown, function () {
        showHideKeyBindings(this);
      }, false);
    } else {
      document.querySelector("#toggleKeyBind").style.visibility = 'hidden';
    }
    /* ------------ KEY BINDINGS: ------------*/
    if (desktop) {
      document.addEventListener("keydown", function (e) {
        switch (e.which) {
          case 32:
            someOnePressedPlayStopButton();
            break;
          case 39:
            setTempoTo(++document.getElementById("tempo").value);
            break;
          case 37:
            setTempoTo(--document.getElementById("tempo").value);
            break;
            //keyboard inputs for the sequencer:
          case 49:
            toggleButton(latestPadPushed, 0);
            break;
          case 50:
            toggleButton(latestPadPushed, 1);
            break;
          case 51:
            toggleButton(latestPadPushed, 2);
            break;
          case 52:
            toggleButton(latestPadPushed, 3);
            break;
          case 53:
            toggleButton(latestPadPushed, 4);
            break;
          case 54:
            toggleButton(latestPadPushed, 5);
            break;
          case 55:
            toggleButton(latestPadPushed, 6);
            break;
          case 56:
            toggleButton(latestPadPushed, 7);
            break;
          case 81:
            toggleButton(latestPadPushed, 8);
            break;
          case 87:
            toggleButton(latestPadPushed, 9);
            break;
          case 69:
            toggleButton(latestPadPushed, 10);
            break;
          case 82:
            toggleButton(latestPadPushed, 11);
            break;
          case 84:
            toggleButton(latestPadPushed, 12);
            break;
          case 89:
            toggleButton(latestPadPushed, 13);
            break;
          case 85:
            toggleButton(latestPadPushed, 14);
            break;
          case 73:
            toggleButton(latestPadPushed, 15);
            break;
        }
      }, false);
    }

  }, false);
  /*------------------- END OF DOMContentLoaded -------------------*/


  var loadPatch = function (patch, padToChange) {
    var finishedLoading = function (bufferList) {
      soundPads[padToChange].buffer = bufferList[0];
      soundPads[padToChange].patch = patch;
      soundSelect.value = patch;
      soundPads[padToChange].drumPad.textContent = soundSelect.options[soundSelect.selectedIndex].text;
    };
    var bufferLoader = new BufferLoader(
    context, [
      'au/mono/' + patch + '.wav'],
    finishedLoading);
    bufferLoader.load();
  };

  var createSequencerElements = function () {
    var keys = [65, 83, 68, 70, 71, 72];
    var allSoundPadElements = document.querySelector("#soundPads").children;
    for (var i = 0; i < allSoundPadElements.length; i++) {
      var soundPad = createSoundPadFromUIElement(allSoundPadElements[i], keys[i], i);
      soundPads.push(soundPad);
    }
  };

  var createSoundPadFromUIElement = function (element, key, number) {
    var self = {};
    self.filterSlider = element.querySelector('.filter');
    self.volumeSlider = element.querySelector('.volume');
    self.panSlider = element.querySelector('.pan');
    self.drumPad = element.querySelector('.drumPad');
    self.filterFreq = 20000;
    self.volume = 0.5;
    self.pan = 0;
    self.keyIsDown = false;
    self.number = number;
    self.sequencer = createSequencerLine(number);

    self.drumOn = function () {
      playSound(self.buffer, self.filterFreq, self.volume, self.pan, 0);
      self.drumPad.classList.add('btnDown');
      latestPadPushed = self.number;
      padNum.innerHTML = self.number + 1;
      soundSelect.value = self.patch;
    };
    self.drumOff = function () {
      self.drumPad.classList.remove('btnDown');
    };
    self.setFilterFreq = function (sliderValue) {
      var minValue = 40;
      var maxValue = context.sampleRate / 2;
      var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
      var multiplier = Math.pow(2, numberOfOctaves * (sliderValue - 1.0));
      self.filterFreq = maxValue * multiplier;
    };
    self.drumPad.addEventListener(clickOrTouchDown, function () {
      self.drumOn();
    }, false);
    self.drumPad.addEventListener(clickOrTouchUp, function () {
      self.drumOff();
    }, false);
    self.filterSlider.addEventListener("change", function () {
      self.setFilterFreq(this.value);
    }, false);
    self.volumeSlider.addEventListener("change", function () {
      self.volume = this.value;
    }, false);
    self.panSlider.addEventListener("change", function () {
      self.pan = -this.value;
    }, false);
    if (desktop) {
      document.addEventListener("keydown", function (e) {
        if (e.which === key && !self.keyIsDown) {
          self.drumOn();
          self.keyIsDown = true;
        }
      }, false);
      document.addEventListener("keyup", function (e) {
        if (e.which === key) {
          self.drumOff();
          self.keyIsDown = false;
        }
      }, false);
    }
    return self;
  };

  var playSound = function (buffer, filterFreq, volume, pan, time) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    var gainNode = context.createGainNode();
    gainNode.gain.value = volume;
    var filter = context.createBiquadFilter();
    filter.type = 0;
    filter.Q.value = 0;
    filter.frequency.value = filterFreq;
    var panner = context.createPanner();
    panner.panningModel = 0;
    panner.maxDistance = 0;
    panner.setPosition(pan, 0, 0.5);
    source.connect(filter);
    filter.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(context.destination);
    source.noteOn(time);
    return source;
  };

  var createSequencerLine = function (number) {
    self = {};
    self.line = document.createElement("div");
    self.line.classList.add('seqLine');
    self.buttons = [];
    self.notes = [];
    for (var i = 0; i < 16; i++) {
      var button = document.createElement("div");
      button.innerHTML = i;
      self.line.appendChild(button);
      self.buttons.push(button);
      self.notes[i] = false;
    }
    document.querySelector("#sequencer").appendChild(self.line);
    self.line.addEventListener(clickOrTouchDown, function (e) {
      toggleButton(number, Number(e.target.innerHTML));
    }, false);
    return self;
  };

  sequencer.start = function () {
    sequencer.isPlaying = true;
    sequencer.notes = [];
    var startTime = context.currentTime + 0.100;
    var sixteenthsTime = (60 / tempo) / 4;
    for (var i = 0; i < soundPads.length; i++) {
      for (var x = 0; x < 4; x++) {
        if (soundPads[i].sequencer.notes[x + sequencer.beat]) {
          sequencer.notes.push(playSound(soundPads[i].buffer, soundPads[i].filterFreq, soundPads[i].volume, soundPads[i].pan, startTime + x * sixteenthsTime));
        }
      }
    }
    sequencer.beat += 4;
    if (sequencer.beat === 16) {
      sequencer.beat = 0;
    }
    sequencer.nextbar = setTimeout(function () {
      if (sequencer.isPlaying) {
        sequencer.start();
      }
    }, sixteenthsTime * 4000);
  };

  sequencer.stop = function () {
    sequencer.isPlaying = false;
    clearTimeout(sequencer.nextbar);
    for (var i = 0; i < sequencer.notes.length; i++) {
      sequencer.notes[i].noteOff(0);
    }
    sequencer.notes = [];
    sequencer.beat = 0;
  };

  var setTempoTo = function (tmpo) {
    tmpo = Number(tmpo);
    if (tmpo < 60) {
      tmpo = 60;
    } else if (tmpo > 180) {
      tmpo = 180;
    }
    document.getElementById("tempoTxt").textContent = tmpo;
    tempo = tmpo;
  };

  var someOnePressedPlayStopButton = function () {
    if (sequencer.isPlaying) {
      sequencer.stop();
      document.getElementById("play").classList.remove('btnDownTxt');
    } else {
      sequencer.start();
      document.getElementById("play").classList.add('btnDownTxt');
    }
  };

  var toggleButton = function (whichPad, whichBtn) {
    var self = soundPads[whichPad].sequencer;
    if (self.notes[whichBtn]) {
      self.buttons[whichBtn].classList.remove('btnDown');
      self.notes[whichBtn] = false;
    } else {
      self.buttons[whichBtn].classList.add('btnDown');
      self.notes[whichBtn] = true;
    }
  };

  if (desktop) {
    var showHideKeyBindings = function (btn) {
      var keyBindings = document.querySelectorAll('.keyBind');
      var toSet = 'hidden';
      btn.innerHTML = "Show key bindings";
      if (keyBindings[0].style.visibility === toSet) {
        toSet = 'visible';
        btn.innerHTML = "Hide key bindings";
      }
      for (var i = 0; i < keyBindings.length; i++) {
        keyBindings[i].style.visibility = toSet;
      }
    };
  }

  var getSession = function () {
    var session = {};
    session.tempo = tempo;
    session.pads = [];
    for (var i = 0; i < soundPads.length; i++) {
      session.pads.push({
        filter: soundPads[i].filterSlider.value,
        volume: soundPads[i].volumeSlider.value,
        pan: soundPads[i].panSlider.value,
        notes: soundPads[i].sequencer.notes,
        patch: soundPads[i].patch
      });
    }
    return session;
  };

  var readSession = function (session) {
    if (session === undefined) {
      session = getEmptySession();
    }
    setTempoTo(session.tempo);
    document.getElementById("tempo").value = session.tempo;
    for (var i = 0; i < session.pads.length; i++) {
      soundPads[i].filterSlider.value = session.pads[i].filter;
      soundPads[i].volumeSlider.value = session.pads[i].volume;
      soundPads[i].panSlider.value = session.pads[i].pan;
      soundPads[i].setFilterFreq(session.pads[i].filter);
      soundPads[i].volume = session.pads[i].volume;
      soundPads[i].pan = session.pads[i].pan;
      soundPads[i].sequencer.notes = session.pads[i].notes;
      loadPatch(session.pads[i].patch, i);
    }
    //loop through the soundPads...
    for (var x = 0; x < 6; x++) {
      //loop through all the 16th notes...
      for (var y = 0; y < 16; y++) {
        toggleButton(x, y);
        //toggle twice to override the untoggling...
        toggleButton(x, y);
      }
    }
  };

  return {
    getSession: getSession,
    readSession: readSession
  };
}());