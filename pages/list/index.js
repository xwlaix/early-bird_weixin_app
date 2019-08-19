// pages/list/index.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    option:['年利率'],
    buttons: [{ text: '取消' }, { text: '确定' }],
    aprButtons: [{ text: '开价' }],
    active_market:{},
    choose: {
      vendorcode:'',
      market_status:'',
      market_code:'',
      index:0,
      num:0.1,
    },
    change: {
      status: '',
      index: '',
      id: '',
      vendorcode:''
    },
    market:[],
    showAlert: false,
    showAlertMarket:false,
    close_time:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow: function (params) {
    this.getMarketList()
  },
  onHide: function () {
    clearInterval(app.t);
  },
  getMarketList:function(showLoading,type){
    let _this = this;
    app.getApi({
      api:'market/get_market_list',
      isAuth:true,
      showLoading: showLoading=='none'?false:true,
      success:function(res){
        console.log(res)
        if(res.code==1){
          _this.setData({
            market:res.data.list,
            close_time: res.data.close_time
          })
          if(res.data.list.length===0){
            wx.navigateTo({
              url: '/pages/index/warning',
            })
          }
          app.config.close_time = res.data.close_time;
          if (app.config.close_time > 1) {
            if (!type) {
              _this.loopUpdate()
            }
          }else{
            app.t = '';
          }
        }else{
          console.log(res);
        }
      }
    })
  },
  loopUpdate:function(){
    let _this = this;
    clearInterval(app.t);
    app.t = setInterval(function(){
      _this.getMarketList('none')
    },60000)
  },
  toDetail:function(e){
    let id = e.currentTarget.dataset.id;
    let vendor_code = e.currentTarget.dataset.vendorcode;
    wx.navigateTo({
      url: '/pages/list/detail?market_code=' + id +'&vendor_code='+vendor_code,
    })
    // let formId = e.detail.formId;
    // app.postFormId(formId,function(res){
    //   wx.navigateTo({
    //     url: '/pages/list/detail?buyer_id=' + id,
    //   })
    // });    
  },
  changeRate: function (e) {
    if(this.data.close_time<0){
      wx.showToast({
        title: '市场已关闭',
        icon:'none'
      });return false;
    }
    let index = e.currentTarget.dataset.index;
    if (this.data.market[index].market_status != 1||this.data.close_time<0) {
      wx.showToast({
        title: '市场今日未开市',
        icon:'none'
      });return false;
    }
    if (this.data.market[index].offer_status == 1) {
      wx.showToast({
        title: '正在计算中',
        icon: 'none'
      }); return false;
    }
    this.setData({
      showAlert:true,
      choose:{
        index: 0,
        market_status:this.data.market[index].market_status,
        market_code: this.data.market[index].buyer_id,
        vendor_code: this.data.market[index].vendor_code,
        num: this.data.market[index].offer_value
      },
    })
  },
  setAprButton: function () {
    let _this = this;
    if(!_this.data.choose.num){
      wx.showToast({
        title: '请填写利率值',
        icon:'none'
      });return false;
    }
    if (_this.data.choose.num<0.1||_this.data.choose.num>36) {
      wx.showToast({
        title: '利率值的范围应为0.1~36!',
        icon: 'none'
      }); return false;
    }
    app.getApi({
      type:'POST',
      api: 'invoice/offer_apr',
      needBuyer:_this.data.choose.market_code,
      showLoading:true,
      isAuth:true,
      data: {
        vendor_code: _this.data.choose.vendor_code,
        offer_type: 'apr',
        offer_value: _this.data.choose.num,
        min_payment: -1	
      },
      success:function(res){
        if(res.code==1){
          wx.showToast({
            title: '修改成功',
            complete:function(){
              setTimeout(function(){
                _this.hideAlert();
                _this.getMarketList('none','none');
              },1500)
            },
          })
          // app.postFormId(formId);    
        }else{
          wx.showToast({
            title: '修改失败',
            icon:'none'
          })
        }
      }
    })
  },
  hideAlert:function(){
    this.setData({
      showAlert:false,
    })
  },
  changeStatus: function (e) {
    if (this.data.close_time < 0) {
      wx.showToast({
        title: '市场已关闭',
        icon: 'none'
      }); return false;
    }
    let status = e.currentTarget.dataset.status==1 ? -1 : 1;
    let marketStatus = e.currentTarget.dataset.marketstatus;
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let vendorcode = e.currentTarget.dataset.vendorcode;
    this.setData({
      change: {
        status: status,
        index: index,
        id: id,
        vendorcode:vendorcode
      }
    })
    if (marketStatus != 1 || this.data.close_time < 0) {
      wx.showToast({
        title: '市场今日未开市',
        icon:'none'
      });return false;
    }
    if (status == -1) {
      if (this.data.market[index].offer_status == 1) {
        wx.showToast({
          title: '正在计算中',
          icon: 'none'
        }); return false;
      }
      this.setData({
        showAlertMarket:true,
      })
      return false;
    } else {
      this.changeStatusAction()
    }
  },
  changeStatusAction:function(){
    let _this = this;
    const index = this.data.change.index
    const id = this.data.change.id
    const status = this.data.change.status
    const vendorcode = this.data.change.vendorcode
    if (this.data.market[index].offer_status == 1) {
      wx.showToast({
        title: '正在计算中',
        icon: 'none'
      }); return false;
    }

    app.getApi({
      type:'POST',
      api:'market/set_participation',
      showLoading:true,
      isAuth:true,
      data:{
        market_code: id,
        vendor_code:vendorcode,
        is_participation:status
      },
      success:function(res){
        if(res.code==1){
          let target = "market[" + index +"].is_participation";
          _this.setData({
            [target]: _this.data.market[index].is_participation == 1 ? -1 : 1,
            showAlertMarket:false,
          })
        }else{
          wx.showToast({
            title: '操作失败',
            icon:'none'
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
  hideAlertMarket:function(){
    this.setData({
      showAlertMarket:false,
    })
  },
  inputNumber:function(e){
    let mynumber = e.detail.value;
    mynumber = Math.floor(parseFloat(mynumber)*100)/100;
    if (mynumber<=0.1){
      mynumber = 0.1;
    }else if(mynumber>36){
      mynumber = 36;
    }
    let target = "choose.num";
    this.setData({
      [target]:mynumber
    })
  },
  removeNumber:function(){
    let mynumber = this.data.choose.num;
    mynumber = parseFloat(mynumber);
    if (mynumber<=0.1){
      return false;
    }else{
      mynumber = this.numRemove(mynumber.toString(), "0.1");
    }
    let target = "choose.num";
    this.setData({
      [target]: mynumber
    })
  },
  addNumber:function(){
    let mynumber = this.data.choose.num;
    mynumber = parseFloat(mynumber);
    if (mynumber >= 36) {
      return false;
    } else {
      mynumber = this.numAdd(mynumber.toString(),"0.1");
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
  numAdd: function (num1, num2){
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

  setChooseIndex:function(e){
    let index = e.detail.value;
    let target = "choose.index";
    this.setData({
      [target]:index     
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
    clearInterval(app.t);
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