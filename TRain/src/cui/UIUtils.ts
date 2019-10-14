/**
 * Created by CV-PC359 on 2016/6/18.
 */

module cui
{
    export let htmlParser = new egret.HtmlTextParser();
    
    export interface IPointData
    {
        x:number;
        y:number;
    }

    export interface ISizeData
    {
        w:number;
        h:number;
    }

    export let tempPt = {x:0,y:0};

    export interface IRectData
    {
        x:number;
        y:number;
        w:number;
        h:number;
    }

    export let tempRect = {x:0,y:0,w:0,h:0};

    export const enum UI_EVENT
    {
        VIEW_CLEAR = "view_clear",
        EVT_CREATED = "created",
        EVT_PLAY_FIN = "play_fin",
        FRAME_LABEL = "frame_label",
        ITEM_TAP = "item_tap",
        COLLECT_CHANGE = "collect_ch",
        RMV_CHILD = "rmv_child",
    }

    export const enum Direction
    {
        LTR = "ltr",//left-to-right direction
        RTL = "rtl",//right-to-left direction
        TTB = "ttb", //top-to-bottom direction.
        BTT = "btt", //bottom-to-top direction
    }

    export interface IItemRenderer extends Component
    {
        data: any;
        selected: boolean;
        itemIndex: number;
    }

    export interface IViewport extends BaseContainer
    {
        contentWidth: number;
        contentHeight: number;
        scrollH: number;
        scrollV: number;
        scrollEnabled: boolean;

        numElements:number;
        getElementSize( idx:number ):ISizeData;
        getElementRect( idx:number ):IRectData;
        getElementIdxByPos( x:number, y:number ):number;

        getElementAt( index:number ):egret.DisplayObject;
        getVirtualElementAt( index:number ):egret.DisplayObject
        isElementInView( idx:number ):boolean;
        setIndicesInView(startIndex:number, endIndex:number):void;
    }

    export interface IDisplayText extends IBaseCtrl
    {
        text:string;
    }

    export interface ILayout extends egret.DisplayObject
    {
        needPLayout:boolean;
        top:number;
        left:number;
        right:number;
        bottom:number;
        hCenter:number;
        vCenter:number;
        perWidth:number;
        perHeight:number;

        //setLayoutPos(x:number, y:number):void;
        //setLayoutSize(layoutWidth:number, layoutHeight:number):void
    }

    export interface IBaseCtrl extends ILayout
    {
        tag:number;
        ud:any;//userdata
        dispose();

        validateProps():void;
    }

    export interface IBaseContainer extends IBaseCtrl
    {
        isOpenLayout:boolean;
        nestLevel:number;

        invalidateDL():void;
        validateDL():void;
    }

    //export interface IAssetAdapter
    //{
    //    getTex(source: string, callBack: (data: any, source: string) => void, thisObject: any): void;
    //    releaseTex(data: any): void;
    //}
    //
    //export interface IThemeAdapter
    //{
    //    getSkin(name:string): any;
    //}
}

