/**
 * Created by wjdeng on 2016/4/6.
 */

module cui
{
    interface IDepthItem
    {
        nestLevel:number;
        hashCode:number;
    }

    interface QueueItem
    {
        items:IDepthItem[];
        depth:number;
    }

    class DepthQueue
    {
        private _queues:Array<QueueItem> = [];

        public insert( dItem:IDepthItem ):void
        {
            let self = this;
            let itemDepth:number = dItem.nestLevel;
            let queues = self._queues;
            let findItem:QueueItem;
            let idx = 0;
            for( let len = queues.length; idx<len; ++idx )
            {
                let tmp = queues[idx];//tmp 必须要有元素
                let tmpDepth = tmp.depth;
                if( tmpDepth == itemDepth )
                {
                    findItem = tmp;
                    break;
                }
                else if( tmpDepth > itemDepth )
                {
                    break;
                }
            }
            if( !findItem )
            {
                findItem = {items:[],depth:itemDepth};
                queues.splice( idx, 0, findItem );
            }
            findItem.items.push( dItem );
        }

        public forEachItemDo( itemFun:string, ...args): void
        {
            let queues = this._queues;
            for( let i = queues.length-1; i>=0; --i )
            {
                let items = queues[i].items;
                for( let j = 0, cnt=items.length; j<cnt; ++j )
                {
                    let item = items[j];
                    item[itemFun].apply( item, args );
                }
            }
        }

        public hasItem():boolean
        {
            return this._queues.length > 0;
        }
    }

    export const enum PropertyType
    {
        position = 1,
        size = 2,
        state = 4,
        itemRender = 8,
        itemRenderSkinName = 16,
        dataProvider = 32,
        source = 64,
        text = 128,
    }

    export const enum FilterType
    {
        GlowFilter = 1,
        ColorMatrixFilter = 2,
        DropShadowFilter = 3,
        CustomFilter = 4, 
        BlurFilter = 5,
        BitmapFilterQuality = 6,
    }

    export class UIManager
    {
        private _filters:{[key:string]:egret.Filter[]};
        private _invalidDL:DepthQueue;
        private _invalidProps:Array<IBaseCtrl>;

        constructor()
        {
            let self = this;
            self._filters = {};
            self._invalidDL = new DepthQueue();
            self._invalidProps = [];
        }

        public initState( stage:egret.Stage ):void
        {
            let self = this;
            stage.addEventListener( egret.Event.ENTER_FRAME, self.update, self );
            stage.addEventListener( egret.Event.RENDER, self.update, self );
        }

        //---------------------------------------------

        public invalidateDL( container:IBaseContainer ):void
        {
            this._invalidDL.insert( container );
        }

        public invalidateProperty( container:IBaseCtrl ):void
        {
            this._invalidProps.push( container );
        }

        //----------------------------------------------
        public createFilters( conf:any ):void{
            let filterList = this._filters;
            for( let key in conf ){
                let filterConfs = conf[key];
                let filters = [];
                filterList[key] = filters;
                for( let i=0, len=filterConfs.length; i<len; ++i ){
                    let filterConf = filterConfs[i];
                    let filter:egret.Filter = null;
                    switch( filterConf.tp ){
                        case FilterType.GlowFilter:
                            filter = new egret.GlowFilter(filterConf.c, filterConf.a,filterConf.bx,filterConf.by,filterConf.s,filterConf.q,filterConf.i,filterConf.k);
                            break;
                        case FilterType.ColorMatrixFilter:
                            filter = new egret.ColorMatrixFilter( filterConf.m );
                            break;
                        case FilterType.DropShadowFilter:
                            filter = new egret.DropShadowFilter( filterConf.d, filterConf.an, filterConf.c, filterConf.a,filterConf.bx,filterConf.by,filterConf.s,filterConf.q,filterConf.i,filterConf.k);
                            break;
                    }
                    if( filter ) filters.push(filter);
                }
            }
        }

        public getFilters( nm:string ):egret.Filter[]{
            return this._filters[nm];
        }

        //----------------------------------------------

        public update( dt:number ):void
        {
            let self = this;
            let invalidProperties = self._invalidProps;
            let len = invalidProperties.length;
            if( len>0 )
            {
                self._invalidProps = new Array<IBaseCtrl>(); //防止 处理过程中有新的对象加入  新对象下次处理
                for( let i=0; i<len; ++i )
                {
                    invalidProperties[i].validateProps();
                }
            }

            let invalidDisplaylist = self._invalidDL;
            if( invalidDisplaylist.hasItem() )
            {
                self._invalidDL = new DepthQueue();//防止 处理过程中有新的对象加入  新对象下次处理
                invalidDisplaylist.forEachItemDo( "validateDL" );
            }
        }
    }

    export let uiMgr = new cui.UIManager();
}
