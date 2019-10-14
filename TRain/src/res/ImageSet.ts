/**
 * Created by wjdeng on 2015/11/4.
 */

module TRain
{
    interface ISubData
    {
        x:number;
        y:number;
        w:number;
        h:number;
        ox:number;
        oy:number;
        sw:number;
        sh:number;
        scale9grid?:string;
    }

    export interface ITexDataGetFun
    {
        comp:(data:TexData)=>void;
        thisObj:any;
        name:string;
        subTexData?:TexData;
    }

    export class ImageSet
    {
        //--------------------------------------------------------------------
        public name:string;

        private _texData:TexData;
        private _subTexs:Object;
        private _refCnt:number;

        private _cbs:Array<ITexDataGetFun>;
        constructor( name:string )
        {
            let self = this;
            self.name = name;
            self._cbs = [];
            self._subTexs = {};
            self._refCnt = 0;
        }

        public getTexture( subname:string, compFunc:(data:TexData)=>void, thisObject:any ):void
        {
            let self = this;
            if( !self._texData )
            {
                let callbacks = self._cbs;
                callbacks.push( {name:subname, comp:compFunc, thisObj:thisObject} );
                if( callbacks.length === 1 )
                {
                    assetMgr.getTex(CONF.sheetUrl + self.name + ".st", self.loadImageSetFin, self, RES_TYPE.SHEET);
                }
                return;
            }

            let subTexData = self._getTexture(subname);
            compFunc.call(thisObject, subTexData);
        }

        private _getTexture( subname:string ):TexData
        {
            let self = this;
            let subTexData = <TexData>self._subTexs[subname];
            if( !subTexData )
            {
                let texData = self._texData;
                let config:ISubData = texData.conf[subname];
                if( config )
                {
                    subTexData = new TexData();
                    subTexData.name = subname;
                    subTexData.pname = self.name;
                    subTexData.$bitmapData = texData.$bitmapData;

                    //会被拉伸的纯色图片，以"mk_"为前缀，处理时会向内缩1象素， 避免与周围色融合
                    if(subname.indexOf("mk_")==0){
                        //高拉伸
                        if(subname.indexOf("mk_h_")==0){
                            subTexData.$initData(config.x, config.y+1, config.w, config.h-2, config.ox, config.oy, config.sw, config.sh-2, texData.$sourceWidth, texData.$sourceHeight);
                        }
                        //宽拉伸
                        else if(subname.indexOf("mk_w_")==0){
                            subTexData.$initData(config.x+1, config.y, config.w-2, config.h, config.ox, config.oy, config.sw-2, config.sh, texData.$sourceWidth, texData.$sourceHeight);
                        }
                        else{
                            subTexData.$initData(config.x+1, config.y+1, config.w-2, config.h-2, config.ox, config.oy, config.sw-2, config.sh-2, texData.$sourceWidth, texData.$sourceHeight);
                        }                       
                    }
                    else{
                        subTexData.$initData(config.x, config.y, config.w, config.h, config.ox, config.oy, config.sw, config.sh, texData.$sourceWidth, texData.$sourceHeight);
                        if(config["scale9grid"]){
                            let str:string = config["scale9grid"];
                            let list:string[] = str.split(",");
                            subTexData["scale9Grid"] = new egret.Rectangle(parseInt(list[0]),parseInt(list[1]),parseInt(list[2]),parseInt(list[3]));
                        }
                    }                
                    self._subTexs[subname] = subTexData;
                }
            }

            if( subTexData ){
                subTexData.$addRef();
                self._refCnt++;
            }
            else{
                egret.log( "subTexture not find  subname=" + subname + "  name=" + self.name );
            }
            return subTexData;
        }

        private loadImageSetFin( texData:TexData ): void
        {
            let self = this;
            let callbacks = self._cbs;
            let length = callbacks.length;
            let callData:ITexDataGetFun;
            if( texData )
            {
                self._texData = texData;

                let texList = self._subTexs;
                let bitmapData = texData.$bitmapData;
                for( let key in texList )
                {
                    let subTexData:TexData = texList[key];
                    subTexData.$bitmapData = bitmapData;
                }

                let i = 0;
                for( i=0; i<length; ++i )
                {//先加好计数 再回调  避免被释放
                    callData = callbacks[i];
                    callData.subTexData = self._getTexture( callData.name );
                }

                for( i=0; i<length; ++i )
                {
                    callData = callbacks[i];
                    callData.comp.call( callData.thisObj, callData.subTexData );
                }
            }
            else
            {
                for( let i=0; i<length; ++i )
                {
                    callData = callbacks[i];
                    callData.comp.call( callData.thisObj, null);
                }
            }

            callbacks.length = 0;
        }

        public releaseBubTex( texData:TexData ):void
        {
            texData.$subRef();

            let self = this;
            self._refCnt--;
            if( DEBUG )
            {
                if( self._refCnt<0 )
                {
                    egret.error( "warning releaseBubTex refCnt is navigate" );
                }
            }
        
            if( self._refCnt<=0 )
            {
                let texList = self._subTexs;
                for( let key in texList )
                {
                    let subTexData:TexData = texList[key];
                    subTexData.$bitmapData = null;
                    if( DEBUG )
                    {
                        if( texData.$hasRef() )
                        {
                            egret.error( "ImageSet doGC  ref has user name=" + self.name +"."+ texData.name );
                        }
                    }
                }

                texData = self._texData;
                self._texData = null;
                assetMgr.releaseTex( texData );
            }
        }
    }
}
