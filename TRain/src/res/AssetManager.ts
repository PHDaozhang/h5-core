/**
 * Created by wjdeng on 2015/11/4.
 */

module TRain
{
    export class TexData extends egret.Texture
    {
        public name:string;
        public pname:string;
        public conf:any; //配置信息

        //---------------- 以下 内部 使用
        private _refCnt:number = 0;
        public $hasRef():boolean
        {
            return this._refCnt>0;
        }

        public $addRef():void
        {
            this._refCnt++;
        }

        public $subRef():void
        {
            this._refCnt--;
            if( DEBUG )
            {
                if( this._refCnt<0 )
                {
                    egret.error( "warning refCnt is navigate" );
                }
            }
        }

        public dispose(){
            super.dispose();

            if(this.conf) this.conf = null;
        }
    }


    export interface TexCallBack
    {
        (data:TexData,source:string):void;
    }

    export interface FontCallBack
    {
        (data:egret.BitmapFont,source:string):void;
    }

    export const enum RES_TYPE{
        JSON = 'json',
        IMAGE = 'image',
        SHEET = 'st',
        FONT = 'fnt',
        MC = 'mc'
    }

    export class AssetManager
    {
        //生成 texData的  font不多，留后期处理
        public static texTps:string[] = [RES_TYPE.IMAGE, RES_TYPE.MC];
        //-------------------------------------------------
        private _imgsetList:Object;

        private _texList:{[key:string]:TexData};
        private _waitGCs:string[];
        constructor()
        {
            let self = this;
            self._imgsetList = {};
            self._waitGCs = [];
            self._texList = {};
        }

        //---------------------------------------------------------------------------
        public releaseTex( texData:TexData ):void
        {
            let self = this;
            let parentNm = texData.pname;
            if( parentNm )
            {
                let imgSet:ImageSet = self._imgsetList[parentNm];
                imgSet.releaseBubTex(texData);
            }
            else
            {
                texData.$subRef();
                if( !texData.$hasRef() )
                {
                    //delete self._texList[texData.name];
                    self._waitGCs.push(texData.name);
                }
            }
        }

        private onTexLoadFin( data:any, source:string ):TexData
        {
            let self = this;
            let texData;
            if ( !(data instanceof TexData) )
            {
                texData = new TexData();
                texData.name = source;
                texData.$bitmapData = data.$bitmapData;
                texData.$initData(data.$bitmapX, data.$bitmapY, data.$bitmapWidth, data.$bitmapHeight, data.$offsetX, data.$offsetY, data.$sourceWidth, data.$sourceHeight, data.$sourceWidth, data.$sourceHeight);

                self._texList[source] = texData;
            }
            else{
                texData = data;
            }
            return texData;
        }

        public getTex(source:string, cb:TexCallBack, thisObj:any, tp?:string ): void
        {
            let self = this;
            let isUrl = source.indexOf("/")>=0;
            if( !isUrl ){
                let idx = source.indexOf("@");
                if( idx > 0 )
                {
                    let imgName = source.substring(0, idx);
                    let subName = source.substr(idx+1);
                    let imgSet:ImageSet = self._imgsetList[imgName];
                    if( !imgSet )
                    {
                        imgSet = new ImageSet( imgName );
                        self._imgsetList[imgName] = imgSet;
                    }
                    imgSet.getTexture(subName, function(data:TexData){cb.call(this,data,source);}, thisObj);
                    return;
                }
            }

            let texData = <TexData>self._texList[source];
            if(texData)
            {
                texData.$addRef();
                cb.call(thisObj, texData, source);
                return;
            }

            tp = tp || RES_TYPE.IMAGE;
            let callBack = function (data: any): void {
                    let texData:TexData;
                    if( data )
                    {
                        texData = self.onTexLoadFin(data, source);
                        texData.$addRef();
                    }
                    cb.call(thisObj, texData, source);
                };
 
            if( isUrl ){
                RES.getResByUrl(source, callBack, self, tp);
            }
            else{
                if (RES.hasRes(source)) {
                    RES.getResAsync(source, callBack, self);
                }
                else {
                    RES.getResByUrl(CONF.imgUrl + source + ".png", callBack, self, tp);
                }
            }
        }

