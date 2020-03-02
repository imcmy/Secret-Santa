const cutdown = cutdown => {
  var posTime = cutdown > 0 ? cutdown : 0 - cutdown
  return posTime
}

module.exports = {
  cutdown: cutdown
}