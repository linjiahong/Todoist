const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const {OPENID} = cloud.getWXContext();

    // 在云开发数据库中存储用户订阅的课程
    const result = await db.collection('subscribeMessages').add({
      data: {
        touser: OPENID, // 订阅者的openid
        page: event.plan_id?('pages/plan/add?id='+ event.plan_id):'pages/plan/plan', // 订阅消息卡片点击后会打开小程序的哪个页面
        data: event.data, // 订阅消息的数据
        templateId: event.templateId, // 订阅消息模板ID
        time: new Date(new Date(event.date.replace('-', '/')).getTime()).getTime(),
        done: false, // 消息发送状态设置为 false
      },
    });

    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};