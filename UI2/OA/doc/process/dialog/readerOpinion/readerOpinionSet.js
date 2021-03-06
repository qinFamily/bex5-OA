define(function(require){
	var $ = require("jquery");
	var justep = require("$UI/system/lib/justep");
	var docUtils = require("$UI/OA/doc/js/docUtils");
	var biz = require('$UI/system/lib/biz');
	
	var Model = function(){
		this.callParent();
		this.docId;
	};

	Model.prototype.btnCommonWordDOMActivate = function(event){;
		var process = "/OA/common/process/commonWords/commonWordsProcess";
		var activity = "mainActivity";
		///appCommon/process/commonWords/mainActivity.w?process=/appCommon/process/commonWords/commonWordsProcess&activity=mainActivity
		var dlgCommonWords = this.comp("dlgCommonWords");
		dlgCommonWords.set({process:process,activity:activity});
		dlgCommonWords.open();
	};


	Model.prototype.btnSaveDOMActivate = function(event){;
		var data = this.comp("dData");
		data.setValue("fState","psFinished");
		data.setValue("fStateName","已完成");
		data.saveData();
		// 记录公文已阅
		var fOpinion = data.getValue("fOpinion");
		this.setReaderOpinionToTask(fOpinion,this.docId);
		this.comp('windowReceiver').windowEnsure();
	};
	
	Model.prototype.setReaderOpinionToTask = function(fOpinion,fMasterID){
		;
		var params = new biz.Request.ActionParam();
		params.setString("fOpinion", fOpinion);
		params.setString("fMasterID", fMasterID);
		var me = this;
		biz.Request.sendBizRequest({
			"context" : this.getContext(),
			"action" : "setReaderOpinionToTaskAction",
			"parameters" : params,
			"callback" : function(callbackData) {
				callbackData.ignoreError = false;
				if (callbackData.state) {
					;
					docUtils.recordReaded(me.getContext(),me.docId);
					//response = callbackData.response;
				}else{
					throw new Error("设置阅文意见到任务表失败!");
				}
			}
		});
	};

	Model.prototype.windowReceiverReceive = function(event){
		;
		this.docId = event.data.docId;
		if (this.docId) {
			var processData = this.comp("dDocProcess");
			processData.filters.setFilter("docProcessFilter1", "fMasterID = '"
					+ this.docId + "'");
			processData.filters.setFilter("docProcessFilter2",
					"fActivityFName = 'readerOpinion'");
			processData.filters.setFilter("docProcessFilter3", "fCreatePsnID = '"
					+ this.getContext().getCurrentPersonID() + "'");
			processData.refreshData();
			var a = processData.getCount();
			var dData = this.comp("dData");
			if (processData.getCount() == 0) {
				dData.newData();
				dData.setValue("fMasterID", this.docId);
				dData.setValue("fActivityFName", "readerOpinion");
				dData.setValue("fActivityLabel", "传阅意见");
			}
			var dCommonWords = this.comp("dCommonWords");
			dCommonWords.filters.setFilter("personFilter", "fPersonID = '"
					+ this.getContext().getCurrentPersonID() + "'");
		}
	};

	Model.prototype.selectCommonWordsClick = function(event){
		this.comp('dCommonWords').refreshData();
	};

	return Model;
});