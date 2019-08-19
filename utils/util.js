const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

let jsonStringToObjject = function (text) {
  var jsonStr = text;
  jsonStr = jsonStr.replace(" ", "");
  if (typeof jsonStr != 'object') {
    jsonStr = jsonStr.replace(/\ufeff/g, ""); //重点
    var jj = JSON.parse(jsonStr);
  }
  return jj;
}


module.exports = {
  formatTime: formatTime,
}