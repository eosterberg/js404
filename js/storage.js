/*jslint browser:true */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */

storage = (function () {
	"use strict";

	var sessionSelector;

	document.addEventListener("DOMContentLoaded", function () {
		sessionSelector = document.getElementById("storage");
		/*------------------- Get the stored keys: -------------------*/
		for (var keys in localStorage) {
			createOption(keys);
		}

		document.getElementById("save").addEventListener(clickOrTouchDown, function () {
			var selected = sessionSelector.options[sessionSelector.selectedIndex].innerHTML;
			if (selected === 'New session') {
				var name = prompt('Save session as:');
				if (name !== null && name !== "") {
					localStorage[name] = JSON.stringify(drummachine.getSession());
					createOption(name);
					sessionSelector.value = name;
				}
			} else {
				if (confirm('Overwrite session: "' + selected + '"?')) {
					localStorage[selected] = JSON.stringify(drummachine.getSession());
				}
			}
		}, false);

		document.getElementById("load").addEventListener(clickOrTouchDown, function () {
			var selected = sessionSelector.options[sessionSelector.selectedIndex].innerHTML;
			var confirmed;
			if (selected === 'New session' && confirm('Start a new session? The present one will be lost unless you´ve saved.')) {
				drummachine.readSession(getEmptySession());
			} else if (confirm('Load session: "' + selected + '"? The recent one will be discarded')) {
				drummachine.readSession(JSON.parse(localStorage[selected]));
			}
		}, false);

		document.getElementById("delete").addEventListener(clickOrTouchDown, function () {
			var selected = sessionSelector.options[sessionSelector.selectedIndex].innerHTML;
			if (selected !== 'New session' && confirm('Delete session: "' + selected + '" permanently?')) {
				localStorage.removeItem(selected);
				sessionSelector.remove(sessionSelector.options.selectedIndex);
				drummachine.readSession(getEmptySession());
			}
		}, false);
	}, false);

	var createOption = function (name) {
		var option = document.createElement("option");
		option.textContent = name;
		sessionSelector.appendChild(option);
	};

}());