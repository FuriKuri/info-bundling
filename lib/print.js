var clc = require('cli-color');
var Jetty = require("jetty");
var jetty = new Jetty(process.stdout);

var level = {
  info: clc.blue,
  error: clc.red,
  ok: clc.green,
  warning: clc.yellow
}

function slice(string, length) {
  var s = string.substring(0, length);
  return new String(new Array(length).join(" ") + s).slice(s.length)
}

function fill(string, length) {
  var diff = length - string.length;
  return string + new Array(diff).join("-");
}

function compareState(a, b) {
  if (a.name > b.name) {
    return 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  return 0;
}

function printStatus(connectionState) {
  jetty.clear();
  jetty.moveTo([0,0]);
  var groups = {};
  for (var value of connectionState.values()) {
    if (!groups[value.group]) {
      groups[value.group] = [];
    }
    groups[value.group].push(value);
  }
  Object.getOwnPropertyNames(groups).sort().forEach(function (group) {
    jetty.text(fill("----- " + group + " -", 63) + "\n");
    groups[group].sort(compareState).forEach(function (state) {
      jetty.text(slice(state.name, 30) + " - " + level[state.level](slice(state.status, 30)));
      jetty.text('\n');
    });
  });
}

module.exports = printStatus;
