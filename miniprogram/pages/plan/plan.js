// pages/plan/plan.js
const db = wx.cloud.database()
var Moment = require("../../utils/moment.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    weeks: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月","十二月" ],
    // 所选择日期
    selectDate: {
      'year': new Date().getFullYear(),
      'month': new Date().getMonth() + 1,
      'date': new Date().getDate(),
      'dateFormat': Moment(new Date()).format('YYYY-MM-DD'),
    },

    calendarTitle: '',

    // 日期list 
    calendarDays: [],
    refresh: true,

    month_show: false,

    logged: false,
    avatarUrl: '',
    shake:false,

    dates:[],
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMonthDaysCurrent(new Date())


     // 获取用户信息
     wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {

              console.log(res);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })

              this.onGetOpenid()
            }
          })
        }
      }
    })

    let that = this


  },

  onGetOpenid: function() {
    // 调用云函数
    let that = this, userInfo = that.data.userInfo
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result)
        userInfo.openid = res.result.openid
        userInfo.updateTime = new Date().getTime();
        var userdb = db.collection('user').where({openid: userInfo.openid})
        userdb.get({
          success: function(res) {
          console.log(res)
            if(res.data.length > 0){
              userdb.update({
                // data 字段表示需新增的 JSON 数据
                data: userInfo,
                success: function(res) {
                  console.log(res)
                  
                }
              })
            }else{
              db.collection('user').add({
                // data 字段表示需新增的 JSON 数据
                data: userInfo,
                success: function(res) {
                  console.log(res)
                }
              })
            }
          }
        });

        return false
        if(userdb.get()){
          
    
        }else{
          db.collection('user').add({
            // data 字段表示需新增的 JSON 数据
            data: userInfo,
            success: function(res) {
             
            }
          })
    
        }


        // app.globalData.openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        // wx.navigateTo({
        //   url: '../deployFunctions/deployFunctions',
        // })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.onGetOpenid()
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
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
    let selectDate = {
      'year': year,
      'month': month,
      'date': date,
      'dateFormat': Moment(e).format('YYYY-MM-DD'),
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
      calendarDays: calendarDays,selectDate

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
        let selectDate = { 
          year: list[i].year,
          month: list[i].month,
          date: list[i].date,
          dateFormat : list[i].dateFormat
        }

        this.setData({
          calendarTitle: this.data.months[list[i].month-1],
          selectDate
          // calendarTitle: list[i].year + "/" + (list[i].month > 9 ? list[i].month : "0" + list[i].month) + "/" + (list[i].date > 9 ? list[i].date : "0" + list[i].date)
        })
      }
    }
    
    this.setData({
      calendarDays: list
    })

  },
  onToday: function () {
    this.getMonthDaysCurrent(new Date())
    this.getData(Moment(new Date()).format('YYYY-MM-DD'))
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
   
    let that = this
    if(that.data.prevDate){
      that.getData(that.data.prevDate)
    } else {
      that.getData();
    }
  },
  getData: function ( date ){
    let that = this, 
        calendarDays = that.data.calendarDays, 
        dates = that.data.dates

    for(var i in calendarDays){
      if(calendarDays[i].dateFormat == date){
        calendarDays[i].selected = true
      }else{
        calendarDays[i].selected = false
      }
    }

    wx.showLoading({
      title: 'loading...',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 4000)

    that.setData({ calendarDays});

    var where = { }
    if(date){
      where.date = date
    }

    db.collection('my_plan').orderBy('date', 'desc')
    .where(where)
    .get({
      success: function(res) {
        let list = res.data;
        let deleteIndex = [];
        
        for(var i in list){
          if( list[i].status == 2 ) {
            deleteIndex.push(i)
          }
        }

        console.log(deleteIndex)

        for(var i in deleteIndex){
          list.splice(i,1)
        } 

        list.map(function(item, index){
          dates.push(item.date)
          that.getStatus(item)
        }) 

        console.log(list);

        that.setData({ list : list , dates: that.unique(dates)});
        wx.hideLoading()
      }
    })
  },
  unique(array){
    var n = {}, r = [], len = array.length, val, type;
    for (var i = 0; i < array.length; i++) {
      val = array[i];
      type = typeof val;
      if (!n[val]) {
        n[val] = [type];
        r.push(val);
      } else if (n[val].indexOf(type) < 0) {
        n[val].push(type);
        r.push(val);
      }
    }
    return r;
  },
  edit: function(e) {
    let { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: 'add?id=' + id ,
    })
  },

  bindMonth: function (e) {
    let { index } = e.target.dataset,
        selectDate = this.data.selectDate,
        date = new Date(new Date().getFullYear(),index,1)
        selectDate.month = index + 1
    this.getMonthDaysCurrent(date)
    this.getData(this.data.selectDate.dateFormat)
    this.setData({
      selectDate,
      month_show : false
    })
  },

  monthShow: function (){
    let that = this
    that.setData({
      month_show: !that.data.month_show
    })
  },
  getStatus: function (item){
    let  time = new Date();
    time = time.setDate(time.getDate()-1)
    time = new Date(time);

      if(new Date(item.date + ' 00:00:00') < time && item.status != 1){

        db.collection('my_plan').doc(item._id).update({
          data: {
            status: 1
          },
          success: function(res) {
              console.log(res)
          }
        })
      }
  },
  onShareAppMessage: function () {
    return {
      title: '直观便捷地管理待办事项，帮你保持专注与高效。',
      imageUrl:'http://cnd.hongblog.cn/portal/20200918/b322881962dc866ab2a686e6e3f31021.jpg'
    }
  }
})