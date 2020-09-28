// pages/plan/share.js
const db = wx.cloud.database()
import WxValidate from '../../utils/WxValidate.js'
var Moment = require("../../utils/moment.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this

    console.log(options.id);
    this.setData({id:options.id})
    if(options.id){

      wx.showLoading({
        title: 'loading...',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 4000)
   
      db.collection('my_plan').where({
        _id: options.id // 填入当前用户 openid
      }).get().then(res => {
        console.log(res.data)
        that.setData({
          info : res.data[0]
        })
        wx.hideLoading()

      })
    }
  },

  openLocation(){
    let that = this,
        info = that.data.info
    wx.openLocation({
      latitude: info.address.latitude,
      longitude: info.address.longitude,
      name: info.name,
      address: info.address.address,
      scale: 18
    })
  },
  onShareAppMessage: function () {
    let info = this.data.info
    return {
      title:  '我的事项：' + info.name,
      desc: info.description,
      path: '/pages/plan/share?id=' + info._id,
      imageUrl:'http://cnd.hongblog.cn/portal/20200918/b322881962dc866ab2a686e6e3f31021.jpg'
    }
  }
})