// pages/plan/add.js
const db = wx.cloud.database()
import WxValidate from '../../utils/WxValidate.js'
var Moment = require("../../utils/moment.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    info:{
      category:'',
      date:Moment(new Date()).format('YYYY-MM-DD'),
      time:Moment(new Date()).format('hh:mm'),
      description:'',
      name:'',
      address:{},
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
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

    if(options.selectDate){
      let info = that.data.info
      info.date = options.selectDate
      that.setData({ info })
    }

    var pages = getCurrentPages();
    var Page = pages[pages.length - 1];//当前页
    var prevPage = pages[pages.length - 2];  //上一个页面
    if(prevPage){
      var info = prevPage.data //取上页data里的数据也可以修改
      prevPage.setData({
        refresh: false,
        prevDate: ''
      })
    }

    that.initValidate()//验证规则函数
  },
  DateChange:function(e){
    let info = this.data.info
    info.date = e.detail.value
    this.setData({
      info
    })
  },

  TimeChange: function(e) {
    let info = this.data.info
    info.time = e.detail.value
    this.setData({
      info
    })
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
  chooseLocation(){
    let that = this, info = that.data.info

    if(!info.address){
      info.address = {
        latitude:0,
        longitude:0,
      }
    }
    wx.chooseLocation({
      latitude:info.address.latitude,
      longitude:info.address.longitude,
      success: function (res) {
        info.address = res
        that.setData({info})
      },
      fail(e){
        wx.showToast({
          title: e.errMsg,
          icon:'none'
        })
      }
    })
      
  },
  getLocation:function(){
    let _this = this;
    wx.getSetting({
      success(res) {
        // 判断定位的授权
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              _this.chooseLocation();
            },
            fail(errMsg) {
              wx.showToast({ title: JSON.stringify(errMsg), icon: 'none' }) 
            }
          })
        } else {
          _this.chooseLocation();
        }
      }
    })
  },
  //验证函数
  initValidate() {
    const rules = {
      name: {
        required: true,
        minlength:2
      },
      date: {
        required: true,
      },
      description: {
        required: false,
      },
      category: {
        required: true,
      },
    }
    const messages = {
      name: {
        required: '请填写名称',
        minlength:'请输入正确的名称'
      },
      date:{
        required:'请填写时间',
      },
      description:{
        required:'请填写备注',
      },
      category:{
        required:'请填写分类',
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  submit:function(e){
    let { value } = e.detail, that = this
    value.NewDate = new Date
    //校验表单
    if (!that.WxValidate.checkForm(value)) {
      const error = that.WxValidate.errorList[0]
      that.showModal(error)
      console.log(error);
      return false
    }
    wx.showLoading({
      title: 'loading...',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 4000)

    var info = that.data.info;
    if(info){
      value.address = info.address
    }

    console.log(value);

    if(that.data.id){
      db.collection('my_plan').doc(that.data.id).update({
        // data 字段表示需新增的 JSON 数据
        data: value,
        success: function(res) {
          that.setPrevPageData()
          if(info.status == 0) return false
          wx.navigateBack({
            delta: 1,
          })
        }
      })

    }else{

      db.collection('my_plan').add({
        // data 字段表示需新增的 JSON 数据
        data: value,
        success: function(res) {
          that.setPrevPageData()
          console.log('add data:',res);
          wx.navigateBack({
            delta: 1,
          })
        }
      })

    }
    
    
  },
  showModal(error){
    wx.vibrateShort();
    this.setData({error:error})
  },
  del:function () {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定删除 "'+ that.data.info.name +'" ?',
      success (res) {
        if (res.confirm) {
          db.collection('my_plan').doc(that.data.id).update({
            data: {
              status: 2
            },
            success: function(res) {
              that.setPrevPageData()
              wx.navigateBack({
                delta: 1,
              })
            }
          })
          
        } else if (res.cancel) {
          
        }
      }
    })
  },

  input: function(e){
    console.log(e);
    let id = e.currentTarget.id , info = this.data.info , value = e.detail.value
    info[id] = e.detail.value

    this.setData({info:info})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    const todos = db.collection('my_plan').get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log(res.data,)
      }
    })

  },
  setPrevPageData: function () {
    let that = this
    var pages = getCurrentPages();
    var Page = pages[pages.length - 1];//当前页
    var prevPage = pages[pages.length - 2];  //上一个页面
    var info = prevPage.data //取上页data里的数据也可以修改
    prevPage.setData({
      refresh:that.data.id? false: true,
      prevDate: that.data.info.date
    })
  },
  onSubscribe: function(e) {
    // 获取课程信息
    let info = this.data.info;

    if(info.status) return false
    const item = {
      thing1:{
        value: info.name.slice(0,20)
      },
      time2:{
        value: info.date
      },
      thing3:{
        value: info.category.slice(0,20)
      },
      thing4:{
        value: '帮助用户更轻松便捷的记录'
      }
    }, 
    lessonTmplId = 'qVaVd2SaecO-VW45tuPhgc9Wp2orb97-KKwdpKRzSmw';
    // 调用微信 API 申请发送订阅消息
    wx.requestSubscribeMessage({
      // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
      tmplIds: [lessonTmplId],
      success(res) {
        // 申请订阅成功
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          // 这里将订阅的课程信息调用云函数存入云开发数据
          wx.cloud
            .callFunction({
              name: 'subscribe',
              data: {
                data: item,
                date:info.date,
                plan_id:info._id,
                templateId: lessonTmplId,
              },
            })
            .then(() => {
              // wx.showToast({
              //   title: '订阅成功',
              //   icon: 'success',
              //   duration: 2000,
              // });

              
              if(!info._id) return false
              wx.navigateBack({
                delta: 1,
              })
            })
            .catch(() => {
              // wx.showToast({
              //   title: '订阅失败',
              //   icon: 'success',
              //   duration: 2000,
              // });
              if(!info._id) return false
              wx.navigateBack({
                delta: 1,
              })
            });
        }
      },
    });
  },
  onShareAppMessage: function () {
    let info = this.data.info
    return {
      title: '我的事项：' + info.name,
      desc: info.description,
      path: '/pages/plan/share?id=' + info._id,
      imageUrl:'http://cnd.hongblog.cn/portal/20200918/b322881962dc866ab2a686e6e3f31021.jpg'
    }
  }
})