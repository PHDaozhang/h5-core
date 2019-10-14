/**
 * Created by wjdeng on 2015/12/22.
 */

module cui
{
    export interface IItemData
    {
        width?:number;
        height?:number;
    }

    export class DataItem extends Component
    {
        public itemIndex:number;
        protected _data:IItemData|any;

        public get data():IItemData|any
        {
            return this._data;
        }

        public set data(value:IItemData|any)
        {
            let self = this;
            self._data = value;
            if( "width" in value ) self.width = value.width;
            if( "height" in value ) self.height = value.height;
                
            if(self._inited)
            {
                self.dataChanged();
            }

        }

        protected childrenCreated():void
        {
            super.childrenCreated();
            let self = this;
            if(self._data)
            {
                self.dataChanged();
            }
        }

        protected dataChanged():void
        {

        }
    }

    const enum Keys
    {
        freeRenders,
        itemRender,
        itemRenderSkinName,
        dataProvider
    }

    export class DataGroup extends Group
    {
        protected $DataGroup:any[];

        protected _range:number[];
        protected _idxToItm:CMap<number,DataItem>;// idx 为索引

        constructor()
        {
            super();

            let self = this;
            self.$DataGroup = [
                [],        //freeRenders
                null,      //itemRender
                null,     //itemRenderSkinName
                null,    //dataProvider
            ];

            self._range = [0,0];
            self._idxToItm = new CMap<number,DataItem>();
        }

        public dispose():void
        {
            let self = this;
            self.onRenderTouchFinish(null);

            let dataProvider = self.$DataGroup[Keys.dataProvider];
            if( dataProvider )
            {
                dataProvider.removeEventListener(UI_EVENT.COLLECT_CHANGE, self.onCollectionChange, self);
                self.$DataGroup[Keys.dataProvider] = null;
            }

            self.clearAllRenders();

            super.dispose();
        }

        protected childrenCreated():void
        {
            let self = this;
            if (!self._layout)
            {
                let layout = new DataLineLayout();
                layout.isHorizontal = false;
                self.layout = layout;
            }
            super.childrenCreated();
        }

        //---------------------------------------------- layout ---------------------------
        public get numElements():number
        {
            let dataProvider = this.$DataGroup[Keys.dataProvider];
            return dataProvider ? dataProvider.length : 0;
        }

        public getElementAt(index:number):DataItem
        {
            return this._idxToItm.get(index);
        }

        public getVirtualElementAt(index:number):DataItem
        {
            let self = this;
            let dataProvider = self.$DataGroup[Keys.dataProvider];
            if (index < 0 || index >= dataProvider.length)
                return null;

            let idxToItm = self._idxToItm;
            let renderer = idxToItm.get(index);
            if (!renderer)
            {
                let item:any = dataProvider.getItemAt(index);
                renderer = self.createRender();
                renderer.itemIndex = index;
                renderer.data = item;
                idxToItm.set(index,renderer);
                self.addChild( renderer );
                self.rendererAdded( renderer, index, item );
            }
            return renderer;
        }

        public setIndicesInView(startIndex:number, endIndex:number):void
        {
            let self = this;
            let viewRange = self._range;
            viewRange[0] = startIndex;
            viewRange[1] = endIndex;
            
            let idxToItm = self._idxToItm;
            let renders = idxToItm.values;
            let rmvIdxs = [];
            let length = renders.length;
            let i = 0;
            for (i = 0; i < length; i++)
            {
                let render = renders[i];
                let idx = render.itemIndex;
                if ( idx < startIndex || idx > endIndex )
                {
                    rmvIdxs.push( idx );
                    self.doFreeRender( render );
                }
            }

            length = rmvIdxs.length;
            for ( i = 0; i < length; i++ )
            {
                idxToItm.delete( rmvIdxs[i] );
            }
        }

        public isElementInView( idx:number ):boolean
        {
            return this._idxToItm.has( idx );
        }

        //-------------------------------- itemRender ----------------------------
        public get itemRender():any
        {
            return this.$DataGroup[Keys.itemRender];
        }

        public set itemRender(value:any)
        {
            let self = this;
            let values = self.$DataGroup;
            if (values[Keys.itemRender] == value)
                return;

            values[Keys.itemRender] = value;
            self.invalidateProps( PropertyType.itemRender );
        }


        public get itemSkinName():string
        {
            return this.$DataGroup[Keys.itemRenderSkinName];
        }

        public set itemSkinName(value:string)
        {
            let self = this;
            let values = self.$DataGroup;
            if ( values[Keys.itemRenderSkinName] == value )
                return;

            values[Keys.itemRenderSkinName] = value;
            self.invalidateProps( PropertyType.itemRenderSkinName );
        }