        public doGC():void
        {
            let self = this;
            let texList = self._texList;
            let names = self._waitGCs;
            for( let name of names )
            {
               let texData = texList[name];
               if( texData && !texData.$hasRef() ){
                    delete texList[name];
                    RES.destroyRes( name );
               }
            }
            names.length = 0;
        }

        //-----------------------------------------------------------------------------------
        public getFont( name:string, cb:FontCallBack, thisObject:any ):void
        {
            var url = CONF.fontUrl + name + ".fnt";
            var data = RES.getAnalyzer("fnt" /* FONT */).getRes(url);
            if (data) {
                cb.call(thisObject, data, name);
                return;
            }
            let callBack = function(data:any):void{
                cb.call(thisObject, data, name);
            }

            RES.getResByUrl(url, callBack, thisObject, RES_TYPE.FONT );
        }

        public getMultiRes( srcs:string[], finFunc:(succ:boolean,datas:any[],userData?:any )=>void, thisObject:any, userData?:any ): void
        {
            let loadedcnt = 0;
            let succ = true;
            let datas = [];
            function onGetRes(data:any, source:string): void
            {
                loadedcnt++;
                if( data )
                {
                    let idx = srcs.indexOf(source);
                    datas[idx] = data;
                }
                else
                {
                    succ = false;
                }

                if( loadedcnt >= srcs.length )
                {
                    finFunc.call(thisObject, succ, datas, userData );
                }
            }

            for( let i=0, n=srcs.length; i<n; ++i )
            {
                RES.getResAsync(srcs[i], onGetRes, this);
            }
        }

        public getUrlRes( tp:string, url:string  ):any{
            return RES.getAnalyzer(tp).getRes(url);
        }

        public destroyRes( name:string  ):any{
            return RES.destroyRes(name)
        }

        public getAsset( source:string, finFunc:(data:any, source:string)=>void, thisObject:any ):void
        {
            if (RES.hasRes(source)) {
                let data = RES.getRes(source);
                if (data) {
                    finFunc.call(thisObject, data, source);
                }
                else {
                    RES.getResAsync(source, finFunc, thisObject);
                }
            }
            else{
                finFunc.call(thisObject, null, source);
            }
        }

        public getUrlAsset( source:string, finFunc:(data:any, source:string)=>void, thisObject: any, tp?:string ):void
        {
            RES.getResByUrl(source, finFunc, thisObject, tp);
        }

        public getUrlAssets( srcs:string[], tps:string[], finFunc:(succ:boolean,datas:any[],userData?:any)=>void, thisObject:any, userData?:any ): void
        {
            let loadedcnt = 0;
            let succ = true;
            let datas = [];
            function onGetRes(data:any, source:string): void
            {
                loadedcnt++;
                if( data ){
                    let idx = srcs.indexOf(source);
                    datas[idx] = data;
                }
                else{
                    succ = false;
                }

                if( loadedcnt >= srcs.length )
                {
                    finFunc.call(thisObject, succ, datas, userData );
                }
            }

            let self = this;
            let texTps = AssetManager.texTps;
            for( let i=0, n=srcs.length; i<n; ++i )
            {
                let tp = tps[i];
                let source = srcs[i];
                if( texTps.indexOf(tp)<0 ){
                    RES.getResByUrl(source, onGetRes, self, tp);
                }
                else{
                    self.getTex(source, onGetRes, self, tp );
                }
            }
        }

        // public createBitmapData(data, callback):void{
        //     let img = new Image();
        //     img.src = "data:image/png;base64," + egret.Base64Util.encode(data);
        //     img.crossOrigin = '*';
        //     let bitmapData = new egret.BitmapData(img);
        //     img.onload = function () {
        //         img.onload = undefined;
        //         bitmapData.source = img;
        //         bitmapData.height = img.height;
        //         bitmapData.width = img.width;
        //         if (callback) {
        //             callback(bitmapData);
        //         }
        //     };
        // };
        
    }

    export let assetMgr:AssetManager = new AssetManager();
}