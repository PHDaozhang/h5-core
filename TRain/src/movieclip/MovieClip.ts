module TRain
{
    export const enum MovieClipKeys
    {
        bitmapData,
        movieClipData,
        smoothing,
        isPlaying,
        intervalTime,
        playTimes,
        startFrame,
        totalFrames,
        currFrame,
        passedTime
    }



    export class MovieClip extends egret.DisplayObject
    {
        public userdata:any;

        protected $MovieClip:Object;

        constructor()
        {
            super();

            let self = this;
            self.$MovieClip = [
                null,//bitmapData,
                null,//movieClipData,
                egret.Bitmap.defaultSmoothing,//smoothing,
                false,//isPlaying
                0,//intervalTime
                0,//playTimes,
                0,//startFrame,
                0,//totalFrames,
                0,//currFrame,
                0,//passedTime
            ];

            //self.$renderRegion = new egret.sys.Region();
            self.$renderNode = new egret.sys.BitmapNode();
        }

        public dispose():void
        {
            let values = this.$MovieClip;
            values[MovieClipKeys.bitmapData] = null;
            values[MovieClipKeys.movieClipData] = null;
        }

        public get smoothing():boolean
        {
            return this.$MovieClip[MovieClipKeys.smoothing];
        }

        public set smoothing(value:boolean)
        {
            value = !!value;
            this.$MovieClip[MovieClipKeys.smoothing] = value;
        }

        public get totalFrames():number
        {
            return this.$MovieClip[MovieClipKeys.totalFrames];
        }

        public get currentFrame():number
        {
            return this.$MovieClip[MovieClipKeys.currFrame];
        }

        public get frameRate():number
        {
            let intervalTime = this.$MovieClip[MovieClipKeys.intervalTime];
            return intervalTime>0 ? Math.floor(1000/intervalTime) : 0;
        }

        //value <= 0 则还原默认
        public set frameRate(value:number)
        {
            let intervalTime = 0;
            if( value <= 0 )
            {
                intervalTime = 1000/value;
            }
            else
            {
                let movieClipData = this.$MovieClip[MovieClipKeys.movieClipData];
                if( movieClipData ) intervalTime = movieClipData.intervalTime;
            }

            this.$MovieClip[MovieClipKeys.intervalTime] = intervalTime;
        }

        public get duration():number
        {
            let values = this.$MovieClip;
            return values[MovieClipKeys.intervalTime]*values[MovieClipKeys.totalFrames];
        }

        //当前时间进度
        public get curSchedule():number
        {
            let values = this.$MovieClip;
            return values[MovieClipKeys.intervalTime]*values[MovieClipKeys.currFrame]+values[MovieClipKeys.passedTime];
        }

        /**
         * MovieClip 实例当前是否正在播放
         * @version Egret 2.4
         * @platform Web,Native
         */
        public get isPlaying():boolean
        {
            let values = this.$MovieClip;
            return values[MovieClipKeys.isPlaying] && values[MovieClipKeys.totalFrames]>0;
        }

        /**
         * MovieClip数据源
         */
        public set movieClipData( clipData:MovieClipData )
        {
            let self = this;
            let values = this.$MovieClip;
            if ( values[MovieClipKeys.movieClipData] == clipData) {
                return;
            }

            values[MovieClipKeys.startFrame] = 0;
            values[MovieClipKeys.currFrame] = 0;
            values[MovieClipKeys.passedTime] = 0;

            values[MovieClipKeys.movieClipData] = clipData;
            if( clipData )
            {
                values[MovieClipKeys.intervalTime] = clipData.intervalTime;
                values[MovieClipKeys.totalFrames] = clipData.numFrames;
            }
            else
            {
                values[MovieClipKeys.intervalTime] = 0;
                values[MovieClipKeys.totalFrames] = 0;
            }

            self.updateDisplay();
        }

        public get movieClipData():MovieClipData
        {
            return this.$MovieClip[MovieClipKeys.movieClipData];
        }

        //-------------------------------------------- label -----------------------------------------
        public getFrameLabelByName(labelName:string):IFrameLabel
        {
            let movieClipData = this.$MovieClip[MovieClipKeys.movieClipData];
            if( !movieClipData ) return;

            let frameLabels = movieClipData.labels;
            if (frameLabels)
            {
                let outputFramelabel:IFrameLabel = null;
                for (let i = 0, n=frameLabels.length; i < n; i++)
                {
                    outputFramelabel = frameLabels[i];
                    if ( outputFramelabel.name== labelName )
                    {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        }

        public getFrameLabelByFrame(frame:number):IFrameLabel
        {
            let movieClipData = this.$MovieClip[MovieClipKeys.movieClipData];
            if( !movieClipData ) return;

            let frameLabels = movieClipData.labels;
            if (frameLabels)
            {
                let outputFramelabel:IFrameLabel = null;
                for (let i = 0; i < frameLabels.length; i++)
                {
                    outputFramelabel = frameLabels[i];
                    if (outputFramelabel.frame == frame)
                    {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        }

        public getFrameLabelForFrame(frame:number):IFrameLabel
        {
            let movieClipData = this.$MovieClip[MovieClipKeys.movieClipData];
            if( !movieClipData ) return null;

            let outputFrameLabel:IFrameLabel = null;
            let frameLabels = movieClipData.labels;
            if (frameLabels)
            {
                for (let i = 0; i < frameLabels.length; i++)
                {
                    let tempFrameLabel = frameLabels[i];
                    if (tempFrameLabel.frame > frame )
                    {
                        return outputFrameLabel;
                    }
                    outputFrameLabel = tempFrameLabel;
                }
            }
            return outputFrameLabel;
        }

        //labelName 为null 表示清除
        public setPlayLabel( labelName:string ): void
        {
            let values = this.$MovieClip;
            let movieClipData = values[MovieClipKeys.movieClipData];
            if( !movieClipData ) return null;

            let startFrame = 0;
            let endFrame = 0;
            if( labelName )
            {
                let frameLabels = movieClipData.labels;
                if(frameLabels)
                {
                    let outputFramelabel:IFrameLabel = null;
                    for (let i = 0; i < frameLabels.length; i++)
                    {
                        outputFramelabel = frameLabels[i];
                        if(labelName == outputFramelabel.name)
                        {
                            startFrame = outputFramelabel.frame;
                            endFrame = outputFramelabel.end;
                            break;
                        }
                    }
                }
            }

            values[MovieClipKeys.startFrame] = startFrame;
            if( endFrame == 0 ) endFrame = movieClipData.numFrames - 1;

            let totalFrames = endFrame>startFrame ? endFrame-startFrame+1 : 0;
            values[MovieClipKeys.totalFrames] = totalFrames;
            if( startFrame != values[MovieClipKeys.currFrame] )
            {
                values[MovieClipKeys.currFrame] = startFrame;
                this.updateDisplay();
            }
        }

        //--------------------------------------------  ctrl ---------------------------
        public stop():void
        {
            this.$MovieClip[MovieClipKeys.isPlaying] = false;
        }

        // playTimes {number} 动画播放次数(0:循环播放, >=1:播放次数, NaN:使用动画数据中的播放时间), 默认值：NaN
        public gotoAndPlay( frame:number=0, playTimes:number=NaN ):void
        {
            let self = this;
            let values = self.$MovieClip;
            let movieClipData = values[MovieClipKeys.movieClipData];
            if( !movieClipData ) return;

            if( isNaN(playTimes) )
            {
                playTimes = movieClipData.loop;
            }

            values[MovieClipKeys.isPlaying] = true;
            values[MovieClipKeys.playTimes] = playTimes;

            values[MovieClipKeys.passedTime] = 0;
            self.gotoFrame( frame );
        }

        // playTimes {number} 动画播放次数(0:循环播放, >=1:播放次数, NaN:使用动画数据中的播放时间), 默认值：NaN
        public gotoTmAndPlay( tm:number=0, playTimes:number=NaN ):void
        {
            let self = this;
            let values = self.$MovieClip;
            let movieClipData = values[MovieClipKeys.movieClipData];
            if( !movieClipData ) return;

            if( isNaN(playTimes) )
            {
                playTimes = movieClipData.loop;
            }

            values[MovieClipKeys.isPlaying] = true;
            values[MovieClipKeys.playTimes] = playTimes;

            let intervalTime:number = values[MovieClipKeys.intervalTime];
            let advanceFrame:number = Math.floor( tm/intervalTime );
            values[MovieClipKeys.passedTime] = tm%intervalTime;
            self.gotoFrame( advanceFrame % values[MovieClipKeys.totalFrames] );
        }

        //frame < 0 时 保持当前状态
        public gotoAndStop( frame:number ):void
        {
            let self = this;
            let values = self.$MovieClip;
            values[MovieClipKeys.isPlaying] = false;

            if( !values[MovieClipKeys.movieClipData] ) return;

            values[MovieClipKeys.passedTime] = 0;
            self.gotoFrame(frame);
        }

        private gotoFrame(frame:number):void
        {
            let values = this.$MovieClip;
            if (frame < 0)
            {
                frame = 0;
            }
            else
            {
                let startFrame = values[MovieClipKeys.startFrame];
                let maxFrame = startFrame + values[MovieClipKeys.totalFrames] - 1;
                if ( frame > maxFrame ) frame = maxFrame;
            }

            if ( values[MovieClipKeys.currFrame] == frame )
            {
                return;
            }

            values[MovieClipKeys.currFrame] = frame;
            this.updateDisplay();
        }

        public advanceTime( tm:number ):void
        {
            let self = this;
            let values = self.$MovieClip;
            let totalFrames = values[MovieClipKeys.totalFrames];
            if( !(values[MovieClipKeys.isPlaying] && totalFrames>0) ) return;

            let passedTime:number = tm + values[MovieClipKeys.passedTime];
            let intervalTime:number = values[MovieClipKeys.intervalTime];
            let advanceFrame:number = Math.floor( passedTime/intervalTime );

            if( advanceFrame <= 0 )
            {
                values[MovieClipKeys.passedTime] = passedTime;
                return;
            }

            values[MovieClipKeys.passedTime] = passedTime%intervalTime;

            let startFrame = values[MovieClipKeys.startFrame];
            let endFrame = startFrame + totalFrames -1;

            advanceFrame = advanceFrame % totalFrames;

            let toFrame = values[MovieClipKeys.currFrame];
            let frameEvents = values[MovieClipKeys.movieClipData].events;
            let eventPool = [];
            let playTimes = values[MovieClipKeys.playTimes];
            let finish = false;
            for ( let i = 0; i < advanceFrame; ++i )
            {
                toFrame++;
                if ( toFrame > endFrame )
                {
                    if ( playTimes <= 0 )
                    {
                        eventPool.push({type:egret.Event.LOOP_COMPLETE});
                        toFrame = startFrame;
                    }
                    else
                    {
                        playTimes--;
                        if ( playTimes > 0)
                        {
                            eventPool.push({type:egret.Event.LOOP_COMPLETE, data:playTimes});
                            toFrame = startFrame;
                        }
                        else
                        {
                            toFrame = endFrame;
                            finish = true;
                            eventPool.push({type:egret.Event.COMPLETE});
                            break;
                        }
                    }
                }

                if( frameEvents )
                {
                    let frameEvent = frameEvents[toFrame];
                    if( frameEvent )
                    {
                        eventPool.push({type:cui.UI_EVENT.FRAME_LABEL, data:frameEvent});
                    }
                }
            }

            values[MovieClipKeys.playTimes] = playTimes;
            values[MovieClipKeys.currFrame] = toFrame;

            self.updateDisplay();

            if( finish )
            {
                self.stop();
            }

            if ( eventPool.length > 0)
            {
                let length:number = eventPool.length;
                for (let i = 0; i < length; ++i)
                {
                    let eventData = eventPool[i];
                    self.dispatchEventWith(eventData.type, false, eventData.data);
                }
            }
        }


        protected updateDisplay():void
        {
            let values = this.$MovieClip;
            let oldBitmapData = values[MovieClipKeys.bitmapData];
            let movieClipData:MovieClipData = values[MovieClipKeys.movieClipData];
            let newBitmapData;
            if( movieClipData )
            {
                newBitmapData = movieClipData.getFrameTex( values[MovieClipKeys.currFrame] );
            }

            if( oldBitmapData != newBitmapData )
            {
                values[MovieClipKeys.bitmapData] = newBitmapData;
                this.$renderDirty = true;
            }
        }

        //----------------------------------------------------------------------------
        /**
         * @private
         */
        // $render():void
        // {
        //     let values = this.$MovieClip;
        //     let texture = values[MovieClipKeys.bitmapData];
        //     if ( texture )
        //     {
        //         let offsetX:number = Math.round(texture._offsetX);
        //         let offsetY:number = Math.round(texture._offsetY);
        //         let bitmapWidth:number = texture._bitmapWidth;
        //         let bitmapHeight:number = texture._bitmapHeight;
        //         let textureWidth:number = texture.$getTextureWidth();
        //         let textureHeight:number = texture.$getTextureHeight();
        //         let destW:number = Math.round(texture.$getScaleBitmapWidth());
        //         let destH:number = Math.round(texture.$getScaleBitmapHeight());

        //         egret.sys.BitmapNode.$updateTextureData(<egret.sys.BitmapNode>this.$renderNode, texture._bitmapData, texture._bitmapX, texture._bitmapY,
        //             bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, texture._sourceWidth, texture._sourceHeight, null, egret.BitmapFillMode.SCALE, values[MovieClipKeys.smoothing]);
        //     }
        // }

        $updateRenderNode(): void {
            let self = this;
            let values = self.$MovieClip;
            let texture = values[MovieClipKeys.bitmapData];
            if (texture) {
                let offsetX: number = Math.round(texture.$offsetX);
                let offsetY: number = Math.round(texture.$offsetY);
                let bitmapWidth: number = texture.$bitmapWidth;
                let bitmapHeight: number = texture.$bitmapHeight;
                let textureWidth: number = texture.$getTextureWidth();
                let textureHeight: number = texture.$getTextureHeight();
                let destW: number = Math.round(texture.$getScaleBitmapWidth());
                let destH: number = Math.round(texture.$getScaleBitmapHeight());
                let sourceWidth: number = texture.$sourceWidth;
                let sourceHeight: number = texture.$sourceHeight;

                egret.sys.BitmapNode.$updateTextureData(<egret.sys.NormalBitmapNode>self.$renderNode, texture.$bitmapData, texture.$bitmapX, texture.$bitmapY,
                    bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, egret.BitmapFillMode.SCALE, values[MovieClipKeys.smoothing]);
            }
        }

        /**
         * @private
         */
        $measureContentBounds(bounds:egret.Rectangle):void
        {
            let texture = this.$MovieClip[MovieClipKeys.bitmapData];
            if (texture)
            {
                let x:number = texture._offsetX;
                let y:number = texture._offsetY;
                let w:number = texture.$getTextureWidth();
                let h:number = texture.$getTextureHeight();

                bounds.setTo(x, y, w, h);
            }
            else
            {
                bounds.setEmpty();
            }
        }
    }
}

