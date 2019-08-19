# weixin_app
这是小程序源码仓库。

## 说明
+ 接口请求封装在`app.js`中的`getApi`，全局设置请求前验证token是否过期，设置传参`options`中的参数等。
+ 项目配置在`app.js`中的`config`中。
+ 在`app.js`中设置了加载时获取用户信息，判断有无绑定过。用户登录分为两种，一种是密码（需要加密），一种是通过openid获取。
+ 页面主要分为登录页，错误页，警告页，登录成功页，市场列表页，市场详情页。

## 目录结构
 ```
├── pages                        // 源代码
│   ├── filter                   // 过滤器js
│   ├── image                    // 引用图片
│   ├── index                    // 登录，错误，警告，成功页面
│   └── list                     // 市场列表，市场详情页
├── utils                        // 工具
│   ├── aes.js                   // 加密工具
│   └── utils.js                 // 封装工具
├── app.js                       // 全局js
├── app.json                     // 微信自带
├── app.wxss                     // 全局css
├── project.config               // 项目配置文件
├── README.md                    // 页面指导
└── sitemap.json                 // sitemap.json
 ```

## api 和 views
+ api在app.js封装微信请求接口，在根据具体接口，设置不同函数调用。
+ views在pages目录下的index和list

## 前后端的交互问题
在禅道理解需求，在原型图上编写页面视图，整理后台需要提交的接口参数，然后再写出相应的逻辑，模拟页面操作，之后再对接接口，先行自己测试之后没问题，再交给测试人员测试。

## 路由
在pages目录添加文件夹和对应的文件，然后在app.json中设置好页面路径。