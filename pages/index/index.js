// pages/index/index.js
const CryptoJS = require('../../utils/aes.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    wx.login({
      success(res) {
        let target = "user.js_code";
        _this.setData({
          [target]:res.code
        });
      }
    })
  },

  login: function () {
    let data = this.data.user;
    if (!data.username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      }); return false;
    }
    if (!data.password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      }); return false;
    }
    data.password = this.encrypted(data.password)
    app.getApi({
      api: `oauth2/check_authorize?appid=${app.config.appid}&secret=${app.config.secret}&grant_type=password`,
      type: 'POST',
      data: data,
      grant_type:"password",
      showLoading: true,
      success: function (res) {
        if (res.code == 1) {
          wx.setStorage({
            key: 'userInfo',
            data: res,
          })
          app.config.userInfo = res;
          wx.redirectTo({
            url: '/pages/index/success',
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      }
    })
  },
  encrypted: function (word) {
    var keyHex = CryptoJS.enc.Utf8.parse("abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG");
    var encrypted = CryptoJS.AES.encrypt(word, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encrypted
  },
  setUsername: function (e) {
    let username = e.detail.value;
    let target = "user.username";
    this.setData({
      [target]: username
    })
  },
  setPassword: function (e) {
    let password = e.detail.value;
    let target = "user.password";
    this.setData({
      [target]: password
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