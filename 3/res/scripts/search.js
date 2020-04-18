"use strict";
require.config({baseUrl:VW.SCRIPTS});
require(['HashChange','Keywords','EVEIGB'],function(hashchange,keywords,eveigb){

	var TypesMapping = 
	{
		'1'			:'solar',
		'2'			:'hole',
		'3'			:'site',
		'4'			:'sleeper',
		'5'			:'npcship',
		'6'			:'region',
		'7'			:'constl',
		'8'			:'item',
		'9'			:'keyword',
		'solar'		:1,
		'hole'		:2,
		'site'		:3,
		'sleeper'	:4,
		'npcship'	:5,
		'region'	:6,
		'constl'	:7,
		'item'		:8,
		'type'		:8,
		'keyword'	:9
	};

	$(function(){
		if(VW.DEV)console.log("Search.JS Load Complete!");

		if(!window.VW)window.VW = 
		{
		    
		};
		
		VW.isKwFocus = false;
		VW.accordionData = { animate:"easeOutExpo",collapsible:true, heightStyle:"content" };
		VW.$message = $("#message");
		VW.$results = $("#results");
		VW.$keyword = $("#keyword");
		VW.$keyword.on("keydown",function(event){if(event.keyCode == 13)setTimeout(JumpToSearch,250);});
		VW.$keyword.on("paste",function(){this.select();setTimeout(JumpToSearch,250);});
		VW.$keyword.on("drop",function(){setTimeout(JumpToSearch,250);});
		VW.$keyword.on("blur",function(){VW.isKwFocus = false;/*setTimeout(SearchJump,500);*/});
		VW.$keyword.on("focus",function(){
			if( !VW.isKwFocus ){
				VW.isKwFocus = true;
				this.select();
			}
		});
		VW.$keyword.on("click",function(){
		});
		VW.$keyword.autocomplete({
			autoFocus	: true,
			minLength	: 3,
			source : function(request,response){
				var filtered =[];
				var term = request.term.toUpperCase();
				for( var i in keywords.KEYWORDS){
					var p = keywords.KEYWORDS[i].indexOf(term);
					if(p>-1&&p<2)filtered.push(keywords.KEYWORDS[i]);
				}
				response( filtered );
			},
			select : function( event, ui ) {
				setTimeout( function(){JumpToSearch(ui.item.value);}, 250 );
			}
		});
		VW.$keyword.focus();
		
		$(document).tooltip({track:true});

		window.onkeydown = function(e){ 
			if(e.keyCode==8||e.keyCode==32||e.keyCode==38||e.keyCode==40)return true;
			if(!VW.isKwFocus){
				VW.$keyword.select();
			}
			VW.$keyword.focus(); 
		};
        
        $(window).hashchange( HandleHashChange );
		$(window).hashchange();

	});

	var RenderFuncs = {
		'1':ShowSolarInfo,
		'2':ShowHoleInfo,
		'3':ShowSiteInfo,
		'4':ShowNpcShipInfo,
		'5':ShowNpcShipInfo,
		'6':ShowRegionInfo,
		'7':ShowConstlInfo,
		'8':ShowItemInfo,
		'9':ShowSearchResults 
	};

	function FormatNumber( n, float )
	{
		if(n==-1)return "Unknown";
		n=n.toString().replace(/\b(0+?!\.)/g,'');
		return n.replace(/^(-?\d+)((\.\d+)?)$/,function(s,s1,s2){return s1.replace(/\d{1,3}(?=(\d{3})+$)/g,'$&,')+s2.substr(0,float?float+1:3);});
	}

	function Status(text,bError,obj)
	{
	    if(VW){
    	    if(!text){ //Clear
    	        VW.$message.html("");
    	        VW.$results.html("");
    	        VW.$keyword.value="";
    	    }
    	    else{
    	        var msg = VW.T[text]||text;
    	        if(VW.DEV&&bError&&obj){
    	        	msg=[msg,"<br/>",obj.toString(),"<br/>",JSON.stringify(obj)].join("");
    	        	console.error(obj);
    	        }
    	        VW.$message.html("<span style='color:"+(bError?"red":"yellow")+";'>"+msg+"</span>");
    	    }
	    }
	    else console.log(text);
	}

	function JumpToSearch( userKeyword )
	{
		var keyword = userKeyword || document.getElementById("keyword").value;
		var obj = ExtractKeyword( keyword.toString() );

		if(obj.type){
			window.location.hash=[ "#showinfo",TypesMapping[obj.type], obj.keyword ].join("/");
		}
		else{
			window.location.hash=[ "#keyword", TypesMapping[obj.type], obj.keyword ].join("/");
		}
	}

	function HandleHashChange(){
		if(VW.DEV)console.log("HandleHashChange():"+window.location.hash);
		var hash = window.location.hash;
		if( hash ){
			var params = hash.split("/");
			if(hash.length!=0||params.length!=0){ //default
				return Search(params[1],params[2]);
			}
		}
		Status(null);
	}

	function Search( type, keyword )
	{
		if(!type)return Status('NEED_TYPE');
		if(!keyword)return Status('NEED_KEYWORD');

		var args = [];
		args.push( "lang=" + (VW.LANG||"EN") );
		if(VW.DEV) args.push("dev");
		
		var typeInt = typeof(type)==="string"?TypesMapping[type]:type;
		args.push( "type=" + typeInt ); 
		var id = parseInt(keyword);
		if(isNaN(id)){
			VW.$keyword[0].value = keyword;
			args.push( "name="+keyword );
		}else{
			VW.$keyword[0].value = '';
			args.push( "id="+keyword );
		}
		
		window.scrollTo(0,0);
		Status('STATUS_SEARCHING');

		$.ajax({
			async:true,
			cache:true,
			url: "./service/query.php",
			data: args.join('&'),
			success: function(data){
				try{
					var obj = JSON.parse(data);
					if('error' in obj){
						return Status( VW.T['STATUS_SERVER_ERROR'].replace('{error}',VW.T[obj.error]),true,obj);
					}
					Status(null);
					if(VW.DEV){ console.log(RenderFuncs[typeInt].name);console.debug(obj);}
					RenderFuncs[typeInt](obj);
				}
				catch(e){
					return Status('STATUS_FORMAT_ERROR',true,e);
				}
				VW.isKwFocus = false;
			},
			error: function(xhr,type){
				switch(type){
				case 'timeout':
					Status('STATUS_OPERATION_TIMEOUT',true);
					break;
				case 'error':
				default:
					Status('STATUS_CONNECTION_LOST',true);
				}
			}
		});
	}

	function ExtractKeyword( input )
	{
		if(VW.DEV)console.log("ExtractKeyword():"+input);
		var obj = {};
		if(input)
		{
			input = input.replace(/(^[\s\t\r\n]*)|([\s\t\r\n]*$)/g, ""); //trim
			var p = -1;
			if( -1 != ( p=input.search("=showinfo:") ) )
			{
				var re = /=showinfo:([0-9\/]{1,32}?)(>| )/.exec(input);
				if(re){
					re = re[1].split("//");
					re[0] = parseInt(re[0]);
					if(re[0]==2){ //corperation
						throw Error("Not Implement");
					}
					else if(re[0]==3){
						obj = {type:6,keyword:re[1]};
					}
					else if(re[0]==5){
						obj = {type:1,keyword:re[1]};
					}
					else if(re[0]>=1000&&re[0]<=2000 )
					{
						//throw Error("Not Implement");
						obj = {type:8,keyword:re[0]};
					}
					else //general item info // npc ship 
					{
						obj = {type:4,keyword:re[0]};
					}
				}
				else{
					obj = {type:0};
					Status("STATUS_EXTRACT_FAILED");
				}
			}
            else if(/^\d{6}$/.test(input))
            {
            	obj.type = 1;
				obj.keyword = "J"+input;
            }
			else if( -1 != ( p=input.search( /(J[\+\-\d]{6})/i) ) ) //solar
			{
				obj.type = 1;
				obj.keyword = input.substr(p,7).replace("+","9");
			}
			else if( -1 != (p=input.search( /[A-Z]{1}-R\d{5}/i )) ) //region
			{
				obj.type = 6;
				obj.keyword = input.substr(p,8);
			}
			else if( -1 != (p=input.search( /[A-Z]{1}-C\d{5}/i )) ) //constellation
			{
				obj.type = 7;
				obj.keyword = input.substr(p,8);
			}
			else if( -1 != (p=input.search(/[A-Z]{3}-\d{3}/i)) ) // signals (scan results)
			{
				//ZHY-937	异常空间	矿石地点	小行星带残迹	100.0%	21.00 AU
				input = input.replace(/[A-Z]{3}-\d{3}\t[\u4e00-\u9fa5]{2,5}\t[\u4e00-\u9fa5]{2,5}\t/,"");//.replace(/\t[\d.]{1,6}%\t[\d.]{1,8} [AUm]{2}/i,"");
				if( -1 != (p=input.search(/\t[\d.]{1,6}%\t[\d.]{1,8} [AUkm]{2}/i) ) )
				{	
					obj.type = 3;
					obj.keyword = input.substring(0,p);
				}
				else
				{
					obj.type = 0;
					Error("STATUS_FORMAT_ERROR");
				}
			}
			else if( -1 != (p=input.search( /[A-Za-z]{1}\d{3}/i )) ) //holes
			{
				obj.type = 2;
				obj.keyword = input.substr(p,4);
			}
			else if( -1 != ( p=input.search("<br>") ) ) // overview select target
			{
				var re = /^(.+?)<br>/.exec(input);
				if(re){
					obj = {type:9,keyword:re[1]};
				}
				else{
					obj = {type:0};
					Status("STATUS_EXTRACT_FAILED");
				}
			}
			else if( input==="Thera"||input==="thera" || -1 != ( p=input.search( /\u5e2d\u62c9/i) ) ) // Thera
			{
				obj.type = 1;
				obj.keyword = 31000005;
			}
			else if( -1 != input.search( /.{2,16}$/ )  ) //keyword
			{
				obj.type = 9 ;
				obj.keyword = input;
			}
			else
			{
				obj = {type:0};
				Status("STATUS_EXTRACT_FAILED");
			}
		}
		else
		{
			//Clear();
			Status("NEED_KEYWORD");
			obj={type:0};
		}
		return obj;
	}

	function ShowSearchResults( obj )
	{
		/*if(obj.list&&obj.list.length==1)
		{
			return Search(4,obj.list[0][0]);
		}*/

		if(obj.basic){
			return ShowItemInfo(obj);
		}

		VW.$results.html( 
		[
			"<div id='list' class='accordion'><h3>",VW.T.SEARCH_RESULTS.replace('{searchResult}',obj.list.length),"</h3><div style='line-height:1.2em;'>",
			function(data){
				var snippets=[];
				for(var key in data.list){
					snippets.push( "<a class='info' href='#showinfo/sleeper/",obj.list[key][0],"'>",data.list[key][1],"</a><br/>");
				}
				return snippets.join("");
			}(obj),
			"</div></div>",
		].join("") );
		$(".accordion").accordion(VW.accordionData);
	}

	function ShowItemInfo( obj )
	{
		if(obj.basic.groupID=="988"){
			return ShowHoleInfo(obj);
		}
		else if(obj.basic.categoryID =="11"){
			return ShowNpcShipInfo(obj);
		}

		VW.$results.html( 
		[
			"<div id='basic' class='accordion'><h3>",obj.basic.title,": ",obj.basic.categoryName,"</h3><div style='line-height:1.2em;'>",
				"<img src='",VW.EIS,"Type/",obj.basic.typeID,"_64.png' style='float:left;margin-right:5px;'/>",
				"<strong class='title'><a class='info' onclick='IGB.info(",obj.basic.typeID,");'>",obj.basic.typeName,"</a></strong>",
				"<br/><span class='plain'>",obj.basic.groupName,"<br/>",obj.basic.raceName,"<br/>",obj.basic.description.replace(/('|")/g,"`"),"</span>",
			"</div></div>",

			(obj.attrs)?function(data){
				/*var snippets=["<div id='attrs' class='accordion'>"];
				for(var key in data){
					snippets.push("<h3>",key,"</h3><div><table>");
					for(var key2 in data[key]){
						var attr=data[key][key2];
						snippets.push("<tr><td align='right'>",
						attr[2]!=="typeID"?
							[FormatNumber(attr[1]),attr[2]].join(''):
							["<a href='#showinfo/item/",attr[1],"'><img class='icon' src='",VW.EIS,"Type/",attr[1],"_32.png'/></a>"].join(''),
						"</td><td class='plain'>",attr[0],"</td></tr>");
					}
					snippets.push("</table></div>");
				}
				snippets.push("</div>");*/
				return _renderAllAttrs(data); //snippets.join("");
			}(obj.attrs):"",

			(obj.links)?function(data){
				var snippets = ["<div id='links' class='accordion' ><h3>",data.title,"</h3><div>"];
				for(var key in data.list){
					snippets.push( "<a class='jump' href='",data.list[key][1],"'>",data.list[key][0],"</a><br/>");
				}
				snippets.push("</div></div>");
				return snippets.join("");
			}(obj.links):"",

		].join("") );
		$(".accordion").accordion(VW.accordionData);
	}

	function ShowNpcShipInfo( obj )
	{
		VW.$results.html( 
		[
			"<div id='basic' class='accordion'><h3>",obj.basic.title,": ",obj.basic.categoryName,"</h3><div style='line-height:1.2em;'>",
				"<img src='",VW.EIS,"Type/",obj.basic.typeID,"_64.png' style='float:left;margin-right:5px;'/>",
				"<strong class='title'><a class='info' onclick='IGB.info(",obj.basic.typeID,");' title='",obj.basic.description.replace(/('|")/g,"`"),"'>",obj.basic.typeName,"</a></strong>",
				"<br/><span class='plain'>",obj.basic.groupName,"<br/>",obj.basic.raceName,"</span>",
			"</div></div>",

			(obj.weapon)?function(data){
				var list = data.list;
				return [
				"<div id='weapon' class='accordion'>",
				"<h3>",data.title,"</h3><div><table>",
					"<tr align='middle'><td class='plain'>",list.All[0],"</td><td class='dps_em' title='",list.EM[0],"'></td><td class='dps_the' title='",list.The[0],"'></td>",
						"<td class='dps_kin' title='",list.Kin[0],"'></td><td class='dps_exp' title='",list.Exp[0],"'></td></tr>",
					"<tr align='middle'><td align='right'><strong>",FormatNumber(list.All[1])," DPS</strong>&nbsp;&nbsp;=&nbsp;</td><td>",list.EM[1],"</td><td>",list.The[1],"</td><td>",list.Kin[1],"</td><td>",list.Exp[1],"</td></tr>",
					"<tr align='middle' style='line-height:1.4em;' ><td align='right'><strong>",FormatNumber(list.All[2])," DPH</strong>&nbsp;&nbsp;=&nbsp;</td><td>",list.EM[2],"</td><td>",list.The[2],"</td><td>",list.Kin[2],"</td><td>",list.Exp[2],"</td></tr>",
				"</table></div></div>"
				].join("");
			}(obj.weapon):"",

			(obj.defence)?function(data){
				var list = data.list;
				return [
				"<div id='defence' class='accordion'>",
				"<h3>",data.title,"</h3><div><table>",
					"<tr align='right' style='font-weight:bold;line-height:2em;'><td class='plain'>Avg. = </td><td title='",list.Avg[3],"'> ",FormatNumber(list.Avg[1])," EHP/S</td><td title='",list.Avg[4],"'>&nbsp;",FormatNumber(list.Avg[2])," EHP </td></tr>",
					"<tr align='right' title='",list.EM[0],"'><td class='plain'><img class='ico' src='",VW.IMAGES,"22_32_20.png'/></td><td align='right'>",FormatNumber(list.EM[1])," EHP/S</td><td align='right'>",FormatNumber(list.EM[2])," EHP</td></tr>",
					"<tr align='right' title='",list.The[0],"'><td class='plain'><img class='ico' src='",VW.IMAGES,"22_32_18.png'/></td><td align='right'>",FormatNumber(list.The[1])," EHP/S</td><td align='right'>",FormatNumber(list.The[2])," EHP</td></tr>",
					"<tr align='right' title='",list.Kin[0],"'><td class='plain'><img class='ico' src='",VW.IMAGES,"22_32_17.png'/></td><td align='right'>",FormatNumber(list.Kin[1])," EHP/S</td><td align='right'>",FormatNumber(list.Kin[2])," EHP</td></tr>",
					"<tr align='right' title='",list.Exp[0],"'><td class='plain'><img class='ico' src='",VW.IMAGES,"22_32_19.png'/></td><td align='right'>",FormatNumber(list.Exp[1])," EHP/S</td><td align='right'>",FormatNumber(list.Exp[2])," EHP</td></tr>",
				"</table></div></div>"
				].join("");
			}(obj.defence):"",

			(obj.attrs)?function(data){
				var snippets=["<div id='attrs' class='accordion'>"];
				for(var key in data){
					snippets.push("<h3>",key,"</h3><div><table>");
					for(var key2 in data[key]){
						var attr=data[key][key2];
						snippets.push("<tr><td align='right'>",
						attr[2]!=="typeID"?
							[FormatNumber(attr[1]),attr[2]].join(''):
							["<a href='#showinfo/item/",attr[1],"'><img class='icon' src='",VW.EIS,"Type/",attr[1],"_32.png'/></a>"].join(''),
						"</td><td class='plain'>",attr[0],"</td></tr>");
					}
					snippets.push("</table></div>");
				}
				snippets.push("</div>");
				return snippets.join("");
			}(obj.attrs):"",

			(obj.links)?function(data){
				var snippets = ["<div id='links' class='accordion' ><h3>",data.title,"</h3><div>"];
				for(var key in data.list){
					snippets.push( "<a class='jump' href='",data.list[key][1],"'>",data.list[key][0],"</a><br/>");
				}
				snippets.push("</div></div>");
				return snippets.join("");
			}(obj.links):"",
		].join("") );
		$(".accordion").accordion(VW.accordionData);
	}

	function ShowSiteInfo( obj )
	{
		var htmls =
        [
			"<div id='basic' class='accordion'><h3>",obj.basic.title,"</h3><div>",
					"<a class='vw2' href='",VW.VW2,"#panel-search/site/",obj.basic.siteName,"'></a><strong><a>",obj.basic.siteName,"</a></strong>",
                    //"<img src='",Icons[obj.type],"' class='icon'/><strong>&nbsp;",obj.name,"</strong><br/>",
            		//obj.wave>1?["所在区域:&nbsp;<span class='class"+obj.level+"'>",ClassTypes[obj.level],"</span><br/>"].join(""):"",
                    //"信号类型:&nbsp;",obj.type,"<br/>",
            		//obj.wave>1?["有效点数:&nbsp;",FormatNumber(obj.EHP).replace(/\.\d+/,""),"&nbsp;EHP<br/>"].join(""):"",
            		//obj.wave>1?["掉落价值:&nbsp;",FormatNumber(obj.bounty),"&nbsp;ISK"].join(""):"",
			"</div></div>",
            
            (function(){
                
            	var snippet=[];
            	var waves = obj.waves;
                for( var waveName in waves )
                {
                    snippet.push("<div class='accordion'><h3>",waveName,"</h3><div><table>");
					var npcShips = waves[waveName];
                    for( var i in npcShips )
                    {
						var ship = npcShips[i];
						snippet.push("<tr><td><span class='group",ship[1]||99,"'></td><td><a href='#showinfo/sleeper/",ship[2],"'>",
										ship[3],"</a>&nbsp;&times;",ship[4],"</td><td>",showSpecial(ship[5]),"</td></tr>");
                    }
                    snippet.push("</table></div></div>");
                }
                
                if(obj.harvest)
                {
                    snippet.push("<div id='product'><h3>产出物</h3><div><table>");
                    var c3 = obj.harvest.length;
                    for( var k=0;k<c3;++k )
                    {
                        snippet.push("<tr><td><a href='javascript:void(0);' onclick='IGB.info(",obj.harvest[k].id,");'>",obj.harvest[k].name,"</a><span style='color:grey;'>x",
                                     FormatNumber(obj.harvest[k].amount),"</span></td><td align='right'>",FormatNumber(obj.harvest[k].volume).replace(/\.\d+/,""),"m<sup>3</sup></td></tr>");
                    }
                    snippet.push("</table></div></div>");
                }
                
            	return snippet.join("");
                
            })()
		];
		$("#results").html( htmls.join("") );
        $(".accordion").accordion(VW.accordionData);
		
		function showSpecial( special )
		{
			var html = [];
			if( -1 != special.search(/\[web\]/) )
			{
				html.push("<span class='webify' />");///*"<img class='icon' src='",Icons["[web]"],"' alt='网子' title='停滞缠绕'/>");
			}
			if( -1 != special.search(/\[nos\]/) )
			{
				html.push("<span class='nos' />");//html.push("<img class='icon' src='",Icons["[nos]"],"' alt='毁电' title='能量中和' />");
			} 
			if( -1 != special.search(/\[rep\]/) )
			{
				html.push("<span class='repair' />");//html.push("<img class='icon' src='",Icons["[rep]"],"' alt='遥修' title='远程修甲'/>");
			}
			if( -1 != special.search(/\[srm\]/))
			{
				html.push("<span class='scramble' />");//html.push("<img class='icon' src='",Icons["[srm]"],"' alt='反跳' title='跃迁干扰'/>");
			}
			//html.push("</td><td align='right'>");
			if( -1 != special.search(/\[TRIGGER\]/) )
			{
				html.push("<span class='trigger' />");
			}
			if( -1 != special.search(/\[possible\]/) )
			{
				html.push("<span class='random' />");
				//html.push("<img class='icon' src='",Icons["[possible]"],"' alt='随机' title='有概率出现'/>");
			}
			return html.join("");
		}
	}

	function ShowHoleInfo( obj )
	{
		VW.$results.html( [

			"<div id='basic' class='accordion'><h3>",obj.basic.title,"</h3><div style='line-height:1.2em;'>",
				"<img src='",VW.EIS,"Type/",obj.basic.typeID,"_64.png' style='float:left;margin-right:5px;'/>",
				"<a class='vw2' href='",VW.VW2,"#panel-search/hole/",obj.basic.typeName.split(' ')[1],"'></a><strong class='title'><a class='info' onclick='IGB.info(",obj.basic.typeID,");' title='",obj.basic.description,"'>",obj.basic.typeName,"</a></strong><br/>",
				"<span class='plain'>",obj.basic.target,"</span><br/>",
				"<span class='plain'>",obj.basic.size,"</span><br/>",
			"</div></div>",

			(obj.attrs)?function(data){
				return [
				"<div id='attrs' class='accordion'><h3>",obj.attrs.title,"</h3><div><table>",
					"<tr><td align='right' ><span style='word-break:break-word;' class='class",data[1381][4],"'>",data[1381][5],"</span>&nbsp;",data[1381][4],"</td><td class='plain'>",data[1381][3],"</td></tr>",
					"<tr><td align='right'>",data[1382][4]/3600," H</td><td class='plain'>",data[1382][3],"</td></tr>",
					"<tr><td align='right' width='120px'>",FormatNumber(data[1383][4])," ",data[1383][5],"</td><td class='plain'><span style='color:yellow;'>(±10%)</span>",data[1383][3],"</td></tr>",
					"<tr><td align='right'>",FormatNumber(data[1385][4])," ",data[1385][5],"</td><td class='plain'>",data[1385][3],"</td></tr>",
					"<tr><td align='right'>",FormatNumber(data[1384][4])," ",data[1384][5],"</td><td class='plain'>",data[1384][3],"</td></tr>",
					//"<tr><td align='right'>",FormatNumber(data[162][4])," ",data[162][5],"</td><td class='plain'>",data[162][3],"</td></tr>",
				"</table></div></div>"
				].join("");
			}(obj.attrs):"",
			
			(obj.mass)?function(data){
				var snippets = ["<div id='mass' class='accordion' ><h3>",data.title,"</h3><div><table>"];
				for(var key in data.list){
					snippets.push( "<tr><td align='right' valign='top' width='50px'>",data.list[key][0],"</td><td class='plain'>",data.list[key][1],"</td></tr>");
				}
				snippets.push("</table></div></div>");
				return snippets.join("");
			}(obj.mass):"",

			(obj.time)?function(data){
				var snippets = ["<div id='time' class='accordion'><h3>",data.title,"</h3><div><table>"];
				for(var key in data.list){
					snippets.push( "<tr><td align='right' valign='top' width='50px'>",data.list[key][0],"</td><td class='plain'>",data.list[key][1],"</td></tr>");
				}
				snippets.push("</table></div></div>");
				return snippets.join("");
			}(obj.time):"",

			(obj.links)?function(data){
				var snippets = ["<div id='links' class='accordion' ><h3>",data.title,"</h3><div>"];
				for(var key in data.list){
					snippets.push( "<a class='jump' href='",data.list[key][1],"'>",data.list[key][0],"</a><br/>");
				}
				snippets.push("</div></div>");
				return snippets.join("");
			}(obj.links):"",

		].join("") );
		$(".accordion").accordion(VW.accordionData);
	}

	function ShowSolarInfo( obj )
	{
		VW.$results.html( [
			"<div id='basic' class='accordion'><h3>",obj.basic.title,"</h3><div style='line-height:1.3em;'>",
				"<a class='vw2' href='",VW.VW2,"#panel-search/solar/",obj.basic.solarSystemName,"'></a><span class='sun'/><strong class='title'><a class='info' onclick='IGB.solar(",obj.basic.solarSystemID,");'>",obj.basic.solarSystemName,"</a></strong>",
					"&nbsp;&lt;&nbsp;<a href='",VW.VW2,'#panel-search/constellation/',obj.basic.constellationName,"'>",obj.basic.constellationName,
					"</a>&nbsp;&lt;&nbsp;<a href='",VW.VW2,'#panel-search/region/',obj.basic.regionName,"'>",obj.basic.regionName,"</a>",
            "<br/><span class='class",obj.basic.wormholeClassID,"'>",obj.basic.wormholeClassName,
					"&nbsp;&nbsp;</span>",
				(obj.basic.typeID)?"<br/><a class='info' onclick='IGB.info("+obj.basic.typeID+");'>"+obj.basic.typeName+"</a>":"",
				"<br/><span style='color:hsl(",(obj.basic.security>=0)?Math.round(200*obj.basic.security*obj.basic.security):0,",100%,50%);'>&bull;&nbsp;",FormatNumber(obj.basic.security,3),
					"</span><span class='plain'>&nbsp;&nbsp;|&nbsp;&nbsp;",FormatNumber(obj.basic.radius),"AU&nbsp;&nbsp;|&nbsp;&nbsp;<span class='planet'>",
					obj.basic.planetCount,"</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span class='moon'>",obj.basic.moonCount,"</span></span><div id='trapped''></div>",
			"</div></div>",

			// SOS in current solar system
			(obj.trapped) ? (function(){/*
				var snippets = ["<div id='trapped-info' class='accordion'><h3>求救信息</h3><div>"];
				for( var i in obj.trapped)
				{
					snippets.push
					(
						obj.trapped[i].roleId ? "<a href='javascript:void(0);' onclick='IGB.pilot("+obj.trapped[i].roleId+");'>"+obj.trapped[i].name+"</a>" : obj.trapped[i].name,
						"&gt;&nbsp;",obj.trapped[i].words,"&nbsp;",
						obj.trapped[i].reward ? "<br/>"+FormatNumber(obj.trapped[i].reward)+"&nbsp;ISK&nbsp;&nbsp;" : "",
						obj.trapped[i].contact,"<br/><span style='color:grey;'>发布于",obj.trapped[i].days,"天前</span><br/>"
					);
				}
				snippets.push("</div></div>");
				return snippets.join("");*/
			})():"",
			
			(obj.beacon) ? function(data){
				return ["<div id='beacon' class='accordion'><h3>",obj.beacon.title,"</h3><div>",
				"<a  class='info' title='",obj.beacon.description,"' onclick='IGB.info(",obj.beacon.typeID,");'>",obj.beacon.typeName,"</a>",
					_renderAttrs(data.bonuses),
					/* "<table>",function(){
						var snippets=[];
						for(var key in obj.beacon.bonuses){
							var item = obj.beacon.bonuses[key];
							snippets.push(
								["<tr><td align='right' color=''>",item[4],item[5],"</td><td style='color:#999;'>",item[3],"</td></tr>"].join('')
								//["<span style='color:#aaa;'>",item[3],"</span>:&nbsp;&nbsp;",item[4],item[5]].join("")
							);
						}
						return snippets.join("");
					}(),"</table>", */
				"</div></div>"].join("");
			}(obj.beacon) : "",
			
			"<div id='wormhole' class='accordion'>",
				"<h3>",obj.wormholes.title,"</h3><div><table>",
					(function(){
						var snippets=[];
						for(var key in obj.wormholes.localStatic){
							var item = obj.wormholes.localStatic[key];
							snippets.push([
								"<tr title='Static ",item[3],"mKg&nbsp;",item[4],"H'><td width=56><a class='wormhole' href='#showinfo/hole/",item[1],"'>",item[1],"</a></td><td><span class='whStatic'>*",
								obj.wormholes.connect,"</span>&nbsp;<span class='class",item[2],"'>","&nbsp;",obj.classes[item[2]],"</span></td></tr>"
							].join(""));
						}
						for(var key in obj.wormholes.classRoam){
							var item = obj.wormholes.classRoam[key];
							snippets.push([
								"<tr  title='Roaming ",item[3],"mKg&nbsp;&nbsp;",item[4],"H'><td width=56><a class='wormhole' href='#showinfo/hole/",item[1],"'>",item[1],"</a></td><td><span class='whRoam'>?",
								obj.wormholes.connect,"</span>&nbsp;<span class='class",item[2],"'>","&nbsp;",obj.classes[item[2]],"</span></td></tr>"
							].join(""));
						}
						return snippets.join("");
					})(),
				"</table></div>",
				"<h3>",obj.wormholes.title2,"</h3><div><table>",
					(function(){
						var snippets=[];
						for(var key in obj.wormholes.commonRand){
							var item = obj.wormholes.commonRand[key];
							snippets.push([
								"<tr  title='Random ",item[3],"mKg&nbsp;",item[4],"H'><td width=56><a class='wormhole' href='#showinfo/hole/",item[1],"'>",item[1],"</a></td><td><span class='whRandom'>?",
                                obj.wormholes.connect,"</span>&nbsp;<span class='class",item[2],"'>",/*(item[2]<7)?"Class"+item[2]:"","&nbsp;"*/,obj.classes[item[2]],"</span></td></tr>"
							].join(""));
						}
						return snippets.join("");
					})(),
				"</table></div></div>",

			"<div id='sites' class='accordion'>",
			(function(){
				var snippets=[];
				var icons=["anomaly","relic","data","gas","ore"];
				for(var key in obj.sites){
					var icon = icons.shift();
					snippets.push("<h3>",key,"</h3><div><table>");
					for(var key2 in obj.sites[key]){
						snippets.push(
						"<tr><td>",
							obj.basic.wormholeClassID<7||obj.basic.wormholeClassID>9?
							["<a class='",icon,"' href='#showinfo/site/"+key2,"'>",
							obj.sites[key][key2],"</a>"].join(''):
							["<span class='",icon," plain'>",obj.sites[key][key2],"</span>"].join(''),
						"<td></tr>");
					}
					snippets.push("</table></div>");
				}
				return snippets.join("");
			})(),"</div>",
			
			"<div id='celestial' class='accordion'>",
			"<h3>",obj.celestial['title'],"</h3><div><table>",
				(function(){
					var snippets=[];
					for(var key in obj.celestial.planets){
						var item = obj.celestial.planets[key];
						snippets.push(
							["<tr title='",item[1],"&nbsp;&nbsp;",FormatNumber(item[7]),"AU'><td class='planet'>",item[2].split(" ").pop(),"</td>","<td><span class='planet",item[3],"'>",item[4],"</span></td>",
							"<td align='right'>&nbsp;",FormatNumber(item[5]/1000),"km&nbsp;&nbsp;</td><td class='moon' align='left'>",item[6],"</td></tr>"].join("")
						);
					}
					return snippets.join("");
				})(),
			"</table></div></div>",
				
			(obj.links)?function(data){
				var snippets = ["<div id='links' class='accordion' ><h3>",data.title,"</h3><div>"];
				for(var key in data.list){
					snippets.push( "<a class='jump' href='",data.list[key][1],"' target='_blank'>",data.list[key][0],"</a><br/>");
				}
				snippets.push("</div></div>");
				return snippets.join("");
			}(obj.links):"",

		].join("") );

		$(".accordion").accordion(VW.accordionData);

		$.get("./trapped.php?type=2&solar="+obj.basic.solarSystemName+(VW.DEV?"&DEV":""),function(data){
			var trapped = JSON.parse(data);
			if(!trapped)return;
			var snippets = [];
			for( var i in trapped )
			{
				snippets.push
				(
					"<br/>",
					trapped[i].roleId ? "<a href='javascript:void(0);' onclick='IGB.pilot("+trapped[i].roleId+");'>"+trapped[i].name+"</a>" : trapped[i].name,
					"&gt;&nbsp;",trapped[i].words,"&nbsp;",
					trapped[i].reward ? "<br/>"+FormatNumber(obj.trapped[i].reward)+"&nbsp;ISK&nbsp;&nbsp;" : "",
					trapped[i].contact,"<br/><span style='color:grey;'>",ElapsedTime(trapped[i].updated),"</span><br/>"
				);
			}
			$("#trapped").html(snippets.join(""));
			
        });

		////////////////////////// pilot activities
		//htmls=[];

		// //eve api kills
		// if( obj.kills )
		// {

			// htmls = ["<div id='kills-info'><h3>48小时击杀记录</h3><div id='kills-chart' style='overflow:auto;position:relative; height:120px; background:#555555; padding:1px;'></div></div>"];
			// $("#results").append( htmls.join("") );
			// $("#kills-info").accordion(accordionData);
			
			// var killsMap = {};
			// for(var i in obj.kills)
			// {
				// killsMap[ obj.kills[i]["hours"] ] = obj.kills[i];
			// }
			
			// var graphic = new linechart.LineChart();
			// for( var i =0; i<=48; ++i )
			// {
				// var kills = killsMap[i+""];
				// var scale = "";
				// if(i%6==0) scale = i+ "";
				// graphic.add( scale, kills ? kills["factionKills"] : 0 );
			// }

			// graphic.render("kills-chart", "", 100);
		// }
		
		

		//$("#message").html("");
		
		/*
		function makeSiteList( array ){
			var snippets=[];
			for(var key in array)
			{
				var item = array[key];
				snippets.push("<div><a href='#panel-search/site/"+item+"' target='venus_wormhole_site_detail'><img src='./Images/38_16_30.png'/>"+item+"</a></div>");
			}
			return snippets.join("");
		}
		*/
	}

	function _renderAllAttrs(data)
	{
		var snippets=["<div id='attrs' class='accordion'>"];
		for(var key in data){
			snippets.push("<h3>",key,"</h3><div>");
			snippets.push(_renderAttrs(data[key]));
			snippets.push("</div>");
		}
		snippets.push("</div>");
		return snippets.join("");
	}

	function _renderAttrs(data2)
	{
		var snippets = ['<table>'];
		for(var key2 in data2){
			var attr=data2[key2];
			snippets.push("<tr><td align='right'>",
			attr[2]!=="typeID"?
				[FormatNumber(attr[1]),attr[2]].join(''):
				["<a href='#showinfo/item/",attr[1],"'><img class='icon' src='",VW.EIS,"Type/",attr[1],"_32.png' style='border:solid yellow thin;'/></a>"].join(''),
			"</td><td class='plain'>",attr[0],"</td></tr>");
		}
		snippets.push('</table>');
		return snippets.join("");
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

});////////////////////////////////////////////////////////////////


   	function ShowRegionInfo( obj )
    {
        if(VW.DEV)console.log("ShowRegionInfo");
		if(!Validate(obj))return;
        
        var htmls =
        [
			"<div id='basic'>",
				"<h3>基本信息</h3><div></div>",
			"</div><div id='const'>",
				"<h3>星座列表</h3><div></div>",
			"</div>"
		];
		$("#results").html( htmls.join("") );
        
        htmls =
        [
            "<span><img class='icon' src='./Images/7_64_4.png'/><strong class='title'>&nbsp;",obj.name,"</strong></span>",
            "<a href='javascript:void(0);' onclick='IGB.region(",obj.igID,")' title='显示信息'><img src='./Images/38_16_208.png'/></a>",
            "<br/>等级:&nbsp;<span class='c",Letters[obj.name[0]],"'>",ClassTypes[Letters[obj.name[0]]],"</span><br/>"
        ];
        $("#basic div").html( htmls.join("") );
        
        htmls = [];
        for( var i in obj.consts )
        {
            htmls.push(
                "<img class='icon' src='./Icons/7_64_4.png'/><a href='#panel-search/constellation/",obj.consts[i].name,"'>",obj.consts[i].name,"</a>",
                "&nbsp;&nbsp;",obj.consts[i].wormhole.replace(/([A-Z]\d{3})/gi,"<a href='#panel-search/hole/$1'>$1</a>"),"<br/>"
            );

        }
        $("#const div").html( htmls.join("") );
        
        $("#basic").accordion(accordionData);
		$("#const").accordion(accordionData);
        $("#message").html("");
    }
    
   	function ShowConstlInfo( obj )
    {
        if(VW.DEV)console.log("ShowConstellationInfo");
		if(!Validate(obj))return;
        
        var htmls =
        [
			"<div id='basic'>",
				"<h3>基本信息</h3><div></div>",
			"</div><div id='solar'>",
				"<h3>星系列表</h3><div></div>",
			"</div>"
		];
		$("#results").html( htmls.join("") );
        
        htmls =
        [
            "<span><img class='icon' src='./Icons/7_64_4.png'/><strong class='title'>&nbsp;",obj.name,"</strong></span>",
            "<a href='javascript:void(0);' onclick='IGB.cnstl(",obj.igID,")' title='显示信息'><img src='./Icons/38_16_208.png'/></a><br/>",
            "星域:&nbsp;<a href='#panel-search/region/",obj.region,"'>",obj.region,"</a><br/>",
            "等级:&nbsp;<span class='c",Letters[obj.name[0]],"'>",ClassTypes[Letters[obj.name[0]]],"</span><br/>",
            "虫洞:&nbsp;",obj.wormhole?obj.wormhole.toString().replace(/([A-Z]\d{3})/gi,"<a href='#panel-search/hole/$1'>$1</a>"):""
        ];
        $("#basic div").html( htmls.join("") );
        
        htmls = [];
        for( var i in obj.solars )
        {

            htmls.push
            (
                "<img src='./Images/38_16_254.png'/><a href='#panel-search/solar/",obj.solars[i].name,"'>",obj.solars[i].name,"</a>&nbsp;",obj.solars[i].anomaly,"<br/>"
            );

        }
        $("#solar div").html( htmls.join("") );
        
        $("#basic").accordion(accordionData);
		$("#solar").accordion(accordionData);
        $("#message").html("");
        
        $("#activities").html("<div id='starmap' style='margin-top:-20px;position:relative; width:400px; height:400px;'></div>");
        htmls = [];
        for(var i in obj["starmap"])
        {
            htmls.push("<a href='#panel-search/solar/",obj["starmap"][i].solarSystemName,"'></a>");
        }
        $("#starmap").html( htmls.join("") );
        $("#starmap a").css({"position":"absolute"});
        
        starmap.starmap("starmap",obj["starmap"]);

    }


