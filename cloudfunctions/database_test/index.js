// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const userDb = cloud.database().collection('user')
const addressDb = cloud.database().collection('address')
const _ = cloud.database().command


const unPackQuery = obj => {
  var queried = []
  var data = obj.data ? obj.data : (obj.result ? obj.result : [])
  if (Array.isArray(data))
    data.forEach((value, index, _) => {
      queried.push(value)
    })
  else
    queried.push(data)
  return queried
}

// 云函数入口函数
exports.main = async (event, context) => {
  var openid = cloud.getWXContext().OPENID
  var userCheck = await userDb.where({ _openid: openid }).count()
  console.log(userCheck.total)
  // var unPack = unPackQuery(await userDb.where({ privilege: _.gt(-1) }).get())
  // for (var i=0; i<unPack.length; i++) {
  //   var inserted = await addressDb.add({
  //     data: {
  //       _openid: unPack[i]._openid,
  //       postalCode: unPack[i].postalCode,
  //       telNumber: unPack[i].telNumber,
  //       recipient: unPack[i].recipient,
  //       fullAddr: unPack[i].provinceName + unPack[i].cityName + unPack[i].countyName + unPack[i].detailInfo,
  //       current: true
  //     }
  //   })
  //   var addresses = []
  //   addresses.push(inserted._id)
  //   await userDb.doc(unPack[i]._id).update({ data: { 
  //     addresses: addresses,
  //     currentAddress: inserted._id
  //   } })
  // }
}