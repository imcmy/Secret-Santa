// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const userDb = cloud.database().collection('user')
const addressDb = cloud.database().collection('address')
const eventDB = cloud.database().collection('event')
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
  diced = [
    {
      "_id": "79550af2600666c200117364641aff73",
      "myno": 9,
      "sid": "oXL790L59KlsdSROJ23b75TLT2fM"
    },
    {
      "_id": "b00064a76006643400128b15405d4d5e",
      "myno": 11,
      "sid": "oXL790CYSQ6uQbtPePF9mqpdsXBE"
    },
    {
      "_id": "3b020ca360065d5c000fe4f1550254d9",
      "myno": 10,
      "sid": "oXL790Ei93JzMIr7zsCOkpWrRH6o"
    },
    {
      "_id": "1526e12a6006c167001789066f4ae0fc",
      "myno": 7,
      "sid": "oXL790EYW34E9C1xyfoLIAP5IBfg"
    },
    {
      "_id": "1526e12a601b8dfc021c82c56adb2f0a",
      "myno": 1,
      "sid": "oXL790Br7tC3dnfL8EeD9GbntAE8"
    },
    {
      "_id": "79550af260065eb70010921403ee9e8a",
      "myno": 5,
      "sid": "oXL790EvT6Q4sXAsvojCrVlHKSig"
    },
    {
      "_id": "28ee4e3e6006ba68001ec28a724f14c4",
      "myno": 4,
      "sid": "oXL790DNatO8eH31oxjUgUAmgwBA"
    },
    
    {
      "_id": "3b020ca3601b552a026a25006cc19bfe",
      "myno": 8,
      "sid": "oXL790KbBnDDgLrhCX4xA-IlUe-s"
    },
    {
      "_id": "28ee4e3e600667870014368012408b7f",
      "myno": 3,
      "sid": "oXL790KOcL7HjjimB5o8YHWGNLUo"
    },
    {
      "_id": "3b020ca3600679e900137e5c702bbdd4",
      "myno": 6,
      "sid": "oXL790PFKQhGKWjgoJs0WdvfUKrc"
    },
    {
      "_id": "79550af2600666c200117364641aff73",
      "myno": 9,
      "sid": "oXL790L59KlsdSROJ23b75TLT2fM"
    },
  ]
  var names = unPackQuery(await cloud.callFunction({
    name: 'userdbo_v2',
    data: {
      "action": "queryList",
      "list": diced.map(r => { return r.sid })
    }
  }))
  eventDB.doc("46cc45b2-325f-4209-8363-c0090dbbb6d6").update({
    data: {
      _names_diced: names
    }
  })
  // var openid = cloud.getWXContext().OPENID
  // var userCheck = await userDb.where({ _openid: openid }).count()
  // console.log(userCheck.total)
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