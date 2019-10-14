module cui
{
    export class ProgressBar extends Component
	{
		protected _ani:Animation;
		protected _aniVal:number;

		protected _dir:string;
		protected _val:number;
		protected _thumbPos:IPointData;

		protected _valToLabel:(val:number)=>string;

		private _thumb:Image;
		public skLabel:Label;
		public openAni:boolean;

		public constructor()
		{
			super();

			let self = this;
			self._dir = Direction.LTR;
			self._ani = new Animation(self.aniUpdateHandler, self);
			self._aniVal = 0;
		}

		public dispose():void
		{
			this._valToLabel = null;
			super.dispose();
		}

		protected childrenCreated():void
		{
			this._inited = true;
			this.update();
		}

		//---------------------------------------------
		public set labelFunction( fun:(val:number)=>string )
		{
			this._valToLabel = fun;
		}

		public get direction():string
		{
			return this._dir;
		}

		public set direction(value:string)
		{
			let self = this;
			if (self._dir == value)
				return;

			self._dir = value;
			if( self._inited )
			{
				self.update();
			}
		}

		public get thumb():Image//毫秒
		{
			return this._thumb;
		}

		//必须先调整好 位置
		public set thumb( val:Image )
		{
			let self = this;
			self._thumb = val;
			if( val )
			{
				self._thumbPos = {x:val.x, y:val.y};
			}
		}

		public get value():number//毫秒
		{
			return this._val || 0;
		}

		public set value( val:number )
		{
			if( val < 0 ) val = 0;
			else if( val > 1 ) val = 1;

			let self = this;
			if( self._ani.isPlaying ) self._ani.stop();

			self.setCurValue( val );
		}

		public setProgressValue(val:number, dur:number):void//毫秒
		{
			if( val < 0 ) val = 0;
			else if( val > 1 ) val = 1;

			let self = this;
			if( self.openAni && dur > 0 )
			{
				self.startAni( val, dur );
			}
			else
			{
				if( self._ani.isPlaying ) self._ani.stop();

				self.setCurValue( val );
			}
		}

		protected startAni( toValue:number, dur:number ):void
		{
			let self = this;
			let ani = self._ani;
			ani.stop();

			ani.duration = dur;
			ani.from = self.value;
			ani.to = toValue;
			ani.play();
		}

		//--------------------------------------- ani ----------------------------------
		protected aniUpdateHandler( ani:Animation ):void
		{
			this.setCurValue( ani.currentValue );
		}


		//----------------------------------------------------------------
		protected setCurValue( val:number ):void
		{
			let self =this;
			if( self._val == val ) return;

			self._val = val;
			self.update();
		}

		protected update():void
		{
			let self = this;
			let val = self.value;
			let thumb = self._thumb;
			if (thumb)
			{
				let thumbWidth = thumb.width;
				let thumbHeight = thumb.height;
				let clipWidth = Math.round(val * thumbWidth);
				if (clipWidth < 0 || clipWidth === Infinity)
					clipWidth = 0;
				let clipHeight = Math.round(val * thumbHeight);
				if (clipHeight < 0 || clipHeight === Infinity)
					clipHeight = 0;

				let rect = thumb.$scrollRect;
				if (!rect) {
					rect = egret.$TempRectangle;
				}
				rect.setTo(0,0,thumbWidth,thumbHeight);
				switch (self._dir) {
					case Direction.LTR:
						rect.width = clipWidth;
						break;
					case Direction.RTL:
						rect.width = clipWidth;
						rect.x = thumbWidth - clipWidth;
						thumb.x = self._thumbPos.x + rect.x;
						break;
					case Direction.TTB:
						rect.height = clipHeight;
						break;
					case Direction.BTT:
						rect.height = clipHeight;
						rect.y = thumbHeight - clipHeight;
						thumb.y = self._thumbPos.y + rect.y;
						break;
				}
				thumb.scrollRect = rect;
			}

			self.updateLabel( val );
		}

		protected updateLabel( val:number ):void
		{
			let self =this;
			let txt = String(val);
			if( self._valToLabel ) txt = self._valToLabel( val );

			let skLabel = self.skLabel;
			if( skLabel  ) skLabel.text = txt;
		}
	}
}