export const cloudErrorCodes = {
    0x1: "Context not supported",
    0x2: "Parameters not supported",
    0x3: "Session expired",
    0x4: "User does not exist",
    
    0x11: "User already registered",
    0x12: "Nickname validation not passed",
    0x13: "Still a manager",
    
    0x21: "No group matched",
    0x22: "Already in the group",
    0x23: "Group token duplicated",
    0x24: "Validation not passed",
    0x25: "Need audit",
    0x26: "Already in the waiting list",
    0x27: "Still in event",

    0x31: "Validation not passed",
    0x32: "Not allowed to create"
}

export const errorHandler = (e) => {
    console.log(e)
    wx.reportEvent("user_critical_error", e)
    wx.reLaunch({
        url: '/pages/critical_error/critical_error'
    })
}
