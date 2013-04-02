/*jslint browser:true */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */

var getEmptySession = function () {
	'use strict';
	var patches = ['housekick', 'housesnare', 'handclap', 'chh', 'ohh', 'ride909'];
	var emptySession = {
		tempo: 120,
		pads: []
	};
	var makePadWithPatch = function (patch) {
		var pad = {
			filter: 1,
			volume: 0.5,
			pan: 0,
			notes: [],
			patch: patch
		};
		for (var i = 0; i < 16; i++) {
			pad.notes.push(false);
		}
		return pad;
	};
	for (var i = 0; i < 6; i++) {
		emptySession.pads.push(makePadWithPatch(patches[i]));
	}
	return emptySession;
};

var getDefaultSession = function () {
	return {
		"tempo": 124,
		"pads": [{
			"filter": "0.74",
			"volume": "0.89",
			"pan": "0",
			"notes": [true, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false],
			"patch": "kick808"
		}, {
			"filter": "1",
			"volume": "0.5",
			"pan": "-1.16",
			"notes": [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true],
			"patch": "snare808"
		}, {
			"filter": "1",
			"volume": "0.29",
			"pan": "0",
			"notes": [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
			"patch": "clap808"
		}, {
			"filter": "1",
			"volume": "0.24",
			"pan": "-1.03",
			"notes": [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
			"patch": "chh909"
		}, {
			"filter": "1",
			"volume": "0.36",
			"pan": "1.63",
			"notes": [false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
			"patch": "ohh909"
		}, {
			"filter": "1",
			"volume": "0.34",
			"pan": "0.51",
			"notes": [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
			"patch": "ride808"
		}]
	};
};