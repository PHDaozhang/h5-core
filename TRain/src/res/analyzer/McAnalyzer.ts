
///<reference path="./SheetAnalyzer.ts" />

module TRain{
    export class MCAnalyzer extends SheetAnalyzer {
        protected parseSpriteSheet(texData:TexData, dataStr:string, name:string):void  {
            let data = JSON.parse( dataStr );
            texData.name = name;
            texData.conf = data;
            this.fileDic[name] = texData;
        }
    }  

    RES.registerAnalyzer( RES_TYPE.MC, MCAnalyzer );
}