        //--------------------------------- dataprovider --------------------------
        public get dataProvider():cui.ArrayCollection
        {
            return this.$DataGroup[Keys.dataProvider];
        }

        public set dataProvider(value:cui.ArrayCollection)
        {
            let self = this;
            let values = self.$DataGroup;
            let dataProvider = values[Keys.dataProvider];
            if (dataProvider == value)
                return;

            if( dataProvider )
            {
                dataProvider.removeEventListener(UI_EVENT.COLLECT_CHANGE, self.onCollectionChange, self);
            }

            values[Keys.dataProvider] = value;
            self.invalidateProps( PropertyType.dataProvider );
        }


        protected onCollectionChange(event:CollectionEvent):void
        {
            let self = this;
            //let values = self.$DataGroup;
            switch (event.kind)
            {
                case CollectionEventKind.ADD:
                    self.itemAddedHandler(event.item, event.location);
                    break;
                case CollectionEventKind.REMOVE:
                    self.itemRemovedHandler(event.item, event.location);
                    break;
                case CollectionEventKind.UPDATE:
                case CollectionEventKind.REPLACE:
                    self.itemUpdatedHandler(event.item, event.location);
                    break;
                case CollectionEventKind.UPDATE_idxs:
                    self.idxsUpdatedHandler( event.item );
                    break;
                case CollectionEventKind.REMOVEALL:
                case CollectionEventKind.RESET:
                case CollectionEventKind.REFRESH:
                    self.freeAllRender();
                    self.invalidateProps(PropertyType.dataProvider);
                    break;
            }
        }

        protected itemAddedHandler(items:any, idx:number):void
        {
            let self = this;
            if( self._idxToItm.has(idx) ){
                self.resetRenderIdxs();
                self.invalidateDL();
            }
            else{
                let range = self._range;
                if( range[0]<=idx && idx<=range[1] ){
                    self.invalidateDL();
                }
            }
        }

        protected itemRemovedHandler(item:any, idx:number):void
        {
            let self = this;
            let idxToItm = self._idxToItm;
            let renderer = idxToItm.get(idx);
            if( renderer ){
                idxToItm.delete(idx);
                self.doFreeRender( renderer );

                self.resetRenderIdxs();
                self.invalidateDL();
            }
        }

        private resetRenderIdxs():void
        {
            let self = this;
            let idxToItm = self._idxToItm;
            if ( idxToItm.size==0 ) return;

            let dataProvider = <cui.ArrayCollection>self.$DataGroup[Keys.dataProvider];
            let renderers:Array<DataItem> = idxToItm.values;
            let length = renderers.length;
            let changed = false, item:DataItem, newIdx=0;
            for (let i = 0; i < length; i++)
            {
                item = renderers[i];
                newIdx = dataProvider.getItemIndex( item.data );
                if( item.itemIndex != newIdx ){
                    item.itemIndex = newIdx;
                    changed = true;
                }
            }

            if( changed ){
                renderers = renderers.slice(0);
                idxToItm.clear();
                for (let i = 0; i < length; i++)
                {
                    item = renderers[i];
                    idxToItm.set( item.itemIndex, item );
                }
            }
        }

        private itemUpdatedHandler(item:any, idx:number):void
        {
            let renderer = this._idxToItm.get(idx);
            if (renderer){
                renderer.data = item;
            }
        }

        private idxsUpdatedHandler(idxs:number[]):void
        {
            let idxToItm = this._idxToItm;
            let dataProvider = this.dataProvider;
            for( let idx of idxs ){
                let renderer = idxToItm.get(idx);
                if (renderer){
                    renderer.data = dataProvider.getItemAt( idx );
                }
            }
        }

        private clearAllRenders():void
        {
            let self = this;
            let idxToItems = self._idxToItm;
            let length = idxToItems.size;
            if( length>0 )
            {
                let renderers = idxToItems.values;
                self.removeChildren();
                for ( let i = 0; i < length; i++)
                {
                    renderers[i].dispose();
                }
                idxToItems.clear();
            }

            let values = self.$DataGroup;
            let freeRenders = values[Keys.freeRenders];
            length = freeRenders.length;
            if( length > 0 )
            {
                for ( let i = 0; i < length; i++)
                {
                    freeRenders[i].dispose();
                }
                values[Keys.freeRenders] = [];
            }
        }

        //----------------------------------------------------------------
        private freeAllRender():void
        {
            let self = this;
            let renderers = self._idxToItm.values;
            for( let i=0, n=renderers.length; i < n; ++i )
            {
                self.doFreeRender(renderers[i]);
            }
            self._idxToItm.clear();
        }

