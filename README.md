# `#小程序云开发挑战赛#-待办事项工具-Lin

### 应用场景

直观便捷地管理待办事项，帮你保持专注与高效工具型小程序，用户可在手机上随时随地高效便捷地管理自己的待办事项。

### 目标用户

适合老师、学生和工作者。

### 实现思路

本小程序采用基于云开发的原生开发，用到了云数据库存储数据，使用云函数获取当前用户的openid、读写操作云数据库。

### 主要用到了以下几个云函数：

1、用户登录获取openid

2、用户基本信息通过云数据库存储

3、更新云数据库，使用api更新数据库会有权限的限制，所以部分操作使用了云函数来更新云数据库

4、发送订阅消息

效果截图：

这里是首页，日历和事项列表。

![](https://upload-images.jianshu.io/upload_images/7888241-4f5c1fa4879b9152.png?imageMogr2/auto-orient/strip|imageView2/2/w/1080/format/webp)


首页
添加或编辑页面，这里可以输入名称，时间，分类，位置（可以打开地图功能），备注，也可以分享给好友。

![](https://upload-images.jianshu.io/upload_images/19498634-5dad250541bbf904.png?imageMogr2/auto-orient/strip|imageView2/2/w/1080/format/webp)

添加/编辑页面
分享给好友，比如：活动事项，朋友也可以看到活动地点，位置。

![](https://upload-images.jianshu.io/upload_images/19498634-9b35a312e77f2642.png?imageMogr2/auto-orient/strip|imageView2/2/w/1080/format/webp)

分享好友页

### 代码链接

码云：https://github.com/linjiahong/Todoist

作品体验二维码

![](https://upload-images.jianshu.io/upload_images/19498634-c4f3a66e27e0819d.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/430/format/webp)

扫一扫体验

### 功能演示

腾讯视频：

### 团队简介

个人开发者林佳鸿，从事于WEB前端开发，喜欢敲代码的感觉，相信编程是一门艺术。

作者：Lin
