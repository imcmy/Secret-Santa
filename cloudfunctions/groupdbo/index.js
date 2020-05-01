// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('groups')
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
  var action = event.action
  try {
    switch (action) {
      case 'queryKey':
        return unPackQuery(await db.where({ key: event.key.toUpperCase() }).get())
      case 'queryList':
        return unPackQuery(await db.where({ _id: _.in(event.list) }).get())
    }
  } catch (e) {
    console.log(e)
  }
}