module TRain
{
    export class WebVerController implements RES.VersionController
    {
        private _verInfo:any;
        private _cb:{onSuccess: (data: any) => any;onFail: (error: number, data: any) => any};

        public fetchVersion(callback:{onSuccess: (data: any) => any;onFail: (error: number, data: any) => any}):void{
            let self = this;
            if( self._verInfo || !CONF.verFile ){
                callback.onSuccess(null);
                return;
            }

            self._cb = callback;

            let request:egret.HttpRequest = new egret.HttpRequest();
            request.addEventListener(egret.Event.COMPLETE, self.onLoadFinish, self);
            request.addEventListener(egret.IOErrorEvent.IO_ERROR, self.onLoadFinish, self);

            request.responseType = egret.HttpResponseType.TEXT;
            request.open(CONF.verFile);
            request.send();
        }

        private onLoadFinish(event:egret.Event):void {
            let self = this;
            let loadSucess = false;
            if (event.type == egret.Event.COMPLETE) {
                try {
                    let request:egret.HttpRequest = <egret.HttpRequest> (event.target);
                    self._verInfo = JSON.parse(request.response);
                    loadSucess = true;
                }
                catch (e) {
                    egret.log("version parse fail");
                }
            }
            else {
                egret.log("version load fail");
            }

            let cbData = self._cb;
            if (loadSucess) {
                cbData.onSuccess(null);
            }
            else {
                cbData.onFail(1, null);
            }
            self._cb = null;
        }

        public addWebVer( addVerList:any ){
            let verInfo = this._verInfo;
            for( let key in addVerList ){
                let addVer = addVerList[key];
                let verList = verInfo[key];
                if( verList ){
                    for( let subKey in addVer ){
                        verList[subKey] = addVer[subKey];
                    }
                }
                else{
                    verInfo[key] = addVer;
                }
            }
        }

        /**
         * 获取所有有变化的文件
         * @returns {Array<any>}
         */
        public getChangeList():Array<{url:string; size:number}> {
            return [];
        }

        public getVirtualUrl(url:string):string {
            let idx = url.lastIndexOf(".");
            let postfix = url.substring(idx + 1);
            //带了版本号的
            if( postfix.indexOf("?")>0 ) return CONF.resHome + url;

            let verInfo = this._verInfo;
            if(verInfo){
                let verStr:string;
                let typeVerMap = verInfo[postfix];
                if (typeVerMap) {
                    let pathStr = url.substring(0, idx);
                    verStr = typeVerMap[pathStr];
                }
                if (!verStr)
                    verStr = verInfo.ver;

                if( verStr ){
                    return CONF.resHome + url.substring(0,idx) + "_" + verStr + "." + postfix;
                }
            }
            
            return CONF.resHome + url;
        }
    }
}