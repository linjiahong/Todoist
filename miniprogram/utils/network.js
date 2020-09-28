var log = require('./log.js') // 引用上面的log.js文件
var app = getApp()


function request(url, params, success, fail, errorToastNo) {
  this.requestLoading(url, params, "", success, fail, errorToastNo)
}
// 展示进度条的网络请求
// url:网络请求的url
// params:请求参数
// message:进度条的提示信息
// success:成功的回调函数
// fail：失败的回调
// errorToastNo：关闭错误提示
function requestLoading(url, params, message, success, fail, errorToastNo) {
  let that = this  
  
  if (message == true){
    wx.showLoading({
      mask:true,
    })
  }else if (message != "") {
    wx.showLoading({
      title: message,
      mask:true,
    })
  }
 
  console.log(url + ','+ JSON.stringify(params))
  wx.request({
    url: url,
    data: params,
    header: {
      'Content-Type': 'application/json'
      // 'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'post',
    success: function (res) {

      log.setFilterMsg(JSON.stringify({
        user: wx.getStorageSync('auth'),
        url: url,
        params: params,
      }))

      if (JSON.stringify(res.data).length < 7000){
        log.info({
          res: res.data
        })
      }
      if (message != "") {
        wx.hideLoading()
      }
      if (res.statusCode == 200) {
        if (res.data.code == 1){
          success(res.data)
        }else{
          success(res.data)
          if (!errorToastNo){
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }
      } else {
        // fail()
        success({ code: 0 })
        wx.showToast({
          title: '网路开小差，请稍后再试',
          icon: 'none',
        })
      }
    },
    fail: function (res) {
      //wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
      // fail()
      wx.showToast({
        title: '无网络状态',
        icon: 'none',
        duration: 5000
      })
      // wx.navigateTo({
      //   url: '/pages/errorPage/errorPage',
      // })
      success({ code: 0 })
    },
    complete: function (res) {

    },
  })
}
module.exports = {
  request: request,
  requestLoading: requestLoading
}