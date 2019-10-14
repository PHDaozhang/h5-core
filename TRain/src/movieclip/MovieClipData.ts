module TRain
{
    export interface IFrameLabel
    {
        name:string;
        frame:number;
        end?:number;
    }

    export class MovieClipData
    {
        //private _mcData:any;
        private _texData:any;
        private _sheet:egret.SpriteSheet;

        public frameRate:number;
        public loop:number;

        public numFrames:number;
        public intervalTime:number;
        public duration:number;

        public frames:any[];
        public labels:any[];
        public events:any;

        public resName:string;
        public aniName:string;

        constructor( mcData:any, texData:any, sheet:egret.SpriteSheet )
        {
            let self = this;
            self.numFrames = 0;
            self.loop = 0;
            self.intervalTime = 0;
            self.duration = 0;
            self.frames = [];

            self._texData = texData;
            self._sheet = sheet;
            //self._mcData = mcData;
            if( mcData )
            {
                self.fillMCData(mcData);
            }
        }

        public clone( reverse:boolean ):MovieClipData
        {
            let self = this;
            let mc = new MovieClipData( null, self._texData, self._sheet );
            mc.numFrames = self.numFrames;
            mc.loop = self.loop;
            mc.frameRate = self.frameRate;
            mc.intervalTime = self.intervalTime;
            mc.duration = self.duration;

            let frames = self.frames.concat();
            mc.frames = reverse ? frames.reverse() : frames;
            mc.labels = self.labels;
            mc.events = self.events;

            mc.aniName = self.aniName;
            mc.resName = self.resName;
            return mc;
        }

        public getKeyFrame(frame:number):any
        {
            return this.frames[frame];
        }

        public getFrameTex(frame:number):egret.Texture
        {
            let frameData = this.getKeyFrame(frame);
            if (frameData.res)
            {
                let outputTexture = this.getTex(frameData.res);
                outputTexture.$offsetX = frameData.x | 0;
                outputTexture.$offsetY = frameData.y | 0;
                return outputTexture;
            }
            return null;
        }

        private getTex(resName:string):egret.Texture
        {
            let self = this;
            let texture = self._sheet.getTexture(resName);
            if (!texture)
            {
                let texData = self._texData[resName];
                texture = self._sheet.createTexture(resName, texData.x, texData.y, texData.w, texData.h);
            }
            return texture;
        }


        private fillMCData( mcData:any ):void
        {
            let self = this;
            let frameRate = mcData.frameRate || 24;
            self.frameRate = frameRate;
            self.intervalTime = 1000/frameRate;

            self.loop = mcData.loop || 0;
            self.fillFramesData(mcData.frames);
            self.fillFramesEvent( mcData.events );
            self.labels = mcData.labels;
        }

        private fillFramesData(framesData:any[]):void
        {
            let self = this;
            let frames = self.frames;
            let length:number = framesData ? framesData.length : 0;
            for (let i = 0; i < length; i++)
            {
                let frameData:any = framesData[i];
                frames.push(frameData);
                if (frameData.duration)
                {
                    let duration:number = frameData.duration;
                    if (duration > 1)
                    {
                        for (let j = 1; j < duration; j++)
                        {
                            frames.push( frameData );
                        }
                    }
                }
            }

            length = frames.length;
            self.numFrames = length;
            self.duration = length * self.intervalTime;
        }

        private fillFramesEvent( eventDatas:any[] ):void
        {
            let length:number = eventDatas ? eventDatas.length : 0;
            if( length > 0 )
            {
                let eventList = {};
                for (let i = 0; i < length; i++)
                {
                    let eventData = eventDatas[i];
                    eventList[eventData.frame] = eventData;
                }
                this.events = eventList;
            }
        }
    }
}
