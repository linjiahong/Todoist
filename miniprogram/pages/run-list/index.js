// pages/run-list/index.js
var Moment = require("../../utils/moment.js");

Page({

  /**
   * 页面的初始数据
   */
  
 data:{
    weeks: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
 months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月","十二月" ],
 // 所选择日期
 selectDate: {
   'year': new Date().getFullYear(),
   'month': new Date().getMonth() + 1,
   'date': new Date().getDate(),
 },

 calendarTitle: '',

 // 日期list 
 calendarDays: []
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMonthDaysCurrent(new Date())
    this.getData()
  },
  // 所选时间对应月份日期
  getMonthDaysCurrent(e) {
    let year = e.getFullYear()
    let month = e.getMonth() + 1
    let date = e.getDate()
    let day = e.getDay() // 周几
    let days = new Date(year, month, 0).getDate() //当月天数(即下个月0号=当月最后一天)

    let firstDayDate = new Date(year, month - 1, 1) // 当月1号
    let firstDay = firstDayDate.getDay() //当月1号对应的星期

    let lastDate = new Date(year, month - 1, days) //当月最后一天日期
    let lastDay = lastDate.getDay() //当月最后一天对应的星期

    // 更新选择日期
    this.data.selectDate = {
      'year': year,
      'month': month,
      'date': date,
    }
    
    // 更新顶部显示日期
    this.setData({
      // calendarTitle: year + "/" + (month > 9 ? month : "0" + month) + "/" + (date > 9 ? date : "0" + date)
      calendarTitle: this.data.months[month-1]
    })

    let calendarDays = []

    // 上个月显示的天数及日期
    for (let i = firstDay - 1; i >= 0; i--) {
      let date = new Date(year, month - 1, -i)
      //console.log(date, date.getMonth() + 1)

      calendarDays.push({
        'year': date.getFullYear(),
        'month': date.getMonth() + 1,
        'date': date.getDate(),
        'day': date.getDay(),
        'dateFormat': Moment(date).format('YYYY-MM-DD'),
        'current': false,
        'selected': false
      })
    }

    // 当月显示的日期
    for (let i = 1; i <= days; i++) {
      calendarDays.push({
        'year': year,
        'month': month,
        'date': i,
        'day': new Date(year, month - 1, i).getDay(),
        'dateFormat': Moment(new Date(year, month - 1, i)).format('YYYY-MM-DD'),
        'current': true,
        'selected': i == date // 判断当前日期
      })
    }

    // 下个月显示的天数及日期
    for (let i = 1; i < 7 - lastDay; i++) {
      let date = new Date(year, month, i)
      //console.log(date, date.getMonth() + 1)

      calendarDays.push({
        'year': date.getFullYear(),
        'month': date.getMonth() + 1,
        'date': date.getDate(),
        'day': date.getDay(),
        'current': false,
        'selected': false
      })
    }

    this.setData({
      calendarDays: calendarDays
    })
  },

  // 手动选中日期
  clickDate(e) {
    let index = e.currentTarget.dataset.index
    let list = this.data.calendarDays
    for (let i = 0; i < list.length; i++) {
      list[i].selected = i == index
      if (i == index) {
        console.log(list[i], this.data.selectDate)

        this.getData(list[i].dateFormat)
        // 如果选择日期不在当月范围内，则重新刷新日历数据
        if (list[i].year != this.data.selectDate.year || list[i].month != this.data.selectDate.month) {
          let date = new Date(list[i].year, list[i].month - 1, list[i].date)
          this.getMonthDaysCurrent(date)
          return
        }
        // 更新顶部显示日期
        this.setData({
          calendarTitle: this.data.months[list[i].month-1]
          // calendarTitle: list[i].year + "/" + (list[i].month > 9 ? list[i].month : "0" + list[i].month) + "/" + (list[i].date > 9 ? list[i].date : "0" + list[i].date)
        })
      }
    }
    
    this.setData({
      calendarDays: list
    })

  },
  getData: function () {

    let that = this
    wx.login({
      success:function(resLonin){
        console.log(resLonin)
        console.log(resLonin.code)
        wx.getWeRunData({
          success:function(resRun){
            console.log("微信运动密文：")
            console.log(resRun)
            wx.cloud.callFunction({
              name:'weRun',//云函数的文件名
              data:{
                weRunData: wx.cloud.CloudID(resRun.cloudID),
                obj:{
                  shareInfo: wx.cloud.CloudID(resRun.cloudID)
                }
              },
              success: function (res) {
                console.log("云函数接收到的数据:")
                console.log(res)
                let step = res.result.weRunData.data.stepInfoList[30].step ,stepInfoList = res.result.weRunData.data.stepInfoList

                for(var i in stepInfoList){
                   stepInfoList[i].date = Moment(stepInfoList[i].timestamp*1000).format('YYYY-MM-DD')
                }

                that.setData({
                  step:step,
                  stepInfoList: stepInfoList
                })
              }
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})