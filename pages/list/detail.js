// pages/list/detail.js
const app = getApp()
const util = require('../../utils/util.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    market_code: '',
    vendor_code: '',
    detail: {},
    showAlert: false,
    showAlertMarket: false,
    option: ['年利率'],
    buttons: [{ text: '取消' }, { text: '确定' }],
    aprButtons: [{ text: '开价' }],
    choose: {
      market_status: '',
      vendor_code: '',
      market_code: '',
      index: 0,
      num: 0.1,
    },
    change: {
      status: '',
      index: '',
      id: ''
    },
    end_time: {},
    close_time:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      market_code: options.market_code,
      vendor_code: options.vendor_code
    })
  },
  onShow: function () {
    this.getDetail();
    this.computingTime();
  },
  onHide: function () {
    clearInterval(app.tt);
  },
  computingTime: function () {
    let close_time = app.config.close_time;
    this.setData({
      close_time:app.config.close_time
    })
    let myDate = new Date();
    let new_time = myDate.getTime() / 1000;
    new_time = parseInt(new_time.toFixed(0));
    let offset_time = close_time - new_time;
    if (offset_time > 0) {
      this.setData({
        end_time: {
          hour: parseInt((offset_time % (60 * 60 * 24)) / (60 * 60)),
          min: parseInt((offset_time % (60 * 60)) / (60))
        }
      })
    } else {
      this.setData({
        end_time: {
          hour: '00',
          min: '00'
        }
      })
    }
  },
  loopUpdate: function () {
    const _this = this
    clearInterval(app.tt);
    app.tt = setInterval(function () {
      _this.getDetail('none')
    }, 60000)
  },

  getDetail: function (showLoading, type) {
    let _this = this;
    app.getApi({
      api: 'invoice/get_market_stat',
      isAuth: true,
      needBuyer: _this.data.market_code,
      vendorcode: _this.data.vendor_code,
      showLoading: showLoading == 'none' ? false : true,
      success: function (res) {
        if (res.code == 1) {
          _this.setData({
            detail: res.data
          })
          if (!type) {
            if (app.config.close_time > 1 && res.data.market_status == 1) {
              _this.loopUpdate();
            } else {
              app.tt = ''
            }
          }
        } else {
          wx.showToast({
            title: '获取失败',
            icon: 'none',
            complate: function () {
              setTimeout(function () {
                wx.navigateBack({})
              }, 1500)
            }
          })
        }

      }
    })
  },

  changeStatus: function () {
    const status = this.data.detail.is_participation == 1 ? -1 : 1
    if (app.config.close_time < 0) {
      wx.showToast({
        title: '市场已关闭',
        icon: 'none'
      });
      return false;
    }
    if (this.data.detail.market_status != 1 || this.data.close_time < 0) {
      wx.showToast({
        title: '市场今日未开市',
        icon: 'none'
      }); return false;
    }
    if (status == -1) {
      this.setData({
        showAlertMarket: true,
      })
      return false;
    } else {
      this.changeStatusAction()
    }
  },
  changeStatusAction: function () {
    let _this = this;
    if (app.config.close_time < 0) {
      wx.showToast({
        title: '市场已关闭',
        icon: 'none'
      });
      return false;
    }
    if (this.data.detail.market_status != 1 || app.config.close_time < 0) {
      wx.showToast({
        title: '市场今日未开市',
        icon: 'none'
      });
      return false;
    }

    if (this.data.detail.offer_status == 1) {
      wx.showToast({
        title: '正在计算中',
        icon: 'none'
      }); return false;
    }
    app.getApi({
      type: 'POST',
      api: 'market/set_participation',
      showLoading: true,
      isAuth: true,
      data: {
        market_code: _this.data.market_code,
        vendor_code: _this.data.vendor_code,
        is_participation: _this.data.detail.is_participation == 1 ? -1 : 1
      },
      success: function (res) {
        _this.hideAlertMarket()
        if (res.code == 1) {
          let target = "detail.is_participation";
          _this.setData({
            [target]: _this.data.detail.is_participation == 1 ? -1 : 1
          })
        } else {
          wx.showToast({
            title: '操作失败',
            icon: 'none'
          })
        }
      }
    })
  },
  setMarketButton: function (e) {
    if (e.detail.index == 0) {
      this.hideAlertMarket()
    } else {
      this.changeStatusAction()
    }
  },
  hideAlertMarket: function () {
    this.setData({
      showAlertMarket: false,
    })
  },
  changeRate: function (e) {
    if (app.config.close_time < 0) {
      wx.showToast({
        title: '市场已关闭',
        icon: 'none'
      }); return false;
    }
    if (this.data.detail.market_status != 1 || app.config.close_time < 0) {
      wx.showToast({
        title: '市场今日未开市',
        icon: 'none'
      });
      return false;
    }

    if (this.data.detail.offer_status == 1) {
      wx.showToast({
        title: '正在计算中',
        icon: 'none'
      }); return false;
    }
    this.setData({
      showAlert: true,
      choose: {
        index: 0,
        market_status: this.data.detail.market_status,
        market_code: this.data.market_code,
        vendorcode: this.data.detail.vendor_code,
        num: this.data.detail.offer_value
      },
    })
  },
  setAprButton: function () {
    let _this = this;
    if (!_this.data.choose.num) {
      wx.showToast({
        title: '请填写利率值',
        icon: 'none'
      }); return false;
    }
    if (_this.data.choose.num < 0.1 || _this.data.choose.num > 36) {
      wx.showToast({
        title: '利率值的范围应为0.1~36!',
        icon: 'none'
      }); return false;
    }
    app.getApi({
      type: 'POST',
      api: 'invoice/offer_apr',
      showLoading: true,
      isAuth: true,
      needBuyer: _this.data.choose.market_code,
      data: {
        vendor_code: _this.data.choose.vendorcode,
        offer_type: 'apr',
        offer_value: _this.data.choose.num,
        min_payment: -1
      },
      success: function (res) {
        if (res.code == 1) {
          wx.showToast({
            title: '修改成功',
            complete: function () {
              setTimeout(function () {
                _this.hideAlert();
                _this.getDetail('none', 'none');
              }, 1500)
            },
          })
          // app.postFormId(formId);    
        } else {
          wx.showToast({
            title: '修改失败',
            icon: 'none'
          })
        }
      }
    })
  },
  inputNumber: function (e) {
    let mynumber = e.detail.value;
    mynumber = Math.floor(parseFloat(mynumber)*100)/100;
    if (mynumber <= 0.1) {
      mynumber = 0.1;
    } else if (mynumber > 36) {
      mynumber = 36;
    }
    let target = "choose.num";
    this.setData({
      [target]: mynumber
    })
  },
  removeNumber: function () {
    let mynumber = this.data.choose.num;
    mynumber = parseFloat(mynumber);
    if (mynumber <= 0.1) {
      return false;
    } else {
      mynumber = this.numRemove(mynumber.toString(), "0.1");
    }
    let target = "choose.num";
    this.setData({
      [target]: mynumber
    })
  },
  addNumber: function () {
    let mynumber = this.data.choose.num;
    mynumber = parseFloat(mynumber);
    if (mynumber >= 36) {
      return false;
    } else {
      mynumber = this.numAdd(mynumber.toString(), "0.1");
    }
    let target = "choose.num";
    this.setData({
      [target]: mynumber
    })
  },
  numRemove: function (num1, num2) {
    var baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = num1.split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (num1 * baseNum - num2 * baseNum) / baseNum;
  },
  numAdd: function (num1, num2) {
    var baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = num1.split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = num2.split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (num1 * baseNum + num2 * baseNum) / baseNum;
  },
  hideAlert: function () {
    this.setData({
      showAlert: false,
    })
  },
  setChooseIndex: function (e) {
    let index = e.detail.value;
    let target = "choose.index";
    this.setData({
      [target]: index
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(app.tt);
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


})