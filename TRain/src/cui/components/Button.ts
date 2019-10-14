///<reference path="./SimpleButton.ts" />

module cui
{
	
	export class Button extends cui.SimpleButton
	{
		//-------------skin
		//public skBg:cui.Image;
		public skIcon:cui.Image;
		public skLabel:cui.Label;

		//protected _src:string;
        protected _label:string;
        protected _txtKey:string;
        protected _icon:string;

		// public get source():any
        // {
        //     return this._src;
        // }
        // public set source(value:any)
        // {
        //     let self = this;
        //     self._src = value;
        //     let img = self.skBg;
        //     if(img) img.source=value;
        // }
        public get label():string
        {
            return this._label;
        }
        public set label(value:string)
        {
            let self = this;
            self._label = value;
            let skLabel = self.skLabel;
            if(skLabel) skLabel.text = value;
        }

        public get txtKey():string
        {
            return this._txtKey;
        }
        public set txtKey(value:string)
        {
            let self = this;
            self._txtKey = value;
            let skLabel = self.skLabel;
            if(skLabel) skLabel.txtKey = value;
        }

        public get icon():string
        {
            return this._icon;
        }
        public set icon(value:string)
        {
            let self = this;
            self._icon = value;
            let skIcon = self.skIcon;
            if(skIcon) skIcon.source = value;
        }

		protected onPartAdded():void
		{
			let self = this;
			// let skBg = self.skBg;
			// let source = self._src;
            // if( source && skBg ) skBg.source = source;
            
            let skIcon = self.skIcon;
			let icon = self._icon;
			if( icon && skIcon ) skIcon.source = icon;

            let skLabel = self.skLabel;
			if( skLabel ){
				let label = self._label;
				if( label )
				{
					skLabel.text = label;
				}
				else{
					let txtKey = self._txtKey;
					if(txtKey) skLabel.txtKey = txtKey;
				}
			}
		}
	}
}
