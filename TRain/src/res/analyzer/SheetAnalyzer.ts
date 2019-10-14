
 
 module TRain
 {
    export class SheetAnalyzer extends RES.BinAnalyzer {
        public getRes(name:string):any {
            return this.fileDic[name];
        } 

        /**
         * 一项加载结束
         */
        public onLoadFinish(event:egret.Event):void {
            let self = this;
            let request = event.target;
            let resData:any = self.resItemDic[request.$hashCode];
            delete self.resItemDic[request.hashCode];
            let resItem = resData.item;
            resItem.loaded = (event.type == egret.Event.COMPLETE);
            if (resItem.loaded) {
                let response:any = request.response;
                let int32Arr = new Uint32Array(response, 0, 2);
                let jsonLen = int32Arr[0];
                let imgLen = int32Arr[1];           
                let imgArr = new Uint8Array(response, 8+jsonLen, imgLen);
                egret.BitmapData.create("arraybuffer",imgArr,function(bitmapData:egret.BitmapData){
                    let texture = new TexData();
                    texture._setBitmapData( bitmapData );

                    let int8Arr = new Uint8Array(response, 8, jsonLen);       
                    let tmpArr = new Uint16Array(int8Arr.length);
                    let i:number, len:number, code:number;
                    for (i=0, len=int8Arr.length; i<len; i++) {
                        code = int8Arr[i];
                        tmpArr[i] = ((code<<4)&0xff)+(code>>4);
                    }

                    let confStr = String.fromCharCode.apply(null, tmpArr);
                    let confStr1:string;
                    let byteOffset = jsonLen + imgLen + 8;
                    //let otherLen = response.byteLength - byteOffset;
                    if( response.byteLength > byteOffset ){
                        let int16Arr = new Uint16Array(response, byteOffset);       
                        tmpArr = new Uint16Array(int8Arr.length);
                        for (i=0, len=int16Arr.length; i<len; i++) {
                            code = int16Arr[i];
                            tmpArr[i] = ((code<<8)&0xff)+(code>>8);
                        }
                        confStr1 = String.fromCharCode.apply(null, tmpArr);
                    }

                    self.parseSpriteSheet( texture, confStr, resItem.name, confStr1 );

                    resData.func.call(resData.thisObject, resItem);
                });
            }
            else{
                resData.func.call(resData.thisObject, resItem);
            }     
            self.recycler.push(request); 
        }

        protected parseSpriteSheet(texData:TexData, jsonStr:string, name:string, otherStr?:string):void  {
            let data = JSON.parse(jsonStr);
            let frames = data.frames;
            if(!frames){
                return;
            }

            texData.name = name;
            texData.conf = frames;
            this.fileDic[name] = texData;
        }

        public destroyRes(name:string):boolean {
            let fileDic = this.fileDic;
            let texData = fileDic[name];
            if( texData ){
                delete fileDic[name];
                texData.dispose();
                return true;
            }
            return false;
        }
    }

    RES.registerAnalyzer( RES_TYPE.SHEET, SheetAnalyzer );
}