        //private freeRenderByIndex(index:number):void
        //{
        //    let self = this;
        //    let renderer = self._idxToItems[index];
        //    if (renderer)
        //    {
        //        delete self._idxToItems[index];
        //        self.doFreeRender(renderer);
        //    }
        //}

        private doFreeRender(renderer:DataItem):void
        {
            let self = this;
            let values = self.$DataGroup;
            let freeRenders = values[Keys.freeRenders];
            freeRenders.push( renderer );
            self.rendererRemoved( renderer, renderer.itemIndex, renderer.data );
            self.removeChild( renderer );
        }

        /**
         * @private
         * 为指定索引创建虚拟的项呈示器
         */
        private createRender():DataItem
        {
            let self = this;
            let renderer:DataItem;
            let freeRenders = self.$DataGroup[Keys.freeRenders];
            if ( freeRenders && freeRenders.length > 0 )
            {
                renderer = freeRenders.pop();
            }
            else
            {
                let rendererClass = self.$DataGroup[Keys.itemRender];
                if (!rendererClass)  rendererClass = DataItem;
        
                renderer = <DataItem> (new rendererClass());
                let itemRenderSkinName = self.$DataGroup[Keys.itemRenderSkinName];
                if ( itemRenderSkinName )
                {
                    renderer.skinName = itemRenderSkinName;
                }
            }
            return renderer;
        }

        protected rendererAdded(renderer:DataItem, index:number, item:any):void
        {
            let self = this;
            renderer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onRenderTouchBegin, self);
        }

        protected rendererRemoved(renderer:DataItem, index:number, item:any):void
        {
            let self = this;
            renderer.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onRenderTouchBegin, self);
        }

        protected _downRender:DataItem;
        protected _tempStage:egret.Stage;
        protected onRenderTouchBegin(event:egret.TouchEvent):void
        {
            let self = this;
            let render = <DataItem> (event.$currentTarget);

            let stage = self.$stage;
            self._tempStage = stage;

            self._downRender = render;
            render.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchEnd, self);
            render.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderCaptureEnd, self, true);//优先监听

            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchFinish, self);
        }

        protected onRenderTouchFinish(event:egret.TouchEvent):void
        {
            let self = this;
            let itemRender = self._downRender;
            if( itemRender )
            {
                itemRender.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchEnd, self);
                itemRender.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderCaptureEnd, self, true);//优先监听
                self._tempStage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchFinish, self);
                self._tempStage = null;
                self._downRender = null;
            }
        }

        protected onRenderCaptureEnd(event:egret.TouchEvent):void
        {
            let self = this;
            if (event.isDefaultPrevented())
            {//已被父节点处理  则不响应事件
                self.onRenderTouchFinish( event );
            }
        }

        protected onRenderTouchEnd(event:egret.TouchEvent):void
        {
            let self = this;
            let downRender = self._downRender;
            if( !downRender ) return;

            self.onRenderTouchFinish( event );

            let itemRender = <DataItem> (event.$currentTarget);
            if (itemRender != downRender)
                return;

            self.dispatchEventWith( UI_EVENT.ITEM_TAP, false, itemRender );
            //不阻塞事件
        }

        //-----------------------------------------------------------------------------
        protected commitProps():void
        {
            let self = this;
            let values = self.$DataGroup;
            let invalidProps = self._invalidProps;
            let dataProviderChanged = (invalidProps&PropertyType.dataProvider)==PropertyType.dataProvider;
            if ( dataProviderChanged || (invalidProps&PropertyType.itemRender)==PropertyType.itemRender )
            {
                //let numChildren = self.numChildren;
                self.clearAllRenders();
                //if( numChildren > 0 )
                //{
                    self.dispatchEventWith( UI_EVENT.VIEW_CLEAR, false );
                //}

                if ( dataProviderChanged )
                {
                    let dataProvider = values[Keys.dataProvider];
                    if ( dataProvider )
                        dataProvider.addEventListener(UI_EVENT.COLLECT_CHANGE, self.onCollectionChange, self);

                    self.scrollV = self.scrollH = 0;
                }

                self.invalidateDL();
            }

            if ( (invalidProps&PropertyType.itemRenderSkinName)==PropertyType.itemRenderSkinName )
            {
                let skinName = values[Keys.itemRenderSkinName];
                let renderers = self._idxToItm.values;
                let length = renderers.length;
                let i = 0;
                for (i = 0; i < length; i++)
                {
                    renderers[i].skinName = skinName;
                }

                let freeRenders = values[Keys.freeRenders];
                length = freeRenders.length;
                for (i = 0; i < length; i++)
                {
                    freeRenders[i].skinName = skinName;
                }
            }

            super.commitProps();
        }
    }
}
