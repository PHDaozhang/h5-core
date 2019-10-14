var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
/**
 * Created by wjdeng on 2016/4/1.
 */
var cui;
(function (cui) {
    var disProp = egret.DisplayObject.prototype;
    disProp.$getOriginalBounds = function () {
        var self = this;
        var bounds = self.$getContentBounds();
        self.$measureChildBounds(bounds);
        if (self.filters) {
            var offset = self['$measureFiltersOffset'](false);
            bounds.x += offset.minX;
            bounds.y += offset.minY;
            bounds.width += -offset.minX + offset.maxX;
            bounds.height += -offset.minY + offset.maxY;
        }
        return bounds;
    };
    /**
         * @private
         * 显示对象添加到舞台
         */
    disProp.$onAddToStage = function (stage, nestLevel) {
        var self = this;
        self.$stage = stage;
        self.$nestLevel = nestLevel;
        self.$hasAddToStage = true;
        //egret.Sprite.$EVENT_ADD_TO_STAGE_LIST.push(self);
    };
    /**
     * @private
     * 显示对象从舞台移除
     */
    disProp.$onRemoveFromStage = function () {
        var self = this;
        self.$nestLevel = 0;
        self.$stage = null;
        self.$hasAddToStage = false;
        //egret.Sprite.$EVENT_REMOVE_FROM_STAGE_LIST.push(self);
    };
    var BaseContainer = (function (_super) {
        __extends(BaseContainer, _super);
        function BaseContainer() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false,
                false,
                NaN,
                NaN,
            ];
            self._invalidDL = false;
            self._invalidProps = 0;
            self.hitCheckBound = true;
            self.$touchEnabled = true;
            return _this;
        }
        BaseContainer.prototype.dispose = function () {
            if (true) {
                if (this.disposed) {
                    egret.log("this UIComponent already disposed");
                }
            }
            var self = this;
            if (self.disposed)
                return;
            if (self.ud)
                self.ud = null;
            self.disposed = true;
            var children = self.$children;
            for (var i = 0, n = children.length; i < n; ++i) {
                children[i].dispose();
            }
        };
        //-----------------------------------------------------------
        BaseContainer.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (!self._inited) {
                self._inited = true;
                self.childrenCreated();
            }
            if (self._invalidProps > 0) {
                self.validateProps();
            }
            if (self._invalidDL) {
                self.validateDL();
            }
        };
        //-----------------------------------------------------------
        BaseContainer.prototype.childrenCreated = function () {
        };
        Object.defineProperty(BaseContainer.prototype, "anthorPerX", {
            //-------------------------------------------------------------
            /**
             * float
             */
            get: function () {
                return this._anthorPerX || 0;
            },
            /**
             * float
             */
            set: function (val) {
                var self = this;
                self._anthorPerX = val;
                var width = self.$getWidth();
                if (width > 0) {
                    self.anchorOffsetX = Math.floor(width * val);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "anthorPerY", {
            /**
             * float
             */
            get: function () {
                return this._anthorPerY || 0;
            },
            /**
             * float
             */
            set: function (val) {
                var self = this;
                self._anthorPerY = val;
                var height = self.$getHeight();
                if (height > 0) {
                    self.anchorOffsetY = Math.floor(height * val);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "width", {
            get: function () {
                return _super.prototype.$getWidth.call(this);
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[10 /* width */] === value)
                    return;
                values[10 /* width */] = value;
                this.$setWidth(value);
            },
            enumerable: true,
            configurable: true
        });
        BaseContainer.prototype.$getExplicitWidth = function () {
            return this.$BC[10 /* width */];
        };
        BaseContainer.prototype.$setWidth = function (value) {
            _super.prototype.$setWidth.call(this, value);
            this.invalidateProps(2 /* size */);
        };
        Object.defineProperty(BaseContainer.prototype, "height", {
            get: function () {
                return _super.prototype.$getHeight.call(this);
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[11 /* height */] === value)
                    return;
                values[11 /* height */] = value;
                this.$setHeight(value);
            },
            enumerable: true,
            configurable: true
        });
        BaseContainer.prototype.$getExplicitHeight = function () {
            return this.$BC[11 /* height */];
        };
        BaseContainer.prototype.$setHeight = function (value) {
            _super.prototype.$setHeight.call(this, value);
            this.invalidateProps(2 /* size */);
        };
        Object.defineProperty(BaseContainer.prototype, "filterNm", {
            get: function () {
                return this.$BC[12 /* filterNm */];
            },
            set: function (nm) {
                this.$BC[12 /* filterNm */] = nm;
                this.filters = nm && nm.length > 0 ? cui.uiMgr.getFilters(nm) : null;
            },
            enumerable: true,
            configurable: true
        });
        //-----------------------------------------------------------------------
        BaseContainer.prototype.$childAdded = function (child, index) {
            var self = this;
            if (child.needPLayout) {
                self.openLayout();
            }
            if (self.isOpenLayout) {
                if (!self.needPLayout || self.$stage) {
                    self.validateChildDL(child);
                }
                else if (self._inited) {
                    self.invalidateDL();
                }
            }
        };
        BaseContainer.prototype.$childRemoved = function (child, index) {
            var self = this;
            if (self.isOpenLayout) {
                self.invalidateDL();
            }
        };
        BaseContainer.prototype.getChildAt = function (index) {
            var children = this.$children;
            if (index >= 0 && index < children.length) {
                return children[index];
            }
            return null;
        };
        BaseContainer.prototype.addChild = function (child) {
            var self = this;
            var index = self.$children.length;
            if (child.$parent == self)
                index--;
            return self.$doAddChild(child, index, false);
        };
        BaseContainer.prototype.addChildAt = function (child, index) {
            var num = this.$children.length;
            if (index < 0 || index >= num) {
                index = num;
                if (child.$parent == this) {
                    index--;
                }
            }
            return this.$doAddChild(child, index, false);
        };
        BaseContainer.prototype.removeChild = function (child) {
            var self = this;
            var index = self.$children.indexOf(child);
            if (true) {
                if (index < 0) {
                    egret.$error(1006);
                    return child;
                }
            }
            child = self.$doRemoveChild(index, false);
            self.dispatchEventWith("rmv_child" /* RMV_CHILD */, false);
            return child;
        };
        BaseContainer.prototype.removeChildAt = function (index) {
            var self = this;
            if (index >= 0 && index < self.$children.length) {
                var child = self.$doRemoveChild(index, false);
                self.dispatchEventWith("rmv_child" /* RMV_CHILD */, false);
                return child;
            }
            return null;
        };
        Object.defineProperty(BaseContainer.prototype, "left", {
            //----------------------------------
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "perHeight", {
            get: function () {
                return this.$BC[7 /* perHeight */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[7 /* perHeight */] === value)
                    return;
                values[7 /* perHeight */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseContainer.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        BaseContainer.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                var parent_1 = self.$parent;
                if (parent_1) {
                    parent_1.openLayout();
                }
            }
            if (self._inited) {
                self.invalidateDL();
            }
        };
        Object.defineProperty(BaseContainer.prototype, "isOpenLayout", {
            get: function () {
                return this.$BC[9 /* openLayout */];
            },
            enumerable: true,
            configurable: true
        });
        BaseContainer.prototype.openLayout = function () {
            this.$BC[9 /* openLayout */] = true;
        };
        Object.defineProperty(BaseContainer.prototype, "nestLevel", {
            //-----------------------------------------------------------------
            //public getLayoutBounds(bounds:egret.Rectangle):void
            //{
            //    let self = this;
            //    let w = self.$getWidth();
            //    let h = self.$getHeight();
            //
            //    self.applyMatrix(bounds, w, h);
            //}
            //
            //public setLayoutPos(x:number, y:number):void
            //{
            //    let self = this;
            //    let matrix = self.$getMatrix();
            //    if (!self.isDeltaIdentity(matrix))
            //    {
            //        let bounds = egret.$TempRectangle;
            //        self.getLayoutBounds(bounds);
            //        x += self.$getX() - bounds.x;
            //        y += self.$getY() - bounds.y;
            //    }
            //    super.$setX(x);
            //    super.$setY(y);
            //}
            //------------------------- property -------------------------------
            get: function () {
                return this.$nestLevel;
            },
            enumerable: true,
            configurable: true
        });
        BaseContainer.prototype.getPreferredBounds = function (bounds) {
            var self = this;
            var w = self.$getWidth();
            var h = self.$getHeight();
            self.applyMatrix(bounds, w, h);
        };
        BaseContainer.prototype.applyMatrix = function (bounds, w, h) {
            var self = this;
            bounds.setTo(0, 0, w, h);
            var matrix = self.$getMatrix();
            if (self.isDeltaIdentity(matrix)) {
                bounds.x += matrix.tx;
                bounds.y += matrix.ty;
            }
            else {
                matrix.$transformBounds(bounds);
            }
        };
        BaseContainer.prototype.isDeltaIdentity = function (m) {
            return (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1);
        };
        //-----------------------------------------------------------------------------------------
        BaseContainer.prototype.invalidateProps = function (tp) {
            var self = this;
            if (tp == 2 /* size */) {
                var tmpVal = self._anthorPerX;
                if (tmpVal != undefined) {
                    self.anchorOffsetX = Math.floor(self.$getWidth() * tmpVal);
                }
                tmpVal = self._anthorPerY;
                if (tmpVal != undefined) {
                    self.anchorOffsetY = Math.floor(self.$getHeight() * tmpVal);
                }
            }
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        BaseContainer.prototype.validateProps = function () {
            var self = this;
            if (self._invalidProps != 0) {
                self.commitProps();
            }
        };
        BaseContainer.prototype.commitProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if ((invalidateProps & 2 /* size */) == 2 /* size */ ||
                (invalidateProps & 1 /* position */) == 1 /* position */) {
                self.invalidateDL();
            }
            self._invalidProps = 0;
            self._invalidPropsFlag = false;
        };
        //--------------------------------------------
        BaseContainer.prototype.invalidateDL = function () {
            var self = this;
            if (self.$stage && !self._invalidDLFlag) {
                self._invalidDLFlag = true;
                if (self.needPLayout) {
                    var parent_2 = self.$parent;
                    if (parent_2) {
                        parent_2.invalidateDL();
                    }
                }
                // else{
                //     if( self.isOpenLayout ){
                cui.uiMgr.invalidateDL(self);
                //}
                //}
            }
            self._invalidDL = true;
        };
        BaseContainer.prototype.validateDL = function () {
            var self = this;
            self._invalidDL = false;
            self._invalidDLFlag = false;
            if (self.isOpenLayout) {
                self.updateDL();
            }
        };
        BaseContainer.prototype.validateChildDL = function (child) {
            var self = this;
            if (self.isOpenLayout) {
                var unscaledWidth = self.$getWidth();
                if (unscaledWidth == 0)
                    return;
                var unscaledHeight = self.$getHeight();
                if (unscaledHeight == 0)
                    return;
                self.adjChildDL(child, unscaledWidth, unscaledHeight);
            }
        };
        BaseContainer.prototype.updateDL = function () {
            var self = this;
            var unscaledWidth = self.$getWidth();
            if (unscaledWidth == 0)
                return;
            var unscaledHeight = self.$getHeight();
            if (unscaledHeight == 0)
                return;
            var chilren = self.$children;
            for (var i = 0, len = chilren.length; i < len; i++) {
                var child = chilren[i];
                if (!child.needPLayout)
                    continue;
                self.adjChildDL(child, unscaledWidth, unscaledHeight);
            }
        };
        BaseContainer.prototype.adjChildDL = function (layoutElement, unscaledWidth, unscaledHeight) {
            var left = layoutElement.left;
            var right = layoutElement.right;
            var perWidth = layoutElement.perWidth;
            var childWidth = NaN;
            if (!isNaN(left) && !isNaN(right)) {
                childWidth = unscaledWidth - right - left;
            }
            else if (!isNaN(perWidth)) {
                childWidth = Math.round(unscaledWidth * perWidth * 0.01);
            }
            if (isNaN(childWidth)) {
                childWidth = layoutElement.$getWidth();
            }
            else {
                layoutElement.width = childWidth;
            }
            var childHeight = NaN;
            var top = layoutElement.top;
            var bottom = layoutElement.bottom;
            var perHeight = layoutElement.perHeight;
            if (!isNaN(top) && !isNaN(bottom)) {
                childHeight = unscaledHeight - bottom - top;
            }
            else if (!isNaN(perHeight)) {
                childHeight = Math.round(unscaledHeight * perHeight * 0.01);
            }
            if (isNaN(childHeight)) {
                childHeight = layoutElement.$getHeight();
            }
            else {
                layoutElement.height = childHeight;
            }
            var childX = NaN;
            var childY = NaN;
            var hCenter = layoutElement.hCenter;
            var vCenter = layoutElement.vCenter;
            if (!isNaN(hCenter))
                childX = Math.round((unscaledWidth - childWidth) / 2 + hCenter);
            else if (!isNaN(left))
                childX = left;
            else if (!isNaN(right))
                childX = unscaledWidth - childWidth - right;
            if (!isNaN(vCenter))
                childY = Math.round((unscaledHeight - childHeight) / 2 + vCenter);
            else if (!isNaN(top))
                childY = top;
            else if (!isNaN(bottom))
                childY = unscaledHeight - childHeight - bottom;
            if (!isNaN(childX)) {
                layoutElement.x = childX + layoutElement.anchorOffsetX;
            }
            if (!isNaN(childY)) {
                layoutElement.y = childY + layoutElement.anchorOffsetY;
            }
            // if( (layoutElement as IBaseContainer).isOpenLayout ){
            //     (layoutElement as IBaseContainer).validateDL();
            // }
            //layoutElement.setLayoutPos( childX, childY );
        };
        //-----------------------------------------------------------------
        BaseContainer.prototype.$hitTest = function (stageX, stageY) {
            var self = this;
            if (!self.touchEnabled || !self.visible)
                return null;
            if (self.hitCheckBound) {
                var point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
                var bounds = egret.$TempRectangle.setTo(0, 0, self.$getWidth(), self.$getHeight());
                var scrollRect = self.$scrollRect;
                if (scrollRect) {
                    bounds.x = scrollRect.x;
                    bounds.y = scrollRect.y;
                }
                if (!bounds.contains(point.x, point.y))
                    return null;
            }
            var ret = _super.prototype.$hitTest.call(this, stageX, stageY);
            if (!ret && !self.touchThrough)
                ret = self;
            return ret;
        };
        //优化 不测量 皮肤制定大小 如有需要具体控件重载修改
        BaseContainer.prototype.$measureChildBounds = function () {
        };
        BaseContainer.prototype.$measureContentBounds = function (bounds) {
            var val = this.$BC[10 /* width */];
            if (val)
                bounds.width = val;
            val = this.$BC[11 /* height */];
            if (val)
                bounds.height = val;
        };
        ;
        return BaseContainer;
    }(egret.DisplayObjectContainer));
    cui.BaseContainer = BaseContainer;
    __reflect(BaseContainer.prototype, "cui.BaseContainer", ["cui.IBaseContainer", "cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/3/31.
 */
var cui;
(function (cui) {
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Component.prototype, "skinName", {
            //------------------------------------ skin -----------------------------------------
            get: function () {
                return this._skinName;
            },
            set: function (value) {
                var self = this;
                var name = self._skinName;
                if (name == value)
                    return;
                self._skinName = value;
                self.parseSkinName();
            },
            enumerable: true,
            configurable: true
        });
        Component.prototype.parseSkinName = function () {
            var self = this;
            var skinName = self.skinName;
            var skin;
            if (skinName) {
                if (skinName.prototype) {
                    skin = new skinName();
                }
                else {
                    var clazz = TRain.UITheme.getSkin(skinName);
                    skin = new clazz();
                    skin.skinParts = clazz.skinParts;
                    skin.needRess = clazz.needRess;
                }
            }
            self.setSkin(skin);
        };
        Component.prototype.setSkin = function (newSkin) {
            var self = this;
            var oldSkin = self._skin;
            if (oldSkin) {
                oldSkin.hostComponent = null;
                var skinParts = oldSkin.skinParts;
                var length_1 = skinParts.length;
                for (var i = 0; i < length_1; i++) {
                    var partName = skinParts[i];
                    if (self[partName]) {
                        delete self[partName];
                    }
                }
                var children = oldSkin.elementsContent;
                if (children) {
                    length_1 = children.length;
                    for (var i = 0; i < length_1; i++) {
                        self.removeChild(children[i]);
                    }
                }
                self._needRess = null;
            }
            self._skin = newSkin;
            if (newSkin) {
                newSkin.hostComponent = self;
                var skinParts = newSkin.skinParts;
                if (skinParts) {
                    var length_2 = skinParts.length;
                    for (var i = 0; i < length_2; i++) {
                        var partName = skinParts[i];
                        self[partName] = newSkin[partName];
                    }
                }
                self._needRess = newSkin.needRess;
                var children = newSkin.elementsContent;
                if (children) {
                    for (var i = children.length - 1; i >= 0; i--) {
                        self.addChildAt(children[i], 0);
                    }
                }
                TRain.core.addDelayDo(self.onPartAdded, self, 0);
            }
            //self.invalidateDL();
        };
        Component.prototype.onPartAdded = function () {
        };
        Object.defineProperty(Component.prototype, "enabled", {
            //------------------------------------ skin -----------------------------------------
            get: function () {
                return !this._disabled;
            },
            set: function (value) {
                var self = this;
                if (self._disabled === !value)
                    return;
                self._disabled = !value;
                self.$touchEnabled = value;
                self.invalidateProps(4 /* state */);
            },
            enumerable: true,
            configurable: true
        });
        Component.prototype.getState = function () {
            return "";
        };
        Component.prototype.commitProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if ((invalidateProps & 4 /* state */) == 4 /* state */) {
                var skin = self._skin;
                if (skin && skin.hasStates()) {
                    skin.applyState(self.getState());
                }
            }
            _super.prototype.commitProps.call(this);
        };
        return Component;
    }(cui.BaseContainer));
    cui.Component = Component;
    __reflect(Component.prototype, "cui.Component");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/10/23.
 */
var cui;
(function (cui) {
    var SimpleButton = (function (_super) {
        __extends(SimpleButton, _super);
        function SimpleButton() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.trigTm = 0;
            self.touchChildren = false;
            self._touchCaptured = false;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            return _this;
            //self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self); //没有TOUCH_BEGIN 也可以收到TOUCH_END
        }
        SimpleButton.prototype.dispose = function () {
            var self = this;
            self.clearTouchTm();
            self.onTouchFinish();
            self._cb = null;
            _super.prototype.dispose.call(this);
        };
        SimpleButton.prototype.setTarget = function (fun, tar) {
            this._cb = { fun: fun, tar: tar };
        };
        SimpleButton.prototype.$hitTest = function (stageX, stageY) {
            var self = this;
            if (!self.touchEnabled || !self.visible)
                return null;
            var point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
            var bounds = egret.$TempRectangle.setTo(0, 0, self.width, self.height);
            if (!bounds.contains(point.x, point.y))
                return null;
            //子控件 不处理事件
            return self;
        };
        SimpleButton.prototype.onTouchBegin = function (event) {
            var self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
            var stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;
            self._touchCaptured = true;
            self.invalidateProps(4 /* state */);
            event.updateAfterEvent();
            if (self.trigTm > 0) {
                if (true) {
                    if (self._tmTag) {
                        egret.warn("warning   frame event not cancel");
                    }
                }
                self._tmTag = TRain.core.addFrameDo(self.longTigger, self, false, self.trigTm);
                self._longTriged = false;
            }
        };
        SimpleButton.prototype.onTouchEnd = function (event) {
            var self = this;
            self.onTouchFinish();
            //此事件 以被别的控件处理了
            if (event.isDefaultPrevented())
                return;
            event.preventDefault();
            if (!self._longTriged) {
                self.buttonReleased();
            }
        };
        SimpleButton.prototype.onTouchFinish = function () {
            var self = this;
            self.clearTouchTm();
            var stage = self._tempStage;
            if (stage) {
                self._tempStage = null;
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
                self._touchCaptured = false;
                self.invalidateProps(4 /* state */);
            }
        };
        //-------------------- long touch tigger
        SimpleButton.prototype.longTigger = function () {
            var self = this;
            self._longTriged = true;
            if (self._touchCaptured) {
                self.buttonReleased();
            }
            else {
                self.clearTouchTm();
            }
        };
        SimpleButton.prototype.clearTouchTm = function () {
            var tmTag = this._tmTag;
            if (tmTag) {
                this._tmTag = 0;
                TRain.core.rmvFrameDoById(tmTag);
            }
        };
        SimpleButton.prototype.getState = function () {
            var self = this;
            if (!self.enabled)
                return "disabled";
            if (self._touchCaptured)
                return "down";
            return "up";
        };
        Object.defineProperty(SimpleButton.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (value) {
                this._sound = value;
            },
            enumerable: true,
            configurable: true
        });
        SimpleButton.prototype.buttonReleased = function () {
            var self = this;
            var cbData = self._cb;
            if (cbData) {
                cbData.fun.call(cbData.tar, self);
            }
            if (self.enabled) {
                var sound = self._sound;
                if (sound)
                    TRain.soundMgr.playSFX(sound);
            }
        };
        return SimpleButton;
    }(cui.Component));
    cui.SimpleButton = SimpleButton;
    __reflect(SimpleButton.prototype, "cui.SimpleButton");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/4/1.
 */
var cui;
(function (cui) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$Group = [
                0,
                0,
                0,
                0,
                false,
            ];
            return _this;
        }
        Object.defineProperty(Group.prototype, "layout", {
            //------------------------------------- layout ------------------------------------
            get: function () {
                return this._layout;
            },
            set: function (value) {
                var self = this;
                if (self._layout == value)
                    return;
                if (self._layout) {
                    self._layout.target = null;
                }
                self._layout = value;
                if (value) {
                    value.target = self;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "isOpenLayout", {
            get: function () {
                return !!this._layout || this.$BC[9 /* openLayout */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "elementsContent", {
            set: function (value) {
                if (value) {
                    var length_3 = value.length;
                    for (var i = 0; i < length_3; i++) {
                        this.addChild(value[i]);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "contentWidth", {
            //-------------------------------------------  layout -------------------------------------
            get: function () {
                return this.$Group[0 /* contentWidth */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "contentHeight", {
            get: function () {
                return this.$Group[1 /* contentHeight */];
            },
            enumerable: true,
            configurable: true
        });
        Group.prototype.setContentSize = function (width, height) {
            var self = this;
            var values = self.$Group;
            values[0 /* contentWidth */] = width;
            values[1 /* contentHeight */] = height;
            values = self.$BC;
            if (isNaN(values[10 /* width */])) {
                self.$setWidth(width);
            }
            if (isNaN(values[11 /* height */])) {
                self.$setHeight(height);
            }
        };
        Group.prototype.getElementRect = function (idx) {
            var self = this;
            var num = self.numElements;
            if (num <= 0)
                return null;
            if (idx >= num)
                idx = num - 1;
            var layout = this._layout;
            if (layout) {
                return layout.getElementRect(idx);
            }
            var ret = null;
            var child = this.getElementAt(idx);
            if (child) {
                ret = { x: child.$getX(), y: child.$getY(), w: child.$getWidth(), h: child.$getHeight() };
            }
            return ret;
        };
        Group.prototype.getElementSize = function (idx) {
            var self = this;
            var num = self.numElements;
            if (num <= 0)
                return { w: 0, h: 0 };
            if (idx >= num)
                idx = num - 1;
            var layout = this._layout;
            if (layout) {
                return layout.getElementSize(idx);
            }
            var ret = { w: 0, h: 0 };
            var child = this.getElementAt(idx);
            if (child) {
                ret.w = child.$getWidth();
                ret.h = child.$getHeight();
            }
            return ret;
        };
        Group.prototype.getElementIdxByPos = function (x, y) {
            var num = this.numElements;
            if (num <= 0 || (x < 0 && y < 0))
                return -1;
            var layout = this._layout;
            if (layout) {
                return layout.getElementIdxByPos(x, y);
            }
            for (var i = 0; i < num; i++) {
                var child = this.getElementAt(i);
                if (child) {
                    var childX = child.$getX();
                    var childY = child.$getY();
                    if (childX <= x && childY <= y && x <= (childX + child.$getWidth()) && y <= (childY + child.$getHeight())) {
                        return i;
                    }
                }
            }
            return -1;
        };
        Object.defineProperty(Group.prototype, "numElements", {
            get: function () {
                return this.$children.length;
            },
            enumerable: true,
            configurable: true
        });
        Group.prototype.getElementAt = function (index) {
            return this.getChildAt(index);
        };
        Group.prototype.getVirtualElementAt = function (index) {
            return this.getChildAt(index);
        };
        Group.prototype.setIndicesInView = function (startIndex, endIndex) {
            var i = 0;
            var children = this.$children;
            for (; i < startIndex; i++) {
                children[i].$setVisible(false);
            }
            for (; i <= endIndex; i++) {
                children[i].$setVisible(true);
            }
            var count = children.length;
            for (; i < count; i++) {
                children[i].$setVisible(false);
            }
        };
        Group.prototype.isElementInView = function (idx) {
            var child = this.getChildAt(idx);
            return child ? child.visible : false;
        };
        Object.defineProperty(Group.prototype, "scrollEnabled", {
            //-------------- scroll -------------
            get: function () {
                return this.$Group[4 /* scrollEnabled */];
            },
            set: function (value) {
                value = !!value;
                var values = this.$Group;
                if (value === values[4 /* scrollEnabled */])
                    return;
                values[4 /* scrollEnabled */] = value;
                this.updateScrollRect();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "scrollH", {
            get: function () {
                return this.$Group[2 /* scrollH */];
            },
            set: function (value) {
                value = +value || 0;
                var self = this;
                var values = self.$Group;
                if (value === values[2 /* scrollH */])
                    return;
                values[2 /* scrollH */] = value;
                self.invalidateDL();
                //if (self.updateScrollRect() && self._layout)
                //{
                //    self._layout.scrollPositionChanged();
                //}
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "scrollV", {
            get: function () {
                return this.$Group[3 /* scrollV */];
            },
            set: function (value) {
                value = +value || 0;
                var self = this;
                var values = self.$Group;
                if (value == values[3 /* scrollV */])
                    return;
                values[3 /* scrollV */] = value;
                self.invalidateDL();
                //if (self.updateScrollRect() && self._layout)
                //{
                //    self._layout.scrollPositionChanged();
                //}
            },
            enumerable: true,
            configurable: true
        });
        Group.prototype.updateScrollRect = function () {
            var self = this;
            var values = self.$Group;
            var hasClip = values[4 /* scrollEnabled */];
            var rect = this.$scrollRect;
            if (hasClip) {
                if (rect) {
                    rect.x = values[2 /* scrollH */];
                    rect.y = values[3 /* scrollV */];
                    rect.width = self.$getWidth();
                    rect.height = self.$getHeight();
                }
                else {
                    rect = new egret.Rectangle(values[2 /* scrollH */], values[3 /* scrollV */], self.$getWidth(), self.$getHeight());
                }
                self.scrollRect = rect;
            }
            else if (this.$scrollRect) {
                self.scrollRect = null;
            }
            return hasClip;
        };
        //-------------------------------------- scroll ------------------------------------
        Group.prototype.validateChildDL = function (child) {
            var self = this;
            var layout = self._layout;
            if (layout) {
                self.invalidateDL();
            }
            else {
                _super.prototype.validateChildDL.call(this, child);
            }
        };
        Group.prototype.validateDL = function () {
            var self = this;
            var layout = self._layout;
            if (layout) {
                self._invalidDL = false;
                self._invalidDLFlag = false;
                layout.updateDL(self.$getWidth(), self.$getHeight());
            }
            else {
                _super.prototype.validateDL.call(this);
            }
            self.updateScrollRect();
        };
        return Group;
    }(cui.BaseContainer));
    cui.Group = Group;
    __reflect(Group.prototype, "cui.Group", ["cui.IViewport"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/11/4.
 */
var TRain;
(function (TRain) {
    var TexData = (function (_super) {
        __extends(TexData, _super);
        function TexData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //---------------- 以下 内部 使用
            _this._refCnt = 0;
            return _this;
        }
        TexData.prototype.$hasRef = function () {
            return this._refCnt > 0;
        };
        TexData.prototype.$addRef = function () {
            this._refCnt++;
        };
        TexData.prototype.$subRef = function () {
            this._refCnt--;
            if (true) {
                if (this._refCnt < 0) {
                    egret.error("warning refCnt is navigate");
                }
            }
        };
        TexData.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            if (this.conf)
                this.conf = null;
        };
        return TexData;
    }(egret.Texture));
    TRain.TexData = TexData;
    __reflect(TexData.prototype, "TRain.TexData");
    var AssetManager = (function () {
        function AssetManager() {
            var self = this;
            self._imgsetList = {};
            self._waitGCs = [];
            self._texList = {};
        }
        //---------------------------------------------------------------------------
        AssetManager.prototype.releaseTex = function (texData) {
            var self = this;
            var parentNm = texData.pname;
            if (parentNm) {
                var imgSet = self._imgsetList[parentNm];
                imgSet.releaseBubTex(texData);
            }
            else {
                texData.$subRef();
                if (!texData.$hasRef()) {
                    //delete self._texList[texData.name];
                    self._waitGCs.push(texData.name);
                }
            }
        };
        AssetManager.prototype.onTexLoadFin = function (data, source) {
            var self = this;
            var texData;
            if (!(data instanceof TexData)) {
                texData = new TexData();
                texData.name = source;
                texData.$bitmapData = data.$bitmapData;
                texData.$initData(data.$bitmapX, data.$bitmapY, data.$bitmapWidth, data.$bitmapHeight, data.$offsetX, data.$offsetY, data.$sourceWidth, data.$sourceHeight, data.$sourceWidth, data.$sourceHeight);
                self._texList[source] = texData;
            }
            else {
                texData = data;
            }
            return texData;
        };
        AssetManager.prototype.getTex = function (source, cb, thisObj, tp) {
            var self = this;
            var isUrl = source.indexOf("/") >= 0;
            if (!isUrl) {
                var idx = source.indexOf("@");
                if (idx > 0) {
                    var imgName = source.substring(0, idx);
                    var subName = source.substr(idx + 1);
                    var imgSet = self._imgsetList[imgName];
                    if (!imgSet) {
                        imgSet = new TRain.ImageSet(imgName);
                        self._imgsetList[imgName] = imgSet;
                    }
                    imgSet.getTexture(subName, function (data) { cb.call(this, data, source); }, thisObj);
                    return;
                }
            }
            var texData = self._texList[source];
            if (texData) {
                texData.$addRef();
                cb.call(thisObj, texData, source);
                return;
            }
            tp = tp || "image" /* IMAGE */;
            var callBack = function (data) {
                var texData;
                if (data) {
                    texData = self.onTexLoadFin(data, source);
                    texData.$addRef();
                }
                cb.call(thisObj, texData, source);
            };
            if (isUrl) {
                RES.getResByUrl(source, callBack, self, tp);
            }
            else {
                if (RES.hasRes(source)) {
                    RES.getResAsync(source, callBack, self);
                }
                else {
                    RES.getResByUrl(CONF.imgUrl + source + ".png", callBack, self, tp);
                }
            }
        };
        AssetManager.prototype.doGC = function () {
            var self = this;
            var texList = self._texList;
            var names = self._waitGCs;
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_1 = names_1[_i];
                var texData = texList[name_1];
                if (texData && !texData.$hasRef()) {
                    delete texList[name_1];
                    RES.destroyRes(name_1);
                }
            }
            names.length = 0;
        };
        //-----------------------------------------------------------------------------------
        AssetManager.prototype.getFont = function (name, cb, thisObject) {
            var url = CONF.fontUrl + name + ".fnt";
            var data = RES.getAnalyzer("fnt" /* FONT */).getRes(url);
            if (data) {
                cb.call(thisObject, data, name);
                return;
            }
            var callBack = function (data) {
                cb.call(thisObject, data, name);
            };
            RES.getResByUrl(url, callBack, thisObject, "fnt" /* FONT */);
        };
        AssetManager.prototype.getMultiRes = function (srcs, finFunc, thisObject, userData) {
            var loadedcnt = 0;
            var succ = true;
            var datas = [];
            function onGetRes(data, source) {
                loadedcnt++;
                if (data) {
                    var idx = srcs.indexOf(source);
                    datas[idx] = data;
                }
                else {
                    succ = false;
                }
                if (loadedcnt >= srcs.length) {
                    finFunc.call(thisObject, succ, datas, userData);
                }
            }
            for (var i = 0, n = srcs.length; i < n; ++i) {
                RES.getResAsync(srcs[i], onGetRes, this);
            }
        };
        AssetManager.prototype.getUrlRes = function (tp, url) {
            return RES.getAnalyzer(tp).getRes(url);
        };
        AssetManager.prototype.destroyRes = function (name) {
            return RES.destroyRes(name);
        };
        AssetManager.prototype.getAsset = function (source, finFunc, thisObject) {
            if (RES.hasRes(source)) {
                var data = RES.getRes(source);
                if (data) {
                    finFunc.call(thisObject, data, source);
                }
                else {
                    RES.getResAsync(source, finFunc, thisObject);
                }
            }
            else {
                finFunc.call(thisObject, null, source);
            }
        };
        AssetManager.prototype.getUrlAsset = function (source, finFunc, thisObject, tp) {
            RES.getResByUrl(source, finFunc, thisObject, tp);
        };
        AssetManager.prototype.getUrlAssets = function (srcs, tps, finFunc, thisObject, userData) {
            var loadedcnt = 0;
            var succ = true;
            var datas = [];
            function onGetRes(data, source) {
                loadedcnt++;
                if (data) {
                    var idx = srcs.indexOf(source);
                    datas[idx] = data;
                }
                else {
                    succ = false;
                }
                if (loadedcnt >= srcs.length) {
                    finFunc.call(thisObject, succ, datas, userData);
                }
            }
            var self = this;
            var texTps = AssetManager.texTps;
            for (var i = 0, n = srcs.length; i < n; ++i) {
                var tp = tps[i];
                var source = srcs[i];
                if (texTps.indexOf(tp) < 0) {
                    RES.getResByUrl(source, onGetRes, self, tp);
                }
                else {
                    self.getTex(source, onGetRes, self, tp);
                }
            }
        };
        //生成 texData的  font不多，留后期处理
        AssetManager.texTps = ["image" /* IMAGE */, "mc" /* MC */];
        return AssetManager;
    }());
    TRain.AssetManager = AssetManager;
    __reflect(AssetManager.prototype, "TRain.AssetManager");
    TRain.assetMgr = new AssetManager();
})(TRain || (TRain = {}));
/**
 * Created by wjdeng on 2015/10/29.
 */
var cui;
(function (cui) {
    egret.Bitmap.prototype.$setTexture = function (value) {
        var self = this;
        self._sourceChanged = false;
        var oldTexture = self.$texture;
        if (value == oldTexture) {
            return false;
        }
        self.$texture = value;
        if (value) {
            self.$refreshImageData();
        }
        else {
            self.setImageData(null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        self.$renderDirty = true;
        return true;
    };
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image(source) {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false,
            ];
            self._invalidProps = 0;
            self._sourceChanged = false;
            self._source = null;
            self.$renderNode = new egret.sys.BitmapNode();
            if (source) {
                self.source = source;
            }
            return _this;
        }
        Object.defineProperty(Image.prototype, "anthorPerX", {
            //----------------------------------------------------
            get: function () {
                return this._anthorPerX || 0;
            },
            set: function (val) {
                var self = this;
                self._anthorPerX = val;
                var width = self.$getWidth();
                if (width > 0) {
                    self.anchorOffsetX = Math.floor(width * val);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "anthorPerY", {
            get: function () {
                return this._anthorPerY || 0;
            },
            set: function (val) {
                var self = this;
                self._anthorPerY = val;
                var height = self.$getHeight();
                if (height > 0) {
                    self.anchorOffsetY = Math.floor(height * val);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "filterNm", {
            get: function () {
                return this.$BC[12 /* filterNm */];
            },
            set: function (nm) {
                this.$BC[12 /* filterNm */] = nm;
                this.filters = nm && nm.length > 0 ? cui.uiMgr.getFilters(nm) : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "source", {
            //----------------------------------------
            get: function () {
                return this._source;
            },
            set: function (value) {
                var self = this;
                if (value == self._source) {
                    return;
                }
                self._source = value;
                if (value) {
                    if (self.$stage) {
                        self.handleSourceChange();
                    }
                    else {
                        self._sourceChanged = true;
                    }
                }
                else {
                    self.$setTexture(null);
                }
            },
            enumerable: true,
            configurable: true
        });
        Image.prototype.handleSourceChange = function () {
            var self = this;
            self._sourceChanged = false;
            var value = self._source;
            if (value) {
                TRain.assetMgr.getTex(value, self.contentChanged, self);
            }
        };
        Image.prototype.$setTexture = function (value) {
            var self = this;
            self._sourceChanged = false;
            var oldTexture = self.$texture;
            if (value == oldTexture) {
                return false;
            }
            self.$texture = value;
            if (value) {
                self.$refreshImageData();
                self.dispatchEventWith(egret.Event.COMPLETE);
                self.invalidateProps(64 /* source */);
            }
            else {
                self.resetBitmapData();
            }
            self.$renderDirty = true;
            if (oldTexture) {
                TRain.assetMgr.releaseTex(oldTexture);
            }
            return true;
        };
        Image.prototype.resetBitmapData = function () {
            var self = this;
            self.$bitmapData = null;
            self.$bitmapX = 0;
            self.$bitmapY = 0;
            self.$bitmapWidth = 0;
            self.$bitmapHeight = 0;
            self.$offsetX = 0;
            self.$offsetY = 0;
            self.$textureWidth = 0;
            self.$textureHeight = 0;
            self.$sourceWidth = 0;
            self.$sourceHeight = 0;
        };
        Image.prototype.contentChanged = function (data, source) {
            var self = this;
            var used = false;
            if (source == self._source) {
                used = !!self.$setTexture(data);
            }
            if (data && !used) {
                TRain.assetMgr.releaseTex(data);
            }
        };
        //----------------------------------------------------
        Image.prototype.$onAddToStage = function (stage, nestLevel) {
            egret.DisplayObject.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (self._sourceChanged) {
                self.handleSourceChange();
            }
            if (self._invalidProps > 0) {
                self.validateProps();
            }
        };
        Image.prototype.$onRemoveFromStage = function () {
            egret.DisplayObject.prototype.$onRemoveFromStage.call(this);
        };
        // $render():void
        // {
        //     let  self = this;
        //     let image = self.$Bitmap[egret.sys.BitmapKeys.bitmapData];
        //     if (!image) return;
        //     let width = self.$getWidth();
        //     let height = self.$getHeight();
        //     if (width === 0 || height === 0) {
        //         return;
        //     }
        //     let values = this.$Bitmap;
        //     egret.sys.BitmapNode.$updateTextureData(<egret.sys.BitmapNode>this.$renderNode, values[egret.sys.BitmapKeys.image],
        //         values[egret.sys.BitmapKeys.bitmapX], values[egret.sys.BitmapKeys.bitmapY], values[egret.sys.BitmapKeys.bitmapWidth], values[egret.sys.BitmapKeys.bitmapHeight],
        //         values[egret.sys.BitmapKeys.offsetX], values[egret.sys.BitmapKeys.offsetY], values[egret.sys.BitmapKeys.textureWidth], values[egret.sys.BitmapKeys.textureHeight],
        //         width, height, values[egret.sys.BitmapKeys.sourceWidth], values[egret.sys.BitmapKeys.sourceHeight], self.$scale9Grid, self.$fillMode, values[egret.sys.BitmapKeys.smoothing]);
        // }
        //-----------------------------------------------------------
        Image.prototype.dispose = function () {
            var self = this;
            self._disposed = true;
            var texture = self.$texture;
            if (texture) {
                self.$texture = null;
                TRain.assetMgr.releaseTex(texture);
            }
        };
        //----------------------------------------------------------
        Image.prototype.$setWidth = function (value) {
            var ret = _super.prototype.$setWidth.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Image.prototype.$setHeight = function (value) {
            var ret = _super.prototype.$setHeight.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Object.defineProperty(Image.prototype, "left", {
            //---------------------------------------------------------------------
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "perHeight", {
            get: function () {
                return this.$BC[7 /* perHeight */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[7 /* perHeight */] === value)
                    return;
                values[7 /* perHeight */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Image.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        Image.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            var parent = self.$parent;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                if (parent) {
                    parent.openLayout();
                }
            }
            if (parent) {
                parent.invalidateDL();
            }
        };
        //--------------------------------------------------
        Image.prototype.invalidateProps = function (tp) {
            var self = this;
            if (tp == 2 /* size */ || tp == 64 /* source */) {
                var tmpVal = self._anthorPerX;
                if (tmpVal != undefined) {
                    self.anchorOffsetX = Math.floor(self.$getWidth() * tmpVal);
                }
                tmpVal = self._anthorPerY;
                if (tmpVal != undefined) {
                    self.anchorOffsetY = Math.floor(self.$getHeight() * tmpVal);
                }
            }
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        Image.prototype.validateProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if (invalidateProps != 0) {
                var values = self.$BC;
                if (values[8 /* needPLayout */] && self.$parent) {
                    if (self.$texture) {
                        self.$parent.invalidateDL();
                    }
                }
                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        };
        return Image;
    }(egret.Bitmap));
    cui.Image = Image;
    __reflect(Image.prototype, "cui.Image", ["cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/10/24.
 */
var CMap = (function () {
    function CMap() {
        var self = this;
        self._keys = [];
        self._values = [];
    }
    CMap.prototype.set = function (key, value) {
        var self = this;
        var idx = self._keys.indexOf(key);
        if (idx >= 0) {
            self._values[idx] = value;
        }
        else {
            self._keys.push(key);
            self._values.push(value);
            if (true) {
                if (self._keys.length !== self._values.length) {
                    throw "CMap keys length not equal values length";
                }
            }
        }
        return self;
    };
    CMap.prototype.get = function (key) {
        var self = this;
        var idx = self._keys.indexOf(key);
        return (idx >= 0) ? self._values[idx] : null;
    };
    Object.defineProperty(CMap.prototype, "size", {
        get: function () {
            return this._keys.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CMap.prototype, "keys", {
        //注意 外部不能修改 返回的数组
        get: function () {
            return this._keys;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CMap.prototype, "values", {
        //注意 外部不能修改 返回的数组
        get: function () {
            return this._values;
        },
        enumerable: true,
        configurable: true
    });
    CMap.prototype.forEach = function (callbackfn, thisArg) {
        var self = this;
        var keys = self._keys;
        var values = self._values;
        var size = keys.length;
        for (var i = 0; i < size; ++i) {
            callbackfn.call(thisArg, values[i], keys[i], self);
        }
    };
    CMap.prototype.clear = function () {
        var self = this;
        self._keys.length = 0;
        self._values.length = 0;
    };
    CMap.prototype.has = function (key) {
        return this._keys.indexOf(key) >= 0;
    };
    CMap.prototype.delete = function (key) {
        var self = this;
        var idx = self._keys.indexOf(key);
        if (idx >= 0) {
            self._keys.splice(idx, 1);
            self._values.splice(idx, 1);
            return true;
        }
        return false;
    };
    return CMap;
}());
__reflect(CMap.prototype, "CMap");
///<reference path="./SimpleButton.ts" />
var cui;
(function (cui) {
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Button.prototype, "label", {
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
            get: function () {
                return this._label;
            },
            set: function (value) {
                var self = this;
                self._label = value;
                var skLabel = self.skLabel;
                if (skLabel)
                    skLabel.text = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "txtKey", {
            get: function () {
                return this._txtKey;
            },
            set: function (value) {
                var self = this;
                self._txtKey = value;
                var skLabel = self.skLabel;
                if (skLabel)
                    skLabel.txtKey = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (value) {
                var self = this;
                self._icon = value;
                var skIcon = self.skIcon;
                if (skIcon)
                    skIcon.source = value;
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.onPartAdded = function () {
            var self = this;
            // let skBg = self.skBg;
            // let source = self._src;
            // if( source && skBg ) skBg.source = source;
            var skIcon = self.skIcon;
            var icon = self._icon;
            if (icon && skIcon)
                skIcon.source = icon;
            var skLabel = self.skLabel;
            if (skLabel) {
                var label = self._label;
                if (label) {
                    skLabel.text = label;
                }
                else {
                    var txtKey = self._txtKey;
                    if (txtKey)
                        skLabel.txtKey = txtKey;
                }
            }
        };
        return Button;
    }(cui.SimpleButton));
    cui.Button = Button;
    __reflect(Button.prototype, "cui.Button");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/12/22.
 */
var cui;
(function (cui) {
    var DataItem = (function (_super) {
        __extends(DataItem, _super);
        function DataItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(DataItem.prototype, "data", {
            get: function () {
                return this._data;
            },
            set: function (value) {
                var self = this;
                self._data = value;
                if ("width" in value)
                    self.width = value.width;
                if ("height" in value)
                    self.height = value.height;
                if (self._inited) {
                    self.dataChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        DataItem.prototype.childrenCreated = function () {
            _super.prototype.childrenCreated.call(this);
            var self = this;
            if (self._data) {
                self.dataChanged();
            }
        };
        DataItem.prototype.dataChanged = function () {
        };
        return DataItem;
    }(cui.Component));
    cui.DataItem = DataItem;
    __reflect(DataItem.prototype, "cui.DataItem");
    var DataGroup = (function (_super) {
        __extends(DataGroup, _super);
        function DataGroup() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$DataGroup = [
                [],
                null,
                null,
                null,
            ];
            self._range = [0, 0];
            self._idxToItm = new CMap();
            return _this;
        }
        DataGroup.prototype.dispose = function () {
            var self = this;
            self.onRenderTouchFinish(null);
            var dataProvider = self.$DataGroup[3 /* dataProvider */];
            if (dataProvider) {
                dataProvider.removeEventListener("collect_ch" /* COLLECT_CHANGE */, self.onCollectionChange, self);
                self.$DataGroup[3 /* dataProvider */] = null;
            }
            self.clearAllRenders();
            _super.prototype.dispose.call(this);
        };
        DataGroup.prototype.childrenCreated = function () {
            var self = this;
            if (!self._layout) {
                var layout = new cui.DataLineLayout();
                layout.isHorizontal = false;
                self.layout = layout;
            }
            _super.prototype.childrenCreated.call(this);
        };
        Object.defineProperty(DataGroup.prototype, "numElements", {
            //---------------------------------------------- layout ---------------------------
            get: function () {
                var dataProvider = this.$DataGroup[3 /* dataProvider */];
                return dataProvider ? dataProvider.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        DataGroup.prototype.getElementAt = function (index) {
            return this._idxToItm.get(index);
        };
        DataGroup.prototype.getVirtualElementAt = function (index) {
            var self = this;
            var dataProvider = self.$DataGroup[3 /* dataProvider */];
            if (index < 0 || index >= dataProvider.length)
                return null;
            var idxToItm = self._idxToItm;
            var renderer = idxToItm.get(index);
            if (!renderer) {
                var item = dataProvider.getItemAt(index);
                renderer = self.createRender();
                renderer.itemIndex = index;
                renderer.data = item;
                idxToItm.set(index, renderer);
                self.addChild(renderer);
                self.rendererAdded(renderer, index, item);
            }
            return renderer;
        };
        DataGroup.prototype.setIndicesInView = function (startIndex, endIndex) {
            var self = this;
            var viewRange = self._range;
            viewRange[0] = startIndex;
            viewRange[1] = endIndex;
            var idxToItm = self._idxToItm;
            var renders = idxToItm.values;
            var rmvIdxs = [];
            var length = renders.length;
            var i = 0;
            for (i = 0; i < length; i++) {
                var render = renders[i];
                var idx = render.itemIndex;
                if (idx < startIndex || idx > endIndex) {
                    rmvIdxs.push(idx);
                    self.doFreeRender(render);
                }
            }
            length = rmvIdxs.length;
            for (i = 0; i < length; i++) {
                idxToItm.delete(rmvIdxs[i]);
            }
        };
        DataGroup.prototype.isElementInView = function (idx) {
            return this._idxToItm.has(idx);
        };
        Object.defineProperty(DataGroup.prototype, "itemRender", {
            //-------------------------------- itemRender ----------------------------
            get: function () {
                return this.$DataGroup[1 /* itemRender */];
            },
            set: function (value) {
                var self = this;
                var values = self.$DataGroup;
                if (values[1 /* itemRender */] == value)
                    return;
                values[1 /* itemRender */] = value;
                self.invalidateProps(8 /* itemRender */);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGroup.prototype, "itemSkinName", {
            get: function () {
                return this.$DataGroup[2 /* itemRenderSkinName */];
            },
            set: function (value) {
                var self = this;
                var values = self.$DataGroup;
                if (values[2 /* itemRenderSkinName */] == value)
                    return;
                values[2 /* itemRenderSkinName */] = value;
                self.invalidateProps(16 /* itemRenderSkinName */);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGroup.prototype, "dataProvider", {
            //--------------------------------- dataprovider --------------------------
            get: function () {
                return this.$DataGroup[3 /* dataProvider */];
            },
            set: function (value) {
                var self = this;
                var values = self.$DataGroup;
                var dataProvider = values[3 /* dataProvider */];
                if (dataProvider == value)
                    return;
                if (dataProvider) {
                    dataProvider.removeEventListener("collect_ch" /* COLLECT_CHANGE */, self.onCollectionChange, self);
                }
                values[3 /* dataProvider */] = value;
                self.invalidateProps(32 /* dataProvider */);
            },
            enumerable: true,
            configurable: true
        });
        DataGroup.prototype.onCollectionChange = function (event) {
            var self = this;
            //let values = self.$DataGroup;
            switch (event.kind) {
                case "add" /* ADD */:
                    self.itemAddedHandler(event.item, event.location);
                    break;
                case "remove" /* REMOVE */:
                    self.itemRemovedHandler(event.item, event.location);
                    break;
                case "update" /* UPDATE */:
                case "replace" /* REPLACE */:
                    self.itemUpdatedHandler(event.item, event.location);
                    break;
                case "upidxs" /* UPDATE_idxs */:
                    self.idxsUpdatedHandler(event.item);
                    break;
                case "removeAll" /* REMOVEALL */:
                case "reset" /* RESET */:
                case "refresh" /* REFRESH */:
                    self.freeAllRender();
                    self.invalidateProps(32 /* dataProvider */);
                    break;
            }
        };
        DataGroup.prototype.itemAddedHandler = function (items, idx) {
            var self = this;
            if (self._idxToItm.has(idx)) {
                self.resetRenderIdxs();
                self.invalidateDL();
            }
            else {
                var range = self._range;
                if (range[0] <= idx && idx <= range[1]) {
                    self.invalidateDL();
                }
            }
        };
        DataGroup.prototype.itemRemovedHandler = function (item, idx) {
            var self = this;
            var idxToItm = self._idxToItm;
            var renderer = idxToItm.get(idx);
            if (renderer) {
                idxToItm.delete(idx);
                self.doFreeRender(renderer);
                self.resetRenderIdxs();
                self.invalidateDL();
            }
        };
        DataGroup.prototype.resetRenderIdxs = function () {
            var self = this;
            var idxToItm = self._idxToItm;
            if (idxToItm.size == 0)
                return;
            var dataProvider = self.$DataGroup[3 /* dataProvider */];
            var renderers = idxToItm.values;
            var length = renderers.length;
            var changed = false, item, newIdx = 0;
            for (var i = 0; i < length; i++) {
                item = renderers[i];
                newIdx = dataProvider.getItemIndex(item.data);
                if (item.itemIndex != newIdx) {
                    item.itemIndex = newIdx;
                    changed = true;
                }
            }
            if (changed) {
                renderers = renderers.slice(0);
                idxToItm.clear();
                for (var i = 0; i < length; i++) {
                    item = renderers[i];
                    idxToItm.set(item.itemIndex, item);
                }
            }
        };
        DataGroup.prototype.itemUpdatedHandler = function (item, idx) {
            var renderer = this._idxToItm.get(idx);
            if (renderer) {
                renderer.data = item;
            }
        };
        DataGroup.prototype.idxsUpdatedHandler = function (idxs) {
            var idxToItm = this._idxToItm;
            var dataProvider = this.dataProvider;
            for (var _i = 0, idxs_1 = idxs; _i < idxs_1.length; _i++) {
                var idx = idxs_1[_i];
                var renderer = idxToItm.get(idx);
                if (renderer) {
                    renderer.data = dataProvider.getItemAt(idx);
                }
            }
        };
        DataGroup.prototype.clearAllRenders = function () {
            var self = this;
            var idxToItems = self._idxToItm;
            var length = idxToItems.size;
            if (length > 0) {
                var renderers = idxToItems.values;
                self.removeChildren();
                for (var i = 0; i < length; i++) {
                    renderers[i].dispose();
                }
                idxToItems.clear();
            }
            var values = self.$DataGroup;
            var freeRenders = values[0 /* freeRenders */];
            length = freeRenders.length;
            if (length > 0) {
                for (var i = 0; i < length; i++) {
                    freeRenders[i].dispose();
                }
                values[0 /* freeRenders */] = [];
            }
        };
        //----------------------------------------------------------------
        DataGroup.prototype.freeAllRender = function () {
            var self = this;
            var renderers = self._idxToItm.values;
            for (var i = 0, n = renderers.length; i < n; ++i) {
                self.doFreeRender(renderers[i]);
            }
            self._idxToItm.clear();
        };
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
        DataGroup.prototype.doFreeRender = function (renderer) {
            var self = this;
            var values = self.$DataGroup;
            var freeRenders = values[0 /* freeRenders */];
            freeRenders.push(renderer);
            self.rendererRemoved(renderer, renderer.itemIndex, renderer.data);
            self.removeChild(renderer);
        };
        /**
         * @private
         * 为指定索引创建虚拟的项呈示器
         */
        DataGroup.prototype.createRender = function () {
            var self = this;
            var renderer;
            var freeRenders = self.$DataGroup[0 /* freeRenders */];
            if (freeRenders && freeRenders.length > 0) {
                renderer = freeRenders.pop();
            }
            else {
                var rendererClass = self.$DataGroup[1 /* itemRender */];
                if (!rendererClass)
                    rendererClass = DataItem;
                renderer = (new rendererClass());
                var itemRenderSkinName = self.$DataGroup[2 /* itemRenderSkinName */];
                if (itemRenderSkinName) {
                    renderer.skinName = itemRenderSkinName;
                }
            }
            return renderer;
        };
        DataGroup.prototype.rendererAdded = function (renderer, index, item) {
            var self = this;
            renderer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onRenderTouchBegin, self);
        };
        DataGroup.prototype.rendererRemoved = function (renderer, index, item) {
            var self = this;
            renderer.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onRenderTouchBegin, self);
        };
        DataGroup.prototype.onRenderTouchBegin = function (event) {
            var self = this;
            var render = (event.$currentTarget);
            var stage = self.$stage;
            self._tempStage = stage;
            self._downRender = render;
            render.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchEnd, self);
            render.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderCaptureEnd, self, true); //优先监听
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchFinish, self);
        };
        DataGroup.prototype.onRenderTouchFinish = function (event) {
            var self = this;
            var itemRender = self._downRender;
            if (itemRender) {
                itemRender.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchEnd, self);
                itemRender.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderCaptureEnd, self, true); //优先监听
                self._tempStage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onRenderTouchFinish, self);
                self._tempStage = null;
                self._downRender = null;
            }
        };
        DataGroup.prototype.onRenderCaptureEnd = function (event) {
            var self = this;
            if (event.isDefaultPrevented()) {
                self.onRenderTouchFinish(event);
            }
        };
        DataGroup.prototype.onRenderTouchEnd = function (event) {
            var self = this;
            var downRender = self._downRender;
            if (!downRender)
                return;
            self.onRenderTouchFinish(event);
            var itemRender = (event.$currentTarget);
            if (itemRender != downRender)
                return;
            self.dispatchEventWith("item_tap" /* ITEM_TAP */, false, itemRender);
            //不阻塞事件
        };
        //-----------------------------------------------------------------------------
        DataGroup.prototype.commitProps = function () {
            var self = this;
            var values = self.$DataGroup;
            var invalidProps = self._invalidProps;
            var dataProviderChanged = (invalidProps & 32 /* dataProvider */) == 32 /* dataProvider */;
            if (dataProviderChanged || (invalidProps & 8 /* itemRender */) == 8 /* itemRender */) {
                //let numChildren = self.numChildren;
                self.clearAllRenders();
                //if( numChildren > 0 )
                //{
                self.dispatchEventWith("view_clear" /* VIEW_CLEAR */, false);
                //}
                if (dataProviderChanged) {
                    var dataProvider = values[3 /* dataProvider */];
                    if (dataProvider)
                        dataProvider.addEventListener("collect_ch" /* COLLECT_CHANGE */, self.onCollectionChange, self);
                    self.scrollV = self.scrollH = 0;
                }
                self.invalidateDL();
            }
            if ((invalidProps & 16 /* itemRenderSkinName */) == 16 /* itemRenderSkinName */) {
                var skinName = values[2 /* itemRenderSkinName */];
                var renderers = self._idxToItm.values;
                var length_4 = renderers.length;
                var i = 0;
                for (i = 0; i < length_4; i++) {
                    renderers[i].skinName = skinName;
                }
                var freeRenders = values[0 /* freeRenders */];
                length_4 = freeRenders.length;
                for (i = 0; i < length_4; i++) {
                    freeRenders[i].skinName = skinName;
                }
            }
            _super.prototype.commitProps.call(this);
        };
        return DataGroup;
    }(cui.Group));
    cui.DataGroup = DataGroup;
    __reflect(DataGroup.prototype, "cui.DataGroup");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/4/1.
 */
var cui;
(function (cui) {
    var LayoutBase = (function () {
        function LayoutBase() {
            var self = this;
            self._target = null;
            self.paddingBottom = 0;
            self.paddingTop = 0;
            self.paddingRight = 0;
            self.paddingLeft = 0;
            self.itemH = 0;
            self.itemW = 0;
            self._startIdx = -1;
            self._endIdx = -1;
        }
        Object.defineProperty(LayoutBase.prototype, "target", {
            get: function () {
                return this._target;
            },
            set: function (value) {
                var self = this;
                if (self._target === value)
                    return;
                self._target = value;
            },
            enumerable: true,
            configurable: true
        });
        LayoutBase.prototype.getElementIdxByPos = function (x, y) {
            return -1;
        };
        //含item周围的间隔  确保 idx 有效
        LayoutBase.prototype.getElementRect = function (idx) {
            return null;
        };
        LayoutBase.prototype.getElementSize = function (idx) {
            var self = this;
            if (self.isFixedSize()) {
                return { w: self.itemW, h: self.itemH };
            }
            var child = self.target.getElementAt(idx);
            return child ? { w: child.width, h: child.height } : { w: 0, h: 0 };
        };
        LayoutBase.prototype.isFixedSize = function () {
            return this.itemH > 0 && this.itemW > 0;
        };
        LayoutBase.prototype.checkTargetValid = function (target) {
            if (!target || target.numElements <= 0)
                return false;
            var width = target.$getWidth();
            var height = target.$getHeight();
            if (width <= 0 || height <= 0)
                return false;
            return true;
        };
        LayoutBase.prototype.scrollPositionChanged = function () {
            var self = this;
            var target = self._target;
            if (!self.checkTargetValid(target)) {
                self._startIdx = self._endIdx = -1;
                return;
            }
            var changed = self.adjustViewIndex(target);
            if (changed) {
                self._inViewCalc = true;
                self.target.invalidateDL();
            }
        };
        LayoutBase.prototype.adjustViewIndex = function (target) {
            return false;
        };
        LayoutBase.prototype.updateDL = function (unscaledWidth, unscaledHeight) {
            var self = this;
            var target = self._target;
            if (!self.checkTargetValid(target)) {
                self._startIdx = self._endIdx = -1;
                return;
            }
            if (self._inViewCalc)
                self._inViewCalc = false;
            else
                self.adjustViewIndex(target);
            if (self._startIdx == -1 || self._endIdx == -1) {
                target.setContentSize(Math.ceil(self.paddingLeft + self.paddingRight), Math.ceil(self.paddingTop + self.paddingBottom));
                return;
            }
            target.setIndicesInView(self._startIdx, self._endIdx);
            if (self.isFixedSize()) {
                self.updateFixSizeDList(unscaledWidth, unscaledHeight);
            }
            else {
                self.updateRealDList(unscaledWidth, unscaledHeight);
            }
        };
        LayoutBase.prototype.updateFixSizeDList = function (unscaledWidth, unscaledHeight) {
        };
        LayoutBase.prototype.updateRealDList = function (unscaledWidth, unscaledHeight) {
        };
        return LayoutBase;
    }());
    cui.LayoutBase = LayoutBase;
    __reflect(LayoutBase.prototype, "cui.LayoutBase");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/1/4.
 */
var TRain;
(function (TRain) {
    var Action = (function () {
        //和别的系统保持一至  如 delaydo
        //private _firstTick:boolean = true;
        function Action(dur, times) {
            this._tm = 0;
            this._doCnt = 0;
            var self = this;
            self._dur = dur || 1;
            self._times = times || 1;
            self._tm = 0;
            self._doCnt = 0;
        }
        Object.defineProperty(Action.prototype, "duration", {
            get: function () {
                var self = this;
                return self._dur * self._times;
            },
            set: function (d) {
                this._dur = d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Action.prototype, "times", {
            get: function () {
                return this._times;
            },
            set: function (val) {
                this._times = val > 0 ? val : 1;
            },
            enumerable: true,
            configurable: true
        });
        Action.prototype.isDone = function () {
            return this._tm >= this._dur;
        };
        Action.prototype.getTar = function () {
            return this._tar;
        };
        Action.prototype.start = function (tar) {
            var self = this;
            self._tar = tar;
            //self._firstTick = true;
            self._tm = 0;
            self._doCnt = 0;
        };
        Action.prototype.stop = function () {
            this._tar = null;
        };
        //停在最 并结束
        Action.prototype.stopToEnd = function () {
            var self = this;
            if (self._tar) {
                self.update(1);
                self._tar = null;
            }
        };
        Action.prototype.clear = function () {
            this._tar = null;
        };
        Action.prototype.step = function (dt) {
            var self = this;
            //if (self._firstTick)
            //{
            //    self._firstTick = false;
            //    self._tm = 0;
            //}
            //else
            //{
            self._tm += dt;
            //}
            var val = Math.min(1, self._tm / self._dur);
            self.update(val);
            if (val >= 1) {
                var times = self.times;
                self._doCnt++;
                if (self._doCnt < times) {
                    self._tm -= self._dur;
                }
            }
        };
        /**
         called once per frame. tm a value between 0 and 1

         For example:
         - 0 means that the action just started
         - 0.5 means that the action is in the middle
         - 1 means that the action is over
         */
        Action.prototype.update = function (tm) {
        };
        return Action;
    }());
    TRain.Action = Action;
    __reflect(Action.prototype, "TRain.Action");
    var ActionLoop = (function (_super) {
        __extends(ActionLoop, _super);
        function ActionLoop(action) {
            var _this = _super.call(this) || this;
            _this._act = action;
            return _this;
        }
        ActionLoop.prototype.isDone = function () {
            return false;
        };
        ActionLoop.prototype.stop = function () {
            var self = this;
            self._tar = null;
            self._act.stop();
        };
        ActionLoop.prototype.clear = function () {
            _super.prototype.clear.call(this);
            var action = this._act;
            if (action) {
                action.clear();
                this._act = null;
            }
        };
        ActionLoop.prototype.setAction = function (action) {
            var self = this;
            var oldAction = self._act;
            if (oldAction)
                oldAction.stop();
            self._act = action;
            var tar = self._tar;
            if (tar && action) {
                action.start(tar);
            }
        };
        ActionLoop.prototype.start = function (tar) {
            _super.prototype.start.call(this, tar);
            var action = this._act;
            if (action)
                action.start(tar);
        };
        ActionLoop.prototype.step = function (dt) {
            var self = this;
            var action = self._act;
            if (action) {
                self._tm += dt;
                if (action.isDone()) {
                    //重新开始
                    var duration = action.duration;
                    dt = self._tm - duration;
                    if (dt > duration) {
                        dt = dt % duration;
                    }
                    self._tm = dt;
                    action.start(self._tar);
                }
                action.step(dt);
            }
        };
        return ActionLoop;
    }(Action));
    TRain.ActionLoop = ActionLoop;
    __reflect(ActionLoop.prototype, "TRain.ActionLoop");
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var SheetAnalyzer = (function (_super) {
        __extends(SheetAnalyzer, _super);
        function SheetAnalyzer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SheetAnalyzer.prototype.getRes = function (name) {
            return this.fileDic[name];
        };
        /**
         * 一项加载结束
         */
        SheetAnalyzer.prototype.onLoadFinish = function (event) {
            var self = this;
            var request = event.target;
            var resData = self.resItemDic[request.$hashCode];
            delete self.resItemDic[request.hashCode];
            var resItem = resData.item;
            resItem.loaded = (event.type == egret.Event.COMPLETE);
            if (resItem.loaded) {
                var response_1 = request.response;
                var int32Arr = new Uint32Array(response_1, 0, 2);
                var jsonLen_1 = int32Arr[0];
                var imgLen_1 = int32Arr[1];
                var imgArr = new Uint8Array(response_1, 8 + jsonLen_1, imgLen_1);
                egret.BitmapData.create("arraybuffer", imgArr, function (bitmapData) {
                    var texture = new TRain.TexData();
                    texture._setBitmapData(bitmapData);
                    var int8Arr = new Uint8Array(response_1, 8, jsonLen_1);
                    var tmpArr = new Uint16Array(int8Arr.length);
                    var i, len, code;
                    for (i = 0, len = int8Arr.length; i < len; i++) {
                        code = int8Arr[i];
                        tmpArr[i] = ((code << 4) & 0xff) + (code >> 4);
                    }
                    var confStr = String.fromCharCode.apply(null, tmpArr);
                    var confStr1;
                    var byteOffset = jsonLen_1 + imgLen_1 + 8;
                    //let otherLen = response.byteLength - byteOffset;
                    if (response_1.byteLength > byteOffset) {
                        var int16Arr = new Uint16Array(response_1, byteOffset);
                        tmpArr = new Uint16Array(int8Arr.length);
                        for (i = 0, len = int16Arr.length; i < len; i++) {
                            code = int16Arr[i];
                            tmpArr[i] = ((code << 8) & 0xff) + (code >> 8);
                        }
                        confStr1 = String.fromCharCode.apply(null, tmpArr);
                    }
                    self.parseSpriteSheet(texture, confStr, resItem.name, confStr1);
                    resData.func.call(resData.thisObject, resItem);
                });
            }
            else {
                resData.func.call(resData.thisObject, resItem);
            }
            self.recycler.push(request);
        };
        SheetAnalyzer.prototype.parseSpriteSheet = function (texData, jsonStr, name, otherStr) {
            var data = JSON.parse(jsonStr);
            var frames = data.frames;
            if (!frames) {
                return;
            }
            texData.name = name;
            texData.conf = frames;
            this.fileDic[name] = texData;
        };
        SheetAnalyzer.prototype.destroyRes = function (name) {
            var fileDic = this.fileDic;
            var texData = fileDic[name];
            if (texData) {
                delete fileDic[name];
                texData.dispose();
                return true;
            }
            return false;
        };
        return SheetAnalyzer;
    }(RES.BinAnalyzer));
    TRain.SheetAnalyzer = SheetAnalyzer;
    __reflect(SheetAnalyzer.prototype, "TRain.SheetAnalyzer");
    RES.registerAnalyzer("st" /* SHEET */, SheetAnalyzer);
})(TRain || (TRain = {}));
var Profile;
(function (Profile) {
    if (true) {
    }
})(Profile || (Profile = {}));
var cui;
(function (cui) {
    var EditableText = (function (_super) {
        __extends(EditableText, _super);
        function EditableText() {
            var _this = _super.call(this) || this;
            _this._isFocusIn = false;
            _this._promptColor = 0x666666;
            var self = _this;
            self.type = egret.TextFieldType.INPUT;
            self._isFocusIn = false;
            self.$EditableText = [
                null,
                0xffffff,
                false //asPassword
            ];
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false,
            ];
            self._invalidProps = 0;
            return _this;
        }
        EditableText.prototype.dispose = function () {
            this._disposed = true;
        };
        Object.defineProperty(EditableText.prototype, "filterNm", {
            get: function () {
                return this.$BC[12 /* filterNm */];
            },
            set: function (nm) {
                this.$BC[12 /* filterNm */] = nm;
                this.filters = nm && nm.length > 0 ? cui.uiMgr.getFilters(nm) : null;
            },
            enumerable: true,
            configurable: true
        });
        //----------------------------------------------------------------
        EditableText.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            self.addEventListener(egret.FocusEvent.FOCUS_IN, self.onfocusIn, self);
            self.addEventListener(egret.FocusEvent.FOCUS_OUT, self.onfocusOut, self);
            if (self._invalidProps > 0) {
                self.validateProps();
            }
        };
        EditableText.prototype.$onRemoveFromStage = function () {
            _super.prototype.$onRemoveFromStage.call(this);
            var self = this;
            self.removeEventListener(egret.FocusEvent.FOCUS_IN, self.onfocusIn, self);
            self.removeEventListener(egret.FocusEvent.FOCUS_OUT, self.onfocusOut, self);
        };
        EditableText.prototype.onfocusOut = function () {
            var self = this;
            self._isFocusIn = false;
            if (!self.text) {
                self.showPromptText();
            }
        };
        EditableText.prototype.onfocusIn = function () {
            var self = this;
            self._isFocusIn = true;
            self._showPrompt = false;
            self.displayAsPassword = self.$EditableText[2 /* asPassword */];
            var values = self.$EditableText;
            var text = self.text;
            if (!text || text == values[0 /* promptText */]) {
                self.textColor = values[1 /* textColorUser */];
                self.text = "";
            }
        };
        //-----------------------------------------------
        EditableText.prototype.$getText = function () {
            var value = _super.prototype.$getText.call(this);
            if (value == this.$EditableText[0 /* promptText */]) {
                value = "";
            }
            return value;
        };
        EditableText.prototype.$setText = function (value) {
            var self = this;
            var promptText = self.$EditableText[0 /* promptText */];
            if (promptText != value || promptText == null) {
                self._showPrompt = false;
                self.textColor = self.$EditableText[1 /* textColorUser */];
            }
            if (!self._isFocusIn) {
                if (value == "" || value == null) {
                    value = promptText;
                    self._showPrompt = true;
                    _super.prototype.$setTextColor.call(this, self._promptColor);
                }
            }
            var result = _super.prototype.$setText.call(this, value);
            return result;
        };
        Object.defineProperty(EditableText.prototype, "prompt", {
            get: function () {
                return this.$EditableText[0 /* promptText */];
            },
            set: function (value) {
                var self = this;
                var values = self.$EditableText;
                var promptText = values[0 /* promptText */];
                if (promptText == value)
                    return;
                values[0 /* promptText */] = value;
                var text = self.text;
                if (!text || text == promptText) {
                    self.showPromptText();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "promptColor", {
            get: function () {
                return this._promptColor;
            },
            //------------------------------------------
            set: function (value) {
                value = +value | 0;
                var self = this;
                if (self._promptColor != value) {
                    self._promptColor = value;
                    var text = self.text;
                    if (!text || text == self.$EditableText[0 /* promptText */]) {
                        self.showPromptText();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        EditableText.prototype.showPromptText = function () {
            var self = this;
            var values = self.$EditableText;
            self._showPrompt = true;
            _super.prototype.$setTextColor.call(this, self._promptColor);
            _super.prototype.$setDisplayAsPassword.call(this, false);
            self.text = values[0 /* promptText */];
        };
        //------------------------------------------
        EditableText.prototype.$setTextColor = function (value) {
            value = +value | 0;
            var self = this;
            self.$EditableText[1 /* textColorUser */] = value;
            if (!self._showPrompt) {
                _super.prototype.$setTextColor.call(this, value);
            }
            return true;
        };
        /**
         * @private
         */
        EditableText.prototype.$setDisplayAsPassword = function (value) {
            var self = this;
            self.$EditableText[2 /* asPassword */] = value;
            if (!self._showPrompt) {
                _super.prototype.$setDisplayAsPassword.call(this, value);
            }
            return true;
        };
        //-------------------------------------------------------------
        EditableText.prototype.$setWidth = function (value) {
            var ret = _super.prototype.$setWidth.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        EditableText.prototype.$setHeight = function (value) {
            var ret = _super.prototype.$setHeight.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Object.defineProperty(EditableText.prototype, "left", {
            //---------------------------------------------------------------------
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "perHeight", {
            get: function () {
                return this.$BC[7 /* perHeight */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[7 /* perHeight */] === value)
                    return;
                values[7 /* perHeight */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EditableText.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        EditableText.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            var parent = self.$parent;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                if (parent) {
                    parent.openLayout();
                }
            }
            if (parent) {
                parent.invalidateDL();
            }
        };
        //--------------------------------------------------
        EditableText.prototype.invalidateProps = function (tp) {
            var self = this;
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        EditableText.prototype.validateProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if (invalidateProps != 0) {
                var values = self.$BC;
                if (values[8 /* needPLayout */] && self.$parent) {
                    if (self.$getText() != "") {
                        self.$parent.invalidateDL();
                    }
                }
                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        };
        return EditableText;
    }(egret.TextField));
    cui.EditableText = EditableText;
    __reflect(EditableText.prototype, "cui.EditableText", ["cui.IDisplayText", "cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
var cui;
(function (cui) {
    /**通过 width  表示直径
     * 顺时针
    */
    var FanShape = (function (_super) {
        __extends(FanShape, _super);
        function FanShape() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN
            ];
            self.tag = -1;
            self._invalidProps = 0;
            self._stAngle = 0;
            self._endAngle = 360;
            self._color = 0;
            return _this;
        }
        FanShape.prototype.dispose = function () {
            this._disposed = true;
        };
        FanShape.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (self._invalidProps > 0) {
                self.validateProps();
            }
        };
        //-------------------------------------------------------------
        // width  表示直径 
        FanShape.prototype.$setWidth = function (value) {
            _super.prototype.$setWidth.call(this, value);
            _super.prototype.$setHeight.call(this, value);
            this.invalidateProps(2 /* size */);
        };
        Object.defineProperty(FanShape.prototype, "stAngle", {
            // $setHeight(value:number):void
            // {
            //     super.$setHeight( value );
            //     this.invalidateProps( PropertyType.size );
            // }
            //开始角度 默认0
            get: function () {
                return this._stAngle;
            },
            set: function (value) {
                value = +value;
                if (this._stAngle == value)
                    return;
                this._stAngle = value;
                this.invalidateProps(64 /* source */);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "endAngle", {
            //结束角度 默认360
            get: function () {
                return this._endAngle;
            },
            set: function (value) {
                value = +value;
                if (this._endAngle == value)
                    return;
                this._endAngle = value;
                this.invalidateProps(64 /* source */);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "color", {
            //结束角度 默认360
            get: function () {
                return this._color;
            },
            set: function (value) {
                value = +value;
                if (this._color == value)
                    return;
                this._color = value;
                this.invalidateProps(64 /* source */);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "left", {
            //---------------------------------------------------------------------
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "perHeight", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                // value = +value;
                // let values = this.$BC;
                // if (values[BaseUIKeys.perHeight] === value)
                //     return;
                // values[BaseUIKeys.perHeight] = value;
                // this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FanShape.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        FanShape.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            var parent = self.$parent;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                if (parent) {
                    parent.openLayout();
                }
            }
            if (parent) {
                parent.invalidateDL();
            }
        };
        //--------------------------------------------------
        FanShape.prototype.invalidateProps = function (tp) {
            var self = this;
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        FanShape.prototype.validateProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if (invalidateProps != 0) {
                if (self.$parent) {
                    self.drawFan();
                }
                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        };
        FanShape.prototype.drawFan = function () {
            var self = this;
            var g = self.graphics;
            var width = self.width;
            var startAngle = self._stAngle;
            var endAngle = self._endAngle;
            if (!width || startAngle == endAngle) {
                g.clear();
                return;
            }
            var radius = Math.floor(width / 2 + 0.5);
            g.beginFill(self.color);
            g.moveTo(radius, radius);
            var tx = radius * (1 + Math.cos(startAngle));
            var ty = radius * (1 - Math.sin(startAngle));
            g.lineTo(tx, ty);
            g.drawArc(radius, radius, radius, startAngle / 180 * Math.PI, endAngle / 180 * Math.PI);
            g.lineTo(radius, radius);
            g.endFill();
        };
        return FanShape;
    }(egret.Shape));
    cui.FanShape = FanShape;
    __reflect(FanShape.prototype, "cui.FanShape", ["cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/1/4.
 */
///<reference path="../utils/CMap.ts" />
var TRain;
(function (TRain) {
    var ActionManager = (function () {
        function ActionManager() {
            var self = this;
            self._unitTag = 10000;
            self._tarActs = new CMap();
            self._tagActs = new CMap();
        }
        ActionManager.prototype.getUnitTag = function () {
            return this._unitTag++;
        };
        //注： tag用于做清除tag相同的Action，当用完后，必须要调用rmvActionsByTag，完成 action 清理
        ActionManager.prototype.addAction = function (act, tar, paused, tag) {
            var tarActs = this._tarActs;
            var actData = tarActs.get(tar);
            if (!actData) {
                actData = { actions: [act], tar: tar, state: paused ? 1 /* PAUSE */ : 0 /* NONE */ };
                tarActs.set(tar, actData);
            }
            else if (actData.state == 2 /* RMV */) {
                actData.actions = [act];
                actData.state = paused ? 1 /* PAUSE */ : 0 /* NONE */;
            }
            else {
                var actions = actData.actions;
                if (actions.indexOf(act) < 0) {
                    actions.push(act);
                }
            }
            act.start(tar);
            if (tag) {
                var actions = this._tagActs.get(tag);
                if (!actions) {
                    actions = [];
                    this._tagActs.set(tag, actions);
                }
                actions.push(act);
            }
        };
        ActionManager.prototype.rmvAction = function (act) {
            var tar = act.getTar();
            if (tar) {
                act.stop();
                var actData = this._tarActs.get(tar);
                if (actData) {
                    var actions = actData.actions;
                    var idx = actions.indexOf(act);
                    if (idx >= 0) {
                        actions.splice(idx, 1);
                    }
                    if (actions.length == 0) {
                        actData.state = 2 /* RMV */;
                    }
                }
            }
        };
        ActionManager.prototype.rmvActsByTar = function (tar) {
            var actData = this._tarActs.get(tar);
            if (actData) {
                actData.state = 2 /* RMV */;
            }
        };
        ActionManager.prototype.rmvActsByTag = function (tag) {
            var actions = this._tagActs.get(tag);
            if (actions) {
                for (var i = 0, n = actions.length; i < n; ++i) {
                    actions[i].stop();
                }
                this._tagActs.delete(tag);
            }
        };
        ActionManager.prototype.rmvAllActs = function () {
            var actDatas = this._tarActs.values;
            for (var i = 0, n = actDatas.length; i < n; ++i) {
                actDatas[i].state = 2 /* RMV */;
            }
        };
        //----------------------------------------------
        ActionManager.prototype.pauseTar = function (tar) {
            var actData = this._tarActs.get(tar);
            if (actData && actData.state != 2 /* RMV */) {
                actData.state = 1 /* PAUSE */;
            }
        };
        ActionManager.prototype.resumeTar = function (tar) {
            var actData = this._tarActs.get(tar);
            if (actData && actData.state != 2 /* RMV */) {
                actData.state = 0 /* NONE */;
            }
        };
        ActionManager.prototype.pauseAll = function () {
            var actDatas = this._tarActs.values;
            for (var i = 0, n = actDatas.length; i < n; ++i) {
                var actData = actDatas[i];
                if (actData.state != 2 /* RMV */) {
                    actData.state = 1 /* PAUSE */;
                }
            }
        };
        ActionManager.prototype.advanceTime = function (dt) {
            var self = this;
            var tarActs = self._tarActs;
            if (tarActs.size <= 0)
                return;
            var rmvs = [];
            var actDatas = tarActs.values;
            var i = 0, n = actDatas.length;
            for (; i < n; ++i) {
                var actData = actDatas[i];
                switch (actData.state) {
                    case 0 /* NONE */:
                        self.updateAction(actData, dt);
                        break;
                    case 2 /* RMV */:
                        rmvs.push(actData.tar);
                        break;
                }
            }
            if (rmvs.length > 0) {
                for (i = 0, n = rmvs.length; i < n; ++i) {
                    tarActs.delete(rmvs[i]);
                }
            }
        };
        ActionManager.prototype.updateAction = function (actData, dt) {
            var actions = actData.actions;
            for (var i = actions.length - 1; i >= 0; --i) {
                var action = actions[i];
                if (action.getTar()) {
                    action.step(dt);
                    if (action.isDone()) {
                        action.stop();
                        actions.splice(i, 1);
                    }
                }
                else {
                    actions.splice(i, 1);
                }
            }
            if (actions.length == 0) {
                actData.state = 2 /* RMV */;
            }
        };
        return ActionManager;
    }());
    TRain.ActionManager = ActionManager;
    __reflect(ActionManager.prototype, "TRain.ActionManager");
    TRain.actionMgr = new ActionManager();
})(TRain || (TRain = {}));
var CONF;
(function (CONF) {
    CONF.resHome = "resource/";
    CONF.sheetUrl = "sheets/"; //sheet 资源目录
    CONF.fontUrl = "fonts/"; //font 资源目录
    CONF.mcUrl = "mcs/"; //mc 资源目录
    CONF.soundUrl = "sound/";
    CONF.imgUrl = "imgs/";
    CONF.mcGCTm = 10000; //mc gc 间隔时间
    CONF.verFile = "";
})(CONF || (CONF = {}));
;
/**
 * Created by wjdeng on 2016/4/6.
 */
var cui;
(function (cui) {
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false,
            ];
            self.tag = -1;
            self._invalidProps = 0;
            return _this;
            //self.fontFamily = "heiti";
        }
        Label.prototype.dispose = function () {
            this._disposed = true;
        };
        Label.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (self._invalidProps > 0) {
                self.validateProps();
            }
        };
        //-------------------------------------------------------------
        Label.prototype.$setWidth = function (value) {
            var ret = _super.prototype.$setWidth.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Label.prototype.$setHeight = function (value) {
            var ret = _super.prototype.$setHeight.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Object.defineProperty(Label.prototype, "txtKey", {
            //--------------------------------------------------------------------
            set: function (key) {
                var txt = TRain.langMgr.getTxtByKey(key);
                if (txt)
                    this.text = txt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "txtFlowKey", {
            set: function (key) {
                var txt = TRain.langMgr.getTxtByKey(key);
                if (txt)
                    this.textFlow = cui.htmlParser.parser(txt);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "filterNm", {
            get: function () {
                return this.$BC[12 /* filterNm */];
            },
            set: function (nm) {
                this.$BC[12 /* filterNm */] = nm;
                this.filters = nm && nm.length > 0 ? cui.uiMgr.getFilters(nm) : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "left", {
            //---------------------------------------------------------------------
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "perHeight", {
            get: function () {
                return this.$BC[7 /* perHeight */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[7 /* perHeight */] === value)
                    return;
                values[7 /* perHeight */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        Label.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            var parent = self.$parent;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                if (parent) {
                    parent.openLayout();
                }
            }
            if (parent) {
                parent.invalidateDL();
            }
        };
        //--------------------------------------------------
        Label.prototype.invalidateProps = function (tp) {
            var self = this;
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        Label.prototype.validateProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if (invalidateProps != 0) {
                var values = self.$BC;
                if (values[8 /* needPLayout */] && self.$parent) {
                    if (self.$TextField[13 /* text */] != "") {
                        self.$parent.invalidateDL();
                    }
                }
                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        };
        return Label;
    }(egret.TextField));
    cui.Label = Label;
    __reflect(Label.prototype, "cui.Label", ["cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/4/1.
 */
var cui;
(function (cui) {
    var Skin = (function () {
        function Skin() {
            var self = this;
            self.skinParts = [];
            self.elementsContent = [];
        }
        Object.defineProperty(Skin.prototype, "hostComponent", {
            get: function () {
                return this._host;
            },
            set: function (value) {
                var self = this;
                if (self._host == value)
                    return;
                self._host = value;
                if (value) {
                    var tmp = self.x;
                    if (tmp)
                        value.x = tmp;
                    tmp = self.y;
                    if (tmp)
                        value.y = tmp;
                    tmp = self.width;
                    if (tmp && isNaN(value.$getExplicitWidth()))
                        value.width = tmp;
                    tmp = self.height;
                    if (tmp && isNaN(value.$getExplicitHeight()))
                        value.height = tmp;
                }
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------------------------
        Skin.prototype.hasStates = function () {
            return !!this.states;
        };
        Skin.prototype.applyState = function (stateName) {
            var self = this;
            var propInfos = self.states[stateName];
            if (!propInfos)
                return;
            var host = self._host;
            for (var i = 0, n = propInfos.length; i < n; ++i) {
                var propInfo = propInfos[i];
                var ctrlName = propInfo.ctrl;
                if (ctrlName == "") {
                    host[propInfo.prop] = propInfo.val;
                }
                else {
                    self[ctrlName][propInfo.prop] = propInfo.val;
                }
            }
        };
        return Skin;
    }());
    cui.Skin = Skin;
    __reflect(Skin.prototype, "cui.Skin");
})(cui || (cui = {}));
//////////////////////////////////////////////////////////////////////////////////////
var cui;
(function (cui) {
    var ArrayCollection = (function (_super) {
        __extends(ArrayCollection, _super);
        function ArrayCollection(source) {
            var _this = _super.call(this) || this;
            _this._src = source || [];
            return _this;
        }
        Object.defineProperty(ArrayCollection.prototype, "source", {
            get: function () {
                return this._src;
            },
            set: function (value) {
                this._src = value;
                cui.CollectionEvent.dispatchCoEvent(this, "reset" /* RESET */);
            },
            enumerable: true,
            configurable: true
        });
        ArrayCollection.prototype.refresh = function () {
            cui.CollectionEvent.dispatchCoEvent(this, "refresh" /* REFRESH */);
        };
        Object.defineProperty(ArrayCollection.prototype, "length", {
            //--------------------------------------------------------------------------
            //
            // ICollection接口实现方法
            //
            //--------------------------------------------------------------------------
            get: function () {
                return this._src.length;
            },
            enumerable: true,
            configurable: true
        });
        ArrayCollection.prototype.addItem = function (item) {
            var self = this;
            var source = self._src;
            source.push(item);
            cui.CollectionEvent.dispatchCoEvent(self, "add" /* ADD */, source.length - 1, item);
        };
        ArrayCollection.prototype.addItemAt = function (item, index) {
            var self = this;
            var source = self._src;
            if (true) {
                if (index < 0 || index > source.length) {
                    egret.$error(1007);
                }
            }
            source.splice(index, 0, item);
            cui.CollectionEvent.dispatchCoEvent(self, "add" /* ADD */, index, item);
        };
        ArrayCollection.prototype.getItemAt = function (index) {
            return this._src[index];
        };
        ArrayCollection.prototype.getItemIndex = function (item) {
            return this._src.indexOf(item);
        };
        ArrayCollection.prototype.itemUpdated = function (item) {
            var self = this;
            var index = self._src.indexOf(item);
            if (index != -1) {
                cui.CollectionEvent.dispatchCoEvent(self, "update" /* UPDATE */, index, item);
            }
        };
        ArrayCollection.prototype.updateItemAt = function (idx) {
            var self = this;
            var source = self._src;
            if (idx >= 0 && idx < source.length) {
                cui.CollectionEvent.dispatchCoEvent(self, "update" /* UPDATE */, idx, source[idx]);
            }
        };
        ArrayCollection.prototype.updateItemAts = function (idxs) {
            cui.CollectionEvent.dispatchCoEvent(this, "upidxs" /* UPDATE_idxs */, 0, idxs);
        };
        ArrayCollection.prototype.removeAll = function () {
            var self = this;
            self._src.length = 0;
            cui.CollectionEvent.dispatchCoEvent(self, "removeAll" /* REMOVEALL */);
        };
        ArrayCollection.prototype.removeItem = function (item) {
            var self = this;
            var source = self._src;
            var idx = source.indexOf(item);
            source.splice(idx, 1);
            cui.CollectionEvent.dispatchCoEvent(self, "remove" /* REMOVE */, idx, item);
        };
        ArrayCollection.prototype.removeItemAt = function (index) {
            var self = this;
            var source = self._src;
            if (true) {
                if (index < 0 || index > source.length) {
                    egret.$error(1007);
                }
            }
            var item = source.splice(index, 1)[0];
            cui.CollectionEvent.dispatchCoEvent(self, "remove" /* REMOVE */, index, item);
            return item;
        };
        ArrayCollection.prototype.replaceItemAt = function (item, index) {
            var self = this;
            var source = self._src;
            if (true) {
                if (index < 0 || index > source.length) {
                    egret.$error(1007);
                }
            }
            var oldItem = source.splice(index, 1, item)[0];
            cui.CollectionEvent.dispatchCoEvent(self, "replace" /* REPLACE */, index, item, oldItem);
            return oldItem;
        };
        return ArrayCollection;
    }(egret.EventDispatcher));
    cui.ArrayCollection = ArrayCollection;
    __reflect(ArrayCollection.prototype, "cui.ArrayCollection", ["cui.ICollection", "egret.IEventDispatcher"]);
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/4/6.
 */
var TRain;
(function (TRain) {
    var Core = (function () {
        function Core() {
            var self = this;
            self._timeScale = 1;
            self._uid = 0;
            self._delayDos = [];
            self._freeDelayObjs = [];
            self._frameDos = [];
            self._nextDos = [];
        }
        Core.prototype.init = function (s) {
            var self = this;
            var context = egret.lifecycle.contexts[0];
            context.onUpdate = function () { return self.update(); };
            //失去焦点时不响应  只有显示隐藏时才响应
            window.removeEventListener("focus", context.resume, false);
            window.removeEventListener("blur", context.pause, false);
            self.stage = s;
            //s.addEventListener( egret.Event.ENTER_FRAME, self.update, self );
            s.addEventListener(egret.Event.ACTIVATE, s.invalidate, s);
            self._lastTime = egret.getTimer();
            cui.uiMgr.initState(s);
            TRain.soundMgr = new TRain.SoundManager();
        };
        //---------------------------------------------------------------
        Core.prototype.setTimeScale = function (val) {
            this._timeScale = val;
        };
        Core.prototype.addNextDo = function (doFun, target) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this._nextDos.push({ doFun: doFun, thisObj: target, args: args });
        };
        Core.prototype.addDelayDo = function (doFun, target, delay, flag, canScale) {
            var args = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                args[_i - 5] = arguments[_i];
            }
            flag = flag || 0;
            canScale = !!canScale;
            var self = this;
            var delayDos = self._delayDos;
            var id = ++self._uid;
            var obj;
            var objs = this._freeDelayObjs;
            if (objs.length > 0) {
                obj = objs.pop();
                obj.flag = flag;
                obj.doFun = doFun;
                obj.thisObj = target;
                obj.delay = delay;
                obj.canScale = canScale;
                obj.args = args;
                obj.uuid = id;
            }
            else {
                obj = { flag: flag, doFun: doFun, thisObj: target, delay: delay, canScale: canScale, args: args, uuid: id };
            }
            delayDos.unshift(obj);
            return id;
        };
        Core.prototype.freeDelayObj = function (obj) {
            var freeObjs = this._freeDelayObjs;
            if (freeObjs.length < 30) {
                obj.doFun = null;
                obj.thisObj = null;
                obj.args = null;
                freeObjs.push(obj);
            }
        };
        Core.prototype.rmvDelayDo = function (doFun, target) {
            var delayDos = this._delayDos;
            var cnt = delayDos.length;
            if (cnt <= 0)
                return;
            for (var i = cnt - 1; i >= 0; --i) {
                var delayDo = delayDos[i];
                if (delayDo.thisObj == target && delayDo.doFun == doFun) {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                    break;
                }
            }
        };
        Core.prototype.rmvAllDelayDo = function (target) {
            var delayDos = this._delayDos;
            var cnt = delayDos.length;
            if (cnt <= 0)
                return;
            for (var i = cnt - 1; i >= 0; --i) {
                var delayDo = delayDos[i];
                if (delayDo.thisObj == target) {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                }
            }
        };
        Core.prototype.rmvDelayDoByFlag = function (flag) {
            var delayDos = this._delayDos;
            var cnt = delayDos.length;
            if (cnt <= 0)
                return;
            flag = flag || 0;
            for (var i = cnt - 1; i >= 0; --i) {
                var delayDo = delayDos[i];
                if (delayDo.flag == flag) {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                }
            }
        };
        Core.prototype.rmvDelayDoByID = function (id) {
            var delayDos = this._delayDos;
            var cnt = delayDos.length;
            if (cnt <= 0)
                return;
            for (var i = cnt - 1; i >= 0; --i) {
                var delayDo = delayDos[i];
                if (delayDo.uuid == id) {
                    delayDo.thisObj = null;
                    delayDo.doFun = null;
                    break;
                }
            }
        };
        Core.prototype.adjustDelayTmByID = function (id, delay) {
            var delayDos = this._delayDos;
            var cnt = delayDos.length;
            if (cnt <= 0)
                return;
            for (var i = cnt - 1; i >= 0; --i) {
                var delayDo = delayDos[i];
                if (delayDo.uuid == id) {
                    delayDo.delay = delay;
                    break;
                }
            }
        };
        //------------------------------------ 帧回调 -----------------------------------------------
        Core.prototype.addFrameDo = function (doFun, target, canScale, interval) {
            canScale = !!canScale;
            var self = this;
            var frameDos = self._frameDos;
            var id = ++self._uid;
            var frameDo = { doFun: doFun, thisObj: target, canScale: canScale, uuid: id };
            if (interval && interval > 35) {
                frameDo.interval = interval;
                frameDo.lostTm = 0;
            }
            frameDos.push(frameDo);
            return id;
        };
        Core.prototype.rmvAllFrameDo = function () {
            this._frameDos = [];
        };
        Core.prototype.rmvFrameDoById = function (id) {
            var frameDos = this._frameDos;
            var cnt = frameDos.length;
            if (cnt <= 0)
                return;
            for (var i = cnt - 1; i >= 0; --i) {
                var frameDo = frameDos[i];
                if (frameDo.uuid == id) {
                    frameDo.doFun = null;
                    frameDo.thisObj = null;
                    break;
                }
            }
        };
        Core.prototype.rmvFrameDo = function (thisObj, doFun) {
            var frameDos = this._frameDos;
            var cnt = frameDos.length;
            if (cnt <= 0)
                return;
            var i = cnt - 1;
            var frameDo;
            if (doFun) {
                for (; i >= 0; --i) {
                    frameDo = frameDos[i];
                    if (frameDo.thisObj == thisObj && frameDo.doFun == doFun) {
                        frameDo.doFun = null;
                        frameDo.thisObj = null;
                        break;
                    }
                }
            }
            else {
                for (; i >= 0; --i) {
                    frameDo = frameDos[i];
                    if (frameDo.thisObj == thisObj) {
                        frameDo.doFun = null;
                        frameDo.thisObj = null;
                    }
                }
            }
        };
        Core.prototype.update = function () {
            var self = this;
            var tm = egret.getTimer();
            var lostTime = tm - self._lastTime;
            var passedTime = Math.floor(lostTime * self._timeScale);
            self._lastTime = tm;
            var nextDos = self._nextDos;
            var cnt = nextDos.length;
            var i;
            if (cnt > 0) {
                self._nextDos = [];
                for (i = 0; i < cnt; ++i) {
                    var nextDo = nextDos[i];
                    nextDo.doFun.apply(nextDo.thisObj, nextDo.args);
                }
            }
            var delayDos = self._delayDos;
            cnt = delayDos.length;
            if (cnt > 0) {
                for (i = cnt - 1; i >= 0; --i) {
                    var delayDo = delayDos[i];
                    if (delayDo.doFun) {
                        delayDo.delay -= delayDo.canScale ? passedTime : lostTime;
                        if (delayDo.delay <= 0) {
                            delayDos.splice(i, 1);
                            delayDo.doFun.apply(delayDo.thisObj, delayDo.args);
                            self.freeDelayObj(delayDo);
                        }
                    }
                    else {
                        delayDos.splice(i, 1);
                        self.freeDelayObj(delayDo);
                    }
                }
            }
            var frameDos = self._frameDos;
            cnt = frameDos.length;
            if (cnt > 0) {
                for (i = cnt - 1; i >= 0; --i) {
                    var frameDo = frameDos[i];
                    if (frameDo.doFun) {
                        var tmpTime = frameDo.canScale ? passedTime : lostTime;
                        var interval = frameDo.interval;
                        if (interval) {
                            var lostTm = frameDo.lostTm + tmpTime;
                            frameDo.lostTm = lostTm;
                            if (lostTm >= interval) {
                                frameDo.lostTm = lostTm % interval;
                                frameDo.doFun.call(frameDo.thisObj, lostTm);
                            }
                        }
                        else {
                            frameDo.doFun.call(frameDo.thisObj, tmpTime);
                        }
                    }
                    else {
                        frameDos.splice(i, 1);
                    }
                }
            }
        };
        return Core;
    }());
    TRain.Core = Core;
    __reflect(Core.prototype, "TRain.Core");
    TRain.core = new Core();
})(TRain || (TRain = {}));
/**
 * Created by CV-PC359 on 2016/6/22.
 */
var cui;
(function (cui) {
    // export class ItemTapEvent extends egret.Event
    // {
    //     public item:any = null;
    //     public itemRenderer:IItemRenderer = null;
    //     public itemIndex:number = -1;
    //     protected clean():void
    //     {
    //         super.clean();
    //         this.item = this.itemRenderer = null;
    //     }
    //     public static dispatchItemTapEvent(target:egret.IEventDispatcher, itemRenderer?:IItemRenderer):boolean
    //     {
    //         if (!target.hasEventListener(UI_EVENT.ITEM_TAP))
    //         {
    //             return true;
    //         }
    //         let event = egret.Event.create(ItemTapEvent, UI_EVENT.ITEM_TAP);
    //         event.item = itemRenderer.data;
    //         event.itemIndex = itemRenderer.itemIndex;
    //         event.itemRenderer = itemRenderer;
    //         let result = target.dispatchEvent(event);
    //         egret.Event.release(event);
    //         return result;
    //     }
    // }
    var CollectionEvent = (function (_super) {
        __extends(CollectionEvent, _super);
        function CollectionEvent(type, bubbles, cancelable) {
            return _super.call(this, type, bubbles, cancelable) || this;
        }
        CollectionEvent.prototype.clean = function () {
            _super.prototype.clean.call(this);
            this.item = this.oldItem = null;
        };
        CollectionEvent.prototype.initTo = function (kind, location, item, oldItem) {
            this.kind = kind;
            this.location = +location | 0;
            this.item = item;
            this.oldItem = oldItem;
        };
        CollectionEvent.dispatchCoEvent = function (target, kind, location, item, oldItem) {
            if (!target.hasEventListener("collect_ch" /* COLLECT_CHANGE */)) {
                return true;
            }
            var event = egret.Event.create(CollectionEvent, "collect_ch" /* COLLECT_CHANGE */);
            event.initTo(kind, location, item, oldItem);
            var result = target.dispatchEvent(event);
            egret.Event.release(event);
            return result;
        };
        return CollectionEvent;
    }(egret.Event));
    cui.CollectionEvent = CollectionEvent;
    __reflect(CollectionEvent.prototype, "cui.CollectionEvent");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/4/6.
 */
var cui;
(function (cui) {
    var DepthQueue = (function () {
        function DepthQueue() {
            this._queues = [];
        }
        DepthQueue.prototype.insert = function (dItem) {
            var self = this;
            var itemDepth = dItem.nestLevel;
            var queues = self._queues;
            var findItem;
            var idx = 0;
            for (var len = queues.length; idx < len; ++idx) {
                var tmp = queues[idx]; //tmp 必须要有元素
                var tmpDepth = tmp.depth;
                if (tmpDepth == itemDepth) {
                    findItem = tmp;
                    break;
                }
                else if (tmpDepth > itemDepth) {
                    break;
                }
            }
            if (!findItem) {
                findItem = { items: [], depth: itemDepth };
                queues.splice(idx, 0, findItem);
            }
            findItem.items.push(dItem);
        };
        DepthQueue.prototype.forEachItemDo = function (itemFun) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var queues = this._queues;
            for (var i = queues.length - 1; i >= 0; --i) {
                var items = queues[i].items;
                for (var j = 0, cnt = items.length; j < cnt; ++j) {
                    var item = items[j];
                    item[itemFun].apply(item, args);
                }
            }
        };
        DepthQueue.prototype.hasItem = function () {
            return this._queues.length > 0;
        };
        return DepthQueue;
    }());
    __reflect(DepthQueue.prototype, "DepthQueue");
    var UIManager = (function () {
        function UIManager() {
            var self = this;
            self._filters = {};
            self._invalidDL = new DepthQueue();
            self._invalidProps = [];
        }
        UIManager.prototype.initState = function (stage) {
            var self = this;
            stage.addEventListener(egret.Event.ENTER_FRAME, self.update, self);
            stage.addEventListener(egret.Event.RENDER, self.update, self);
        };
        //---------------------------------------------
        UIManager.prototype.invalidateDL = function (container) {
            this._invalidDL.insert(container);
        };
        UIManager.prototype.invalidateProperty = function (container) {
            this._invalidProps.push(container);
        };
        //----------------------------------------------
        UIManager.prototype.createFilters = function (conf) {
            var filterList = this._filters;
            for (var key in conf) {
                var filterConfs = conf[key];
                var filters = [];
                filterList[key] = filters;
                for (var i = 0, len = filterConfs.length; i < len; ++i) {
                    var filterConf = filterConfs[i];
                    var filter = null;
                    switch (filterConf.tp) {
                        case 1 /* GlowFilter */:
                            filter = new egret.GlowFilter(filterConf.c, filterConf.a, filterConf.bx, filterConf.by, filterConf.s, filterConf.q, filterConf.i, filterConf.k);
                            break;
                        case 2 /* ColorMatrixFilter */:
                            filter = new egret.ColorMatrixFilter(filterConf.m);
                            break;
                        case 3 /* DropShadowFilter */:
                            filter = new egret.DropShadowFilter(filterConf.d, filterConf.an, filterConf.c, filterConf.a, filterConf.bx, filterConf.by, filterConf.s, filterConf.q, filterConf.i, filterConf.k);
                            break;
                    }
                    if (filter)
                        filters.push(filter);
                }
            }
        };
        UIManager.prototype.getFilters = function (nm) {
            return this._filters[nm];
        };
        //----------------------------------------------
        UIManager.prototype.update = function (dt) {
            var self = this;
            var invalidProperties = self._invalidProps;
            var len = invalidProperties.length;
            if (len > 0) {
                self._invalidProps = new Array(); //防止 处理过程中有新的对象加入  新对象下次处理
                for (var i = 0; i < len; ++i) {
                    invalidProperties[i].validateProps();
                }
            }
            var invalidDisplaylist = self._invalidDL;
            if (invalidDisplaylist.hasItem()) {
                self._invalidDL = new DepthQueue(); //防止 处理过程中有新的对象加入  新对象下次处理
                invalidDisplaylist.forEachItemDo("validateDL");
            }
        };
        return UIManager;
    }());
    cui.UIManager = UIManager;
    __reflect(UIManager.prototype, "cui.UIManager");
    cui.uiMgr = new cui.UIManager();
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/10/8.
 */
var cui;
(function (cui) {
    //此控件会阻碍事件
    var MenuGroup = (function (_super) {
        __extends(MenuGroup, _super);
        function MenuGroup() {
            var _this = _super.call(this) || this;
            _this.keepSelect = false;
            _this.activeCheckEnable = true;
            var self = _this;
            self._items = [];
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            return _this;
        }
        MenuGroup.prototype.dispose = function () {
            var self = this;
            self.onTouchFinish();
            self._cb = null;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(MenuGroup.prototype, "selectItem", {
            get: function () {
                return this._selection;
            },
            set: function (item) {
                var self = this;
                if (self.keepSelect && self._selection != item) {
                    self.setSelectItem(item);
                    if (item) {
                        self.activate(item);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuGroup.prototype, "selectTag", {
            get: function () {
                var self = this;
                return self._selection ? self._selection.tag : -1;
            },
            set: function (tag) {
                var self = this;
                if (self.keepSelect && (!self._selection || self._selection.tag !== tag)) {
                    var item = self.getChildByTag(tag);
                    if (item) {
                        self.setSelectItem(item);
                        self.activate(item);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        MenuGroup.prototype.setSelectItem = function (item) {
            var self = this;
            if (self._selection) {
                self._selection.selected = false;
            }
            self._selection = item;
            if (self._selection) {
                self._selection.selected = true;
            }
        };
        Object.defineProperty(MenuGroup.prototype, "numItems", {
            get: function () {
                return this._items.length;
            },
            enumerable: true,
            configurable: true
        });
        MenuGroup.prototype.getMenuItemAt = function (index) {
            var self = this;
            if (index >= 0 && index < self.numItems)
                return self._items[index];
            return null;
        };
        MenuGroup.prototype.getChildByTag = function (tag) {
            var self = this;
            var item;
            var items = self._items;
            for (var i = 0, n = items.length; i < n; ++i) {
                item = items[i];
                if (item.tag === tag) {
                    return item;
                }
            }
            return null;
        };
        MenuGroup.prototype.getItemIndex = function (item) {
            return this._items.indexOf(item);
        };
        MenuGroup.prototype.setTarget = function (fun, tar) {
            this._cb = { fun: fun, tar: tar };
        };
        MenuGroup.prototype.activate = function (item) {
            var cbData = this._cb;
            if (cbData) {
                cbData.fun.call(cbData.tar, item);
            }
        };
        //---------------------------------------------------------------------
        MenuGroup.prototype.$childAdded = function (child, index) {
            _super.prototype.$childAdded.call(this, child, index);
            var self = this;
            if (child instanceof MenuItem) {
                self._items.push(child);
            }
        };
        MenuGroup.prototype.$childRemoved = function (child, index) {
            _super.prototype.$childRemoved.call(this, child, index);
            var self = this;
            if (child instanceof MenuItem) {
                var item = child;
                if (item == self._selection) {
                    self._selection = null;
                }
                var items = self._items;
                items.splice(items.indexOf(child), 1);
            }
        };
        MenuGroup.prototype.$hitTest = function (stageX, stageY) {
            var self = this;
            if (!self.touchEnabled || !self.visible)
                return null;
            var point = self.globalToLocal(stageX, stageY, egret.$TempPoint);
            var bounds = egret.$TempRectangle.setTo(0, 0, self.width, self.height);
            var scrollRect = self.$scrollRect;
            if (scrollRect) {
                bounds.x = scrollRect.x;
                bounds.y = scrollRect.y;
            }
            if (!bounds.contains(point.x, point.y))
                return null;
            //子控件 不处理事件
            return self;
        };
        MenuGroup.prototype.onTouchBegin = function (event) {
            var self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
            var stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            self._tempStage = stage;
            self._highLightItem = self._itemForTouch(event.localX, event.localY);
            if (self._highLightItem) {
                self._highLightItem.selected = true;
                event.updateAfterEvent();
            }
        };
        MenuGroup.prototype.onTouchMove = function (event) {
            var self = this;
            var point = self.globalToLocal(event.stageX, event.stageY, egret.$TempPoint);
            var currentItem = self._itemForTouch(point.x, point.y);
            if (self._highLightItem != currentItem) {
                if (self._highLightItem) {
                    if (!self.keepSelect || self._highLightItem != self._selection) {
                        self._highLightItem.selected = false;
                    }
                }
                self._highLightItem = currentItem;
                if (self._highLightItem) {
                    self._highLightItem.selected = true;
                }
                event.updateAfterEvent();
            }
            event.stopPropagation();
        };
        MenuGroup.prototype.onTouchEnd = function (event) {
            var self = this;
            self.onTouchFinish();
            var item = self._highLightItem;
            if (item) {
                self._highLightItem = null;
                if (self.keepSelect) {
                    if (item != self._selection) {
                        self.setSelectItem(item);
                    }
                }
                else {
                    item.selected = false;
                }
                item.onItemTap();
                self.activate(item);
                event.preventDefault();
            }
        };
        MenuGroup.prototype.onTouchFinish = function () {
            var self = this;
            var stage = self._tempStage;
            if (stage) {
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
                self._tempStage = null;
            }
        };
        MenuGroup.prototype._itemForTouch = function (localX, localY) {
            var items = this._items;
            if (items.length > 0) {
                //按显示顺序从上层到下层遍历
                var i = items.length - 1;
                var item = void 0;
                if (this.activeCheckEnable) {
                    for (; i >= 0; --i) {
                        item = items[i];
                        if (item.visible && item.enabled) {
                            if (item.ptInRange(localX, localY))
                                return item;
                        }
                    }
                }
                else {
                    for (; i >= 0; --i) {
                        item = items[i];
                        if (item.visible) {
                            if (item.ptInRange(localX, localY))
                                return item;
                        }
                    }
                }
            }
            return null;
        };
        return MenuGroup;
    }(cui.Group));
    cui.MenuGroup = MenuGroup;
    __reflect(MenuGroup.prototype, "cui.MenuGroup");
    var MenuItem = (function (_super) {
        __extends(MenuItem, _super);
        function MenuItem() {
            var _this = _super.call(this) || this;
            var self = _this;
            self._isSel = false;
            self._enabled = true;
            self.touchEnabled = false;
            return _this;
        }
        Object.defineProperty(MenuItem.prototype, "selected", {
            get: function () {
                return this._isSel;
            },
            set: function (val) {
                this._isSel = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuItem.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (value) {
                this._sound = value;
            },
            enumerable: true,
            configurable: true
        });
        MenuItem.prototype.onItemTap = function () {
            var self = this;
            if (self.enabled) {
                TRain.soundMgr.playSFX(self._sound);
            }
        };
        MenuItem.prototype.ptInRange = function (localX, localY) {
            var self = this;
            var x = self.x - self.anchorOffsetX;
            var y = self.y - self.anchorOffsetY;
            return localX > x && localX < (x + self.width) && localY > y && localY < (y + self.height);
        };
        return MenuItem;
    }(cui.Component));
    cui.MenuItem = MenuItem;
    __reflect(MenuItem.prototype, "cui.MenuItem");
    var MenuItemImage = (function (_super) {
        __extends(MenuItemImage, _super);
        function MenuItemImage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MenuItemImage.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (value) {
                var self = this;
                self._label = value;
                var skLabel = self.skLabel;
                if (skLabel)
                    skLabel.text = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuItemImage.prototype, "txtKey", {
            get: function () {
                return this._txtKey;
            },
            set: function (value) {
                var self = this;
                self._txtKey = value;
                var skLabel = self.skLabel;
                if (skLabel)
                    skLabel.txtKey = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuItemImage.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (value) {
                var self = this;
                self._icon = value;
                var skIcon = self.skIcon;
                if (skIcon)
                    skIcon.source = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MenuItemImage.prototype, "selected", {
            get: function () {
                return this._isSel;
            },
            set: function (val) {
                var self = this;
                if (self._isSel == val)
                    return;
                self._isSel = val;
                self.invalidateProps(4 /* state */);
            },
            enumerable: true,
            configurable: true
        });
        MenuItemImage.prototype.getState = function () {
            var self = this;
            if (!self.enabled)
                return "disabled";
            if (self._isSel)
                return "down";
            return "up";
        };
        MenuItemImage.prototype.onPartAdded = function () {
            var self = this;
            var skIcon = self.skIcon;
            var icon = self._icon;
            if (icon && skIcon)
                skIcon.source = icon;
            var skLabel = self.skLabel;
            if (skLabel) {
                var label = self._label;
                if (label) {
                    skLabel.text = label;
                }
                else {
                    var txtKey = self._txtKey;
                    if (txtKey)
                        skLabel.txtKey = txtKey;
                }
            }
        };
        return MenuItemImage;
    }(MenuItem));
    cui.MenuItemImage = MenuItemImage;
    __reflect(MenuItemImage.prototype, "cui.MenuItemImage");
})(cui || (cui = {}));
var cui;
(function (cui) {
    var ProgressBar = (function (_super) {
        __extends(ProgressBar, _super);
        function ProgressBar() {
            var _this = _super.call(this) || this;
            var self = _this;
            self._dir = "ltr" /* LTR */;
            self._ani = new cui.Animation(self.aniUpdateHandler, self);
            self._aniVal = 0;
            return _this;
        }
        ProgressBar.prototype.dispose = function () {
            this._valToLabel = null;
            _super.prototype.dispose.call(this);
        };
        ProgressBar.prototype.childrenCreated = function () {
            this._inited = true;
            this.update();
        };
        Object.defineProperty(ProgressBar.prototype, "labelFunction", {
            //---------------------------------------------
            set: function (fun) {
                this._valToLabel = fun;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgressBar.prototype, "direction", {
            get: function () {
                return this._dir;
            },
            set: function (value) {
                var self = this;
                if (self._dir == value)
                    return;
                self._dir = value;
                if (self._inited) {
                    self.update();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgressBar.prototype, "thumb", {
            get: function () {
                return this._thumb;
            },
            //必须先调整好 位置
            set: function (val) {
                var self = this;
                self._thumb = val;
                if (val) {
                    self._thumbPos = { x: val.x, y: val.y };
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProgressBar.prototype, "value", {
            get: function () {
                return this._val || 0;
            },
            set: function (val) {
                if (val < 0)
                    val = 0;
                else if (val > 1)
                    val = 1;
                var self = this;
                if (self._ani.isPlaying)
                    self._ani.stop();
                self.setCurValue(val);
            },
            enumerable: true,
            configurable: true
        });
        ProgressBar.prototype.setProgressValue = function (val, dur) {
            if (val < 0)
                val = 0;
            else if (val > 1)
                val = 1;
            var self = this;
            if (self.openAni && dur > 0) {
                self.startAni(val, dur);
            }
            else {
                if (self._ani.isPlaying)
                    self._ani.stop();
                self.setCurValue(val);
            }
        };
        ProgressBar.prototype.startAni = function (toValue, dur) {
            var self = this;
            var ani = self._ani;
            ani.stop();
            ani.duration = dur;
            ani.from = self.value;
            ani.to = toValue;
            ani.play();
        };
        //--------------------------------------- ani ----------------------------------
        ProgressBar.prototype.aniUpdateHandler = function (ani) {
            this.setCurValue(ani.currentValue);
        };
        //----------------------------------------------------------------
        ProgressBar.prototype.setCurValue = function (val) {
            var self = this;
            if (self._val == val)
                return;
            self._val = val;
            self.update();
        };
        ProgressBar.prototype.update = function () {
            var self = this;
            var val = self.value;
            var thumb = self._thumb;
            if (thumb) {
                var thumbWidth = thumb.width;
                var thumbHeight = thumb.height;
                var clipWidth = Math.round(val * thumbWidth);
                if (clipWidth < 0 || clipWidth === Infinity)
                    clipWidth = 0;
                var clipHeight = Math.round(val * thumbHeight);
                if (clipHeight < 0 || clipHeight === Infinity)
                    clipHeight = 0;
                var rect = thumb.$scrollRect;
                if (!rect) {
                    rect = egret.$TempRectangle;
                }
                rect.setTo(0, 0, thumbWidth, thumbHeight);
                switch (self._dir) {
                    case "ltr" /* LTR */:
                        rect.width = clipWidth;
                        break;
                    case "rtl" /* RTL */:
                        rect.width = clipWidth;
                        rect.x = thumbWidth - clipWidth;
                        thumb.x = self._thumbPos.x + rect.x;
                        break;
                    case "ttb" /* TTB */:
                        rect.height = clipHeight;
                        break;
                    case "btt" /* BTT */:
                        rect.height = clipHeight;
                        rect.y = thumbHeight - clipHeight;
                        thumb.y = self._thumbPos.y + rect.y;
                        break;
                }
                thumb.scrollRect = rect;
            }
            self.updateLabel(val);
        };
        ProgressBar.prototype.updateLabel = function (val) {
            var self = this;
            var txt = String(val);
            if (self._valToLabel)
                txt = self._valToLabel(val);
            var skLabel = self.skLabel;
            if (skLabel)
                skLabel.text = txt;
        };
        return ProgressBar;
    }(cui.Component));
    cui.ProgressBar = ProgressBar;
    __reflect(ProgressBar.prototype, "cui.ProgressBar");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/1/5.
 */
var TRain;
(function (TRain) {
    var ActionDo = (function (_super) {
        __extends(ActionDo, _super);
        function ActionDo() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //-------------------------------------------------------
        ActionDo.prototype.update = function (tm) {
            if (tm >= 1) {
                this.do();
            }
        };
        ActionDo.prototype.do = function () {
        };
        return ActionDo;
    }(TRain.Action));
    TRain.ActionDo = ActionDo;
    __reflect(ActionDo.prototype, "TRain.ActionDo");
    var ActionPropDo = (function (_super) {
        __extends(ActionPropDo, _super);
        function ActionPropDo(dur, props) {
            var _this = _super.call(this, dur) || this;
            _this._props = props;
            return _this;
        }
        ActionPropDo.prototype.setProps = function (props) {
            this._props = props;
        };
        ActionPropDo.prototype.addProp = function (name, val) {
            var props = this._props;
            if (!props) {
                props = {};
                this._props = props;
            }
            props[name] = val;
        };
        ActionPropDo.prototype.do = function () {
            var tar = this._tar;
            var props = this._props;
            //if( tar && props )
            //{
            for (var name_2 in props) {
                tar[name_2] = props[name_2];
            }
            //}
        };
        return ActionPropDo;
    }(ActionDo));
    TRain.ActionPropDo = ActionPropDo;
    __reflect(ActionPropDo.prototype, "TRain.ActionPropDo");
    var ActionCallDo = (function (_super) {
        __extends(ActionCallDo, _super);
        function ActionCallDo() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.once = true; //只执行一次
            return _this;
        }
        ActionCallDo.prototype.setCall = function (fun, tar) {
            this._cb = { fun: fun, tar: tar };
        };
        ActionCallDo.prototype.clear = function () {
            var self = this;
            self._tar = null;
            self._cb = null;
        };
        ActionCallDo.prototype.stop = function () {
            var self = this;
            self._tar = null;
            if (self.once) {
                self._cb = null;
            }
        };
        ActionCallDo.prototype.stopToEnd = function () {
            var self = this;
            if (self._tar) {
                self.do();
                self._tar = null;
            }
        };
        ActionCallDo.prototype.do = function () {
            var self = this;
            var cbData = self._cb;
            if (cbData) {
                cbData.fun.call(cbData.tar, self._tar);
                if (self.once) {
                    self._cb = null;
                }
            }
        };
        return ActionCallDo;
    }(ActionDo));
    TRain.ActionCallDo = ActionCallDo;
    __reflect(ActionCallDo.prototype, "TRain.ActionCallDo");
})(TRain || (TRain = {}));
/**
 * Created by wjdeng on 2016/1/22.
 */
var cui;
(function (cui) {
    var Scroller = (function (_super) {
        __extends(Scroller, _super);
        function Scroller() {
            var _this = _super.call(this) || this;
            _this._bounces = true;
            var self = _this;
            self.$Scroller = [
                "auto",
                "auto",
                false,
                false,
                { x: 0, y: 0 },
                false,
                null,
                null,
                1.0,
                null,
                null
            ];
            self._bounces = true;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            return _this;
        }
        Scroller.prototype.dispose = function () {
            var self = this;
            self.clearEvent();
            var values = self.$Scroller;
            values[9 /* viewport */] = null;
            var touchScroll = values[6 /* touchScrollH */];
            if (touchScroll) {
                touchScroll.dispose();
                values[6 /* touchScrollH */] = null;
            }
            touchScroll = values[7 /* touchScrollV */];
            if (touchScroll) {
                touchScroll.dispose();
                values[7 /* touchScrollV */] = null;
            }
            var ani = self._hAnimation;
            if (ani) {
                ani.stop();
                ani.updateFunction = null;
            }
            ani = self._vAnimation;
            if (ani) {
                ani.stop();
                ani.updateFunction = null;
            }
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(Scroller.prototype, "bounces", {
            get: function () {
                return this._bounces;
            },
            set: function (value) {
                var self = this;
                this._bounces = value;
                var touchScrollH = self.$Scroller[6 /* touchScrollH */];
                if (touchScrollH) {
                    touchScrollH.$bounces = value;
                }
                var touchScrollV = self.$Scroller[7 /* touchScrollV */];
                if (touchScrollV) {
                    touchScrollV.$bounces = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scroller.prototype, "scrollPolicyV", {
            get: function () {
                return this.$Scroller[0 /* scrollPolicyV */];
            },
            set: function (value) {
                var self = this;
                var values = self.$Scroller;
                if (values[0 /* scrollPolicyV */] == value) {
                    return;
                }
                values[0 /* scrollPolicyV */] = value;
                self.checkScrollPolicy();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scroller.prototype, "scrollPolicyH", {
            get: function () {
                return this.$Scroller[1 /* scrollPolicyH */];
            },
            set: function (value) {
                var self = this;
                var values = self.$Scroller;
                if (values[1 /* scrollPolicyH */] == value) {
                    return;
                }
                values[1 /* scrollPolicyH */] = value;
                self.checkScrollPolicy();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scroller.prototype, "throwSpeed", {
            get: function () {
                var touchScroll = this.$Scroller[6 /* touchScrollH */];
                if (touchScroll) {
                    return touchScroll.$scrollFactor;
                }
                return 0;
            },
            set: function (val) {
                val = +val;
                val = val < 0.01 ? 0.01 : val;
                var self = this;
                this.$Scroller[8 /* throwSpeed */] = val;
                var touchScroll = self.$Scroller[6 /* touchScrollH */];
                if (touchScroll) {
                    touchScroll.$scrollFactor = val;
                }
                touchScroll = self.$Scroller[7 /* touchScrollV */];
                if (touchScroll) {
                    touchScroll.$scrollFactor = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        //---------------------------------------------------
        Scroller.prototype.setScrollTop = function (scrollTop, duration) {
            var values = this.$Scroller;
            if (!values[9 /* viewport */])
                return;
            var scrollTo = values[10 /* scrollTo */];
            if (!scrollTo) {
                scrollTo = {};
                values[10 /* scrollTo */] = scrollTo;
            }
            scrollTo.top = { v: scrollTop, d: duration };
            this.invalidateDL();
        };
        Scroller.prototype.setScrollLeft = function (scrollLeft, duration) {
            var values = this.$Scroller;
            if (!values[9 /* viewport */])
                return;
            var scrollTo = values[10 /* scrollTo */];
            if (!scrollTo) {
                scrollTo = {};
                values[10 /* scrollTo */] = scrollTo;
            }
            scrollTo.left = { v: scrollLeft, d: duration };
            this.invalidateDL();
        };
        Scroller.prototype.doScrollTo = function () {
            var self = this;
            var values = self.$Scroller;
            var scrollTo = values[10 /* scrollTo */];
            if (!scrollTo)
                return;
            values[10 /* scrollTo */] = null;
            if (!self.checkScrollPolicy())
                return;
            var viewport = values[9 /* viewport */];
            if (!viewport)
                return;
            var topInfo = scrollTo.top;
            if (topInfo) {
                if (values[3 /* vCanScroll */] && viewport.contentHeight > viewport.height) {
                    var scrollTop = topInfo.v;
                    var maxPos = viewport.contentHeight - viewport.height;
                    if (scrollTop > maxPos)
                        scrollTop = maxPos;
                    if (viewport.scrollV != scrollTop) {
                        var touchScroll = self.getTouchScrollV();
                        if (touchScroll.isStarted())
                            return;
                        var animation = self._vAnimation;
                        if (!animation) {
                            var updateFun = function (ani) {
                                self.verticalUpdateHandler(ani.currentValue);
                            };
                            animation = new cui.Animation(updateFun, self);
                            self._vAnimation = animation;
                        }
                        animation.stop();
                        var duration = topInfo.d || 0;
                        if (duration > 0) {
                            animation.duration = duration;
                            animation.from = viewport.scrollV;
                            animation.to = scrollTop;
                            animation.play();
                        }
                        else {
                            viewport.scrollV = scrollTop;
                        }
                    }
                }
            }
            var leftInfo = scrollTo.left;
            if (leftInfo) {
                if (values[2 /* hCanScroll */] && viewport.contentWidth > viewport.width) {
                    var scrollLeft = leftInfo.v;
                    var maxPos = viewport.contentWidth - viewport.width;
                    if (scrollLeft > maxPos)
                        scrollLeft = maxPos;
                    if (viewport.scrollH != scrollLeft) {
                        var touchScroll = self.getTouchScrollH();
                        if (touchScroll.isStarted())
                            return;
                        var animation = self._hAnimation;
                        if (!animation) {
                            var updateFun = function (ani) {
                                self.horizontalUpdateHandler(ani.currentValue);
                            };
                            animation = new cui.Animation(updateFun, self);
                            self._hAnimation = animation;
                        }
                        animation.stop();
                        var duration = leftInfo.d || 0;
                        if (duration > 0) {
                            animation.duration = duration;
                            animation.from = viewport.scrollH;
                            animation.to = scrollLeft;
                            animation.play();
                        }
                        else {
                            viewport.scrollH = scrollLeft;
                        }
                    }
                }
            }
        };
        Scroller.prototype.getTouchScrollV = function () {
            var values = this.$Scroller;
            var touchScroll = values[7 /* touchScrollV */];
            if (!touchScroll) {
                var self_1 = this;
                touchScroll = new cui.TouchScroll(self_1.verticalUpdateHandler, self_1.verticalEndHanlder, self_1);
                touchScroll.stop();
                values[7 /* touchScrollV */] = touchScroll;
                touchScroll.$scrollFactor = values[8 /* throwSpeed */];
            }
            return touchScroll;
        };
        Scroller.prototype.getTouchScrollH = function () {
            var values = this.$Scroller;
            var touchScroll = values[6 /* touchScrollH */];
            if (!touchScroll) {
                var self_2 = this;
                touchScroll = new cui.TouchScroll(self_2.horizontalUpdateHandler, self_2.horizontalEndHandler, self_2);
                touchScroll.stop();
                values[6 /* touchScrollH */] = touchScroll;
                touchScroll.$scrollFactor = values[8 /* throwSpeed */];
            }
            return touchScroll;
        };
        Object.defineProperty(Scroller.prototype, "viewport", {
            //----------------------------------------------------
            get: function () {
                return this.$Scroller[9 /* viewport */];
            },
            set: function (value) {
                var self = this;
                var values = self.$Scroller;
                if (value == values[9 /* viewport */])
                    return;
                var viewport = values[9 /* viewport */];
                if (viewport) {
                    self.uninstallViewport();
                }
                if (value) {
                    self.installViewport(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Scroller.prototype.installViewport = function (viewport) {
            var self = this;
            viewport.scrollEnabled = true;
            self.$Scroller[9 /* viewport */] = viewport;
            self.addChild(viewport);
            viewport.addEventListener("view_clear" /* VIEW_CLEAR */, self.onViewClear, self);
        };
        Scroller.prototype.uninstallViewport = function () {
            var self = this;
            var values = self.$Scroller;
            var touchScroll = values[6 /* touchScrollH */];
            if (touchScroll) {
                touchScroll.stop();
            }
            touchScroll = values[7 /* touchScrollV */];
            if (touchScroll) {
                touchScroll.stop();
            }
            var viewport = values[9 /* viewport */];
            viewport.scrollEnabled = false;
            values[9 /* viewport */] = null;
            self.removeChild(viewport);
        };
        Scroller.prototype.onViewClear = function () {
            var self = this;
            var values = self.$Scroller;
            var touchScroll = values[6 /* touchScrollH */];
            if (touchScroll)
                touchScroll.stop();
            touchScroll = values[7 /* touchScrollV */];
            if (touchScroll)
                touchScroll.stop();
            var ani = self._hAnimation;
            if (ani)
                ani.stop();
            ani = self._vAnimation;
            if (ani)
                ani.stop();
        };
        //-------------------------------------------------------------------
        Scroller.prototype.validateDL = function () {
            this.doScrollTo();
            _super.prototype.validateDL.call(this);
        };
        //------------------------------------------------------------------
        Scroller.prototype.checkScrollPolicy = function () {
            var values = this.$Scroller;
            var viewport = values[9 /* viewport */];
            if (!viewport)
                return false;
            var hCanScroll = false;
            switch (values[1 /* scrollPolicyH */]) {
                case "auto":
                    hCanScroll = viewport.contentWidth > viewport.width;
                    break;
                case "on":
                    hCanScroll = true;
                    break;
            }
            values[2 /* hCanScroll */] = hCanScroll;
            var vCanScroll = false;
            switch (values[0 /* scrollPolicyV */]) {
                case "auto":
                    vCanScroll = viewport.contentHeight > viewport.height;
                    break;
                case "on":
                    vCanScroll = true;
                    break;
            }
            values[3 /* vCanScroll */] = vCanScroll;
            return hCanScroll || vCanScroll;
        };
        Scroller.prototype.onTouchBegin = function (event) {
            var self = this;
            if (!self.checkScrollPolicy()) {
                return;
            }
            var values = self.$Scroller;
            var touchScroll = values[6 /* touchScrollH */];
            if (touchScroll) {
                touchScroll.stop();
            }
            touchScroll = values[7 /* touchScrollV */];
            if (touchScroll) {
                touchScroll.stop();
            }
            var stageX = event.$stageX;
            var stageY = event.$stageY;
            var statPos = self.$Scroller[4 /* touchStartPosition */];
            statPos.x = stageX;
            statPos.y = stageY;
            var stage = self.$stage;
            self._tempStage = stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true); //优先监听
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
        };
        Scroller.prototype.onTouchMove = function (event) {
            event.stopImmediatePropagation();
            var self = this;
            var stageX = event.$stageX;
            var stageY = event.$stageY;
            var values = self.$Scroller;
            if (!values[5 /* touchMoved */]) {
                var startPos = values[4 /* touchStartPosition */];
                if (Math.abs(startPos.x - stageX) < Scroller.scrollThreshold &&
                    Math.abs(startPos.y - stageY) < Scroller.scrollThreshold) {
                    return;
                }
                values[5 /* touchMoved */] = true;
                self.moveStart(startPos.x, startPos.y);
            }
            //if (values[ScrollKeys.delayTouchEvent])
            //{
            //    values[ScrollKeys.delayTouchEvent] = null;
            //    values[ScrollKeys.delayTouchTimer].stop();
            //}
            self.moveUpdate(stageX, stageY);
        };
        Scroller.prototype.onTouchCaptureEnd = function (event) {
            var self = this;
            if (event.isDefaultPrevented()) {
                self.onTouchFinish(event);
                return;
            }
            var touchMoved = self.$Scroller[5 /* touchMoved */];
            if (touchMoved) {
                event.preventDefault();
                self.onTouchFinish(event);
            }
        };
        Scroller.prototype.onTouchFinish = function (event) {
            var self = this;
            self.clearEvent();
            var values = self.$Scroller;
            if (values[5 /* touchMoved */]) {
                self.moveEnd(event.stageX, event.stageY);
                values[5 /* touchMoved */] = false;
            }
        };
        Scroller.prototype.clearEvent = function () {
            var self = this;
            var stage = self._tempStage;
            if (stage) {
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true); //优先监听
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                self._tempStage = null;
            }
        };
        //--------------------------------------------------------------
        Scroller.prototype.moveStart = function (stageX, stageY) {
            var self = this;
            var ani = self._hAnimation;
            if (ani)
                ani.stop();
            ani = self._vAnimation;
            if (ani)
                ani.stop();
            var values = self.$Scroller;
            var viewport = values[9 /* viewport */];
            var uiValues = viewport.$UIComponent;
            var touchScroll;
            if (values[2 /* hCanScroll */]) {
                touchScroll = self.getTouchScrollH();
                touchScroll.stop();
                touchScroll.start(stageX);
            }
            if (values[3 /* vCanScroll */]) {
                touchScroll = self.getTouchScrollV();
                touchScroll.stop();
                touchScroll.start(stageY);
            }
        };
        Scroller.prototype.moveUpdate = function (stageX, stageY) {
            var self = this;
            var values = self.$Scroller;
            var viewport = values[9 /* viewport */];
            var touchScroll;
            if (values[2 /* hCanScroll */]) {
                touchScroll = self.getTouchScrollH();
                if (touchScroll.isStarted()) {
                    touchScroll.update(stageX, viewport.contentWidth - viewport.width, viewport.scrollH);
                }
            }
            if (values[3 /* vCanScroll */]) {
                touchScroll = self.getTouchScrollV();
                if (touchScroll.isStarted()) {
                    touchScroll.update(stageY, viewport.contentHeight - viewport.height, viewport.scrollV);
                }
            }
        };
        Scroller.prototype.moveEnd = function (stageX, stageY) {
            var self = this;
            var values = self.$Scroller;
            var viewport = values[9 /* viewport */];
            var touchScroll;
            if (values[2 /* hCanScroll */]) {
                touchScroll = self.getTouchScrollH();
                if (touchScroll.isStarted()) {
                    touchScroll.finish(viewport.scrollH, viewport.contentWidth - viewport.width);
                }
            }
            if (values[3 /* vCanScroll */]) {
                touchScroll = self.getTouchScrollV();
                if (touchScroll.isStarted()) {
                    touchScroll.finish(viewport.scrollV, viewport.contentHeight - viewport.height);
                }
            }
        };
        Scroller.prototype.horizontalUpdateHandler = function (scrollPos) {
            this.$Scroller[9 /* viewport */].scrollH = scrollPos;
        };
        Scroller.prototype.verticalUpdateHandler = function (scrollPos) {
            this.$Scroller[9 /* viewport */].scrollV = scrollPos;
        };
        Scroller.prototype.horizontalEndHandler = function () {
        };
        Scroller.prototype.verticalEndHanlder = function () {
        };
        Scroller.scrollThreshold = 5;
        return Scroller;
    }(cui.Group));
    cui.Scroller = Scroller;
    __reflect(Scroller.prototype, "cui.Scroller");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/10/26.
 */
var cui;
(function (cui) {
    //根据状态 显示图片
    var StateImage = (function (_super) {
        __extends(StateImage, _super);
        function StateImage() {
            var _this = _super.call(this) || this;
            var self = _this;
            self._states = {};
            self._curState = null;
            return _this;
        }
        Object.defineProperty(StateImage.prototype, "stateStr", {
            set: function (val) {
                var self = this;
                var stateStrs = val.split(",");
                var stateData;
                var states = self._states;
                for (var i = 0; i < stateStrs.length; ++i) {
                    stateData = stateStrs[i].split(":");
                    if (stateData.length == 2) {
                        states[stateData[0]] = stateData[1];
                    }
                }
                var state = self._curState;
                if (state) {
                    self.source = states[state];
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StateImage.prototype, "curState", {
            set: function (state) {
                var self = this;
                if (self._curState == state)
                    return;
                self._curState = state;
                self.source = self._states[state];
            },
            enumerable: true,
            configurable: true
        });
        StateImage.prototype.addState = function (key, val) {
            this._states[key] = val;
        };
        return StateImage;
    }(cui.Image));
    cui.StateImage = StateImage;
    __reflect(StateImage.prototype, "cui.StateImage");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/12/18.
 */
var cui;
(function (cui) {
    var TableScroller = (function (_super) {
        __extends(TableScroller, _super);
        function TableScroller() {
            var _this = _super.call(this) || this;
            _this.activeInView = false; //显示时 触发激活
            _this.canOutBound = true; //是否能拖动 超出边界
            _this.repeatClk = false; //是否可重复点击
            var self = _this;
            self.$TableScroller = [
                "auto",
                "auto",
                false,
                false,
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                false,
                null,
                null,
                null,
            ];
            self._lastActiveIdx = -1;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            return _this;
        }
        Object.defineProperty(TableScroller.prototype, "scrollPolicyV", {
            get: function () {
                return this.$TableScroller[0 /* scrollPolicyV */];
            },
            set: function (value) {
                var values = this.$TableScroller;
                if (values[0 /* scrollPolicyV */] == value) {
                    return;
                }
                values[0 /* scrollPolicyV */] = value;
                //this.checkScrollPolicy();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TableScroller.prototype, "scrollPolicyH", {
            get: function () {
                return this.$TableScroller[1 /* scrollPolicyH */];
            },
            set: function (value) {
                var values = this.$TableScroller;
                if (values[1 /* scrollPolicyH */] == value) {
                    return;
                }
                values[1 /* scrollPolicyH */] = value;
                //this.checkScrollPolicy();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TableScroller.prototype, "viewport", {
            get: function () {
                return this.$TableScroller[9 /* viewport */];
            },
            set: function (value) {
                var self = this;
                var values = self.$TableScroller;
                if (value == values[9 /* viewport */])
                    return;
                var viewport = values[9 /* viewport */];
                if (viewport) {
                    self.uninstallViewport();
                }
                if (value) {
                    self.installViewport(value);
                }
            },
            enumerable: true,
            configurable: true
        });
        //--------------------------------------------------------------------------------
        TableScroller.prototype.dispose = function () {
            var self = this;
            self._cb = null;
            self.clearEvent();
            TRain.actionMgr.rmvActsByTar(self);
            _super.prototype.dispose.call(this);
        };
        TableScroller.prototype.installViewport = function (viewport) {
            var self = this;
            viewport.scrollEnabled = true;
            self.$TableScroller[9 /* viewport */] = viewport;
            self.addChild(viewport);
            viewport.addEventListener("view_clear" /* VIEW_CLEAR */, self.onViewClear, self);
        };
        TableScroller.prototype.uninstallViewport = function () {
            var self = this;
            self._showInfo = null;
            var values = self.$TableScroller;
            var viewport = values[9 /* viewport */];
            var hAction = values[7 /* touchScrollH */];
            if (hAction) {
                TRain.actionMgr.rmvAction(hAction);
            }
            var vAction = values[8 /* touchScrollV */];
            if (vAction) {
                TRain.actionMgr.rmvAction(vAction);
            }
            viewport.scrollEnabled = false;
            values[9 /* viewport */] = null;
            self.removeChild(viewport);
        };
        TableScroller.prototype.onViewClear = function () {
            var values = this.$TableScroller;
            var action = values[7 /* touchScrollH */];
            if (action)
                action.stop();
            action = values[8 /* touchScrollV */];
            if (action)
                action.stop();
        };
        //-----------------------------------------------------------
        TableScroller.prototype.showTableInViewStart = function (idx, ani) {
            var self = this;
            self._showInfo = { idx: idx, ani: ani };
            self.invalidateDL();
        };
        TableScroller.prototype._showTable = function (idx, ani) {
            var self = this;
            if (!self.checkScrollPolicy())
                return;
            var viewport = self.viewport;
            var needAdjust = false;
            var itemRect = viewport.getElementRect(idx);
            if (!itemRect)
                return;
            var hCanScroll = self.$TableScroller[2 /* hCanScroll */];
            var duration;
            var toPos;
            var startPos;
            if (hCanScroll) {
                toPos = itemRect.x;
                startPos = viewport.scrollH;
                var width = viewport.width;
                if (toPos < startPos || (toPos + itemRect.w) > (startPos + width)) {
                    var contentWidth = viewport.contentWidth;
                    if (contentWidth > width && toPos + width > contentWidth) {
                        toPos = contentWidth - width;
                    }
                    if (ani) {
                        duration = self.getAnimationDuration(0.5, startPos, toPos);
                        self.setScrollLeft(toPos, duration);
                    }
                    else {
                        viewport.scrollH = toPos;
                    }
                }
            }
            else {
                toPos = itemRect.y;
                startPos = viewport.scrollV;
                var height = viewport.height;
                if (toPos < startPos || (toPos + itemRect.h) > (startPos + height)) {
                    var contentHeight = viewport.contentHeight;
                    if (contentHeight > height && (toPos + height) > contentHeight) {
                        toPos = contentHeight - height;
                    }
                    if (ani) {
                        duration = self.getAnimationDuration(0.5, startPos, toPos);
                        self.setScrollTop(toPos, duration);
                    }
                    else {
                        viewport.scrollV = toPos;
                    }
                }
            }
            if (self.activeInView) {
                self.activate(idx);
            }
        };
        //------------------------------------------------------------
        TableScroller.prototype.activate = function (tableIdx) {
            var self = this;
            var cbData = self._cb;
            if ((!self.repeatClk && self._lastActiveIdx == tableIdx) || !cbData) {
                return false;
            }
            self._lastActiveIdx = tableIdx;
            cbData.fun.call(cbData.tar, tableIdx);
            return true;
        };
        TableScroller.prototype.setTarget = function (fun, tar) {
            this._cb = { fun: fun, tar: tar };
        };
        //-------------------------------------------------------------
        TableScroller.prototype.checkScrollPolicy = function () {
            var self = this;
            var viewport = self.viewport;
            if (!viewport) {
                return false;
            }
            var values = self.$TableScroller;
            var hCanScroll = false;
            switch (values[1 /* scrollPolicyH */]) {
                case "auto":
                    hCanScroll = viewport.contentWidth > viewport.width;
                    break;
                case "on":
                    hCanScroll = true;
                    break;
            }
            values[2 /* hCanScroll */] = hCanScroll;
            var vCanScroll = false;
            if (!hCanScroll) {
                switch (values[0 /* scrollPolicyV */]) {
                    case "auto":
                        vCanScroll = viewport.contentHeight > viewport.height;
                        break;
                    case "on":
                        vCanScroll = true;
                        break;
                }
                values[3 /* vCanScroll */] = vCanScroll;
            }
            return hCanScroll || vCanScroll;
        };
        TableScroller.prototype.onTouchBegin = function (event) {
            var self = this;
            if (!self.checkScrollPolicy()) {
                return;
            }
            var stageX = event.$stageX;
            var stageY = event.$stageY;
            var statPos = self.$TableScroller[4 /* touchStartPosition */];
            statPos.x = stageX;
            statPos.y = stageY;
            var stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self); //优先监听
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true); //优先监听
            var lastPos = self.$TableScroller[5 /* touchLastPosition */];
            lastPos.x = stageX;
            lastPos.y = stageY;
        };
        TableScroller.prototype.onTouchMove = function (event) {
            var self = this;
            event.stopPropagation();
            var viewport = self.viewport;
            var localPos = viewport.globalToLocal(event.$stageX, event.$stageY, egret.$TempPoint);
            localPos.x -= viewport.scrollH;
            localPos.y -= viewport.scrollV;
            if (localPos.x < 0 || localPos.y < 0 || localPos.x > viewport.width || localPos.y > viewport.height) {
                return;
            }
            var stageX = event.$stageX;
            var stageY = event.$stageY;
            var values = self.$TableScroller;
            if (!self.canOutBound) {
                var lastPos = void 0;
                var offset = void 0;
                if (values[2 /* hCanScroll */]) {
                    lastPos = self.$TableScroller[5 /* touchLastPosition */];
                    offset = event.$stageX - lastPos.x;
                    if (offset >= 0 && viewport.scrollH <= 0)
                        return;
                    if (offset <= 0) {
                        var maxLeft = viewport.contentWidth - viewport.width;
                        if (viewport.scrollH >= maxLeft)
                            return;
                    }
                }
                else if (values[3 /* vCanScroll */]) {
                    offset = event.$stageY - lastPos.y;
                    if (offset >= 0 && viewport.scrollV <= 0)
                        return;
                    if (offset <= 0) {
                        var maxTop = viewport.contentHeight - viewport.height;
                        if (viewport.scrollV >= maxTop)
                            return;
                    }
                }
            }
            if (!values[6 /* touchMoved */]) {
                var startPos = values[4 /* touchStartPosition */];
                if (Math.abs(startPos.x - stageX) < TableScroller.scrollThreshold &&
                    Math.abs(startPos.y - stageY) < TableScroller.scrollThreshold) {
                    return;
                }
                values[6 /* touchMoved */] = true;
                self.moveStart();
            }
            self.moveUpdate(stageX, stageY);
        };
        TableScroller.prototype.onTouchCaptureEnd = function (event) {
            var self = this;
            if (event.isDefaultPrevented()) {
                self.onTouchFinish(event);
                return;
            }
            var touchMoved = self.$TableScroller[6 /* touchMoved */];
            if (touchMoved) {
                event.preventDefault();
                self.onTouchFinish(event);
            }
        };
        TableScroller.prototype.onTouchEnd = function (event) {
            var self = this;
            if (event.isDefaultPrevented()) {
                self.onTouchFinish(event);
                return;
            }
            self.onTouchFinish(event);
            if (self._cb) {
                event.preventDefault();
                var localPos = self.globalToLocal(event.$stageX, event.$stageY, egret.$TempPoint);
                var viewport = self.viewport;
                var clickIdx = -1;
                var tmp = void 0;
                if (self.$TableScroller[2 /* hCanScroll */]) {
                    tmp = localPos.x + viewport.scrollH;
                    if (tmp > 0 && tmp < viewport.contentWidth) {
                        clickIdx = viewport.getElementIdxByPos(tmp, localPos.y);
                    }
                }
                else {
                    tmp = localPos.y + viewport.scrollV;
                    if (tmp > 0 && tmp < viewport.contentHeight) {
                        clickIdx = viewport.getElementIdxByPos(localPos.x, tmp);
                    }
                }
                if (clickIdx >= 0) {
                    if (self.activate(clickIdx)) {
                        event.preventDefault();
                    }
                }
            }
        };
        TableScroller.prototype.onTouchFinish = function (event) {
            var self = this;
            self.clearEvent();
            var values = self.$TableScroller;
            if (values[6 /* touchMoved */]) {
                self.moveEnd(event.stageX, event.stageY);
                values[6 /* touchMoved */] = false;
            }
        };
        TableScroller.prototype.clearEvent = function () {
            var self = this;
            var stage = self._tempStage;
            if (stage) {
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self); //优先监听
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchCaptureEnd, self, true); //优先监听
                stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, self.onTouchMove, self);
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                self._tempStage = null;
            }
        };
        //--------------------------------------------------------------
        TableScroller.prototype.moveStart = function () {
        };
        TableScroller.prototype.moveUpdate = function (stageX, stageY) {
            var self = this;
            var lastPos = self.$TableScroller[5 /* touchLastPosition */];
            var offset = { x: stageX, y: stageY };
            self.getPointChange(offset, lastPos, offset);
            self.setScrollPosition(offset.y, offset.x, true);
            lastPos.x = stageX;
            lastPos.y = stageY;
        };
        TableScroller.prototype.getPointChange = function (from, to, ret) {
            var self = this;
            if (!ret) {
                ret = { x: 0, y: 0 };
            }
            if (self.$TableScroller[2 /* hCanScroll */]) {
                ret.x = to.x - from.x;
                ret.y = 0;
            }
            else if (self.$TableScroller[3 /* vCanScroll */]) {
                ret.x = 0;
                ret.y = to.y - from.y;
            }
            return ret;
        };
        TableScroller.prototype.moveEnd = function (stageX, stageY) {
            var self = this;
            var viewport = self.viewport;
            var num = viewport.numElements;
            if (num <= 0)
                return;
            var hCanScroll = self.$TableScroller[2 /* hCanScroll */];
            var toPos = 0;
            var toIdx = viewport.getElementIdxByPos(viewport.scrollH, viewport.scrollV);
            if (toIdx >= 0) {
                var movDistance = 0;
                var itemSize = 0, contentSize = 0, size = 0;
                var statPos = self.$TableScroller[4 /* touchStartPosition */];
                var itemRect = viewport.getElementRect(toIdx);
                if (hCanScroll) {
                    movDistance = statPos.x - stageX;
                    if (movDistance <= 1 && movDistance >= -1)
                        return;
                    contentSize = viewport.contentWidth;
                    size = viewport.width;
                    itemSize = itemRect.w;
                    toPos = itemRect.x;
                }
                else {
                    movDistance = statPos.y - stageY;
                    if (movDistance <= 1 && movDistance >= -1)
                        return;
                    contentSize = viewport.contentHeight;
                    size = viewport.height;
                    itemSize = itemRect.h;
                    toPos = itemRect.y;
                }
                if (contentSize > size) {
                    var changed = (Math.abs(movDistance) / itemSize) > 0.2;
                    if (toIdx < num - 1 && (movDistance > 0 && changed) || (movDistance < 0 && !changed)) {
                        toPos += itemSize;
                        toIdx++;
                    }
                    if ((toPos + size) > contentSize) {
                        toPos = contentSize - size;
                    }
                }
                else {
                    toPos = 0;
                    toIdx = -1;
                }
            }
            if (hCanScroll) {
                self.setScrollLeft(toPos, self.getAnimationDuration(0.5, viewport.scrollH, toPos));
            }
            else {
                self.setScrollTop(toPos, self.getAnimationDuration(0.5, viewport.scrollV, toPos));
            }
            if (toIdx >= 0 && self.activeInView) {
                self.activate(toIdx);
            }
        };
        TableScroller.prototype.setScrollPosition = function (top, left, isOffset) {
            if (isOffset === void 0) { isOffset = false; }
            var viewport = this.viewport;
            if (isOffset) {
                if (top === 0 && left === 0)
                    return;
            }
            else {
                if (viewport.scrollV === top && viewport.scrollH === left)
                    return;
            }
            var oldTop = viewport.scrollV, oldLeft = viewport.scrollH;
            if (isOffset) {
                if (top != 0) {
                    var maxTop = viewport.contentHeight - viewport.height;
                    if (oldTop <= 0 || oldTop >= maxTop) {
                        top = top * 0.5;
                    }
                    viewport.scrollV = oldTop + top;
                }
                if (left != 0) {
                    var maxLeft = viewport.contentWidth - viewport.width;
                    if (oldLeft <= 0 || oldLeft >= maxLeft) {
                        left = left * 0.5;
                    }
                    viewport.scrollH = oldLeft + left;
                }
            }
            else {
                viewport.scrollV = top;
                viewport.scrollH = left;
            }
        };
        TableScroller.prototype.setScrollTop = function (scrollTop, duration) {
            if (duration === void 0) { duration = 0; }
            var self = this;
            var viewport = self.viewport;
            if (duration > 0) {
                var vAction = self.$TableScroller[8 /* touchScrollV */];
                if (!vAction) {
                    vAction = new TRain.ActionPropTween();
                    vAction.setEaseFun(EaseUtil.quartOut);
                    self.$TableScroller[8 /* touchScrollV */] = vAction;
                }
                vAction.addProp("scrollV", viewport.scrollV, scrollTop);
                vAction.duration = duration;
                TRain.actionMgr.addAction(vAction, viewport, false);
            }
            else {
                viewport.scrollV = scrollTop;
            }
        };
        TableScroller.prototype.setScrollLeft = function (scrollLeft, duration) {
            if (duration === void 0) { duration = 0; }
            var self = this;
            var viewport = self.viewport;
            if (duration > 0) {
                var hAction = self.$TableScroller[7 /* touchScrollH */];
                if (!hAction) {
                    hAction = new TRain.ActionPropTween();
                    hAction.setEaseFun(EaseUtil.quartOut);
                    self.$TableScroller[7 /* touchScrollH */] = hAction;
                }
                hAction.addProp("scrollH", viewport.scrollH, scrollLeft);
                hAction.duration = duration;
                TRain.actionMgr.addAction(hAction, viewport, false);
            }
            else {
                viewport.scrollH = scrollLeft;
            }
        };
        TableScroller.prototype.getAnimationDuration = function (pixelsPerMS, curPos, endPos) {
            var distance = Math.abs(endPos - curPos);
            if (distance <= 10)
                return 0;
            return distance / pixelsPerMS;
        };
        //-------------------------------------------------------------------
        TableScroller.prototype.validateDL = function () {
            var self = this;
            var showInfo = self._showInfo;
            if (showInfo) {
                self._showTable(showInfo.idx, showInfo.ani);
                self._showInfo = null;
            }
            _super.prototype.validateDL.call(this);
        };
        TableScroller.scrollThreshold = 5;
        return TableScroller;
    }(cui.Group));
    cui.TableScroller = TableScroller;
    __reflect(TableScroller.prototype, "cui.TableScroller");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/12/27.
 */
var cui;
(function (cui) {
    var UIMovieClip = (function (_super) {
        __extends(UIMovieClip, _super);
        function UIMovieClip() {
            var _this = _super.call(this) || this;
            _this.anitp = 0; //动画类型
            _this.autoPlay = false;
            var self = _this;
            self._runing = false;
            self._reverse = false;
            self._stopFrame = NaN;
            var clip = new TRain.MovieClip();
            self._clip = clip;
            clip.addEventListener(egret.Event.COMPLETE, self.onAniFin, self);
            self.addChild(clip);
            return _this;
        }
        UIMovieClip.prototype.$hitTest = function (stageX, stageY) {
            return null;
        };
        Object.defineProperty(UIMovieClip.prototype, "aniName", {
            get: function () {
                return this._aniName;
            },
            /**
             * 动画名
             * @param name 使用"."间隔。 格式为：mcName.aniName   文件名.动作名
             * 如果没有使用间隔。默认aniName = mcName
             *
             * */
            set: function (name) {
                var self = this;
                name = (!!name) ? name : null;
                if (self._aniName == name)
                    return;
                self._aniName = name;
                self.freeClipData();
                if (name) {
                    if (self._inited) {
                        self.loadMCData();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        UIMovieClip.prototype.childrenCreated = function () {
            _super.prototype.childrenCreated.call(this);
            var self = this;
            if (self._aniName) {
                self.loadMCData();
            }
        };
        UIMovieClip.prototype.dispose = function () {
            var self = this;
            self.freeClipData();
            var clip = self._clip;
            clip.dispose();
            clip.removeEventListener(egret.Event.COMPLETE, self.onAniFin, self);
            _super.prototype.dispose.call(this);
        };
        UIMovieClip.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (self._clipData && self._runing) {
                TRain.mcMgr.add(self._clip);
            }
        };
        UIMovieClip.prototype.$onRemoveFromStage = function () {
            _super.prototype.$onRemoveFromStage.call(this);
            var self = this;
            if (self._clipData && self._runing) {
                TRain.mcMgr.remove(self._clip);
            }
        };
        //------------------------------- load --------------------------------------
        //加载动画数据
        UIMovieClip.prototype.loadMCData = function () {
            var self = this;
            var aniName = self._aniName;
            var idx = aniName.indexOf(".");
            if (idx < 0) {
                TRain.mcMgr.getMCDataAsync(self.anitp, aniName, self.onLoadDataFinish, self);
            }
            else {
                TRain.mcMgr.getMCDataAsync(self.anitp, aniName.substr(0, idx), self.onLoadDataFinish, self, aniName.substring(idx + 1));
            }
        };
        UIMovieClip.prototype.onLoadDataFinish = function (clipData, anitp) {
            if (!clipData)
                return;
            var self = this;
            if (anitp != self.anitp) {
                TRain.mcMgr.freeMCData(self.anitp, clipData);
                return;
            }
            var aniName = self._aniName;
            if (aniName == null)
                return;
            var idx = aniName.indexOf(".");
            var tmpName = idx < 0 ? clipData.resName : clipData.resName + "." + clipData.aniName;
            if (aniName != tmpName) {
                TRain.mcMgr.freeMCData(self.anitp, clipData);
                return;
            }
            self._clipData = clipData;
            if (self._reverse) {
                var reverseData = clipData.clone(true);
                self._reverseData = reverseData;
                clipData = reverseData;
            }
            self._clip.movieClipData = clipData;
            var plyData = self._playData;
            if (plyData) {
                self.play(plyData.frame, plyData.playTimes);
            }
            else if (self.autoPlay) {
                self.play();
            }
            else if (!isNaN(self._stopFrame)) {
                var clip = self._clip;
                clip.gotoAndStop(self._stopFrame);
                if (self.stage && self._runing) {
                    TRain.mcMgr.remove(clip);
                }
                self._runing = false;
            }
            self.dispatchEventWith("created" /* EVT_CREATED */, false);
            self.invalidateDL();
        };
        UIMovieClip.prototype.reverseChanged = function (reverse) {
            var self = this;
            self._reverse = reverse;
            var clipData;
            if (reverse) {
                clipData = self._reverseData;
                if (!clipData) {
                    clipData = self._clipData.clone(true);
                }
            }
            else {
                clipData = self._clipData;
            }
            self._clip.movieClipData = clipData;
        };
        //---------------------------------------------------------------------
        UIMovieClip.prototype.gotoAndPlay = function (frame, playTimes, reverse) {
            if (frame === void 0) { frame = 0; }
            if (playTimes === void 0) { playTimes = 0; }
            if (reverse === void 0) { reverse = false; }
            var self = this;
            var clipData = self._clipData;
            if (clipData) {
                if (self._reverse != reverse) {
                    self.reverseChanged(reverse);
                }
                self.play(frame, playTimes);
            }
            else {
                self._reverse = reverse;
                self._playData = { frame: frame, playTimes: playTimes };
            }
        };
        UIMovieClip.prototype.play = function (frame, loop) {
            if (frame === void 0) { frame = 0; }
            if (loop === void 0) { loop = NaN; }
            var self = this;
            self._runing = true;
            var clip = self._clip;
            clip.gotoAndPlay(frame, loop);
            if (self.stage) {
                TRain.mcMgr.add(clip);
            }
        };
        UIMovieClip.prototype.gotoAndStop = function (frame, reverse) {
            if (reverse === void 0) { reverse = false; }
            var self = this;
            var clipData = self._clipData;
            if (clipData) {
                if (self._reverse != reverse) {
                    self.reverseChanged(reverse);
                }
                var clip = self._clip;
                clip.gotoAndStop(frame);
                if (self.stage && self._runing) {
                    TRain.mcMgr.remove(clip);
                }
                self._runing = false;
            }
            else {
                self._stopFrame = frame;
            }
        };
        UIMovieClip.prototype.stop = function () {
            var self = this;
            var clip = self._clip;
            if (clip && self._runing) {
                self._runing = false;
                clip.stop();
                if (self.stage) {
                    TRain.mcMgr.remove(clip);
                }
            }
        };
        UIMovieClip.prototype.onAniFin = function (e) {
            var self = this;
            self._runing = false;
            var clip = self._clip;
            TRain.mcMgr.remove(clip);
            self.dispatchEventWith("play_fin" /* EVT_PLAY_FIN */, false);
        };
        UIMovieClip.prototype.freeClipData = function () {
            var self = this;
            var clipData = self._clipData;
            if (clipData) {
                self.stop();
                self._reverseData = null;
                self._clipData = null;
                self._clip.movieClipData = null;
                TRain.mcMgr.freeMCData(self.anitp, clipData);
            }
        };
        return UIMovieClip;
    }(cui.BaseContainer));
    cui.UIMovieClip = UIMovieClip;
    __reflect(UIMovieClip.prototype, "cui.UIMovieClip");
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2016/5/3.
 */
var cui;
(function (cui) {
    var UITile = (function (_super) {
        __extends(UITile, _super);
        function UITile() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.tag = 0;
            self.ud = null;
            return _this;
        }
        UITile.prototype.dispose = function () {
            var self = this;
            self.onTouchFinish();
            self._cb = null;
            _super.prototype.dispose.call(this);
        };
        UITile.prototype.hasProp = function (key) {
            return false;
        };
        // public modProp(key:string, value:any):void
        // {
        //     super.modProp( key, value );
        //     let self = this;
        //     if( self.hasProp(key) ){
        //         self[key] = value;
        //     }
        // }
        UITile.prototype.dataChanged = function () {
            var self = this;
            var showData = self._data;
            self;
            for (var key in showData) {
                if (self.hasProp(key)) {
                    self[key] = showData[key];
                }
            }
        };
        //---------------------------------------事件-----------------------------------------------------
        UITile.prototype.setTarget = function (fun, tar) {
            var self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_BEGIN, self.onTouchBegin, self);
            self._cb = { fun: fun, tar: tar };
        };
        UITile.prototype.onTouchBegin = function (event) {
            var self = this;
            self.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
            var stage = self.$stage;
            stage.addEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
            self._tempStage = stage;
            event.updateAfterEvent();
        };
        UITile.prototype.onTouchEnd = function (event) {
            var self = this;
            self.onTouchFinish();
            //此事件 已被别的控件处理了
            if (event.isDefaultPrevented())
                return;
            event.preventDefault();
            self.clkReleased();
        };
        UITile.prototype.onTouchFinish = function () {
            var self = this;
            var stage = self._tempStage;
            if (stage) {
                stage.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchFinish, self);
                self.removeEventListener(egret.TouchEvent.TOUCH_END, self.onTouchEnd, self);
                self._tempStage = null;
            }
        };
        UITile.prototype.clkReleased = function () {
            var cbData = this._cb;
            if (cbData) {
                cbData.fun.call(cbData.tar, this);
            }
        };
        return UITile;
    }(cui.DataItem));
    cui.UITile = UITile;
    __reflect(UITile.prototype, "cui.UITile");
})(cui || (cui = {}));
/**
 * Created by CV-PC359 on 2016/6/18.
 */
var cui;
(function (cui) {
    cui.htmlParser = new egret.HtmlTextParser();
    cui.tempPt = { x: 0, y: 0 };
    cui.tempRect = { x: 0, y: 0, w: 0, h: 0 };
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
})(cui || (cui = {}));
/**
 * Created by wjdeng on 2015/12/24.
 */
// 1.target 必须是UIDataGroup
// 2. data 中需要有 width  height 属性
///<reference path="./LayoutBase.ts" />
var cui;
(function (cui) {
    var DataLineLayout = (function (_super) {
        __extends(DataLineLayout, _super);
        function DataLineLayout() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isHorizontal = true;
            _this.gap = 0;
            _this.horizontalAlign = "left"; //横向居中对齐 "left" right
            _this.verticalAlign = "top"; //纵向居中对齐 top bottom
            return _this;
        }
        DataLineLayout.prototype.getElementRect = function (idx) {
            var self = this;
            var target = self._target;
            var itemData;
            var dataProvider = self.target.dataProvider;
            var x = 0;
            var y = 0;
            var w = target.contentWidth;
            var h = target.contentHeight;
            var gap = self.gap;
            var item = target.getElementAt(idx);
            if (item) {
                itemData = dataProvider.getItemAt(idx);
                if (self.isHorizontal) {
                    x = item.x;
                    w = itemData.width + gap;
                }
                else {
                    y = item.y;
                    h = itemData.height + gap;
                }
                return { x: x, y: y, w: w, h: h };
            }
            if (self.isFixedSize()) {
                if (self.isHorizontal) {
                    w = self.itemW + gap;
                    x = w * idx + self.paddingLeft;
                }
                else {
                    h = self.itemH + gap;
                    y = h * idx + self.paddingTop;
                }
            }
            else {
                if (self.isHorizontal) {
                    x = self.paddingLeft;
                    for (var i = 0; i < idx; i++) {
                        itemData = dataProvider.getItemAt(i);
                        x += itemData.width + gap;
                    }
                    itemData = dataProvider.getItemAt(idx);
                    w = itemData.width + gap;
                }
                else {
                    y = self.paddingTop;
                    for (var i = 0; i < idx; i++) {
                        itemData = dataProvider.getItemAt(i);
                        y += itemData.height + gap;
                    }
                    itemData = dataProvider.getItemAt(idx);
                    h = itemData.height + gap;
                }
            }
            return { x: x, y: y, w: w, h: h };
        };
        DataLineLayout.prototype.getElementIdxByPos = function (x, y) {
            var self = this;
            var idx = -1;
            var gap = self.gap;
            var dataProvider = self.target.dataProvider;
            var count = dataProvider.length;
            if (self.isFixedSize()) {
                if (self.isHorizontal) {
                    idx = (x > self.paddingLeft) ? Math.floor((x - self.paddingLeft) / (self.itemW + gap)) : 0;
                }
                else {
                    idx = (y > self.paddingTop) ? Math.floor((y - self.paddingTop) / (self.itemH + gap)) : 0;
                }
            }
            else {
                var i = 0;
                var itemData = void 0;
                var target = self._target;
                if (self.isHorizontal) {
                    for (; i < count; i++) {
                        itemData = dataProvider.getItemAt(i);
                        x -= itemData.width;
                        if (x <= 0) {
                            idx = i;
                            break;
                        }
                    }
                }
                else {
                    for (; i < count; i++) {
                        itemData = dataProvider.getItemAt(i);
                        y -= itemData.height;
                        if (y <= 0) {
                            idx = i;
                            break;
                        }
                    }
                }
            }
            if (idx >= count)
                idx = count - 1;
            return idx;
        };
        DataLineLayout.prototype.getElementSize = function (idx) {
            var self = this;
            if (self.isFixedSize()) {
                return { w: self.itemW, h: self.itemH };
            }
            var itemData = self.target.dataProvider.getItemAt(idx);
            return { w: itemData.width, h: itemData.height };
        };
        DataLineLayout.prototype.adjustViewIndex = function (target) {
            var self = this;
            var width = target.$getWidth();
            var height = target.$getHeight();
            if (self.isHorizontal) {
                return self.adjustViewIndexH(target, width, height);
            }
            return self.adjustViewIndexV(target, width, height);
        };
        DataLineLayout.prototype.adjustViewIndexH = function (target, width, height) {
            var self = this;
            var startIdx = 0, endIdx = 0;
            var gap = self.gap;
            var minPos = target.scrollH;
            var maxPos = minPos + width - self.paddingRight;
            var startPos = self.paddingLeft, temp = 0;
            var dataProvider = target.dataProvider;
            var count = dataProvider.length;
            if (self.isFixedSize()) {
                var itemSize = self.itemW + gap;
                if (minPos > startPos) {
                    startIdx = Math.floor((minPos - startPos) / itemSize);
                    if (startIdx >= count)
                        startIdx = count - 1;
                }
                if (maxPos > startPos) {
                    endIdx = Math.floor((maxPos - startPos) / itemSize);
                    if (endIdx >= count)
                        endIdx = count - 1;
                }
            }
            else {
                var itemData = void 0;
                var i = 0;
                if (minPos > startPos) {
                    for (; i < count; i++) {
                        itemData = dataProvider.getItemAt(i);
                        temp = startPos + itemData.width + gap;
                        if (minPos < temp) {
                            startIdx = i;
                            break;
                        }
                        startPos = temp;
                    }
                }
                for (; i < count; i++) {
                    itemData = dataProvider.getItemAt(i);
                    startPos += itemData.width + gap;
                    endIdx = i;
                    if (maxPos <= startPos)
                        break;
                }
            }
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        DataLineLayout.prototype.adjustViewIndexV = function (target, width, height) {
            var self = this;
            var startIdx = 0, endIdx = 0;
            var gap = self.gap;
            var minPos = target.scrollV;
            var maxPos = minPos + height - self.paddingBottom;
            var startPos = self.paddingTop, temp = 0;
            var dataProvider = target.dataProvider;
            var count = dataProvider.length;
            if (self.isFixedSize()) {
                var itemSize = self.itemH + gap;
                if (minPos > startPos) {
                    startIdx = Math.floor((minPos - startPos) / itemSize);
                    if (startIdx >= count)
                        startIdx = count - 1;
                }
                if (maxPos > startPos) {
                    endIdx = Math.floor((maxPos - startPos) / itemSize);
                    if (endIdx >= count)
                        endIdx = count - 1;
                }
            }
            else {
                var itemData = void 0;
                var i = 0;
                if (minPos > startPos) {
                    for (; i < count; i++) {
                        itemData = dataProvider.getItemAt(i);
                        temp = startPos + itemData.height + gap;
                        if (minPos < temp) {
                            startIdx = i;
                            break;
                        }
                        startPos = temp;
                    }
                }
                for (; i < count; i++) {
                    itemData = dataProvider.getItemAt(i);
                    startPos += itemData.height + gap;
                    endIdx = i;
                    if (maxPos <= startPos)
                        break;
                }
            }
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        //------------------------------------------------------------------------
        DataLineLayout.prototype.updateFixSizeDList = function (width, height) {
            var self = this;
            var target = self._target;
            if (self.isHorizontal) {
                self.updateFixSizeH(target);
            }
            else {
                self.updateFixSizeV(target);
            }
        };
        DataLineLayout.prototype.updateRealDList = function (width, height) {
            var self = this;
            var target = self._target;
            if (self.isHorizontal) {
                self.updateDLH(target);
            }
            else {
                self.updateDLV(target);
            }
        };
        DataLineLayout.prototype.updateFixSizeH = function (target) {
            var self = this;
            var dataProvider = target.dataProvider;
            //let oldContentWidth = values[eui.sys.UIKeys.contentWidth];
            var size = self.itemW + self.gap;
            var contentWidth = self.paddingLeft + self.paddingRight + size * dataProvider.length;
            var contentHeight = self.paddingTop + self.paddingBottom + self.itemH;
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = self.paddingLeft + size * startIdx, startY = 0;
            var paddingTop = self.paddingTop;
            for (var i = startIdx; i <= endIdx; i++) {
                var layoutElement = (target.getVirtualElementAt(i));
                layoutElement.x = startX;
                layoutElement.y = paddingTop;
                startX += size;
            }
            target.setContentSize(contentWidth, contentHeight);
            //if( contentWidth != oldContentWidth )
            //{
            //    target.invalidateSize();
            //}
        };
        DataLineLayout.prototype.updateDLH = function (target) {
            var self = this;
            var dataProvider = target.dataProvider;
            var gap = self.gap;
            var i = 0, count = dataProvider.length;
            //let oldContentWidth = values[eui.sys.UIKeys.contentWidth];
            var itemData;
            var contentWidth = self.paddingLeft + self.paddingRight;
            var contentHeight = self.paddingTop + self.paddingBottom;
            for (; i < count; i++) {
                itemData = dataProvider.getItemAt(i);
                contentWidth += itemData.width + gap;
                contentHeight = Math.max(contentHeight, itemData.height);
            }
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = self.paddingLeft, startY = 0;
            i = 0;
            for (; i < startIdx; i++) {
                itemData = dataProvider.getItemAt(i);
                startX = startX + itemData.width + gap;
            }
            var height = target.$getHeight();
            var paddingTop = self.paddingTop;
            if (self.verticalAlign == egret.HorizontalAlign.CENTER) {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    startY = paddingTop + (height - itemData.height) / 2;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += itemData.width + gap;
                }
            }
            else if (self.verticalAlign == egret.VerticalAlign.BOTTOM) {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    startY = height - itemData.height - paddingTop;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += itemData.width + gap;
                }
            }
            else {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    layoutElement.x = startX;
                    layoutElement.y = paddingTop;
                    startX += itemData.width + gap;
                }
            }
            target.setContentSize(contentWidth, contentHeight);
            //if( contentWidth != oldContentWidth )
            //{
            //    target.invalidateSize();
            //}
        };
        DataLineLayout.prototype.updateFixSizeV = function (target) {
            var self = this;
            var dataProvider = target.dataProvider;
            var size = self.itemH + self.gap;
            var contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            var contentHeight = self.paddingTop + self.paddingBottom + size * dataProvider.length;
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = 0, startY = self.paddingTop + startIdx * size;
            var paddingLeft = self.paddingLeft;
            for (var i = startIdx; i <= endIdx; i++) {
                var layoutElement = (target.getVirtualElementAt(i));
                layoutElement.x = paddingLeft;
                layoutElement.y = startY;
                startY += size;
            }
            target.setContentSize(contentWidth, contentHeight);
            //if( contentHeight != oldContentHeight )
            //{
            //    target.invalidateSize();
            //}
        };
        DataLineLayout.prototype.updateDLV = function (target) {
            var self = this;
            var dataProvider = target.dataProvider;
            var gap = self.gap;
            var i = 0, count = dataProvider.length;
            //let oldContentHeight = values[eui.sys.UIKeys.contentWidth];
            var contentWidth = self.paddingLeft + self.paddingRight;
            var contentHeight = self.paddingTop + self.paddingBottom;
            var itemData;
            for (; i < count; i++) {
                itemData = dataProvider.getItemAt(i);
                contentHeight += itemData.height + gap;
                contentWidth = Math.max(contentWidth, itemData.width);
            }
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = 0, startY = self.paddingTop;
            for (i = 0; i < startIdx; i++) {
                itemData = dataProvider.getItemAt(i);
                startY = startY + itemData.height + gap;
            }
            var width = target.$getWidth();
            var paddingLeft = self.paddingLeft;
            if (self.horizontalAlign == egret.HorizontalAlign.CENTER) {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    startX = paddingLeft + (width - itemData.width) / 2;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += itemData.height + gap;
                }
            }
            else if (self.horizontalAlign == egret.HorizontalAlign.RIGHT) {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    startX = width - itemData.width - paddingLeft;
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += itemData.height + gap;
                }
            }
            else {
                for (; i <= endIdx; i++) {
                    var layoutElement = (target.getVirtualElementAt(i));
                    itemData = dataProvider.getItemAt(i);
                    layoutElement.x = paddingLeft;
                    layoutElement.y = startY;
                    startY += itemData.height + gap;
                }
            }
            target.setContentSize(contentWidth, contentHeight);
            //if( contentHeight != oldContentHeight )
            //{
            //    target.invalidateSize();
            //}
        };
        return DataLineLayout;
    }(cui.LayoutBase));
    cui.DataLineLayout = DataLineLayout;
    __reflect(DataLineLayout.prototype, "cui.DataLineLayout");
})(cui || (cui = {}));
//////////////////////////////////////////////////////////////////////////////////////
var cui;
(function (cui) {
    var LineLayout = (function (_super) {
        __extends(LineLayout, _super);
        function LineLayout() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isHorizontal = true;
            _this.gap = 0;
            _this.horizontalAlign = "left"; //横向居中对齐 "left" right
            _this.verticalAlign = "top"; //纵向居中对齐 top bottom
            return _this;
        }
        LineLayout.prototype.getElementRect = function (idx) {
            var self = this;
            var target = self._target;
            var x = 0;
            var y = 0;
            var h = target.contentHeight;
            var w = target.contentWidth;
            var gap = self.gap;
            var item = target.getElementAt(idx);
            //如果没有显示， 则需要定位
            if (item.visible) {
                if (self.isHorizontal) {
                    x = item.x;
                    w = item.width + gap;
                }
                else {
                    y = item.y;
                    h = item.height + gap;
                }
            }
            else {
                var i = 0;
                if (self.isHorizontal) {
                    x = self.paddingLeft;
                    w = item.width + gap;
                    for (; i < idx; i++) {
                        item = target.getElementAt(i);
                        x += (item.width + gap);
                    }
                }
                else {
                    y = self.paddingLeft;
                    h = item.height + gap;
                    for (; i < idx; i++) {
                        item = target.getElementAt(i);
                        y += (item.height + gap);
                    }
                }
            }
            return { x: x, y: y, w: w, h: h };
        };
        LineLayout.prototype.getElementIdxByPos = function (x, y) {
            var self = this;
            var idx = -1;
            var gap = self.gap;
            var target = self._target;
            var count = target.numElements;
            if (self.isFixedSize()) {
                if (self.isHorizontal) {
                    idx = (x > self.paddingLeft) ? Math.floor((x - self.paddingLeft) / (self.itemW + gap)) : 0;
                }
                else {
                    idx = (y > self.paddingTop) ? Math.floor((y - self.paddingTop) / (self.itemH + gap)) : 0;
                }
            }
            else {
                var i = 0;
                var child = void 0;
                if (self.isHorizontal) {
                    for (; i < count; i++) {
                        child = target.getElementAt(i);
                        x -= (child.width + gap);
                        if (x <= 0) {
                            idx = i;
                            break;
                        }
                    }
                }
                else {
                    for (; i < count; i++) {
                        child = target.getElementAt(i);
                        y -= (child.height + gap);
                        if (y <= 0) {
                            idx = i;
                            break;
                        }
                    }
                }
            }
            if (idx >= count)
                idx = count - 1;
            return idx;
        };
        LineLayout.prototype.adjustViewIndex = function (target) {
            var self = this;
            var width = target.$getWidth();
            var height = target.$getHeight();
            if (self.isHorizontal) {
                return self.adjustViewIndexH(target, width, height);
            }
            return self.adjustViewIndexV(target, width, height);
        };
        LineLayout.prototype.adjustViewIndexH = function (target, width, height) {
            var self = this;
            var startIdx = 0, endIdx = 0;
            var gap = self.gap;
            var minPos = target.scrollH;
            var maxPos = minPos + width - self.paddingRight;
            var startPos = self.paddingLeft, temp = 0;
            var child;
            var count = target.numChildren;
            if (self.isFixedSize()) {
                var itemSize = self.itemW + gap;
                if (minPos > startPos) {
                    startIdx = Math.floor((minPos - startPos) / itemSize);
                    if (startIdx >= count)
                        startIdx = count - 1;
                }
                if (maxPos > startPos) {
                    endIdx = Math.floor((maxPos - startPos) / itemSize);
                    if (endIdx >= count)
                        endIdx = count - 1;
                }
            }
            else {
                var i = 0;
                if (minPos > startPos) {
                    for (; i < count; i++) {
                        child = target.getElementAt(i);
                        temp = startPos + child.$getWidth() + gap;
                        if (minPos < temp) {
                            startIdx = i;
                            break;
                        }
                        startPos = temp;
                    }
                }
                for (; i < count; i++) {
                    child = target.getElementAt(i);
                    startPos += child.$getWidth() + gap;
                    endIdx = i;
                    if (maxPos <= startPos)
                        break;
                }
            }
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        LineLayout.prototype.adjustViewIndexV = function (target, width, height) {
            var self = this;
            var startIdx = 0, endIdx = 0;
            var gap = self.gap;
            var minPos = target.scrollV;
            var maxPos = minPos + height - self.paddingBottom;
            var startPos = self.paddingTop, temp = 0;
            var child;
            var count = target.numChildren;
            if (self.isFixedSize()) {
                var itemSize = self.itemH + gap;
                if (minPos > startPos) {
                    startIdx = Math.floor((minPos - startPos) / itemSize);
                    if (startIdx >= count)
                        startIdx = count - 1;
                }
                if (maxPos > startPos) {
                    endIdx = Math.floor((maxPos - startPos) / itemSize);
                    if (endIdx >= count)
                        endIdx = count - 1;
                }
            }
            else {
                var i = 0;
                if (minPos > startPos) {
                    for (; i < count; i++) {
                        child = target.getElementAt(i);
                        temp = startPos + child.$getHeight() + gap;
                        if (minPos < temp) {
                            startIdx = i;
                            break;
                        }
                        startPos = temp;
                    }
                }
                for (; i < count; i++) {
                    child = target.getElementAt(i);
                    startPos += child.$getHeight() + gap;
                    endIdx = i;
                    if (maxPos <= startPos)
                        break;
                }
            }
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        //------------------------------------------------------------------------
        LineLayout.prototype.updateFixSizeDList = function (width, height) {
            var self = this;
            if (self.isHorizontal) {
                self.updateFixSizeH(self._target);
            }
            else {
                self.updateFixSizeV(self._target);
            }
        };
        LineLayout.prototype.updateRealDList = function (width, height) {
            var self = this;
            if (self.isHorizontal) {
                self.updateDLH(self._target);
            }
            else {
                self.updateDLV(self._target);
            }
        };
        LineLayout.prototype.updateFixSizeH = function (target) {
            var self = this;
            var size = self.itemW + self.gap;
            var contentWidth = self.paddingLeft + self.paddingRight + size * target.numElements;
            var contentHeight = self.paddingTop + self.paddingBottom + self.itemH;
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = self.paddingLeft + size * startIdx, startY = 0;
            var paddingTop = self.paddingTop;
            for (var i = startIdx; i <= endIdx; i++) {
                var child = target.getElementAt(i);
                child.x = startX;
                child.y = paddingTop;
                startX += size;
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        LineLayout.prototype.updateDLH = function (target) {
            var self = this;
            var gap = self.gap;
            var i = 0, count = target.numElements;
            var child;
            var contentWidth = self.paddingLeft + self.paddingRight;
            var contentHeight = self.paddingTop + self.paddingBottom;
            for (; i < count; i++) {
                child = target.getElementAt(i);
                contentWidth += child.width + gap;
                contentHeight = Math.max(contentHeight, child.height);
            }
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = self.paddingLeft, startY = 0;
            i = 0;
            for (; i < startIdx; i++) {
                child = target.getElementAt(i);
                startX = startX + child.width + gap;
            }
            var height = target.$getHeight();
            var paddingTop = self.paddingTop;
            if (self.verticalAlign == egret.HorizontalAlign.CENTER) {
                for (; i <= endIdx; i++) {
                    child = target.getElementAt(i);
                    startY = paddingTop + (height - child.height) / 2;
                    child.x = startX;
                    child.y = startY;
                    startX += child.width + gap;
                }
            }
            else if (self.verticalAlign == egret.VerticalAlign.BOTTOM) {
                child = target.getElementAt(i);
                startY = height - paddingTop - child.height;
                child.x = startX;
                child.y = startY;
                startX += child.width + gap;
            }
            else {
                for (; i <= endIdx; i++) {
                    child = target.getElementAt(i);
                    child.x = startX;
                    child.y = paddingTop;
                    startX += child.width + gap;
                }
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        LineLayout.prototype.updateFixSizeV = function (target) {
            var self = this;
            var size = self.itemH + self.gap;
            var contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            var contentHeight = self.paddingTop + self.paddingBottom + size * target.numElements;
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = 0, startY = self.paddingTop + startIdx * size;
            var paddingLeft = self.paddingLeft;
            for (var i = startIdx; i <= endIdx; i++) {
                var child = target.getElementAt(i);
                child.x = paddingLeft;
                child.y = startY;
                startY += size;
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        LineLayout.prototype.updateDLV = function (target) {
            var self = this;
            var gap = self.gap;
            var i = 0, count = target.numElements;
            var child;
            var contentWidth = self.paddingLeft + self.paddingRight;
            var contentHeight = self.paddingTop + self.paddingBottom;
            for (; i < count; i++) {
                child = target.getElementAt(i);
                contentHeight += child.height + gap;
                contentWidth = Math.max(contentWidth, child.width);
            }
            var startIdx = self._startIdx, endIdx = self._endIdx;
            var startX = 0, startY = self.paddingTop;
            for (i = 0; i < startIdx; i++) {
                child = target.getElementAt(i);
                startY = startY + child.height + gap;
            }
            var width = target.$getWidth();
            var paddingLeft = self.paddingLeft;
            if (self.horizontalAlign == egret.HorizontalAlign.CENTER) {
                for (; i <= endIdx; i++) {
                    child = target.getElementAt(i);
                    startX = paddingLeft + (width - child.width) / 2;
                    child.x = startX;
                    child.y = startY;
                    startY += child.height + gap;
                }
            }
            else if (self.horizontalAlign == egret.HorizontalAlign.RIGHT) {
                child = target.getElementAt(i);
                startX = width - paddingLeft - child.width;
                child.x = startX;
                child.y = startY;
                startY += child.height + gap;
            }
            else {
                for (; i <= endIdx; i++) {
                    child = target.getElementAt(i);
                    child.x = paddingLeft;
                    child.y = startY;
                    startY += child.height + gap;
                }
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        return LineLayout;
    }(cui.LayoutBase));
    cui.LineLayout = LineLayout;
    __reflect(LineLayout.prototype, "cui.LineLayout");
})(cui || (cui = {}));
//////////////////////////////////////////////////////////////////////////////////////
var cui;
(function (cui) {
    var TileLayout = (function (_super) {
        __extends(TileLayout, _super);
        function TileLayout() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isHorizontal = true; //横向滚动
            _this.horizontalGap = 0;
            _this.verticalGap = 0;
            _this._count = 0; //1行最多放下item个数
            return _this;
        }
        TileLayout.prototype.getElementRect = function (idx) {
            var self = this;
            var target = self._target;
            var x = 0;
            var y = 0;
            var w = self.itemW + self.horizontalGap;
            var h = self.itemH + self.verticalGap;
            var item = target.getElementAt(idx);
            if (item && item.visible) {
                if (self.isHorizontal) {
                    x = item.x;
                }
                else {
                    y = item.y;
                }
                return { x: x, y: y, w: w, h: h };
            }
            var count = self._count;
            var row = Math.floor(idx / count);
            var col = idx - row * count;
            if (self.isHorizontal) {
                if (row > 0) {
                    x = w * row + self.paddingLeft;
                }
                if (col > 0) {
                    y = h * col + self.paddingTop;
                }
            }
            else {
                if (col > 0) {
                    x = h * col + self.paddingLeft;
                }
                if (row > 0) {
                    y = w * row + self.paddingTop;
                }
            }
            return { x: x, y: y, w: w, h: h };
        };
        TileLayout.prototype.getItemIdxByPos = function (x, y) {
            var self = this;
            var idx = -1;
            var num = self._target.numElements;
            if (self.isFixedSize() && x > self.paddingLeft && y > self.paddingTop) {
                var hSize = self.itemW + self.horizontalGap;
                var vSize = self.itemH + self.verticalGap;
                var col = Math.floor((x - self.paddingLeft) / hSize);
                var row = Math.floor((y - self.paddingTop) / vSize);
                if (self.isHorizontal) {
                    idx = col * self._count + row;
                }
                else {
                    idx = row * self._count + col;
                }
            }
            if (idx >= num)
                idx = num - 1;
            return idx;
        };
        TileLayout.prototype.adjustViewIndex = function (target) {
            var self = this;
            if (self.itemH <= 0 || self.itemW <= 0) {
                self._startIdx = self._endIdx = -1;
                if (true) {
                    egret.error("item size is zero");
                }
                return false;
            }
            var width = target.$getWidth();
            var height = target.$getHeight();
            if (self.isHorizontal) {
                return self.adjustViewIndexH(target, width, height);
            }
            else {
                return self.adjustViewIndexV(target, width, height);
            }
        };
        TileLayout.prototype.adjustViewIndexH = function (target, width, height) {
            var self = this;
            var verticalGap = self.verticalGap;
            var rowCount = Math.floor((height - self.paddingTop - self.paddingBottom + verticalGap) / (self.itemH + verticalGap));
            self._count = rowCount;
            var startPos = self.paddingLeft;
            var startCol = 0, endCol = 0;
            var tmpSize = self.itemW + self.horizontalGap;
            var minPos = target.scrollH;
            if (minPos > startPos) {
                startCol = Math.floor((minPos - startPos) / tmpSize);
            }
            var maxPos = target.scrollH + width - self.paddingRight;
            if (maxPos > startPos) {
                endCol = Math.floor((maxPos - startPos) / tmpSize);
            }
            var startIdx = startCol * rowCount;
            var endIdx = endCol * rowCount + rowCount - 1;
            var numChild = target.numElements;
            if (startIdx >= numChild)
                startIdx = numChild - 1;
            if (endIdx >= numChild)
                endIdx = numChild - 1;
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        TileLayout.prototype.adjustViewIndexV = function (target, width, height) {
            var self = this;
            var horizontalGap = self.horizontalGap;
            var colCount = Math.floor((width - self.paddingLeft - self.paddingRight + horizontalGap) / (self.itemW + horizontalGap));
            self._count = colCount;
            var startPos = self.paddingTop;
            var startRow = 0, endRow = 0;
            var tmpSize = self.itemH + self.verticalGap;
            var minPos = target.scrollV;
            if (minPos > startPos) {
                startRow = Math.floor((minPos - startPos) / tmpSize);
            }
            var maxPos = target.scrollV + height - self.paddingBottom;
            if (maxPos > startPos) {
                endRow = Math.floor((maxPos - startPos) / tmpSize);
            }
            var startIdx = startRow * colCount;
            var endIdx = endRow * colCount + colCount - 1;
            var numChild = target.numElements;
            if (startIdx >= numChild)
                startIdx = numChild - 1;
            if (endIdx >= numChild)
                endIdx = numChild - 1;
            var oldStartIdx = self._startIdx;
            var oldEndIdx = self._endIdx;
            self._startIdx = startIdx;
            self._endIdx = endIdx;
            return oldStartIdx != startIdx || oldEndIdx != endIdx;
        };
        //------------------------------------------------------------------------
        TileLayout.prototype.updateFixSizeDList = function (width, height) {
            var self = this;
            if (self.isHorizontal) {
                self.updateFixSizeH(self._target);
            }
            else {
                self.updateFixSizeV(self._target);
            }
        };
        TileLayout.prototype.updateRealDList = function (width, height) {
            if (true) {
                egret.error("TileLayout must set itemH itemW");
            }
        };
        TileLayout.prototype.updateFixSizeH = function (target) {
            var self = this;
            var paddingTop = self.paddingTop;
            var rowCount = self._count;
            var numElements = target.numElements;
            var size = self.itemW + self.horizontalGap;
            var vSize = self.itemH + self.verticalGap;
            var maxCol = Math.ceil(numElements / rowCount);
            var contentWidth = self.paddingLeft + self.paddingRight + size * maxCol;
            var contentHeight = paddingTop + self.paddingBottom + self.itemH;
            var startCol = Math.floor(self._startIdx / rowCount), endCol = Math.floor(self._endIdx / rowCount);
            var startX = self.paddingLeft + size * startCol, startY = 0;
            var tmpIdx = 0;
            for (var i = startCol; i < endCol; i++) {
                tmpIdx = i * rowCount;
                startY = paddingTop;
                for (var j = 0; j < rowCount; j++) {
                    var layoutElement = target.getVirtualElementAt(tmpIdx + j);
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startY += vSize;
                }
                startX += size;
            }
            //最后一行
            tmpIdx = endCol * rowCount;
            var end = tmpIdx + rowCount;
            if (end > numElements)
                end = numElements;
            startY = paddingTop;
            for (var j = tmpIdx; j < end; j++) {
                var layoutElement = target.getVirtualElementAt(j);
                layoutElement.x = startX;
                layoutElement.y = startY;
                startY += vSize;
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        TileLayout.prototype.updateFixSizeV = function (target) {
            var self = this;
            var paddingLeft = self.paddingLeft;
            var colCount = self._count;
            var numElements = target.numElements;
            var hSize = self.itemW + self.horizontalGap;
            var size = self.itemH + self.verticalGap;
            var maxRow = Math.ceil(numElements / colCount);
            var contentWidth = self.paddingLeft + self.paddingRight + self.itemW;
            var contentHeight = paddingLeft + self.paddingBottom + size * maxRow;
            var startRow = Math.floor(self._startIdx / colCount), endRow = Math.floor(self._endIdx / colCount);
            var startX = 0, startY = self.paddingTop + size * startRow;
            var tmpIdx = 0;
            for (var i = startRow; i < endRow; i++) {
                tmpIdx = i * colCount;
                startX = paddingLeft;
                for (var j = 0; j < colCount; j++) {
                    var layoutElement = target.getVirtualElementAt(tmpIdx + j);
                    layoutElement.x = startX;
                    layoutElement.y = startY;
                    startX += hSize;
                }
                startY += size;
            }
            //最后一行
            tmpIdx = endRow * colCount;
            var end = tmpIdx + colCount;
            if (end > numElements)
                end = numElements;
            startX = paddingLeft;
            for (var j = tmpIdx; j < end; j++) {
                var layoutElement = target.getVirtualElementAt(j);
                layoutElement.x = startX;
                layoutElement.y = startY;
                startX += hSize;
            }
            target.setContentSize(contentWidth, contentHeight);
        };
        return TileLayout;
    }(cui.LayoutBase));
    cui.TileLayout = TileLayout;
    __reflect(TileLayout.prototype, "cui.TileLayout");
})(cui || (cui = {}));
//////////////////////////////////////////////////////////////////////////////////////
var cui;
(function (cui) {
    var Animation = (function () {
        /**
         * @private
         */
        function Animation(updateFunction, thisObject) {
            this.easerFunction = EaseUtil.sineInOut;
            /**
             * @private
             * 是否正在播放动画，不包括延迟等待和暂停的阶段
             */
            this.isPlaying = false;
            /**
             * @private
             * 动画持续时间,单位毫秒，默认值500
             */
            this.duration = 500;
            /**
             * @private
             * 动画到当前时间对应的值。
             */
            this.currentValue = 0;
            /**
             * @private
             * 起始值
             */
            this.from = 0;
            /**
             * @private
             * 终点值。
             */
            this.to = 0;
            /**
             * @private
             * 动画启动时刻
             */
            this.startTime = 0;
            /**
             * @private
             * 动画播放结束时的回调函数
             */
            this.endFunction = null;
            this.updateFunction = updateFunction;
            this.thisObject = thisObject;
        }
        /**
         * @private
         * 开始正向播放动画,无论何时调用都重新从零时刻开始，若设置了延迟会首先进行等待。
         */
        Animation.prototype.play = function () {
            this.stop();
            this.start();
        };
        /**
         * @private
         * 开始播放动画
         */
        Animation.prototype.start = function () {
            this.isPlaying = false;
            this.currentValue = 0;
            this.startTime = egret.getTimer();
            this.doInterval(this.startTime);
            egret.startTick(this.doInterval, this);
        };
        /**
         * @private
         * 停止播放动画
         */
        Animation.prototype.stop = function () {
            this.isPlaying = false;
            this.startTime = 0;
            egret.stopTick(this.doInterval, this);
        };
        Animation.prototype.dispose = function () {
            this.updateFunction = null;
            this.endFunction = null;
            this.thisObject = null;
        };
        /**
         * @private
         * 计算当前值并返回动画是否结束
         */
        Animation.prototype.doInterval = function (currentTime) {
            var runningTime = currentTime - this.startTime;
            if (!this.isPlaying) {
                this.isPlaying = true;
            }
            var duration = this.duration;
            var fraction = duration == 0 ? 1 : Math.min(runningTime, duration) / duration;
            if (this.easerFunction) {
                fraction = this.easerFunction(fraction);
            }
            this.currentValue = this.from + (this.to - this.from) * fraction;
            if (this.updateFunction)
                this.updateFunction.call(this.thisObject, this);
            var isEnded = runningTime >= duration;
            if (isEnded) {
                this.stop();
            }
            if (isEnded && this.endFunction) {
                this.endFunction.call(this.thisObject, this);
            }
            return true;
        };
        return Animation;
    }());
    cui.Animation = Animation;
    __reflect(Animation.prototype, "cui.Animation");
})(cui || (cui = {}));
//////////////////////////////////////////////////////////////////////////////////////
var cui;
(function (cui) {
    /**
     * @private
     * 需要记录的历史速度的最大次数。
     */
    var MAX_VELOCITY_COUNT = 4;
    /**
     * @private
     * 记录的历史速度的权重列表。
     */
    var VELOCITY_WEIGHTS = [1, 1.33, 1.66, 2];
    /**
     * @private
     * 当前速度所占的权重。
     */
    var CURRENT_VELOCITY_WEIGHT = 2.33;
    /**
     * @private
     * 最小的改变速度，解决浮点数精度问题。
     */
    var MINIMUM_VELOCITY = 0.02;
    /**
     * @private
     * 当容器自动滚动时要应用的摩擦系数
     */
    var FRICTION = 0.998;
    /**
     * @private
     * 当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数
     */
    var EXTRA_FRICTION = 0.95;
    /**
     * @private
     * 摩擦系数的自然对数
     */
    var FRICTION_LOG = Math.log(FRICTION);
    var TouchScroll = (function () {
        /**
         * @private
         * 创建一个 TouchScroll 实例
         * @param updateFunction 滚动位置更新回调函数
         */
        function TouchScroll(updateFunction, endFunction, target) {
            /**
             * @private
             * 当前容器滚动外界可调节的系列
             */
            this.$scrollFactor = 1.0;
            /**
             * @private
             */
            this.previousTime = 0;
            /**
             * @private
             */
            this.velocity = 0;
            /**
             * @private
             */
            this.previousVelocity = [];
            /**
             * @private
             */
            this.currentPosition = 0;
            /**
             * @private
             */
            this.previousPosition = 0;
            /**
             * @private
             */
            this.currentScrollPos = 0;
            /**
             * @private
             */
            this.maxScrollPos = 0;
            /**
             * @private
             * 触摸按下时的偏移量
             */
            this.offsetPoint = 0;
            this.$bounces = true;
            this.disposed = false;
            this.started = true;
            if (true && !updateFunction) {
                egret.$error(1003, "updateFunction");
            }
            this.updateFunction = updateFunction;
            this.endFunction = endFunction;
            this.target = target;
            this.animation = new cui.Animation(this.onScrollingUpdate, this);
            this.animation.endFunction = this.finishScrolling;
            this.animation.easerFunction = EaseUtil.cubicOut;
        }
        /**
         * @private
         * 正在播放缓动动画的标志。
         */
        TouchScroll.prototype.isPlaying = function () {
            return this.animation.isPlaying;
        };
        /**
         * @private
         * 如果正在执行缓动滚屏，停止缓动。
         */
        TouchScroll.prototype.stop = function () {
            this.animation.stop();
            egret.stopTick(this.onTick, this);
            this.started = false;
        };
        TouchScroll.prototype.dispose = function () {
            if (this.disposed)
                return;
            this.disposed = true;
            this.animation.dispose();
            egret.stopTick(this.onTick, this);
            this.started = false;
            this.updateFunction = null;
            this.endFunction = null;
            this.target = null;
        };
        /**
         * @private
         * true表示已经调用过start方法。
         */
        TouchScroll.prototype.isStarted = function () {
            return this.started;
        };
        /**
         * @private
         * 开始记录位移变化。注意：当使用完毕后，必须调用 finish() 方法结束记录，否则该对象将无法被回收。
         * @param touchPoint 起始触摸位置，以像素为单位，通常是stageX或stageY。
         */
        TouchScroll.prototype.start = function (touchPoint) {
            this.started = true;
            this.velocity = 0;
            this.previousVelocity.length = 0;
            this.previousTime = egret.getTimer();
            this.previousPosition = this.currentPosition = touchPoint;
            this.offsetPoint = touchPoint;
            egret.startTick(this.onTick, this);
        };
        /**
         * @private
         * 更新当前移动到的位置
         * @param touchPoint 当前触摸位置，以像素为单位，通常是stageX或stageY。
         */
        TouchScroll.prototype.update = function (touchPoint, maxScrollValue, scrollValue) {
            maxScrollValue = Math.max(maxScrollValue, 0);
            this.currentPosition = touchPoint;
            this.maxScrollPos = maxScrollValue;
            var disMove = this.offsetPoint - touchPoint;
            var scrollPos = disMove + scrollValue;
            this.offsetPoint = touchPoint;
            if (scrollPos < 0) {
                if (!this.$bounces) {
                    scrollPos = 0;
                }
                else {
                    scrollPos -= disMove * 0.5;
                }
            }
            if (scrollPos > maxScrollValue) {
                if (!this.$bounces) {
                    scrollPos = maxScrollValue;
                }
                else {
                    scrollPos -= disMove * 0.5;
                }
            }
            this.currentScrollPos = scrollPos;
            this.updateFunction.call(this.target, scrollPos);
        };
        /**
         * @private
         * 停止记录位移变化，并计算出目标值和继续缓动的时间。
         * @param currentScrollPos 容器当前的滚动值。
         * @param maxScrollPos 容器可以滚动的最大值。当目标值不在 0~maxValue之间时，将会应用更大的摩擦力，从而影响缓动时间的长度。
         */
        TouchScroll.prototype.finish = function (currentScrollPos, maxScrollPos) {
            egret.stopTick(this.onTick, this);
            this.started = false;
            var sum = this.velocity * CURRENT_VELOCITY_WEIGHT;
            var previousVelocityX = this.previousVelocity;
            var length = previousVelocityX.length;
            var totalWeight = CURRENT_VELOCITY_WEIGHT;
            for (var i = 0; i < length; i++) {
                var weight = VELOCITY_WEIGHTS[i];
                sum += previousVelocityX[0] * weight;
                totalWeight += weight;
            }
            var pixelsPerMS = sum / totalWeight;
            var absPixelsPerMS = Math.abs(pixelsPerMS);
            var duration = 0;
            var posTo = 0;
            if (absPixelsPerMS > MINIMUM_VELOCITY) {
                posTo = currentScrollPos + (pixelsPerMS - MINIMUM_VELOCITY) / FRICTION_LOG * 2 * this.$scrollFactor;
                if (posTo < 0 || posTo > maxScrollPos) {
                    posTo = currentScrollPos;
                    while (Math.abs(pixelsPerMS) > MINIMUM_VELOCITY) {
                        posTo -= pixelsPerMS;
                        if (posTo < 0 || posTo > maxScrollPos) {
                            pixelsPerMS *= FRICTION * EXTRA_FRICTION;
                        }
                        else {
                            pixelsPerMS *= FRICTION;
                        }
                        duration++;
                    }
                }
                else {
                    duration = Math.log(MINIMUM_VELOCITY / absPixelsPerMS) / FRICTION_LOG;
                }
            }
            else {
                posTo = currentScrollPos;
            }
            //if (this.target["$getThrowInfo"]) {
            //    let event:eui.ScrollerThrowEvent = this.target["$getThrowInfo"](currentScrollPos, posTo);
            //    posTo = event.toPos;
            //}
            if (duration > 0) {
                //如果取消了回弹,保证动画之后不会超出边界
                if (!this.$bounces) {
                    if (posTo < 0) {
                        posTo = 0;
                    }
                    else if (posTo > maxScrollPos) {
                        posTo = maxScrollPos;
                    }
                }
                this.throwTo(posTo, duration);
            }
            else {
                this.finishScrolling();
            }
        };
        /**
         * @private
         *
         * @param timeStamp
         * @returns
         */
        TouchScroll.prototype.onTick = function (timeStamp) {
            if (this.disposed)
                return;
            var timeOffset = timeStamp - this.previousTime;
            if (timeOffset > 10) {
                var previousVelocity = this.previousVelocity;
                if (previousVelocity.length >= MAX_VELOCITY_COUNT) {
                    previousVelocity.shift();
                }
                this.velocity = (this.currentPosition - this.previousPosition) / timeOffset;
                previousVelocity.push(this.velocity);
                this.previousTime = timeStamp;
                this.previousPosition = this.currentPosition;
            }
            return true;
        };
        /**
         * @private
         *
         * @param animation
         */
        TouchScroll.prototype.finishScrolling = function (animation) {
            var hsp = this.currentScrollPos;
            var maxHsp = this.maxScrollPos;
            var hspTo = hsp;
            if (hsp < 0) {
                hspTo = 0;
            }
            if (hsp > maxHsp) {
                hspTo = maxHsp;
            }
            this.throwTo(hspTo, 300);
        };
        /**
         * @private
         * 缓动到水平滚动位置
         */
        TouchScroll.prototype.throwTo = function (hspTo, duration) {
            if (duration === void 0) { duration = 500; }
            var hsp = this.currentScrollPos;
            if (hsp == hspTo) {
                this.endFunction.call(this.target);
                return;
            }
            var animation = this.animation;
            animation.duration = duration;
            animation.from = hsp;
            animation.to = hspTo;
            animation.play();
        };
        /**
         * @private
         * 更新水平滚动位置
         */
        TouchScroll.prototype.onScrollingUpdate = function (animation) {
            if (this.disposed)
                return;
            this.currentScrollPos = animation.currentValue;
            this.updateFunction.call(this.target, animation.currentValue);
        };
        return TouchScroll;
    }());
    cui.TouchScroll = TouchScroll;
    __reflect(TouchScroll.prototype, "cui.TouchScroll");
})(cui || (cui = {}));
var TRain;
(function (TRain) {
    var LangManager = (function () {
        function LangManager() {
            this._gpList = {};
        }
        LangManager.prototype.getGp = function (gpName) {
            return this._gpList[gpName];
        };
        LangManager.prototype.getTxtByKey = function (key) {
            var keys = key.split('#');
            var gp = this._gpList[keys[0]];
            return gp ? gp[keys[1]] : undefined;
        };
        LangManager.prototype.getTxt = function (gpName, key) {
            var gp = this._gpList[gpName];
            return gp ? gp[key] : undefined;
        };
        LangManager.prototype.getErrText = function (errCode) {
            var errGp = this._errGp;
            if (errGp)
                return errGp[errCode];
            errGp = this._gpList['errCode'];
            if (errGp) {
                this._errGp = errGp;
                return errGp[errCode];
            }
            return undefined;
        };
        LangManager.prototype.addGps = function (gps) {
            var gpList = this._gpList;
            for (var key in gps) {
                var addGp = gps[key];
                var gp = gpList[key];
                if (gp) {
                    for (var subKey in addGp) {
                        gp[subKey] = addGp[subKey];
                    }
                }
                else {
                    gpList[key] = addGp;
                }
            }
        };
        return LangManager;
    }());
    TRain.LangManager = LangManager;
    __reflect(LangManager.prototype, "TRain.LangManager");
    TRain.langMgr = new LangManager();
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var MCManager = (function () {
        function MCManager() {
            var self = this;
            self._timeoutHandler = 0;
            self._mcs = [];
        }
        MCManager.prototype.doGC = function () {
            var self = this;
            if (self._timeoutHandler == 0) {
                self._disposeTp = 0;
                self.disposeRess();
                //self._timeoutHandler = core.addDelayDo( self.disposeRess, self, CONF.mcGCTm );
            }
        };
        MCManager.prototype.stopGC = function () {
            var self = this;
            if (self._timeoutHandler !== 0) {
                TRain.core.rmvDelayDoByID(self._timeoutHandler);
                self._timeoutHandler = 0;
            }
        };
        //----------------------------------------------------------------------------------
        //oneUrl 为true  表示  mc文件都放在同一目录下
        MCManager.prototype.init = function (mcTps, oneUrl) {
            var self = this;
            self._armTps = mcTps;
            self._oneUrl = oneUrl;
            var mcRess = [];
            var usecnts = [];
            var loadings = [];
            for (var i = 0, len = mcTps.length; i < len; i++) {
                mcRess.push({});
                usecnts.push({});
                loadings.push({});
            }
            self._mcRess = mcRess;
            self._usecnts = usecnts;
            self._loadings = loadings;
        };
        //-----------------------------------------------------------------------------------
        MCManager.prototype.getMCUrl = function (armtp, resName) {
            if (this._oneUrl) {
                return CONF.mcUrl + resName + ".mc";
            }
            return CONF.mcUrl + this._armTps[armtp] + "/" + resName + ".mc";
        };
        MCManager.prototype.getMCRess = function (armtp, resName, urls, tps) {
            var self = this;
            urls.push(self.getMCUrl(armtp, resName));
            tps.push("mc" /* MC */);
        };
        //---------------------------------- 使用计数 --------------------------------------------------
        // private createUsecnt( armtp:number, resName:string ):void
        // {
        //     let usecntData:any = this._usecnts[armtp];
        //     if( !(resName in usecntData) )
        //     {
        //         usecntData[resName] = 0;
        //     }
        // }
        MCManager.prototype.incUsecnt = function (armtp, resName) {
            var usecntData = this._usecnts[armtp];
            if (resName in usecntData) {
                usecntData[resName]++;
            }
            else {
                usecntData[resName] = 1;
            }
        };
        MCManager.prototype.decUsecnt = function (armtp, resName) {
            var usecntData = this._usecnts[armtp];
            if (usecntData.hasOwnProperty(resName)) {
                usecntData[resName]--;
            }
        };
        //-------------------------------------------------------------------------------------
        //加载 指定动作名字
        MCManager.prototype.getMCData = function (armtp, resName, aniName) {
            var self = this;
            var mcResData = self._mcRess[armtp][resName];
            if (mcResData) {
                return self._getMCData(mcResData, armtp, resName, aniName);
            }
            return null;
        };
        MCManager.prototype.hasMCRes = function (armtp, resName) {
            return !!this._mcRess[armtp][resName];
        };
        MCManager.prototype._getMCData = function (mcResData, armtp, resName, aniName) {
            aniName = aniName || "mc";
            var clips = mcResData.clips;
            var clipData = clips[aniName];
            if (typeof clipData == "undefined") {
                var sheet = mcResData.sheet;
                if (sheet) {
                    var mcData = mcResData.conf[aniName];
                    var res = mcData.res || mcResData.conf.res;
                    clipData = new TRain.MovieClipData(mcData, res, sheet);
                    clipData.resName = resName;
                    clipData.aniName = aniName;
                    clips[aniName] = clipData;
                }
                else {
                    clipData = null;
                    clips[aniName] = clipData;
                }
            }
            if (clipData) {
                this.incUsecnt(armtp, resName);
            }
            return clipData;
        };
        //加载 指定动作名字
        MCManager.prototype.getMCDataAsync = function (armtp, resName, finBack, thisObj, aniName) {
            var self = this;
            var mcRess = self._mcRess[armtp];
            var mcResData = mcRess[resName];
            if (mcResData) {
                var clipData = self._getMCData(mcResData, armtp, resName, aniName);
                TRain.core.addNextDo(finBack, thisObj, clipData, armtp);
                return;
            }
            var loadCallback = function (succ, armtp, resName) {
                var mcResData = self._mcRess[armtp][resName];
                var clipData = self._getMCData(mcResData, armtp, resName, aniName);
                finBack.call(thisObj, clipData, armtp);
            };
            self.loadRessImpl(armtp, resName, loadCallback, self);
        };
        //加载 指定资源名字
        MCManager.prototype.loadMCs = function (loadInfos, callback, thisObj, args) {
            var self = this;
            var loadCnt = loadInfos.length;
            var needLoadInfos = [];
            var loadInfo;
            for (var i = 0; i < loadCnt; ++i) {
                loadInfo = loadInfos[i];
                if (!self.hasMCRes(loadInfo.mcTp, loadInfo.resName)) {
                    needLoadInfos.push(loadInfo);
                }
            }
            loadCnt = needLoadInfos.length;
            if (loadCnt == 0) {
                if (callback != null)
                    TRain.core.addNextDo(callback, thisObj, true, args);
                return;
            }
            var loadCallback;
            if (callback != null) {
                var succ_1 = true;
                var tmpObj_1 = thisObj;
                loadCallback = function (success, armtp, resName) {
                    loadCnt--;
                    if (!success)
                        succ_1 = false;
                    if (loadCnt <= 0) {
                        callback.call(tmpObj_1, succ_1, args);
                    }
                };
                thisObj = self;
            }
            for (var i = 0, len = loadCnt; i < len; ++i) {
                loadInfo = needLoadInfos[i];
                self.loadRessImpl(loadInfo.mcTp, loadInfo.resName, loadCallback, self);
            }
        };
        //加载 指定资源名字
        MCManager.prototype.loadMCRes = function (armtp, resName, callback, thisObj) {
            var self = this;
            if (self.hasMCRes(armtp, resName)) {
                if (callback != null)
                    TRain.core.addNextDo(callback, thisObj, true, armtp, resName);
                return;
            }
            self.loadRessImpl(armtp, resName, callback, thisObj);
        };
        MCManager.prototype.loadRessImpl = function (armtp, resName, callback, thisObj) {
            var self = this;
            var loadingList = self._loadings[armtp];
            var loadings = loadingList[resName];
            var loadingData = { callback: callback, target: thisObj };
            if (loadings) {
                loadings.push(loadingData);
                return;
            }
            loadings = [loadingData];
            loadingList[resName] = loadings;
            var url = self.getMCUrl(armtp, resName);
            function onLoadFin(data) {
                self.onLoadArmResFin(data, armtp, resName);
            }
            TRain.assetMgr.getTex(url, onLoadFin, self, "mc" /* MC */);
        };
        MCManager.prototype.onLoadArmResFin = function (data, armtp, resName) {
            var self = this;
            var mcRess = self._mcRess[armtp];
            var mcResData = mcRess[resName];
            if (mcResData)
                return;
            mcResData = { conf: null, sheet: null, clips: {} };
            var success = !!data;
            if (success) {
                mcResData.conf = data.conf;
                mcResData.sheet = new egret.SpriteSheet(data);
            }
            mcRess[resName] = mcResData;
            var loadingList = self._loadings[armtp];
            var loadings = loadingList[resName];
            delete loadingList[resName];
            for (var i = loadings.length - 1; i >= 0; --i) {
                var loadData = loadings[i];
                loadData.callback.call(loadData.target, success, armtp, resName);
            }
        };
        MCManager.prototype.freeMCData = function (armtp, clip) {
            this.decUsecnt(armtp, clip.resName);
        };
        MCManager.prototype.disposeRess = function () {
            var self = this;
            var disposeTp = self._disposeTp;
            var delKeys = [];
            var mcRess = self._mcRess[disposeTp];
            var usecntData = self._usecnts[disposeTp];
            for (var resName in usecntData) {
                var usecnt = usecntData[resName];
                if (usecnt <= 0) {
                    var mcResData = mcRess[resName];
                    if (mcResData.sheet) {
                        delete mcRess[resName];
                        TRain.assetMgr.releaseTex(mcResData.sheet.$texture);
                        delKeys.push(resName);
                    }
                }
            }
            if (delKeys.length > 0) {
                for (var i = 0, n = delKeys.length; i < n; ++i) {
                    delete usecntData[delKeys[i]];
                }
            }
            disposeTp++;
            if (disposeTp < self._armTps.length) {
                self._disposeTp = disposeTp;
                self._timeoutHandler = TRain.core.addDelayDo(self.disposeRess, self, CONF.mcGCTm, 0, false);
            }
            else {
                self._disposeTp = 0;
                self._timeoutHandler = 0;
            }
        };
        //----------------------------------------------------------------------------------
        MCManager.prototype.add = function (mc) {
            var mcs = this._mcs;
            if (mcs.indexOf(mc) >= 0)
                return;
            mcs.push(mc);
        };
        MCManager.prototype.remove = function (mc) {
            var mcs = this._mcs;
            var idx = mcs.indexOf(mc);
            if (idx >= 0) {
                mcs.splice(idx, 1);
            }
        };
        MCManager.prototype.advanceTime = function (tm) {
            var mcs = this._mcs;
            var length = mcs.length;
            if (length > 0) {
                for (var i = length - 1; i >= 0; --i) {
                    var mc = mcs[i];
                    //remove 可能会同时删除多个
                    if (mc)
                        mc.advanceTime(tm);
                }
            }
        };
        return MCManager;
    }());
    TRain.MCManager = MCManager;
    __reflect(MCManager.prototype, "TRain.MCManager");
    TRain.mcMgr = new MCManager();
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var MovieClip = (function (_super) {
        __extends(MovieClip, _super);
        function MovieClip() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.$MovieClip = [
                null,
                null,
                egret.Bitmap.defaultSmoothing,
                false,
                0,
                0,
                0,
                0,
                0,
                0,
            ];
            //self.$renderRegion = new egret.sys.Region();
            self.$renderNode = new egret.sys.BitmapNode();
            return _this;
        }
        MovieClip.prototype.dispose = function () {
            var values = this.$MovieClip;
            values[0 /* bitmapData */] = null;
            values[1 /* movieClipData */] = null;
        };
        Object.defineProperty(MovieClip.prototype, "smoothing", {
            get: function () {
                return this.$MovieClip[2 /* smoothing */];
            },
            set: function (value) {
                value = !!value;
                this.$MovieClip[2 /* smoothing */] = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "totalFrames", {
            get: function () {
                return this.$MovieClip[7 /* totalFrames */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "currentFrame", {
            get: function () {
                return this.$MovieClip[8 /* currFrame */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "frameRate", {
            get: function () {
                var intervalTime = this.$MovieClip[4 /* intervalTime */];
                return intervalTime > 0 ? Math.floor(1000 / intervalTime) : 0;
            },
            //value <= 0 则还原默认
            set: function (value) {
                var intervalTime = 0;
                if (value <= 0) {
                    intervalTime = 1000 / value;
                }
                else {
                    var movieClipData = this.$MovieClip[1 /* movieClipData */];
                    if (movieClipData)
                        intervalTime = movieClipData.intervalTime;
                }
                this.$MovieClip[4 /* intervalTime */] = intervalTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "duration", {
            get: function () {
                var values = this.$MovieClip;
                return values[4 /* intervalTime */] * values[7 /* totalFrames */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "curSchedule", {
            //当前时间进度
            get: function () {
                var values = this.$MovieClip;
                return values[4 /* intervalTime */] * values[8 /* currFrame */] + values[9 /* passedTime */];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "isPlaying", {
            /**
             * MovieClip 实例当前是否正在播放
             * @version Egret 2.4
             * @platform Web,Native
             */
            get: function () {
                var values = this.$MovieClip;
                return values[3 /* isPlaying */] && values[7 /* totalFrames */] > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MovieClip.prototype, "movieClipData", {
            get: function () {
                return this.$MovieClip[1 /* movieClipData */];
            },
            /**
             * MovieClip数据源
             */
            set: function (clipData) {
                var self = this;
                var values = this.$MovieClip;
                if (values[1 /* movieClipData */] == clipData) {
                    return;
                }
                values[6 /* startFrame */] = 0;
                values[8 /* currFrame */] = 0;
                values[9 /* passedTime */] = 0;
                values[1 /* movieClipData */] = clipData;
                if (clipData) {
                    values[4 /* intervalTime */] = clipData.intervalTime;
                    values[7 /* totalFrames */] = clipData.numFrames;
                }
                else {
                    values[4 /* intervalTime */] = 0;
                    values[7 /* totalFrames */] = 0;
                }
                self.updateDisplay();
            },
            enumerable: true,
            configurable: true
        });
        //-------------------------------------------- label -----------------------------------------
        MovieClip.prototype.getFrameLabelByName = function (labelName) {
            var movieClipData = this.$MovieClip[1 /* movieClipData */];
            if (!movieClipData)
                return;
            var frameLabels = movieClipData.labels;
            if (frameLabels) {
                var outputFramelabel = null;
                for (var i = 0, n = frameLabels.length; i < n; i++) {
                    outputFramelabel = frameLabels[i];
                    if (outputFramelabel.name == labelName) {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        };
        MovieClip.prototype.getFrameLabelByFrame = function (frame) {
            var movieClipData = this.$MovieClip[1 /* movieClipData */];
            if (!movieClipData)
                return;
            var frameLabels = movieClipData.labels;
            if (frameLabels) {
                var outputFramelabel = null;
                for (var i = 0; i < frameLabels.length; i++) {
                    outputFramelabel = frameLabels[i];
                    if (outputFramelabel.frame == frame) {
                        return outputFramelabel;
                    }
                }
            }
            return null;
        };
        MovieClip.prototype.getFrameLabelForFrame = function (frame) {
            var movieClipData = this.$MovieClip[1 /* movieClipData */];
            if (!movieClipData)
                return null;
            var outputFrameLabel = null;
            var frameLabels = movieClipData.labels;
            if (frameLabels) {
                for (var i = 0; i < frameLabels.length; i++) {
                    var tempFrameLabel = frameLabels[i];
                    if (tempFrameLabel.frame > frame) {
                        return outputFrameLabel;
                    }
                    outputFrameLabel = tempFrameLabel;
                }
            }
            return outputFrameLabel;
        };
        //labelName 为null 表示清除
        MovieClip.prototype.setPlayLabel = function (labelName) {
            var values = this.$MovieClip;
            var movieClipData = values[1 /* movieClipData */];
            if (!movieClipData)
                return null;
            var startFrame = 0;
            var endFrame = 0;
            if (labelName) {
                var frameLabels = movieClipData.labels;
                if (frameLabels) {
                    var outputFramelabel = null;
                    for (var i = 0; i < frameLabels.length; i++) {
                        outputFramelabel = frameLabels[i];
                        if (labelName == outputFramelabel.name) {
                            startFrame = outputFramelabel.frame;
                            endFrame = outputFramelabel.end;
                            break;
                        }
                    }
                }
            }
            values[6 /* startFrame */] = startFrame;
            if (endFrame == 0)
                endFrame = movieClipData.numFrames - 1;
            var totalFrames = endFrame > startFrame ? endFrame - startFrame + 1 : 0;
            values[7 /* totalFrames */] = totalFrames;
            if (startFrame != values[8 /* currFrame */]) {
                values[8 /* currFrame */] = startFrame;
                this.updateDisplay();
            }
        };
        //--------------------------------------------  ctrl ---------------------------
        MovieClip.prototype.stop = function () {
            this.$MovieClip[3 /* isPlaying */] = false;
        };
        // playTimes {number} 动画播放次数(0:循环播放, >=1:播放次数, NaN:使用动画数据中的播放时间), 默认值：NaN
        MovieClip.prototype.gotoAndPlay = function (frame, playTimes) {
            if (frame === void 0) { frame = 0; }
            if (playTimes === void 0) { playTimes = NaN; }
            var self = this;
            var values = self.$MovieClip;
            var movieClipData = values[1 /* movieClipData */];
            if (!movieClipData)
                return;
            if (isNaN(playTimes)) {
                playTimes = movieClipData.loop;
            }
            values[3 /* isPlaying */] = true;
            values[5 /* playTimes */] = playTimes;
            values[9 /* passedTime */] = 0;
            self.gotoFrame(frame);
        };
        // playTimes {number} 动画播放次数(0:循环播放, >=1:播放次数, NaN:使用动画数据中的播放时间), 默认值：NaN
        MovieClip.prototype.gotoTmAndPlay = function (tm, playTimes) {
            if (tm === void 0) { tm = 0; }
            if (playTimes === void 0) { playTimes = NaN; }
            var self = this;
            var values = self.$MovieClip;
            var movieClipData = values[1 /* movieClipData */];
            if (!movieClipData)
                return;
            if (isNaN(playTimes)) {
                playTimes = movieClipData.loop;
            }
            values[3 /* isPlaying */] = true;
            values[5 /* playTimes */] = playTimes;
            var intervalTime = values[4 /* intervalTime */];
            var advanceFrame = Math.floor(tm / intervalTime);
            values[9 /* passedTime */] = tm % intervalTime;
            self.gotoFrame(advanceFrame % values[7 /* totalFrames */]);
        };
        //frame < 0 时 保持当前状态
        MovieClip.prototype.gotoAndStop = function (frame) {
            var self = this;
            var values = self.$MovieClip;
            values[3 /* isPlaying */] = false;
            if (!values[1 /* movieClipData */])
                return;
            values[9 /* passedTime */] = 0;
            self.gotoFrame(frame);
        };
        MovieClip.prototype.gotoFrame = function (frame) {
            var values = this.$MovieClip;
            if (frame < 0) {
                frame = 0;
            }
            else {
                var startFrame = values[6 /* startFrame */];
                var maxFrame = startFrame + values[7 /* totalFrames */] - 1;
                if (frame > maxFrame)
                    frame = maxFrame;
            }
            if (values[8 /* currFrame */] == frame) {
                return;
            }
            values[8 /* currFrame */] = frame;
            this.updateDisplay();
        };
        MovieClip.prototype.advanceTime = function (tm) {
            var self = this;
            var values = self.$MovieClip;
            var totalFrames = values[7 /* totalFrames */];
            if (!(values[3 /* isPlaying */] && totalFrames > 0))
                return;
            var passedTime = tm + values[9 /* passedTime */];
            var intervalTime = values[4 /* intervalTime */];
            var advanceFrame = Math.floor(passedTime / intervalTime);
            if (advanceFrame <= 0) {
                values[9 /* passedTime */] = passedTime;
                return;
            }
            values[9 /* passedTime */] = passedTime % intervalTime;
            var startFrame = values[6 /* startFrame */];
            var endFrame = startFrame + totalFrames - 1;
            advanceFrame = advanceFrame % totalFrames;
            var toFrame = values[8 /* currFrame */];
            var frameEvents = values[1 /* movieClipData */].events;
            var eventPool = [];
            var playTimes = values[5 /* playTimes */];
            var finish = false;
            for (var i = 0; i < advanceFrame; ++i) {
                toFrame++;
                if (toFrame > endFrame) {
                    if (playTimes <= 0) {
                        eventPool.push({ type: egret.Event.LOOP_COMPLETE });
                        toFrame = startFrame;
                    }
                    else {
                        playTimes--;
                        if (playTimes > 0) {
                            eventPool.push({ type: egret.Event.LOOP_COMPLETE, data: playTimes });
                            toFrame = startFrame;
                        }
                        else {
                            toFrame = endFrame;
                            finish = true;
                            eventPool.push({ type: egret.Event.COMPLETE });
                            break;
                        }
                    }
                }
                if (frameEvents) {
                    var frameEvent = frameEvents[toFrame];
                    if (frameEvent) {
                        eventPool.push({ type: "frame_label" /* FRAME_LABEL */, data: frameEvent });
                    }
                }
            }
            values[5 /* playTimes */] = playTimes;
            values[8 /* currFrame */] = toFrame;
            self.updateDisplay();
            if (finish) {
                self.stop();
            }
            if (eventPool.length > 0) {
                var length_5 = eventPool.length;
                for (var i = 0; i < length_5; ++i) {
                    var eventData = eventPool[i];
                    self.dispatchEventWith(eventData.type, false, eventData.data);
                }
            }
        };
        MovieClip.prototype.updateDisplay = function () {
            var values = this.$MovieClip;
            var oldBitmapData = values[0 /* bitmapData */];
            var movieClipData = values[1 /* movieClipData */];
            var newBitmapData;
            if (movieClipData) {
                newBitmapData = movieClipData.getFrameTex(values[8 /* currFrame */]);
            }
            if (oldBitmapData != newBitmapData) {
                values[0 /* bitmapData */] = newBitmapData;
                this.$renderDirty = true;
            }
        };
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
        MovieClip.prototype.$updateRenderNode = function () {
            var self = this;
            var values = self.$MovieClip;
            var texture = values[0 /* bitmapData */];
            if (texture) {
                var offsetX = Math.round(texture.$offsetX);
                var offsetY = Math.round(texture.$offsetY);
                var bitmapWidth = texture.$bitmapWidth;
                var bitmapHeight = texture.$bitmapHeight;
                var textureWidth = texture.$getTextureWidth();
                var textureHeight = texture.$getTextureHeight();
                var destW = Math.round(texture.$getScaleBitmapWidth());
                var destH = Math.round(texture.$getScaleBitmapHeight());
                var sourceWidth = texture.$sourceWidth;
                var sourceHeight = texture.$sourceHeight;
                egret.sys.BitmapNode.$updateTextureData(self.$renderNode, texture.$bitmapData, texture.$bitmapX, texture.$bitmapY, bitmapWidth, bitmapHeight, offsetX, offsetY, textureWidth, textureHeight, destW, destH, sourceWidth, sourceHeight, egret.BitmapFillMode.SCALE, values[2 /* smoothing */]);
            }
        };
        /**
         * @private
         */
        MovieClip.prototype.$measureContentBounds = function (bounds) {
            var texture = this.$MovieClip[0 /* bitmapData */];
            if (texture) {
                var x = texture._offsetX;
                var y = texture._offsetY;
                var w = texture.$getTextureWidth();
                var h = texture.$getTextureHeight();
                bounds.setTo(x, y, w, h);
            }
            else {
                bounds.setEmpty();
            }
        };
        return MovieClip;
    }(egret.DisplayObject));
    TRain.MovieClip = MovieClip;
    __reflect(MovieClip.prototype, "TRain.MovieClip");
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var MovieClipData = (function () {
        function MovieClipData(mcData, texData, sheet) {
            var self = this;
            self.numFrames = 0;
            self.loop = 0;
            self.intervalTime = 0;
            self.duration = 0;
            self.frames = [];
            self._texData = texData;
            self._sheet = sheet;
            //self._mcData = mcData;
            if (mcData) {
                self.fillMCData(mcData);
            }
        }
        MovieClipData.prototype.clone = function (reverse) {
            var self = this;
            var mc = new MovieClipData(null, self._texData, self._sheet);
            mc.numFrames = self.numFrames;
            mc.loop = self.loop;
            mc.frameRate = self.frameRate;
            mc.intervalTime = self.intervalTime;
            mc.duration = self.duration;
            var frames = self.frames.concat();
            mc.frames = reverse ? frames.reverse() : frames;
            mc.labels = self.labels;
            mc.events = self.events;
            mc.aniName = self.aniName;
            mc.resName = self.resName;
            return mc;
        };
        MovieClipData.prototype.getKeyFrame = function (frame) {
            return this.frames[frame];
        };
        MovieClipData.prototype.getFrameTex = function (frame) {
            var frameData = this.getKeyFrame(frame);
            if (frameData.res) {
                var outputTexture = this.getTex(frameData.res);
                outputTexture.$offsetX = frameData.x | 0;
                outputTexture.$offsetY = frameData.y | 0;
                return outputTexture;
            }
            return null;
        };
        MovieClipData.prototype.getTex = function (resName) {
            var self = this;
            var texture = self._sheet.getTexture(resName);
            if (!texture) {
                var texData = self._texData[resName];
                texture = self._sheet.createTexture(resName, texData.x, texData.y, texData.w, texData.h);
            }
            return texture;
        };
        MovieClipData.prototype.fillMCData = function (mcData) {
            var self = this;
            var frameRate = mcData.frameRate || 24;
            self.frameRate = frameRate;
            self.intervalTime = 1000 / frameRate;
            self.loop = mcData.loop || 0;
            self.fillFramesData(mcData.frames);
            self.fillFramesEvent(mcData.events);
            self.labels = mcData.labels;
        };
        MovieClipData.prototype.fillFramesData = function (framesData) {
            var self = this;
            var frames = self.frames;
            var length = framesData ? framesData.length : 0;
            for (var i = 0; i < length; i++) {
                var frameData = framesData[i];
                frames.push(frameData);
                if (frameData.duration) {
                    var duration = frameData.duration;
                    if (duration > 1) {
                        for (var j = 1; j < duration; j++) {
                            frames.push(frameData);
                        }
                    }
                }
            }
            length = frames.length;
            self.numFrames = length;
            self.duration = length * self.intervalTime;
        };
        MovieClipData.prototype.fillFramesEvent = function (eventDatas) {
            var length = eventDatas ? eventDatas.length : 0;
            if (length > 0) {
                var eventList = {};
                for (var i = 0; i < length; i++) {
                    var eventData = eventDatas[i];
                    eventList[eventData.frame] = eventData;
                }
                this.events = eventList;
            }
        };
        return MovieClipData;
    }());
    TRain.MovieClipData = MovieClipData;
    __reflect(MovieClipData.prototype, "TRain.MovieClipData");
})(TRain || (TRain = {}));
/**
 * Created by wjdeng on 2016/1/5.
 */
var TRain;
(function (TRain) {
    var ActionTween = (function (_super) {
        __extends(ActionTween, _super);
        function ActionTween() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ActionTween.prototype.setEaseFun = function (fun) {
            this._easeFun = fun;
        };
        ActionTween.prototype.update = function (tm) {
            var self = this;
            var easeFun = self._easeFun;
            if (easeFun)
                tm = easeFun(tm);
            self.doUpdate(tm);
        };
        ActionTween.prototype.doUpdate = function (tm) {
        };
        return ActionTween;
    }(TRain.Action));
    TRain.ActionTween = ActionTween;
    __reflect(ActionTween.prototype, "TRain.ActionTween");
    var ActionTweenCall = (function (_super) {
        __extends(ActionTweenCall, _super);
        function ActionTweenCall() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.once = true; //只执行一次
            return _this;
        }
        ActionTweenCall.prototype.setCall = function (fun, tar) {
            this._cb = { fun: fun, tar: tar };
        };
        ActionTweenCall.prototype.clear = function () {
            var self = this;
            self._tar = null;
            self._cb = null;
        };
        ActionTweenCall.prototype.stop = function () {
            var self = this;
            self._tar = null;
            if (self.once) {
                self._cb = null;
            }
        };
        ActionTweenCall.prototype.doUpdate = function (tm) {
            var self = this;
            var cbData = self._cb;
            if (cbData) {
                cbData.fun.call(cbData.tar, tm);
            }
        };
        return ActionTweenCall;
    }(ActionTween));
    TRain.ActionTweenCall = ActionTweenCall;
    __reflect(ActionTweenCall.prototype, "TRain.ActionTweenCall");
    var ActionPropTween = (function (_super) {
        __extends(ActionPropTween, _super);
        function ActionPropTween(dur, times, props) {
            var _this = _super.call(this, dur, times) || this;
            _this._props = props;
            return _this;
        }
        // props name:{b, r}
        ActionPropTween.prototype.setProps = function (props) {
            this._props = props;
        };
        ActionPropTween.prototype.addProp = function (name, from, to) {
            var props = this._props;
            if (!props) {
                props = {};
                this._props = props;
            }
            props[name] = { b: from, r: to - from };
        };
        ActionPropTween.prototype.start = function (tar) {
            _super.prototype.start.call(this, tar);
            var self = this;
            var props = self._props;
            if (props) {
                for (var name_3 in props) {
                    tar[name_3] = props[name_3].b;
                }
            }
        };
        ActionPropTween.prototype.doUpdate = function (tm) {
            var self = this;
            var tar = self._tar;
            var props = self._props;
            //if( tar && props )
            //{
            for (var name_4 in props) {
                var data = props[name_4];
                tar[name_4] = data.b + data.r * tm;
            }
            //}
        };
        return ActionPropTween;
    }(ActionTween));
    TRain.ActionPropTween = ActionPropTween;
    __reflect(ActionPropTween.prototype, "TRain.ActionPropTween");
    //-----------------------------------------------------------------
    var ActionPropTo = (function (_super) {
        __extends(ActionPropTo, _super);
        function ActionPropTo(dur, times, props) {
            var _this = _super.call(this, dur, times) || this;
            _this._toProps = props;
            return _this;
        }
        // props name:toval
        ActionPropTo.prototype.setProps = function (props) {
            this._toProps = props;
        };
        ActionPropTo.prototype.addProp = function (name, to) {
            var toProps = this._toProps;
            if (!toProps) {
                toProps = {};
                this._toProps = toProps;
            }
            toProps[name] = to;
        };
        ActionPropTo.prototype.start = function (tar) {
            _super.prototype.start.call(this, tar);
            var self = this;
            var toProps = self._toProps;
            var props = {};
            if (toProps) {
                for (var name_5 in toProps) {
                    var from = tar[name_5];
                    props[name_5] = { b: from, r: toProps[name_5] - from };
                }
            }
            self._props = props;
        };
        ActionPropTo.prototype.doUpdate = function (tm) {
            var self = this;
            var tar = self._tar;
            var props = self._props;
            //if( tar && props )
            //{
            for (var name_6 in props) {
                var data = props[name_6];
                tar[name_6] = data.b + data.r * tm;
            }
            //}
        };
        return ActionPropTo;
    }(ActionTween));
    TRain.ActionPropTo = ActionPropTo;
    __reflect(ActionPropTo.prototype, "TRain.ActionPropTo");
    //-------------------------------------------------------------------------
    var ActionSequence = (function (_super) {
        __extends(ActionSequence, _super);
        function ActionSequence(actions) {
            var _this = _super.call(this) || this;
            if (actions)
                _this.setActions(actions);
            return _this;
        }
        ActionSequence.prototype.setActions = function (actions) {
            var self = this;
            self._actions = actions;
            self._curIdx = 0;
            var duration = 0;
            for (var i = 0, n = actions.length; i < n; ++i) {
                duration += actions[i].duration;
            }
            self.duration = duration;
        };
        ActionSequence.prototype.addAction = function (action) {
            var self = this;
            var actions = self._actions;
            if (!actions) {
                actions = [];
                self._actions = actions;
            }
            actions.push(action);
            var duration = self._dur + action.duration;
            self.duration = duration;
        };
        ActionSequence.prototype.stop = function () {
            var self = this;
            var actions = self._actions;
            if (actions.length > self._curIdx) {
                actions[self._curIdx].stop();
            }
            _super.prototype.stop.call(this);
        };
        ActionSequence.prototype.stopToEnd = function () {
            var self = this;
            var actions = self._actions;
            for (var i = self._curIdx, len = actions.length; i < len; ++i) {
                actions[i].stopToEnd();
            }
            _super.prototype.stop.call(this);
        };
        ActionSequence.prototype.clear = function () {
            _super.prototype.clear.call(this);
            var self = this;
            var actions = self._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].clear();
            }
            actions.length = 0;
        };
        ActionSequence.prototype.start = function (tar) {
            _super.prototype.start.call(this, tar);
            var self = this;
            var action = self._actions[0];
            action.start(tar);
            //self._curDuration = action.duration;
            self._lastSplit = 0;
            self._curSplit = action.duration / self._dur;
            self._curIdx = 0;
        };
        ActionSequence.prototype.update = function (tm) {
            var self = this;
            var curIdx = self._curIdx;
            var actions = self._actions;
            while (curIdx < actions.length) {
                var curAction = actions[curIdx];
                var split = Math.min(1, self._curSplit + self._lastSplit);
                if (tm >= split) {
                    curAction.update(1);
                    curAction.stop();
                    curIdx++;
                    self._curIdx = curIdx;
                    if (curIdx < actions.length) {
                        var action = actions[curIdx];
                        action.start(self._tar);
                        //self._curDuration += action.duration;
                        self._lastSplit = split;
                        self._curSplit = action.duration / self._dur;
                    }
                }
                else {
                    curAction.update((tm - self._lastSplit) / self._curSplit);
                    break;
                }
            }
        };
        return ActionSequence;
    }(ActionTween));
    TRain.ActionSequence = ActionSequence;
    __reflect(ActionSequence.prototype, "TRain.ActionSequence");
    var ActionSpawn = (function (_super) {
        __extends(ActionSpawn, _super);
        function ActionSpawn(actions) {
            var _this = _super.call(this) || this;
            if (actions)
                _this.setActions(actions);
            return _this;
        }
        ActionSpawn.prototype.setActions = function (actions) {
            var self = this;
            var maxDuration = 0;
            var action;
            var i = 0, n = actions.length;
            for (; i < n; ++i) {
                action = actions[i];
                if (maxDuration < action.duration) {
                    maxDuration = action.duration;
                }
            }
            var sqAction;
            var delayAction;
            var newActions = [];
            for (i = 0; i < n; ++i) {
                action = actions[i];
                if (action.duration < maxDuration) {
                    sqAction = new ActionSequence();
                    delayAction = new TRain.Action();
                    delayAction.duration = maxDuration - action.duration;
                    sqAction.setActions([action, delayAction]);
                    newActions.push(sqAction);
                }
                else {
                    newActions.push(action);
                }
            }
            self._actions = newActions;
            self.duration = maxDuration;
        };
        ActionSpawn.prototype.stop = function () {
            var actions = this._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].stop();
            }
            _super.prototype.stop.call(this);
        };
        ActionSpawn.prototype.stopToEnd = function () {
            var actions = this._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].stopToEnd();
            }
            _super.prototype.stop.call(this);
        };
        ActionSpawn.prototype.clear = function () {
            _super.prototype.clear.call(this);
            var self = this;
            var actions = self._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].clear();
            }
            actions.length = 0;
        };
        ActionSpawn.prototype.start = function (tar) {
            _super.prototype.start.call(this, tar);
            var actions = this._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].start(tar);
            }
        };
        ActionSpawn.prototype.update = function (tm) {
            var actions = this._actions;
            for (var i = 0, n = actions.length; i < n; ++i) {
                actions[i].update(tm);
            }
        };
        return ActionSpawn;
    }(ActionTween));
    TRain.ActionSpawn = ActionSpawn;
    __reflect(ActionSpawn.prototype, "TRain.ActionSpawn");
})(TRain || (TRain = {}));
/**
 * Created by wjdeng on 2015/11/4.
 */
var TRain;
(function (TRain) {
    var ImageSet = (function () {
        function ImageSet(name) {
            var self = this;
            self.name = name;
            self._cbs = [];
            self._subTexs = {};
            self._refCnt = 0;
        }
        ImageSet.prototype.getTexture = function (subname, compFunc, thisObject) {
            var self = this;
            if (!self._texData) {
                var callbacks = self._cbs;
                callbacks.push({ name: subname, comp: compFunc, thisObj: thisObject });
                if (callbacks.length === 1) {
                    TRain.assetMgr.getTex(CONF.sheetUrl + self.name + ".st", self.loadImageSetFin, self, "st" /* SHEET */);
                }
                return;
            }
            var subTexData = self._getTexture(subname);
            compFunc.call(thisObject, subTexData);
        };
        ImageSet.prototype._getTexture = function (subname) {
            var self = this;
            var subTexData = self._subTexs[subname];
            if (!subTexData) {
                var texData = self._texData;
                var config = texData.conf[subname];
                if (config) {
                    subTexData = new TRain.TexData();
                    subTexData.name = subname;
                    subTexData.pname = self.name;
                    subTexData.$bitmapData = texData.$bitmapData;
                    //会被拉伸的纯色图片，以"mk_"为前缀，处理时会向内缩1象素， 避免与周围色融合
                    if (subname.indexOf("mk_") == 0) {
                        //高拉伸
                        if (subname.indexOf("mk_h_") == 0) {
                            subTexData.$initData(config.x, config.y + 1, config.w, config.h - 2, config.ox, config.oy, config.sw, config.sh - 2, texData.$sourceWidth, texData.$sourceHeight);
                        }
                        else if (subname.indexOf("mk_w_") == 0) {
                            subTexData.$initData(config.x + 1, config.y, config.w - 2, config.h, config.ox, config.oy, config.sw - 2, config.sh, texData.$sourceWidth, texData.$sourceHeight);
                        }
                        else {
                            subTexData.$initData(config.x + 1, config.y + 1, config.w - 2, config.h - 2, config.ox, config.oy, config.sw - 2, config.sh - 2, texData.$sourceWidth, texData.$sourceHeight);
                        }
                    }
                    else {
                        subTexData.$initData(config.x, config.y, config.w, config.h, config.ox, config.oy, config.sw, config.sh, texData.$sourceWidth, texData.$sourceHeight);
                        if (config["scale9grid"]) {
                            var str = config["scale9grid"];
                            var list = str.split(",");
                            subTexData["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
                        }
                    }
                    self._subTexs[subname] = subTexData;
                }
            }
            if (subTexData) {
                subTexData.$addRef();
                self._refCnt++;
            }
            else {
                egret.log("subTexture not find  subname=" + subname + "  name=" + self.name);
            }
            return subTexData;
        };
        ImageSet.prototype.loadImageSetFin = function (texData) {
            var self = this;
            var callbacks = self._cbs;
            var length = callbacks.length;
            var callData;
            if (texData) {
                self._texData = texData;
                var texList = self._subTexs;
                var bitmapData = texData.$bitmapData;
                for (var key in texList) {
                    var subTexData = texList[key];
                    subTexData.$bitmapData = bitmapData;
                }
                var i = 0;
                for (i = 0; i < length; ++i) {
                    callData = callbacks[i];
                    callData.subTexData = self._getTexture(callData.name);
                }
                for (i = 0; i < length; ++i) {
                    callData = callbacks[i];
                    callData.comp.call(callData.thisObj, callData.subTexData);
                }
            }
            else {
                for (var i = 0; i < length; ++i) {
                    callData = callbacks[i];
                    callData.comp.call(callData.thisObj, null);
                }
            }
            callbacks.length = 0;
        };
        ImageSet.prototype.releaseBubTex = function (texData) {
            texData.$subRef();
            var self = this;
            self._refCnt--;
            if (true) {
                if (self._refCnt < 0) {
                    egret.error("warning releaseBubTex refCnt is navigate");
                }
            }
            if (self._refCnt <= 0) {
                var texList = self._subTexs;
                for (var key in texList) {
                    var subTexData = texList[key];
                    subTexData.$bitmapData = null;
                    if (true) {
                        if (texData.$hasRef()) {
                            egret.error("ImageSet doGC  ref has user name=" + self.name + "." + texData.name);
                        }
                    }
                }
                texData = self._texData;
                self._texData = null;
                TRain.assetMgr.releaseTex(texData);
            }
        };
        return ImageSet;
    }());
    TRain.ImageSet = ImageSet;
    __reflect(ImageSet.prototype, "TRain.ImageSet");
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var UITheme;
    (function (UITheme) {
        var _skinMap = {};
        var _skinConfs = {};
        var _initFin;
        var _initTar;
        var _curGp;
        function loadInitConf(configURL, initFin, initTar) {
            _initFin = initFin;
            _initTar = initTar;
            RES.getResByUrl(configURL, onConfigLoaded, UITheme, RES.ResourceItem.TYPE_JSON);
        }
        UITheme.loadInitConf = loadInitConf;
        function setCurGp(gpNm) {
            _curGp = gpNm;
        }
        UITheme.setCurGp = setCurGp;
        function addSkinConf(addConfs, gpNm) {
            var skinConfs = _skinConfs;
            if (gpNm) {
                var profix = gpNm + ".";
                for (var key in addConfs) {
                    skinConfs[profix + key] = addConfs[key];
                }
            }
            else {
                for (var key in addConfs) {
                    skinConfs[key] = addConfs[key];
                }
            }
        }
        UITheme.addSkinConf = addSkinConf;
        function getSkin(name) {
            var cls = _skinMap[name];
            if (cls)
                return cls;
            cls = parseSkin(name);
            if (cls)
                return cls;
            if (_curGp) {
                var fullName = _curGp + "." + name;
                cls = _skinMap[fullName];
                if (cls)
                    return cls;
                cls = parseSkin(fullName);
            }
            return cls;
        }
        UITheme.getSkin = getSkin;
        function onConfigLoaded(data, url) {
            if (true) {
                if (!data) {
                    egret.$error(3000);
                }
            }
            addSkinConf(data);
            RES.destroyRes(url);
            //egret.startTick( updateInitParse, self );
            onInited();
        }
        function onInited() {
            if (_initFin) {
                _initFin.call(_initTar);
                _initFin = null;
                _initTar = null;
            }
        }
        // function updateInitParse( tm:number ):boolean
        // {
        //     let initSkins = _skinConfs;
        //     let handle = false;
        //     for( let key in initSkins )
        //     {
        //         parseSkin( key );
        //         handle = true;
        //         break;
        //     }
        //     if( !handle )
        //     {
        //         onInited();
        //         egret.stopTick( updateInitParse, self );
        //     }
        //     return false;
        // }
        function parseSkin(name) {
            var skinConfs = _skinConfs;
            var skinConf = skinConfs[name];
            if (!skinConf)
                return null;
            delete skinConfs[name];
            skinConf = skinConf.replace(/#4/g, "new cui.");
            skinConf = skinConf.replace(/#3/g, "return ");
            skinConf = skinConf.replace(/#2/g, "this.");
            skinConf = skinConf.replace(/#1/g, "function(");
            var cls = parse(skinConf);
            _skinMap[name] = cls;
            return cls;
        }
        function parse(code) {
            var clazz;
            try {
                clazz = eval(code);
                code = null;
            }
            catch (e) {
                if (true) {
                    egret.log(e);
                }
                return null;
            }
            return clazz;
        }
    })(UITheme = TRain.UITheme || (TRain.UITheme = {}));
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    var WebVerController = (function () {
        function WebVerController() {
        }
        WebVerController.prototype.fetchVersion = function (callback) {
            var self = this;
            if (self._verInfo || !CONF.verFile) {
                callback.onSuccess(null);
                return;
            }
            self._cb = callback;
            var request = new egret.HttpRequest();
            request.addEventListener(egret.Event.COMPLETE, self.onLoadFinish, self);
            request.addEventListener(egret.IOErrorEvent.IO_ERROR, self.onLoadFinish, self);
            request.responseType = egret.HttpResponseType.TEXT;
            request.open(CONF.verFile);
            request.send();
        };
        WebVerController.prototype.onLoadFinish = function (event) {
            var self = this;
            var loadSucess = false;
            if (event.type == egret.Event.COMPLETE) {
                try {
                    var request = (event.target);
                    self._verInfo = JSON.parse(request.response);
                    loadSucess = true;
                }
                catch (e) {
                    egret.log("version parse fail");
                }
            }
            else {
                egret.log("version load fail");
            }
            var cbData = self._cb;
            if (loadSucess) {
                cbData.onSuccess(null);
            }
            else {
                cbData.onFail(1, null);
            }
            self._cb = null;
        };
        WebVerController.prototype.addWebVer = function (addVerList) {
            var verInfo = this._verInfo;
            for (var key in addVerList) {
                var addVer = addVerList[key];
                var verList = verInfo[key];
                if (verList) {
                    for (var subKey in addVer) {
                        verList[subKey] = addVer[subKey];
                    }
                }
                else {
                    verInfo[key] = addVer;
                }
            }
        };
        /**
         * 获取所有有变化的文件
         * @returns {Array<any>}
         */
        WebVerController.prototype.getChangeList = function () {
            return [];
        };
        WebVerController.prototype.getVirtualUrl = function (url) {
            var idx = url.lastIndexOf(".");
            var postfix = url.substring(idx + 1);
            //带了版本号的
            if (postfix.indexOf("?") > 0)
                return CONF.resHome + url;
            var verInfo = this._verInfo;
            if (verInfo) {
                var verStr = void 0;
                var typeVerMap = verInfo[postfix];
                if (typeVerMap) {
                    var pathStr = url.substring(0, idx);
                    verStr = typeVerMap[pathStr];
                }
                if (!verStr)
                    verStr = verInfo.ver;
                if (verStr) {
                    return CONF.resHome + url.substring(0, idx) + "_" + verStr + "." + postfix;
                }
            }
            return CONF.resHome + url;
        };
        return WebVerController;
    }());
    TRain.WebVerController = WebVerController;
    __reflect(WebVerController.prototype, "TRain.WebVerController", ["RES.VersionController", "RES.IVersionController"]);
})(TRain || (TRain = {}));
/**
 * Created by wjdeng on 2015/10/29.
 */
var cui;
(function (cui) {
    var BitmapLabel = (function (_super) {
        __extends(BitmapLabel, _super);
        function BitmapLabel(text) {
            var _this = _super.call(this) || this;
            var self = _this;
            self._fontChanged = false;
            self.$BC = [
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                NaN,
                false,
            ];
            self._invalidProps = 0;
            //self.$BitmapText[egret.sys.BitmapTextKeys.textLinesChanged] = true;
            if (text)
                self.$setText(text);
            return _this;
        }
        Object.defineProperty(BitmapLabel.prototype, "filterNm", {
            get: function () {
                return this.$BC[12 /* filterNm */];
            },
            set: function (nm) {
                this.$BC[12 /* filterNm */] = nm;
                this.filters = nm && nm.length > 0 ? cui.uiMgr.getFilters(nm) : null;
            },
            enumerable: true,
            configurable: true
        });
        BitmapLabel.prototype.$onAddToStage = function (stage, nestLevel) {
            _super.prototype.$onAddToStage.call(this, stage, nestLevel);
            var self = this;
            if (self._fontChanged) {
                self.parseFont();
            }
            if (self._invalidProps > 0) {
                self.validateProps();
            }
        };
        //--------------------------------------------------
        BitmapLabel.prototype.$setText = function (value) {
            var result = _super.prototype.$setText.call(this, value);
            if (result) {
                this.invalidateProps(128 /* text */);
            }
            return result;
        };
        BitmapLabel.prototype.$setFont = function (value) {
            var self = this;
            if (self._font == value) {
                return false;
            }
            self._font = value;
            if (self.$stage) {
                self.parseFont();
            }
            else {
                self._fontChanged = true;
            }
            self.$fontStringChanged = true;
            return true;
        };
        BitmapLabel.prototype.parseFont = function () {
            var self = this;
            self._fontChanged = false;
            if (self._font) {
                TRain.assetMgr.getFont(self._font, self.onFontChanged, self);
            }
            else {
                self.$setFontData(null);
            }
        };
        BitmapLabel.prototype.onFontChanged = function (bitmapFont, font) {
            var self = this;
            if (font !== self._font) {
                return;
            }
            self.$setFontData(bitmapFont);
        };
        BitmapLabel.prototype.$setFontData = function (value) {
            var self = this;
            if (value == self.$font) {
                return false;
            }
            self.$font = value;
            if (self.text != "") {
                self.$invalidateContentBounds();
                self.invalidateProps(64 /* source */);
            }
            return true;
        };
        //-------------------------------------------------------------------
        BitmapLabel.prototype.dispose = function () {
            this._disposed = true;
        };
        //-------------------------------------------------------------
        BitmapLabel.prototype.$setWidth = function (value) {
            var ret = _super.prototype.$setWidth.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        BitmapLabel.prototype.$setHeight = function (value) {
            var ret = _super.prototype.$setHeight.call(this, value);
            if (ret) {
                this.invalidateProps(2 /* size */);
            }
            return ret;
        };
        Object.defineProperty(BitmapLabel.prototype, "txtKey", {
            //---------------------------------------------------------------------
            set: function (key) {
                var txt = TRain.langMgr.getTxtByKey(key);
                if (txt)
                    this.text = txt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "left", {
            get: function () {
                return this.$BC[0 /* left */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[0 /* left */] === value)
                    return;
                values[0 /* left */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "right", {
            /**
             * 距父级容器右边距离
             */
            get: function () {
                return this.$BC[2 /* right */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[2 /* right */] === value)
                    return;
                values[2 /* right */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "top", {
            get: function () {
                return this.$BC[1 /* top */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[1 /* top */] === value)
                    return;
                values[1 /* top */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "bottom", {
            /**
             * 距父级容器底部距离
             */
            get: function () {
                return this.$BC[3 /* bottom */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[3 /* bottom */] == value)
                    return;
                values[3 /* bottom */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "hCenter", {
            /**
             * 在父级容器中距水平中心位置的距离
             */
            get: function () {
                return this.$BC[4 /* hCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[4 /* hCenter */] === value)
                    return;
                values[4 /* hCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "vCenter", {
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            get: function () {
                return this.$BC[5 /* vCenter */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[5 /* vCenter */] === value)
                    return;
                values[5 /* vCenter */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "perWidth", {
            get: function () {
                return this.$BC[6 /* perWidth */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[6 /* perWidth */] === value)
                    return;
                values[6 /* perWidth */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "perHeight", {
            get: function () {
                return this.$BC[7 /* perHeight */];
            },
            set: function (value) {
                value = +value;
                var values = this.$BC;
                if (values[7 /* perHeight */] === value)
                    return;
                values[7 /* perHeight */] = value;
                this.setNeedPLayout();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BitmapLabel.prototype, "needPLayout", {
            get: function () {
                return this.$BC[8 /* needPLayout */];
            },
            enumerable: true,
            configurable: true
        });
        BitmapLabel.prototype.setNeedPLayout = function () {
            var self = this;
            var values = self.$BC;
            var parent = self.$parent;
            if (!values[8 /* needPLayout */]) {
                values[8 /* needPLayout */] = true;
                if (parent) {
                    parent.openLayout();
                }
            }
            if (parent) {
                parent.invalidateDL();
            }
        };
        //--------------------------------------------------
        BitmapLabel.prototype.invalidateProps = function (tp) {
            var self = this;
            if (self.$stage && !self._invalidPropsFlag) {
                self._invalidPropsFlag = true;
                cui.uiMgr.invalidateProperty(self);
            }
            self._invalidProps |= tp;
        };
        BitmapLabel.prototype.validateProps = function () {
            var self = this;
            var invalidateProps = self._invalidProps;
            if (invalidateProps != 0) {
                var values = self.$BC;
                if (values[8 /* needPLayout */] && self.$parent) {
                    if (self.text != "") {
                        self.$parent.invalidateDL();
                    }
                }
                self._invalidProps = 0;
                self._invalidPropsFlag = false;
            }
        };
        return BitmapLabel;
    }(egret.BitmapText));
    cui.BitmapLabel = BitmapLabel;
    __reflect(BitmapLabel.prototype, "cui.BitmapLabel", ["cui.IBaseCtrl", "cui.ILayout", "egret.DisplayObject"]);
})(cui || (cui = {}));
///<reference path="./SheetAnalyzer.ts" />
egret.BitmapFont.prototype.getTexture = function (name) {
    var self = this;
    var texture = self._textureMap[name];
    if (!texture) {
        var c = self.charList[name];
        if (!c) {
            var charTrans = self.charTrans;
            if (charTrans)
                c = self.charList[charTrans[name]];
        }
        if (c) {
            texture = self.createTexture(name, c.x, c.y, c.w, c.h, c.ox, c.oy, c.sw, c.sh);
            self._textureMap[name] = texture;
        }
    }
    return texture;
};
egret.BitmapFont.prototype._getFirstCharHeight = function () {
    var self = this;
    if (self.firstCharHeight == 0) {
        for (var str in self.charList) {
            var c = self.charList[str];
            if (c) {
                var sourceH = c.sw;
                if (sourceH === undefined) {
                    var h = c.h;
                    if (h === undefined) {
                        h = 0;
                    }
                    var offY = c.oy;
                    if (offY === undefined) {
                        offY = 0;
                    }
                    sourceH = h + offY;
                }
                if (sourceH <= 0) {
                    continue;
                }
                this.firstCharHeight = sourceH;
                break;
            }
        }
    }
    return this.firstCharHeight;
};
var TRain;
(function (TRain) {
    var FontAnalyzer = (function (_super) {
        __extends(FontAnalyzer, _super);
        function FontAnalyzer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FontAnalyzer.prototype.parseSpriteSheet = function (texData, jsonStr, name, otherStr) {
            var data = JSON.parse(jsonStr);
            var bitmapFont = new egret.BitmapFont(texData, data);
            if (otherStr) {
                bitmapFont["charTrans"] = JSON.parse(otherStr);
            }
            this.fileDic[name] = bitmapFont;
        };
        FontAnalyzer.prototype.destroyRes = function (name) {
            var fileDic = this.fileDic;
            var bitmapFont = fileDic[name];
            if (bitmapFont) {
                delete fileDic[name];
                bitmapFont.dispose();
                return true;
            }
            return false;
        };
        return FontAnalyzer;
    }(TRain.SheetAnalyzer));
    TRain.FontAnalyzer = FontAnalyzer;
    __reflect(FontAnalyzer.prototype, "TRain.FontAnalyzer");
    RES.registerAnalyzer("fnt" /* FONT */, FontAnalyzer);
})(TRain || (TRain = {}));
///<reference path="./SheetAnalyzer.ts" />
var TRain;
(function (TRain) {
    var MCAnalyzer = (function (_super) {
        __extends(MCAnalyzer, _super);
        function MCAnalyzer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MCAnalyzer.prototype.parseSpriteSheet = function (texData, dataStr, name) {
            var data = JSON.parse(dataStr);
            texData.name = name;
            texData.conf = data;
            this.fileDic[name] = texData;
        };
        return MCAnalyzer;
    }(TRain.SheetAnalyzer));
    TRain.MCAnalyzer = MCAnalyzer;
    __reflect(MCAnalyzer.prototype, "TRain.MCAnalyzer");
    RES.registerAnalyzer("mc" /* MC */, MCAnalyzer);
})(TRain || (TRain = {}));
var TRain;
(function (TRain) {
    // declare class Howl{
    //     constructor( data:{src:string[], loop?:boolean, volume?:number} );
    //     tag:number;
    //     playing();
    //     play();
    //     stop();
    //     unload();
    //     volume(val:number);
    // }
    var SoundManager = (function () {
        function SoundManager() {
            var self = this;
            self._active = true;
            self._curMusic = { sound: null, channel: null };
            self._sfxs = new CMap(); //url
            self._plays = new CMap();
            var stage = TRain.core.stage;
            stage.addEventListener(egret.Event.ACTIVATE, function () {
                self._active = true;
                if (self._musicState && self._musicNm) {
                    self.playMusic(self._musicNm, true);
                }
            }, self);
            stage.addEventListener(egret.Event.DEACTIVATE, function () {
                self._active = false;
                self.stopAllSFX();
                self.stopMusic();
            }, self);
        }
        Object.defineProperty(SoundManager.prototype, "musicState", {
            //-------------------开关
            get: function () {
                return this._musicState;
            },
            set: function (value) {
                var self = this;
                if (self._musicState == value)
                    return;
                self._musicState = value;
                if (value && self._active) {
                    //重新播放当前设置的背景音乐
                    self.playMusic(self._musicNm, true);
                }
                else {
                    //关闭背景音乐
                    self.stopMusic();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundManager.prototype, "sfxState", {
            get: function () {
                return this._sfxState;
            },
            set: function (value) {
                var self = this;
                if (self._sfxState == value)
                    return;
                self._sfxState = value;
                if (!value) {
                    //关闭当前特效声音
                    self.stopAllSFX();
                }
            },
            enumerable: true,
            configurable: true
        });
        SoundManager.prototype.getUrl = function (name) {
            return CONF.soundUrl + name + ".mp3";
        };
        /**
         * 播放背景音乐
         * @param url:string 背景音乐路径
         * */
        SoundManager.prototype.playMusic = function (name, force) {
            var self = this;
            if (!name || (self._musicNm == name && !force)) {
                return;
            }
            self._musicNm = name;
            if (!self._musicState || !self._active)
                return;
            self.stopMusic();
            var sound = new egret.Sound();
            sound.addEventListener(egret.Event.COMPLETE, function (event) {
                var sound = event.target;
                if (name != self._musicNm) {
                    sound.close();
                    return;
                }
                var curMusic = self._curMusic;
                var channel = sound.play();
                curMusic.sound = sound;
                curMusic.channel = channel;
            }, self);
            sound.load(RES.$getVirtualUrl(self.getUrl(name)));
        };
        /**
         * 关闭背景音乐
         * */
        SoundManager.prototype.stopMusic = function () {
            var self = this;
            var curMusic = self._curMusic;
            if (curMusic.channel) {
                curMusic.channel.stop();
                curMusic.channel = null;
            }
            if (curMusic.sound) {
                curMusic.sound.close();
                curMusic.sound = null;
            }
        };
        /**
         * 播放音效
         * @param url:string 音效路径
         * @param delay:number 延时多久后开始播放， 单位毫秒 默认为0
         * @param duration:number 持续时间。值若大于0，表示持续时间到了就关闭音效。0代表不做时间限制。单位毫秒。默认为0
         * @return number 当前音效序列id，可用于停止音效使用。
         * */
        SoundManager.prototype.playSFX = function (name, delay, duration) {
            if (delay === void 0) { delay = 0; }
            if (duration === void 0) { duration = 0; }
            var self = this;
            if (!self._sfxState || !self._active || !name)
                return 0;
            var uuid = SoundManager.UUID++;
            var soundConf = { nm: name, delay: delay, duration: duration, uuid: uuid };
            if (delay > 0) {
                TRain.core.addDelayDo(self._playSfx, self, delay, 0, false, soundConf);
            }
            else {
                self._playSfx(soundConf);
            }
            return uuid;
        };
        SoundManager.prototype.stopSFX = function (id) {
            this.rmvChannelById(id);
        };
        SoundManager.prototype.stopAllSFX = function () {
            var sfxMap = this._sfxs;
            var playings = sfxMap.values;
            for (var i = 0, n = playings.length; i < n; ++i) {
                var playing = playings[i];
                playing.stoped = true;
                if (playing.loaded) {
                    var channels = playing.channels.values;
                    for (var j = 0, m = channels.length; j < m; ++j) {
                        var channel = channels[j];
                        channel.stop();
                    }
                    playing.sound.close();
                }
            }
            sfxMap.clear();
            this._plays.clear();
        };
        SoundManager.prototype._playSfx = function (soundConf) {
            var self = this;
            if (!self._sfxState || !self._active)
                return;
            var uuid = soundConf.uuid;
            var duration = soundConf.duration;
            if (duration > 0) {
                TRain.core.addDelayDo(self.rmvChannelById, self, duration, 0, false, uuid);
            }
            var name = soundConf.nm;
            var sfxData = self._sfxs.get(name);
            if (sfxData) {
                if (!sfxData.loaded)
                    return;
                self.playImpl(sfxData, 1, soundConf.uuid);
                return;
            }
            var sound = new egret.Sound();
            var channels = new CMap();
            sfxData = { sound: sound, channels: channels, nm: name, loaded: false, stoped: false };
            self._sfxs.set(name, sfxData);
            self.addChannel(sfxData, null, uuid);
            var callback = function (event) {
                if (sfxData.stoped) {
                    sfxData.sound.close();
                }
                else {
                    sfxData.loaded = true;
                    var channels_1 = sfxData.channels;
                    if (channels_1.has(uuid)) {
                        self.playImpl(sfxData, 1, uuid);
                    }
                }
            };
            sound.addEventListener(egret.Event.COMPLETE, callback, self);
            var url = self.getUrl(name);
            sound.load(RES.$getVirtualUrl(url));
            return;
        };
        //------------------------------------------------------------------
        SoundManager.prototype.playImpl = function (playing, loops, uuid) {
            var self = this;
            var channel = playing.sound.play(0, loops);
            self.addChannel(playing, channel, uuid);
            channel.uuid = uuid;
            channel.addEventListener(egret.Event.SOUND_COMPLETE, self.onSoundComplete, self);
            playing.channels.set(uuid, channel);
        };
        SoundManager.prototype.addChannel = function (playing, channel, uuid) {
            playing.channels.set(uuid, channel);
            this._plays.set(uuid, playing);
        };
        SoundManager.prototype.rmvChannelById = function (uuid) {
            var playingMap = this._plays;
            var playing = playingMap.get(uuid);
            if (playing) {
                var channel = playing.channels.get(uuid);
                if (channel)
                    channel.stop();
                playing.channels.delete(uuid);
                playingMap.delete(uuid);
            }
        };
        SoundManager.prototype.onSoundComplete = function (event) {
            this.rmvChannelById(event.target.uuid);
        };
        SoundManager.prototype.gcRess = function () {
            var sfxMap = this._sfxs;
            var playings = sfxMap.values;
            var rmvs = [];
            var i = 0;
            for (i = playings.length - 1; i >= 0; --i) {
                var playing = playings[i];
                if (playing.channels.size <= 0) {
                    playing.sound.close();
                    rmvs.push(playing.nm);
                }
            }
            var rmvCnt = rmvs.length;
            if (rmvCnt > 0) {
                for (i = rmvCnt; i >= 0; --i) {
                    sfxMap.delete(rmvs[i]);
                }
            }
        };
        SoundManager.UUID = 1; //统一 channel id
        return SoundManager;
    }());
    TRain.SoundManager = SoundManager;
    __reflect(SoundManager.prototype, "TRain.SoundManager");
})(TRain || (TRain = {}));
var EaseUtil;
(function (EaseUtil) {
    function getPowIn(pow) {
        return function (t) {
            return Math.pow(t, pow);
        };
    }
    EaseUtil.getPowIn = getPowIn;
    function getPowOut(pow) {
        return function (t) {
            return 1 - Math.pow(1 - t, pow);
        };
    }
    EaseUtil.getPowOut = getPowOut;
    function getPowInOut(pow) {
        return function (t) {
            if ((t *= 2) < 1)
                return 0.5 * Math.pow(t, pow);
            return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
        };
    }
    EaseUtil.getPowInOut = getPowInOut;
    EaseUtil.quadIn = getPowIn(2);
    EaseUtil.quadOut = getPowOut(2);
    EaseUtil.quadInOut = getPowInOut(2);
    EaseUtil.cubicIn = getPowIn(3);
    EaseUtil.cubicOut = getPowOut(3);
    EaseUtil.cubicInOut = getPowInOut(3);
    EaseUtil.quartIn = getPowIn(4);
    EaseUtil.quartOut = getPowOut(4);
    EaseUtil.quartInOut = getPowInOut(4);
    EaseUtil.quintIn = getPowIn(5);
    EaseUtil.quintOut = getPowOut(5);
    EaseUtil.quintInOut = getPowInOut(5);
    function sineIn(t) {
        return 1 - Math.cos(t * Math.PI / 2);
    }
    EaseUtil.sineIn = sineIn;
    function sineOut(t) {
        return Math.sin(t * Math.PI / 2);
    }
    EaseUtil.sineOut = sineOut;
    function sineInOut(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    }
    EaseUtil.sineInOut = sineInOut;
    function getBackIn(amount) {
        return function (t) {
            return t * t * ((amount + 1) * t - amount);
        };
    }
    EaseUtil.getBackIn = getBackIn;
    EaseUtil.backIn = getBackIn(1.7);
    function getBackOut(amount) {
        return function (t) {
            return (--t * t * ((amount + 1) * t + amount) + 1);
        };
    }
    EaseUtil.getBackOut = getBackOut;
    EaseUtil.backOut = getBackOut(1.7);
    function getBackInOut(amount) {
        amount *= 1.525;
        return function (t) {
            if ((t *= 2) < 1)
                return 0.5 * (t * t * ((amount + 1) * t - amount));
            return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
        };
    }
    EaseUtil.getBackInOut = getBackInOut;
    EaseUtil.backInOut = getBackInOut(1.7);
    function circIn(t) {
        return -(Math.sqrt(1 - t * t) - 1);
    }
    EaseUtil.circIn = circIn;
    function circOut(t) {
        return Math.sqrt(1 - (--t) * t);
    }
    EaseUtil.circOut = circOut;
    function circInOut(t) {
        if ((t *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - t * t) - 1);
        }
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    }
    EaseUtil.circInOut = circInOut;
    function bounceIn(t) {
        return 1 - bounceOut(1 - t);
    }
    EaseUtil.bounceIn = bounceIn;
    function bounceOut(t) {
        if (t < 1 / 2.75) {
            return (7.5625 * t * t);
        }
        else if (t < 2 / 2.75) {
            return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
        }
        else if (t < 2.5 / 2.75) {
            return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
        }
        else {
            return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        }
    }
    EaseUtil.bounceOut = bounceOut;
    function bounceInOut(t) {
        if (t < 0.5)
            return bounceIn(t * 2) * .5;
        return bounceOut(t * 2 - 1) * 0.5 + 0.5;
    }
    EaseUtil.bounceInOut = bounceInOut;
    function getElasticIn(amplitude, period) {
        var pi2 = Math.PI * 2;
        var s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if (t == 0 || t == 1)
                return t;
            return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
        };
    }
    EaseUtil.getElasticIn = getElasticIn;
    EaseUtil.elasticIn = getElasticIn(1, 0.3);
    function getElasticOut(amplitude, period) {
        var pi2 = Math.PI * 2;
        var s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if (t == 0 || t == 1)
                return t;
            return (amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1);
        };
    }
    EaseUtil.getElasticOut = getElasticOut;
    EaseUtil.elasticOut = getElasticOut(1, 0.3);
    function getElasticInOut(amplitude, period) {
        var pi2 = Math.PI * 2;
        var s = period / pi2 * Math.asin(1 / amplitude);
        return function (t) {
            if ((t *= 2) < 1)
                return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
            return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
        };
    }
    EaseUtil.getElasticInOut = getElasticInOut;
    EaseUtil.elasticInOut = getElasticInOut(1, 0.3 * 1.5);
    //decayPer  衰减百分比
    function getQuakeFun(waveCnt, decayPer) {
        var pi2 = 2 * Math.PI;
        decayPer = decayPer / 100;
        if (decayPer > 1)
            decayPer = 1;
        return function (t) {
            var tmp = t * waveCnt;
            var tmp1 = Math.floor(tmp);
            var radian = (tmp - tmp1) * pi2;
            return Math.sin(radian) * (1 - decayPer * tmp1 * t);
        };
    }
    EaseUtil.getQuakeFun = getQuakeFun;
    EaseUtil.waveRandFun = function (t) {
        if (t === 0 || t === 1)
            return 0;
        return (Math.random() < 0.5) ? Math.random() : -Math.random();
    };
})(EaseUtil || (EaseUtil = {}));
var cui;
(function (cui) {
    /**
     * 缩放按钮
     *
     * 自动对显示对象进行放大缩小
     * 需要指定所有的宽高
     *
     * */
    var ScaleButton = (function (_super) {
        __extends(ScaleButton, _super);
        function ScaleButton() {
            var _this = _super.call(this) || this;
            var self = _this;
            self.scaleTime = 60;
            self.smallRatio = 0.85;
            self.bigRatio = 1.15;
            return _this;
        }
        ScaleButton.prototype.onPartAdded = function () {
            _super.prototype.onPartAdded.call(this);
            var self = this;
            var skAniGp = self.skAniGp;
            skAniGp.x = Math.floor(self.width * 0.5);
            skAniGp.y = Math.floor(self.height * 0.5);
            skAniGp.anthorPerX = 0.5;
            skAniGp.anthorPerY = 0.5;
        };
        //------------------------事件
        ScaleButton.prototype.onTouchBegin = function (event) {
            _super.prototype.onTouchBegin.call(this, event);
            this.scaleSmall();
        };
        ScaleButton.prototype.onTouchFinish = function () {
            var self = this;
            if (self._tempStage)
                self.scaleBig();
            _super.prototype.onTouchFinish.call(this);
        };
        ScaleButton.prototype.scaleSmall = function () {
            var self = this;
            var target = self.skAniGp;
            if (!target)
                return;
            self.clearAction();
            //记录下之前的缩放
            var scaRatio = self.smallRatio;
            var action = new TRain.ActionPropTo(self.scaleTime, 1, { scaleX: scaRatio, scaleY: scaRatio });
            self._action = action;
            TRain.actionMgr.addAction(action, target, false);
        };
        ScaleButton.prototype.scaleBig = function () {
            var self = this;
            var target = self.skAniGp;
            if (!target)
                return;
            self.clearAction();
            //记录下之前的缩放
            var scaRatio = self.bigRatio;
            var scaTm = self.scaleTime;
            var act1 = new TRain.ActionPropTo(scaTm * 2, 1, { scaleX: scaRatio, scaleY: scaRatio });
            var act2 = new TRain.ActionPropTo(scaTm, 1, { scaleX: 1, scaleY: 1 });
            var sequence = self._action = new TRain.ActionSequence([act1, act2]);
            TRain.actionMgr.addAction(sequence, target, false);
        };
        ScaleButton.prototype.clearAction = function () {
            var action = this._action;
            if (action) {
                TRain.actionMgr.rmvAction(action);
                this._action = null;
            }
        };
        ScaleButton.prototype.dispose = function () {
            this.clearAction();
            _super.prototype.dispose.call(this);
        };
        return ScaleButton;
    }(cui.Button));
    cui.ScaleButton = ScaleButton;
    __reflect(ScaleButton.prototype, "cui.ScaleButton");
})(cui || (cui = {}));
