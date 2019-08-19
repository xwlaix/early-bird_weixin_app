//app.js
App({
  onLaunch: function () {
    const _this = this
    wx.login({
      success(res) {
        wx.showLoading({
          title: '自动登录中',
        })
        if (res.code) {
          const value = wx.getStorageSync('userInfo')
          console.log(value)
          if (!value) {
            _this.getToken(res.code)
          } else {
          _this.config.userInfo = value;
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/list/index'
              })
            },100)
            wx.hideLoading();
          }
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  getToken:function(code){
    const _this = this
    _this.getApi({
      type:'POST',
      data:{
        js_code:code
      },
      grant_type:"app",
      showLoading: true,
      api:`oauth2/get_access_token?grant_type=app&appid=${_this.config.appid}&secret=${_this.config.secret}`,
      success:function(res){
        wx.hideLoading();
        if(res.code==1){
          wx.setStorage({
            key: 'userInfo',
            data: res.data,
          })
          _this.config.userInfo = res.data;
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/list/index'
            })
          },100)
        } else {
          wx.showToast({
            title: '自动登录失败,请重新登陆',
            icon: 'none'
          })
        }
      }
    })
  },
  // refreshToken: function (userInfo) {
  //   let _this = this;
  //   _this.getApi({
  //     api:'oauth2/refresh_access_token',
  //     grant_type:"refresh_token",
  //     data:{
  //       grant_type: 'refresh_token',
  //       appid: _this.config.appid,
  //       secret: _this.config.secret,
  //       refresh_access_token: userInfo.refresh_access_token
  //     },
  //     success:function(res){
  //       userInfo.access_token = res.access_token;
  //       userInfo.refresh_access_token = res.refresh_token;
  //       userInfo.expire_time = res.expire_time;
  //       wx.setStorage({
  //         key: 'userInfo',
  //         data: userInfo,
  //       })
  //       _this.config.userInfo = userInfo;
  //     }
  //   })
  // },
  // verifyAccessToken:function(){
  //   let userInfo = this.config.userInfo;
  //   let myDate = new Date();
  //   let new_time = myDate.getTime() / 1000;
  //   new_time = parseInt(new_time.toFixed(0));
  //   // console.log(userInfo.expire_time - new_time);
  //   if (userInfo&&(userInfo.expire_time - new_time )< 120){
  //     this.refreshToken(userInfo);
  //   }
  // },
  postFormId:function(formId,callback){
    this.getApi({
      type:'POST',
      isAuth:true,
      data:{
        formId:formId
      },
      showLoading: true,
      api:'account/push_formid',
      success:function(res){
        callback?callback(res):"";
      }
    })
  },
  getApi: function (options) {
    let _this = this;
    if (!options.type) {
      options.type = 'GET';
    }
    if (options.showLoading) {
      wx.showLoading({
        title:'加载中'
      })
    }
    if (options.isAuth&&_this.config.userInfo) {
      options.api = options.api + "?access_token=" + _this.config.userInfo.access_token;
    }
    if (options.needBuyer){
      options.api = options.api + "&market_code=" + options.needBuyer;
      if (options.vendorcode) {
        options.api = options.api + "&vendor_code=" + options.vendorcode;
      }
    }
    wx.request({
      url: _this.config.apiHost + options.api,
      data: options.data,
      method: options.type,
      header: {
        'content-type': 'application/json', // 默认值,
      },
      success: function (res) {
        wx.hideLoading();
        if(options.isAuth){
          if (res.statusCode == 401 || res.statusCode == 400) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
            if (res.statusCode == 401) {
              wx.removeStorage({
                key: 'userInfo',
                success (res) {
                  console.log(res)
                }
              })
              _this.config.userInfo =null
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/index/index',
                })
              },1500)
            }
          }else{
            options.success(res.data);
          }
        }else{
          options.success(res.data);
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '系统错误',
          icon: 'none'
        })
        console.log('调用' + options.api + '接口失败！');
      }
    })
  },
  getNowTime: function () {
    var date = new Date();
    date = date.getTime();
    return parseInt(date.toString().substr(0, 10));
  },
  config: {
    apiHost: "https://api.eb-cf.com/rest/",
    // apiHost: "https://testapi.eb-cf.com/rest/",
    appid: "platform",
    secret: '123456',
    userInfo: null
  }
})