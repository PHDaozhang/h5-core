
///<reference path="./SheetAnalyzer.ts" />

egret.BitmapFont.prototype.getTexture = function(name:string):egret.Texture{
    let self = this;
    let texture:egret.Texture = self._textureMap[name];
    if (!texture) {
        let c:any = self.charList[name];
        if( !c ){
            let charTrans = self.charTrans;
            if( charTrans ) c = self.charList[charTrans[name]];
        }
        if (c) {
            texture = self.createTexture(name, c.x, c.y, c.w, c.h, c.ox, c.oy,c.sw,c.sh);
            self._textureMap[name] = texture;
        }
    }
    return texture;
}

egret.BitmapFont.prototype._getFirstCharHeight = function():number{
    let self = this;
    if(self.firstCharHeight==0){
        for(let str in self.charList){
            let c:any = self.charList[str];
            if(c){
                let sourceH:number = c.sw;
                if(sourceH === undefined){
                    let h:number = c.h;
                    if(h===undefined){
                        h = 0;
                    }
                    let offY:number = c.oy;
                    if(offY === undefined){
                        offY = 0;
                    }
                    sourceH = h+offY;
                }
                if(sourceH<=0){
                    continue;
                }
                this.firstCharHeight = sourceH;
                break;
            }
        }
    }
    return this.firstCharHeight;
}

module TRain{
  
    export class FontAnalyzer extends SheetAnalyzer {
        
        protected parseSpriteSheet(texData:TexData, jsonStr:string, name:string, otherStr?:string):void  {
            let data = JSON.parse(jsonStr);
            let bitmapFont = new egret.BitmapFont(texData, data);

            if( otherStr ){
                bitmapFont["charTrans"] = JSON.parse(otherStr);
            }
            this.fileDic[name] = bitmapFont;
        }

        public destroyRes(name:string):boolean {
            let fileDic = this.fileDic;
            let bitmapFont:egret.BitmapFont = fileDic[name];
            if( bitmapFont ){
                delete fileDic[name];
                bitmapFont.dispose();
                return true;
            }
            return false;
        }
    }

    RES.registerAnalyzer( RES_TYPE.FONT, FontAnalyzer );
}