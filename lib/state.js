module.exports = function(json, ip) {
  var state = JSON.parse(json);
  if (!state.name) {
    state.name = ip;
  }
  if (!state.level) {
    state.level = "info";
  }
  if (!state.status) {
    state.status = "unknown";
    state.level = "warning";
  }
  if (!state.group) {
    state.group = "no group";
  }
  return state;
}
