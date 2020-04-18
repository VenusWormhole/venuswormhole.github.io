/*
	Wrapper of EVE in game browser objects
	
	CCPEVE, HTTP headers
*/

var isEVEIGB = (-1!=navigator.userAgent.indexOf("EVE-IGB"))?true:false;
var IGB = null;

var RACE = 
{
    "Amarr":"艾玛",
    "Caldari":"加达里"
};

define(function(require, exports, module){

	var igb = null;
	if(isEVEIGB)
	{
		igb = CCPEVE;
	}
	else
	{
		igb = {};
		igb.showInfo = function( type, id )
		{
			//if(DEVMODE)console.log(type+","+id);
            if(1377==type) ShowPilotInfo(id);
            else window.location.hash = "#showinfo/item/"+type;
		}
	}
    
    function ShowPilotInfo( id )
    {
        $.get( "./service/EVEAPI.php?type=2&id="+id ,function(data)
        {
            //console.log(data);
            var obj = JSON.parse(data)[0];
            
            $("#"+obj.characterID).remove();
            $("body").append(
            [
                '<div id="',obj.characterID,'" title="角色信息"><table><tr><td>',
                '<img src="http://image.eve-online.com.cn/Character/',obj.characterID,'_128.jpg"/></td><td>',
                '<strong>',obj.characterName,'</strong><br/>',
                '种族:&nbsp;',obj.race,'<br/>',
                '血统:&nbsp;',obj.bloodline,'<br/>',
                '军团:&nbsp;',obj.corporation,'<br/>',
                '联盟:&nbsp;',obj.alliance,'<br/>',
                '安全等级:&nbsp;',obj.securityStatus,'<br/>',
                '</td></tr></table>雇佣记录:<table>',
                (function(array)
                {
                    if( !array.length )
                    {
                        var a = array;
                        array = [];
                        array.push(a);
                    }
                    var htmls = [];
                    for(var i in array)
                    {
                        var item = array[i]["@attributes"];
                        htmls.push('<tr><td><img style="float:left;margin-right:3px;" src="http://image.eve-online.com.cn/Corporation/',item.corporationID,'_32.png"/></td><td>&nbsp;&nbsp;',item.corporationName,'</td><td align="right">',item.startDate,'</td></tr>');
                    }
                    return htmls.join("");
                })(obj.rowset.row),
                '</table></div>'
            ].join(""));
            
            $("#"+obj.characterID).dialog({width:340,height:400});
            
        });
    }
    
    exports.trust = function( url )
    {
		igb.requestTrust( url || window.location.protocol+"//"+window.location.host+"/*" );
    }
	
	exports.info = function(type,id)
    {
        igb.showInfo(type,id);
    }
    
	exports.region = function( id )
    {
        if(id)igb.showInfo(3,id);
    };
    
	exports.cnstl = function( id )
    {
        if(id)igb.showInfo(4,id);
    };
    
	exports.solar = function( id )
	{
		if(id)igb.showInfo(5,id);
	};
    
	exports.pilot = function( id )
	{
		if(id)igb.showInfo(1377,id);
	};
	
	exports.corp = function( id )
	{
		if(id)igb.showInfo(2,id);
	};
	
	exports.fitting = function( shipDNA )
	{
		if(id)igb.showFitting(shipDNA);
	};
    
    exports.joinChat = function(chName)
    {
    	if(chName)igb.joinChannel(chName);
    };
    
    exports.joinMail = function(chName)
    {
    	if(chName)igb.joinMailingList(chName);
    };
    
	
	IGB = exports;
	return exports;	
});