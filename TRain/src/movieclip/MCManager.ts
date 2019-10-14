module TRain
{
    export interface IMCResData
    {
        conf:any;
        sheet:egret.SpriteSheet;
        clips:any;//clips
    }

    export interface IMCLoadInfo
    {
        resName:string,
        mcTp:number,
    }

    export class MCManager
    {
        //=====================================================================================

        private _mcRess:{[key:string]:IMCResData}[];// IMCResData 列表

        private _armTps:Array<string>;

        private _usecnts:Array<Object>; //引用计数
        private _disposeTp:number;
        private _timeoutHandler:number;

        private _loadings:Array<Object>;

        private _mcs:Array<MovieClip>;

        private _oneUrl:boolean;

        constructor()
        {
            let self = this;

            self._timeoutHandler = 0;
            self._mcs = [];
        }

        public doGC():void
        {
            let self = this;
            if( self._timeoutHandler == 0 )
            {
                self._disposeTp = 0;
                self.disposeRess();
                //self._timeoutHandler = core.addDelayDo( self.disposeRess, self, CONF.mcGCTm );
            }
        }

        public stopGC():void
        {
            let self = this;
            if( self._timeoutHandler !== 0 )
            {
                core.rmvDelayDoByID(self._timeoutHandler);
                self._timeoutHandler = 0;
            }
        }

        //----------------------------------------------------------------------------------
        //oneUrl 为true  表示  mc文件都放在同一目录下
        public init( mcTps:Array<string>, oneUrl:boolean ):void
        {
            let self = this;
            self._armTps = mcTps;
            self._oneUrl = oneUrl;

            let mcRess = [];
            let usecnts = [];
            let loadings = [];
            for( let i=0, len=mcTps.length; i<len; i++ )
            {
                mcRess.push( {} );
                usecnts.push( {} );
                loadings.push( {} );
            }
            self._mcRess = mcRess;
            self._usecnts = usecnts;
            self._loadings = loadings;
        }

        //-----------------------------------------------------------------------------------
        private getMCUrl( armtp:number, resName:string ):string
        {
            if( this._oneUrl ){
                return CONF.mcUrl  + resName + ".mc";
            }
            return CONF.mcUrl + this._armTps[armtp] + "/" + resName + ".mc";
        }

        public getMCRess( armtp:number, resName:string, urls:string[], tps:string[] ):void
        {
            let self = this;
            urls.push( self.getMCUrl(armtp, resName) );
            tps.push( RES_TYPE.MC );
        }

        //---------------------------------- 使用计数 --------------------------------------------------
        // private createUsecnt( armtp:number, resName:string ):void
        // {
        //     let usecntData:any = this._usecnts[armtp];
        //     if( !(resName in usecntData) )
        //     {
        //         usecntData[resName] = 0;
        //     }
        // }
        private incUsecnt( armtp:number, resName:string ):void
        {
            let usecntData:any = this._usecnts[armtp];
            if( resName in usecntData )
            {
                usecntData[resName]++;
            }
            else
            {
                usecntData[resName] = 1;
            }
        }
        private decUsecnt( armtp:number, resName:string ):void
        {
            let usecntData:any = this._usecnts[armtp];
            if( usecntData.hasOwnProperty(resName) ){
                usecntData[resName]--;
            }
        }

        //-------------------------------------------------------------------------------------
        //加载 指定动作名字
        public getMCData( armtp:number, resName:string, aniName?:string ):MovieClipData
        {
            let self = this;
            let mcResData:IMCResData = self._mcRess[armtp][resName];
            if( mcResData )
            {
                return self._getMCData( mcResData, armtp, resName, aniName );
            }
            return null;
        }

        public hasMCRes( armtp:number, resName:string ):boolean
        {
            return !!this._mcRess[armtp][resName];
        }

        private _getMCData( mcResData:IMCResData, armtp:number, resName:string, aniName:string ):MovieClipData
        {
            aniName = aniName || "mc";

            let clips = mcResData.clips;
            let clipData:MovieClipData = clips[aniName];
            if( typeof clipData == "undefined" )
            {
                 let sheet = mcResData.sheet;
                 if( sheet )
                 {
                    let mcData = mcResData.conf[aniName];
                    let res = mcData.res || mcResData.conf.res;
                    clipData = new MovieClipData( mcData, res, sheet );
                    clipData.resName = resName;
                    clipData.aniName = aniName;
                    clips[aniName] = clipData;
                 }
                 else
                 {//没有动作数据  则直接为空
                     clipData = null;
                     clips[aniName] = clipData;
                 }
            }

            if( clipData )
            {
                this.incUsecnt( armtp, resName );
            }
            return clipData;
        }

        //加载 指定动作名字
        public getMCDataAsync( armtp:number, resName:string, finBack:( clipData:MovieClipData, armtp:number )=>void, thisObj:any, aniName?:string ):void
        {
            let self = this;

            let mcRess = self._mcRess[armtp];
            let mcResData:IMCResData = mcRess[resName];
            if( mcResData )
            {
                let clipData = self._getMCData( mcResData, armtp, resName, aniName );
                core.addNextDo(finBack, thisObj, clipData, armtp);
                return;
            }

            let loadCallback = function( succ:boolean, armtp:number, resName:string ){
                let mcResData:IMCResData = self._mcRess[armtp][resName];
                let clipData = self._getMCData( mcResData, armtp, resName, aniName );
                finBack.call( thisObj, clipData, armtp );
            };

            self.loadRessImpl( armtp, resName, loadCallback, self );
        }

        //加载 指定资源名字
        public loadMCs( loadInfos:Array<IMCLoadInfo>, callback?:(succ:boolean, args:any)=>void, thisObj?:any, args?:any ):void
        {
            let self = this;
            let loadCnt = loadInfos.length;
            let needLoadInfos = [];
            let loadInfo;
            for( let i=0; i<loadCnt; ++i )
            {
                loadInfo = loadInfos[i];
                if( !self.hasMCRes( loadInfo.mcTp, loadInfo.resName ) ){
                    needLoadInfos.push(loadInfo);
                }
            }

            loadCnt = needLoadInfos.length;
            if( loadCnt == 0 ) {
                if(callback!=null) TRain.core.addNextDo(callback, thisObj, true, args );
                return;
            }

            let loadCallback;
            if( callback!=null ){
                let succ = true;
                let tmpObj = thisObj;
                loadCallback = function( success:boolean, armtp:number,resName:string )
                {
                    loadCnt--;
                    if( !success ) succ = false;
                    if( loadCnt<=0 )
                    {
                        callback.call( tmpObj, succ, args );
                    }
                };

                thisObj = self;
            }
    
            for( let i=0, len=loadCnt; i<len; ++i )
            {
                loadInfo = needLoadInfos[i];
                self.loadRessImpl( loadInfo.mcTp, loadInfo.resName, loadCallback, self );
            }
        }

        //加载 指定资源名字
        public loadMCRes( armtp:number, resName:string, callback?:(succ:boolean,armtp:number,resName:string)=>void, thisObj?:any ):void
        {
            let self = this;
            if( self.hasMCRes( armtp, resName ) ){
                if(callback!=null) TRain.core.addNextDo(callback, thisObj, true, armtp, resName );
                return;
            }

            self.loadRessImpl( armtp, resName, callback, thisObj );
        }

        private loadRessImpl( armtp:number, resName:string, callback?:(success:boolean,armtp:number,resName:string)=>void, thisObj?:any ):void
        {
            let self = this;
            let loadingList = self._loadings[armtp];
            let loadings = loadingList[resName];
            let loadingData = {callback:callback, target:thisObj};
            if( loadings )
            {
                loadings.push( loadingData );
                return;
            }

            loadings = [loadingData];
            loadingList[resName] = loadings;

            let url = self.getMCUrl( armtp, resName );

            function onLoadFin(data:any): void {
                self.onLoadArmResFin( data, armtp, resName );
            }
            assetMgr.getTex( url, onLoadFin, self, RES_TYPE.MC );
        }

        private onLoadArmResFin( data:TRain.TexData, armtp:number, resName:string ):void
        {
            let self = this;
            let mcRess = self._mcRess[armtp];
            let mcResData:IMCResData = mcRess[resName];
            if( mcResData ) return;

            
            mcResData = {conf:null, sheet:null, clips:{}};
            let success = !!data;
            if( success ){
                mcResData.conf = data.conf;
                mcResData.sheet = new egret.SpriteSheet(data);
            }

            mcRess[resName] = mcResData;
            let loadingList = self._loadings[armtp];
            let loadings = loadingList[resName];
            delete loadingList[resName];

            for( let i=loadings.length-1; i>=0; --i )
            {
                let loadData = loadings[i];
                loadData.callback.call( loadData.target, success, armtp, resName );
            }
        }

        public freeMCData( armtp:number, clip:MovieClipData ):void
        {
            this.decUsecnt( armtp, clip.resName );
        }

        private disposeRess():void
        {
            let self = this;
            let disposeTp = self._disposeTp;
   
            let delKeys:Array<string> = [];
      
            let mcRess = self._mcRess[ disposeTp ];
            let usecntData:Object = self._usecnts[ disposeTp ];
            for( let resName in usecntData )
            {
                let usecnt = usecntData[resName];
                if( usecnt <= 0 )
                {
                    let mcResData = mcRess[resName];
                    if(mcResData.sheet){
                        delete mcRess[resName];
                        assetMgr.releaseTex( <TRain.TexData>mcResData.sheet.$texture );

                        delKeys.push( resName );
                    }  
                }
            }

            if( delKeys.length>0 )
            {
                for( let i=0, n=delKeys.length; i<n; ++i )
                {
                    delete usecntData[delKeys[i]];
                }
            }

            disposeTp++;
            if( disposeTp<self._armTps.length )
            {
                self._disposeTp = disposeTp;

                self._timeoutHandler = core.addDelayDo(self.disposeRess, self, CONF.mcGCTm, 0, false);
            }
            else
            {//停止
                self._disposeTp = 0;
                self._timeoutHandler = 0;
            }
        }

        //----------------------------------------------------------------------------------
        public add( mc:MovieClip ):void
        {
            let mcs = this._mcs;
            if( mcs.indexOf(mc) >= 0 ) return;

            mcs.push( mc );
        }

        public remove( mc:MovieClip ):void
        {
            let mcs = this._mcs;
            let idx = mcs.indexOf(mc);
            if( idx >= 0 )
            {
                mcs.splice( idx, 1 );
            }
        }

        public advanceTime( tm:number ):void
        {
            let mcs = this._mcs;
            let length = mcs.length;
            if( length > 0 )
            {
                for( let i=length-1; i>=0; --i )
                {
                    let mc =mcs[i];
                    //remove 可能会同时删除多个
                    if( mc ) mc.advanceTime( tm );
                }
            }
        }
    }

    export let mcMgr:MCManager = new MCManager();
}
