/* 
	Wrapper of EVE in-game links
	
	Brief: Parse given in-game link text, and retrieve all the useful IDs in it, and convert to IGB link
	
*/

define(function(require, exports, module){

    //><url=showinfo:5//31002392>J111918</url>
    //><url=showinfo:1377//254173564>Venus爱神</url>

    //  ZHY-937	异常空间	矿石地点	边界检查	100.0%	21.00 AU
    // UWU-000	Cosmic Anomaly	Combat Site	Guristas Hideaway	100.0%	22.04 AU
    // IEH-560	Cosmic Signature	Combat Site		37.2%	19.74 AU
    // RSI-769	Cosmic Anomaly	Combat Site	Anomaly Training Site	100.0%	15.07 AU
    
    // Circadian Seeker<br>Distance: 2,242 m<br>Bounty: 10,000 ISK
	//无畏无用 > <url=showinfo:2//817720918>0漩涡0</url>
	//无畏无用 > <url=showinfo:2498//60005071>总部</url>
	//无畏无用 > <url=showinfo:1377//342310834>无畏无用</url>
	//无畏无用 > <url=showinfo:5//31002392>J111918</url>
	//无畏无用 > <url=showinfo:1377//90181134>wkineve</url> 
	//米拉-珍妮 > <url=showinfo:1378//342310834>无畏无用</url>
	//<url=showinfo:5//31002454 alt='当前星系'>J140200</url></b> <color=0xffff0000L><hint='安全等级'>-1.0</hint></color><fontsize=12>
	//<url=showinfo:5//31002109 alt='当前星系'>J162007</url></b> <color=0xffff0000L><hint='安全等级'>-1.0</hint></color><fontsize=12>
	//无知围观群众 > <url=showinfo:30703//9000308351000123019>虫洞 V753</url>
	//无知围观群众 > <url=showinfo:1383//90938739>无知围观群众</url>
	//无知围观群众 > <url=showinfo:1383//90060808>喵 斯卡雷特</url>
	//无知围观群众 > <url=showinfo:1377//91106223>米拉-珍妮</url>
	//无知围观群众 > <url=showinfo:1373//91370991>H天蝎座H</url>
	//无知围观群众 > <url=showinfo:1373//91308409>硝烟之殇</url>
	//无知围观群众 > <url=showinfo:1377//90181134>wkineve</url>
	//无知围观群众 > <loc><url=showinfo:1378//342310834>无畏无用</url>
	//突击的闪电 > <url=killReport:5124716:20a24e9e2a5b60f75e608f8cf276f25ab7203b31>击毁：Wolf Lancer (渡鸦级)</url>  怒爆
    //无畏无用 > <url=showinfo:3//10000002>伏尔戈</url>
	//<a href=showinfo:1373//91212784>笑胡</a>
    //<url=openCareerAgents:>EVE里的职业发展</url>
	//Venus爱神 > <url=showinfo:37472>升级的复仇者</url>
	//贝尔特·呼鲁姆<br>距离：28 km<br>赏金：2,000 ISK
	//毒品贩子<br>距离：35 km<br>赏金：2,000 ISK
	//图塔吉 VI - 卫星 1 - 应用知识学院<br>距离：12.0 AU
	//<url=showinfo:5//30001407 alt='当前星系'>图塔吉</url></b> <color=0xff33ffffL><hint='安全等级'>1.0</hint></color><fontsize=12><fontsize=8> </fontsize>&lt;<fontsize=8> </fontsize><url=showinfo:4//20000206>咖诺拉</url><fontsize=8> </fontsize>&lt;<fontsize=8> </fontsize><url=showinfo:3//10000016>长征</url>
	//卡卡克拉<br>距离：12.0 AU
	//统合部警队指挥官<br>距离：32 km
	//Mat SS<br>距离：74,324 km<br>安全等级0.2
	//艾利克斯安布雷拉<br>距离：2,646 m<br>安全等级0.0
	//sun514 > <url=contract:30000142//25341661>巨鸟级 (物品交换)</url> 吉他骗子太无耻了。
	//巅峰之猫<br>距离：29 km<br>安全等级2.9<br>赏金：538,888,888 ISK

	var reShowInfo	=	null;
	exports.info = function( text )
	{
        if(!reShowInfo) reShowInfo = /showinfo:([\d]{1,5})\/\/([\d]{6,10})>([\S]{1,256}?)</im;
		if(text)
		{
			text+="";
			var result = reShowInfo.exec(text);
			if( result )
			{
				return "<a class='info' href='javascript:void(0);' onclick='IGB.info("+result[1]+","+result[2]+");'>"+result[3]+exports.icon()+"</a>";
			}
		}
		return null;
	}
	
	var reCharactor = null;
	exports.pilot = function (text)
	{
        if(!reCharactor) reCharactor = /showinfo:(1\d\d\d)\/\/([\d]{6,12})>([\S ]{1,256}?)</im;
		if(text)
		{
			text+="";
			var result = reCharactor.exec(text);
			if( result )
			{
				var igblink = "<a class='info' href='javascript:void(0);' onclick='IGB.pilot("+result[2]+");'>"+result[3]+"</a>";
				return {"id":result[2],"txt":result[3],"link":igblink};
			}
		}
		return null;
	}
	
	var reSolarSys	= null;
	exports.solar = function ( text )
	{
        if(!reSolarSys) reSolarSys	= /showinfo:(5)\/\/(3[\d]{7})>([\S]{1,256}?)</im;
		if(text)
		{
			text+="";
			var result = reSolarSys.exec(text);
			if( result )
			{
				var igblink = "<a class='info' href='javascript:void(0);' onclick='IGB.solar("+result[2]+");'>"+result[3]+"</a>";
				return {"id":result[2],"txt":result[3],"link":igblink};
				//return "<a href='javascript:IGB.solar("+result[2]+");'>"+result[3]+exports.icon()+"</a>";
			}
		}
		return null;
	}
	
	var reWhSolar	= /showinfo:(5)\/\/(31[\d]{6}).*?>(J[\d\+\-]{6})</im;
	exports.whSolar = function (text)
	{
		if(text)
		{
			text+="";
			var result = reWhSolar.exec(text);
			if( result )
			{
				var igblink = "<a class='info' href='javascript:void(0);' onclick='IGB.solar("+result[2]+");'>"+result[3]+"</a>";
				return {"id":result[2],"txt":result[3],"link":igblink};
				//return "<a href='javascript:IGB.solar("+result[2]+");'>"+result[3]+exports.icon()+"</a>";
			}
		}
		return null;
	}
	
	//Venus爱神 > <url=fitting:4310:9568;1:8261;1:31718;2:519;2:2281;3:31790;1:6325;1:9497;8:6175;1::>龙卷风级</url>
    //Venus爱神 > <url=fitting:17920:2048;1:16481;1:26914;2:1447;1:25948;3:2032;3:15729;2:3540;2:3065;4:4025;1:2364;1:4029;1:2454;10:2456;3:23711;1:255;4:256;4:257;4:259;4:261;4:262;4:23105;4:30013;10::>0毁电型0 3级洞</url>
	//Venus爱神 > <url=fitting:24702:2048;1:5443;1:31718;1:519;3:2281;1:32780;1:31790;2:1999;1:2897;6:14230;1:5975;1:2488;5:21896;1716:21904;1874:21922;2088:32006;33::>暴风级</url>
	//Venus爱神 > <url=fitting:28659:15810;3:26374;2:14152;1:14154;1:15947;1:18799;2:2032;4:3057;4:33400;1:19036;2:23707;5:23723;5:23731;5:12820;4:23113;4::>帕拉丁级</url>
	//Venus爱神 > <url=fitting:28659:1248;1:14144;2:14146;1:26374;2:15810;3:19311;1:33400;1:3065;4:15963;1:4348;2:19198;1:2456;5:23707;5:32787;5:12816;8:12820;11:12828;8:23105;4:23113;8:28668;1683:28999;3:29001;3:30013;8:30486;8::>帕拉丁级</url>

	var regexFitting = null;
	exports.fitting = function(text)
	{
		if(!regexFitting) regexFitting = /fitting:([\d;:]+)>(.+)</im;
		var re = regexFitting.exec(text);
		if(re)
		{
			var igblink = "<a class='info' href='javascript:void(0);' onclick='IGB.fitting("+re[1]+");'>"+re[4]+"</a>";
			return {
				"id":re[1], // ship DNA 
				"txt":re[2],
				"link":igblink
			};
		}
		return null;
	}
	
	/*
		Replace all the EVE Link supported by IGB
	*/
	exports.replace = function ( text )
	{
	
	}
	
	exports.icon = function ()
	{
		return "<img title='显示信息' src='"+VW.IMG+"/38_16_208.png'></img>"
	}

	return exports;
});
