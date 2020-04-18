"use strict";
require.config({baseUrl:VW.SCRIPTS});
require(["EVELink","EVEIGB"],function(EveLink,IGB){

    var bTrappedPanel 	= false;
    var idPanel			= "panel-trapped";
    var idMsg			= "trapped-message";
    var jqMsg			= null;

//	function CreateTrappedPanel( id )
//	{
//		if( bTrappedPanel ) return; // created yet
//		bTrappedPanel = true;
        
//        if(!id) id=idPanel;

/*		$( "#"+id ).html([
			"<br/><table><tr>",
			"<td style='vertical-align:top;'>",
				"近期被困者列表：",
				"<p id='trapped-list' style='width:200px;'></p>",
			"</td>",
			"<td width='10px'></td>",
            "<td style='width:280px;line-height:25px;vertical-align:top;'>",
				"<span><img src='",IMG,"/6_64_4.png'/>我被困虫洞了...</span><br/>",
            "恒星系链接:&nbsp;<span id='trapped-solar-link'><input id='trapped-solar' type='text' class='evelink' title='复制黄色链接至此' style='width:130px;'/>*&nbsp;<a href='./Help.html#evelink' title='怎样输入链接?'><img class='icon' src='",IMG,"/74_64_14.png'/></a></span><br>",
            	"联系人链接:&nbsp;<span id='trapped-name-link'><input id='trapped-name' type='text' class='evelink' title='复制黄色链接至此' style='width:130px;'/>*&nbsp;<a href='./Help.html#evelink' title='怎样输入链接?'><img class='icon' src='",IMG,"/74_64_14.png'/></a></span><br>",
				//"联系方式:&nbsp;<input id='trapped-contact' type='text'></input><br>",
				//"有效期限:&nbsp;<input id='trapped-duration' type='text'>(天)</input><br>",
            "<span style='vertical-align:top;'>被困者留言:&nbsp;</span><textarea id='trapped-words' type='text' title='联系方式,酬谢等...' style='width:130px;padding:0px;'></textarea><br>",
				"<input id='trapped-submit' type='submit' value='发布求救信息' onclick='' />",
				//"<button onclick=''>发布求救信息</button>",
            	"<p id='",idMsg,"' style='color:grey;'>求救信息将显示在虫洞查询结果中,<br>若有人搜索到该星系即可看到留言。<br/>",
            "<span style='font-size:90%;line-height:1.2em;'><br/>温馨提示:<br/>",
            	"&nbsp;&nbsp;1.为提高成功率，联系人可以填写洞<br/>外的小号或常在线的好友号。<br/>",
            	"&nbsp;&nbsp;2.为保证安全，获救时可以先使用扫<br/>描小号进洞，择机再出洞。<br/>",
            	"&nbsp;&nbsp;3.获救时，以相同联系人重发一条获<br/>救感言即可覆盖求救信息。<br/>",
            	"&nbsp;&nbsp;4.发布失败时，请联系QQ群管理员。<br/></span></p>",
            '求救及搜救可加入Q群168422571<br/>进行线下联系与咨询',
            '<a target="_blank" href="http://shang.qq.com/wpa/qunwpa?idkey=646b729469d1747693568caa033057ffb9763a6518d69b485695925fb189a8aa"><img border="0" src="http://pub.idqqimg.com/wpa/images/group.png" alt="爱神虫洞俱乐部" title="爱神虫洞俱乐部"></a><br/>',
            "<br/>游戏内在线联系可<button id='join-channel' title='VenusWormholeClub'>加入聊天频道</button>",
			"</td>",
			"</tr></table>"
		].join(""));
*/
		
        jqMsg = $("#"+idMsg);
        
		Trapped();
		
		$("#trapped-pilot").on("blur",_checkTrappedName)
        	.on("keydown",function(event){if(event.keyCode == 13)_checkTrappedName();})
        	.on("paste",function(){setTimeout(_checkTrappedName,500);});
        
		$("#trapped-solar").on("blur",_checkTrappedSolar)
        	.on("keydown",function(event){if(event.keyCode == 13)_checkTrappedSolar();})
        	.on("paste",function(){setTimeout(_checkTrappedSolar,500);});
        
		$("#trapped-submit").on("click",_submitTrapped);
        //$("#join-channel").on("click",_joinChannel);
        
		var trappedRoleName = null;
		var trappedRoleId	= null;
		var trappedSolar	= null;
        var trappedSolarId	= null;
		
		function _checkTrappedName()
		{
			var txt = document.getElementById("trapped-pilot").value;
            if(txt.length>0)
            {
                var obj = EveLink.pilot( txt )
                if( obj )
                {
                    //console.log( obj );
                    trappedRoleName 	= obj.txt;
                    trappedRoleId 		= obj.id;
                    $("#trapped-pilot-link").html(obj.link);
                    jqMsg.html("<span style='color:green;'>Completed! 人物链接完成!</span>");
                }
                else
                {
                    trappedRoleName = null;
                    jqMsg.html("<span style='color:red;'>Wrong format! 人物链接格式错误!<br/><a href='./Help.html#evelink'>怎样输入链接?</a></span>");
                    //_showHelp();
                }
            }
		}
		
		function _checkTrappedSolar()
		{
			var txt = document.getElementById("trapped-solar").value; 
			var obj = EveLink.whSolar( txt )
            if(txt.length>0)
            {
                if( obj )
                {
                    //console.log( link );
                    trappedSolar = obj.txt;
                    $("#trapped-solar-link").html(obj.link);
                    jqMsg.html("<span style='color:green;'>Completed! 星系链接完成!</span>");
                }
                else
                {
                    trappedSolar = null;
                    jqMsg.html("<span style='color:red;'>Wrong format! 星系链接格式错误!<br/><a href='./Help.html#evelink'>怎样输入链接?</a></span>");
                    //_showHelp();
                }
            }
		}
		
		function _submitTrapped()
		{
            if( !trappedRoleName || !trappedSolar)
            {
            	 jqMsg.html("<span style='color:red;'>Please inout solarsystem and pilot! 请输入人物和星系链接!<br/><a href='./tutorial.php#evelink'>How to input link? 怎样输入链接?</a></span>");
            	return;
            }
            
			var option = {};
			if( trappedRoleName && trappedRoleId )
			{
				option.name 	= trappedRoleName;
				option.roleId 	= trappedRoleId;
			}

			if( trappedSolar )
			{
				option.solar = trappedSolar;
			}
            
			//option.contact = document.getElementById("trapped-contact").value;
			option.duration = 365;//= document.getElementById("trapped-duration").value;
			option.words= document.getElementById("trapped-words").value;
			
			$(jqMsg).html("<span style='color:yellow;'>Submitting...正在提交中...</span>");

			option.type="1";
			$.post( "./trapped.php",option ,function(res){
				//if(DEVMODE)console.log(data);
				var data = JSON.parse(res);
				if(!data){return jqMsg.html("<span style='color:red;'>发布失败，请联系管理员。</span>");}
                if(data.status)
                {
                    jqMsg.html("<span style='color:red;'>"+data.status+"</span>");
                }
                else //if(Validate(data))
                {
                    jqMsg.html("<span style='color:#11ff22;'>Completed! 发布成功!</span>");
					//Request.GetTrappedList( ShowTrappedList );
					Trapped();
                    setTimeout(function(){ window.location.hash="#panel-search/solar/"+trappedSolar },2000);
                }
			});
        
			/*
			Request.SetTrapped(option,function(data)
            {
				if(!data){return jqMsg.html("<span style='color:red;'>发布失败，请联系管理员。</span>");}
                if(data.status)
                {
                    jqMsg.html("<span style='color:red;'>"+data.status+"</span>");
                }
                else //if(Validate(data))
                {
                    jqMsg.html("<span style='color:green;'>发布成功!</span>");
					Request.GetTrappedList( ShowTrappedList );
                    setTimeout(function(){ window.location.hash="#panel-search/solar/"+trappedSolar },2000);
                }
            });
            */
		}
        
        function _joinChannel()
        {
            IGB.trust();
            setTimeout(function(){ IGB.joinChat("VenusWormholeClub"); },5000);
        }
        
        //var _bShowed = false;
        //function _showHelp()
        //{
        //    if( _bShowed ) // show only once
        //    {
        //        return ;
        //    }
        //    _bShowed = true;
        //    setTimeout(function(){window.location=URL+"/Help.html#evelink";},2000);
        //}
//	}
    
    function Trapped()
	{
        $("#trapped-list").html( "<br/><span style='color:yellow;'>"+VW.T.LOADING+"...</span>" );
		//Request.GetTrappedList( ShowTrappedList );

		//$.get("./service/query.php?type=98&id=0"+(VW.DEV?"&DEV":""),function(data){
		$.get("./trapped.php?type=3"+(VW.DEV?"&DEV":""),function(data){
            var obj = JSON.parse(data);
            ShowTrappedList(obj);
        });
	}
    
    function ShowTrappedList( obj )
	{
	    //if(DEVMODE)console.log("ShowTrappedList");
        
        if( !obj ){
            return;
        }

		var htmls=[];
		for(var i in obj)
		{
			htmls.push(
                "<p><strong class='title'><a href='./search.php?lang=",VW.LANG,"#showinfo/solar/",obj[i].system,"'>",obj[i].system,"</a></strong>&nbsp;<span style='color:grey;'>&nbsp;~",ElapsedTime(obj[i].updated),"</span><br/>",
                "<span style='word-break:break-all;'>",obj[i].roleId?"<a href='javascript:void(0);' onclick='IGB.pilot("+obj[i].roleId+");'>"+obj[i].name+"</a>":obj[i].name,"&gt;&nbsp;",obj[i].words,"</span>&nbsp;<br/>",
                	obj[i].reward?NumberFormat(obj[i].reward)+"&nbsp;ISK&nbsp;&nbsp;":"",
					obj[i].contact,
				"</p>"
			);
		}
		$("#trapped-list").html( htmls.join("") );
		$("#trapped-loading").html("");
	}
    
    function ElapsedTime( time )
    {
        var then = new Date(time);
        var now = new Date();
        var elapsed = now-then; 
        var minutes = (elapsed)/60000;
        if(minutes<60){
            return Math.round(minutes)+"M";
        }
        else{
            var hours = minutes / 60;
            if( hours < 24 )
            {
                return Math.round(hours)+"H";
            }
            else
            {
                var days = hours / 24;
                if(days>90)return null;
                return Math.round(days)+"D";
            }
        }
    }
    
    /*
    function Error( msg )
	{
		var index = $("#tabs").tabs( "option", "active");
		var selector = "";
		switch(index)
		{
		case 0: // search panel
			selector = "#message";
			break;
		case 1: // trapped panel
			selector = "#trapped-message";
			break;
		}
		$( selector ).html("<span style='color:red;'>"+msg+"</span>");
	}
    */
    
    //return {"create":CreateTrappedPanel};

});