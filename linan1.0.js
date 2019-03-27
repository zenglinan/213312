(function (window, undefined) {
    var ln = function (selector) {
        if (arguments.length === 0) {
            return new ln.prototype.init();
        } else {
            return new ln.prototype.init(selector);
        }

    }
    ln.prototype = {
        constructor: ln,
        init: function (selector) {

            /*
            1.传入null undefined NaN 0 false   返回空对象
            2.函数
            3.字符串
                3.1代码片段  将创建好的dom存储到ln对象中返回
                3.2选择器    将找到的所有元素返回到ln对象中返回
            4.数组/伪数组    将数组中的元素依次存储到ln对象返回 
            5.其他类型       将传入的数据存储到ln对象返回
            */
            //0.去除字符串两端空格
            if (arguments.length === 0) {
                return this;
            }
            selector = ln.trim(selector);
            //1.空对象
            if (!selector) {

            } else if (ln.isFunction(selector)) {
                selector();
            } else if (ln.isString(selector)) {//2.字符串
                if (ln.isHTML(selector)) {                                    //判断是否是代码片段,此处判断条件有待修改
                    var temp = document.createElement("div");
                    temp.innerHTML = selector;
                    [].push.apply(this, temp.children);                      //给加工对象添加最外层元素和length属性  并返回
                    this.length = temp.children.length;
                } else {//3.选择器
                    var res = document.querySelectorAll(selector);
                    [].push.apply(this, res);
                    this.length = res.length;
                }
            } else if (ln.isArray(selector)) {                                 //真伪数组
                selector = ln.toTrueArr(selector);                          //不管真伪全部先转为真
                [].push.apply(this, selector);                               //伪数组在调用此方法时必须先转为真数组,以达到ie8兼容
                this.length = selector.length;
            } else {
                this[0] = selector;
                this.length = 1;
            }
            return this;
        },
        toArray: function () {
            return [].slice.call(this);
        },
        get: function (num) {
            if (arguments.length === 0) {
                return this.toArray();
            } else if (num >= 0) {
                return this[num];
            } else {
                var length = this.length;
                return this[length + num];
            }
        },
        eq: function (num) {
            if (arguments.length === 0) {
                return this;
                // return new ln();
            } else {
                return ln(this.get(num));
            }
        },
        first: function () {
            return ln(this.eq(0));
        },
        last: function () {
            return ln(this.eq(-1));
        },
        each: function (fn) {
            return ln.each(this, fn);
        },
        map: function (fn) {
            return ln.map(this, fn);
        },
        ln: "1.0",
        selector: "",
        length: 0,
        push: [].push,
        sort: [].sort,
        splice: [].splice
    };

    ln.extend = ln.prototype.extend = function (obj) {                        //在ln调用的extend参数里可添加静态方法  在ln.prototype调用的extend参数上可以添加实例方法
        for (key in obj) {
            this[key] = obj[key];
        }
    }

    //ln对象上的工具方法(静态)
    ln.extend({
        isString: function (selector) {
            return selector.constructor === String;
        },
        isHTML: function (str) {
            return str.charAt(0) === "<"
        },
        trim: function (str) {
            if (str.constructor !== String) { //不是字符串就返回
                return str;
            }
            if (str.trim) {
                return str.trim();
            } else {
                return str.replace(/^\s*|\s*$/g, "");//去掉开头结尾的空格
            }
        },
        toFalseArr: function (arr) {                                         //真数组转换为伪数组 无返回值
            [].push.apply({}, arr);
        },
        toTrueArr: function (obj) {                                          //伪数组转换为真数组 需要接受返回值
            return [].slice.apply(obj);
        },
        isArray: function (selector) {                                       //包括真数组和伪数组
            return typeof selector === "object" && "length" in selector && selector !== window;
        },
        isFunction: function (obj) {
            return obj.constructor === Function;
        },
        isObject: function (obj) {
            return obj.constructor === Object;
        },
        addEvent: function (elem, type, handle) {                          //兼容性好的绑定事件函数  type为字符串类型
            if (addEventListener) {
                elem.addEventListener(type, handle, false);
            } else if (attachEvent) {
                elem.attachEvent("on" + type, function () {
                    handle.call(elem);                                       //此方法内部的this指向window  用call解决
                })
            } else {
                elem['on' + type] = handle;
            }

        },
        ready: function (fn) {                                               //监听dom是否加载完毕 加载完执行回调
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", function () {
                    fn();
                }, false);
            } else {
                document.attachEvent("onreadystatechange", function () {
                    if (document.readyState === "complete") {
                        fn();
                    }
                })
            };
        },
        each: function (obj, fn) {
            if (ln.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    var res = fn.call(obj[i], i, obj[i]);                     //使函数内部的this指向value值 方便使用
                    if (res === true) {                                       //回调函数如果返回true 跳过当前一次循环
                        continue;
                    } else if (res === false) {                                //回调函数如果返回false 跳出所有循环
                        break;
                    }
                }
            } else if (ln.isObject(obj)) {
                for (key in obj) {
                    var res = fn.call(obj[i], i, obj[i]);
                    if (res === true) {
                        continue;
                    } else if (res === false) {
                        break;
                    }
                }
            }
            return obj;                                                     //each方法 谁调用就返回谁   
        },
        map: function (obj, fn) {
            var ret = [];
            if (ln.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    var temp = fn.call(obj[i], obj[i], i);                     //使函数内部的this指向value值 方便使用
                    if (temp) {                                                //回调函数有返回值给temp时才push
                        ret.push(temp);
                    }
                }
            } else if (ln.isObject(obj)) {
                for (key in obj) {
                    var temp = fn.call(obj[i], obj[i], i);
                    if (temp) {
                        ret.push(temp);
                    }
                }
            }
            return ret;
        },
        getStyle: function (elem, prop) {
            if (window.getComputedStyle) {
                return window.getComputedStyle(elem, null)[prop];
            } else {
                return ele.currentStyle[prop];  //解决IE兼容问题
            }
        },
        //兼容性解除绑定事件函数
        removeEvent: function (elem, type, handle) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, handle, false);
            } else if (elem.detachEvent) {
                elem.detachEvent("on" + type, function () {
                    handle.call(elem);
                })
            } else {
                elem['on' + type] = null;
            }
        },
        addEvent: function (elem, type, handle) {      //type为字符串类型
            if (elem.addEventListener) {
                elem.addEventListener(type, handle, false);
            } else if (elem.attachEvent) {
                elem.attachEvent("on" + type, function () {
                    handle.call(elem);
                })
            } else {
                elem['on' + type] = handle;
            }
        },
        /**
         * @param {Object} obj{
         *      type
         *      data
         *      url 
         *      success
         * }
         */
        ajax: function (obj) {
            var xhr = new XMLHttpRequest();
            if (obj.type == "get" && obj.data) {
                obj.url += "?";
                obj.url += obj.data;
                obj.data = null;                                  //如果是get请求 设为null方便后面直接send
            }
            xhr.open(obj.type, obj.url);
            if (xhr.type == "post" && obj.data) {
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var xhrContentType = xhr.getResponseHeader('Content-Type');
                    if (xhrContentType.indexOf('xml') !== -1) {     //判断返回的数据格式
                        obj.success(xhr.responseXML);
                    } else if (xhrContentType.indexOf('json') !== -1) {
                        obj.success(JSON.parse(xhr.responseText));
                    } else {
                        obj.success(xhr.responseText);
                    }
                }
            }
            xhr.send(obj.data);
        }
    });

    //DOM操作方法(实例)
    ln.prototype.extend({
        empty: function () {
            this.each(function (index, value) {
                value.innerHTML = "";
            });
            return this;                                                    //方便链式编程
        },
        remove: function (sele) {
            if (arguments.length === 0) {
                this.each(function (index, value) {
                    var parent = value.parentNode;
                    if (parent) {
                        parent.removeChild(value);
                    }

                });
            } else {
                var $this = this;
                ln(sele).each(function (index, value) {                            //遍历remove参数对应的元素集合
                    var target = value;                                 //找到调用remove的元素集合
                    $this.each(function (index, value) {
                        if (value == target) {                           //如果是相同类型就删除
                            var parent = value.parentNode;
                            if (parent) {
                                parent.removeChild(value);
                            }
                        }
                    })
                });
            }

            return this;
        },
        html: function (content) {
            if (arguments.length === 0) {                                     //没传参则返回找到的第一个元素的html结构
                return this[0].innerHTML;
            } else {                                                          //若传递了参数 将找到的所有元素的html替换成参数
                this.each(function (index, value) {
                    value.innerHTML = content;
                })
            }
            return this;
        },
        text: function (content) {
            if (arguments.length === 0) {                                     //没传参则返回找到的第一个元素的html结构
                return this[0].innerText;
            } else {                                                          //若传递了参数 将找到的所有元素的html替换成参数
                this.each(function (index, value) {
                    value.innerText = content;
                })
            }
            return this;
        },
        appendTo: function (tar) {
            var $this = this,
                flag = 0;                                                   //是否为找到的第一个元素的标志位
            ln(tar).each(function (index, value) {
                $this.each(function (i, v) {
                    if (flag === 0) {
                        value.appendChild(v);                               //第一个就直接添加节点
                    }
                    else {
                        value.appendChild(v.cloneNode(true));               //第二个就添加复制的节点
                    }
                })
                flag += 1;
            })
        },
        prependTo: function (tar) {
            var $this = this,
                flag = 0;
            ln(tar).each(function (index, value) {
                $this.each(function (i, v) {
                    if (flag === 0) {
                        value.insertBefore(v, value.firstChild);             //类似appendTo方法 添加到第一个子元素的前面
                    }
                    else {
                        value.insertBefore(v.cloneNode(true), value.firstChild);
                    }
                })
                flag += 1;
            })
        },
        append: function (ori) {
            var $this = this,
                flag = 0;
            $this.each(function (index, value) {
                ln(ori).each(function (i, v) {
                    if (flag === 0) {
                        value.appendChild(v);
                    }
                    else {
                        value.appendChild(v.cloneNode(true));
                    }
                })
                flag += 1;
            })
        },
        prepend: function (ori) {
            var $this = this;
            $this.each(function (index, value) {
                ln(ori).each(function (i, v) {
                    if (index === 0) {
                        value.insertBefore(v, value.firstChild);             //类似appendTo方法 添加到第一个子元素的前面
                    } else {
                        value.insertBefore(v.cloneNode(true), value.firstChild);
                    }
                })

            })
        },
        insertBefore: function (ori) {
            var $this = this;
            ln(ori).each(function (index, value) {                             //遍历要被插入的元素
                for (var i = 0; i < $this.length; i++) {                        //顺序插入
                    if (index === 0) {
                        value.parentNode.insertBefore($this[i], value);
                    } else {
                        value.parentNode.insertBefore($this[i].cloneNode(true), value);
                    }
                }
            })
        },
        insertAfter: function (ori) {
            var $this = this;
            ln(ori).each(function (index, value) {
                for (var i = $this.length - 1; i >= 0; i--) {                    //倒序插入下一个元素的前面 达到插入尾部的效果
                    if (index === 0) {
                        value.parentNode.insertBefore($this[i], value.nextElementSibling || value.nextSibiling);
                    } else {
                        value.parentNode.insertBefore($this[i].cloneNode(true), value.nextElementSibling || value.nextSibiling);
                    }
                }
            })
        },
        replaceAll: function (tar) {
            var $this = this;
            $this.insertBefore(tar);
            ln(tar).remove();
        },
        clone: function (bool) {
            var arr = [];
            if (arguments.length === 0 || bool === false) {
                this.each(function (index, ele) {
                    arr.push(ele.cloneNode(false));
                })
            } else if (bool === true) {
                this.each(function (index, ele) {
                    arr.push(ele.cloneNode(true));
                })
            }
            return ln(arr);
        }

    });

    //属性操作方法(实例)
    ln.prototype.extend({
        attr: function (attr, val) {                                          //操作属性节点
            var $this = this;
            if (arguments.length === 1 && ln.isString(attr)) {
                return $this[0].getAttribute(attr);                          //只能获取行间样式
            } else if (arguments.length === 2) {                               //传入属性名和值
                $this.each(function (index, value) {
                    value.setAttribute(attr, val);
                })
                return $this;
            } else if (ln.isObject(attr)) {
                $this.each(function (index, value) {
                    for (key in attr) {
                        value.style[key] = attr[key];
                    }
                })
                return $this;
            }
        },
        prop: function (prop, val) {                                          //操作属性
            var $this = this;
            if (arguments.length === 1 && ln.isString(prop)) {
                return $this[0][prop];                                      //返回第一个的属性
            } else if (arguments.length === 2) {
                $this.each(function (index, value) {
                    value[prop] = val;
                })
                return $this;
            } else if (ln.isObject(prop)) {
                $this.each(function (index, value) {
                    for (key in prop) {
                        value[key] = prop[key];
                    }
                })
                return $this;
            }
        },
        css: function (cssAttr, val) {
            var $this = this;
            if (arguments.length === 1 && ln.isString(cssAttr)) {
                return ln.getStyle($this[0], cssAttr);                         //可以获取实际样式
            } else if (arguments.length === 2) {
                $this.each(function (index, value) {
                    value[cssAttr] = val;
                })
                return $this;
            } else if (ln.isObject(cssAttr)) {
                $this.each(function (index, value) {
                    for (key in cssAttr) {
                        value.style[key] = cssAttr[key];
                    }
                })
                return $this;
            }
        },
        val: function (val) {
            var $this = this;
            if (arguments.length === 0) {
                return $this[0].value;
            } else if (ln.isString(val)) {
                $this[0].value = val;
                return $this;
            } else if (ln.isFunction(val)) {

            }
        },
        hasClass: function (name) {
            var flag = false;
            this.each(function (index, value) {
                if (value.className === name) {
                    flag = true;
                }
            })
            return flag;
        },
        addClass: function (name) {
            this.each(function (index, value) {
                value.className = value.className + " " + name;
            })
        },
        removeClass: function (name) {
            if (arguments.length === 0) {
                this.each(function (key, ele) {
                    ele.className = "";
                })
            } else {
                var namePart = name.split(" ");                                 //切割传入的类名
                this.each(function (key, ele) {
                    ln(namePart).each(function (index, nameValue) {
                        if (ln(ele).hasClass(nameValue)) {
                            ele.className = (ele.className).replace(nameValue, " ");//将原有类名用空字符替换
                        }
                    })
                })
            }
            return this;
        },
        toggleClass: function (name) {
            var namePart = name.split(" ");
            this.each(function (index, ele) {                                          //遍历找到的每一个元素
                if (ln(ele).hasClass(name)) {
                    var classPart = (ele.className).split(" ");
                    ln(classPart).each(function (index, classValue) {                  //遍历元素的每一个类
                        ln(namePart).each(function (index, nameValue) {                //遍历传入参数的每一个类    
                            if (classValue === nameValue) {                           //消除类
                                ele.className = (ele.className).replace(nameValue, " ");
                            } else {                                                  //添加类
                                ele.className = ele.className + namePart + ' ';
                            }
                        })
                    })
                }
            })
        }
    })

    //事件操作方法(实例)
    ln.prototype.extend({
        on: function (type, fn) {
            var $this = this;
            $this.each(function (index, ele) {
                ln.addEvent(ele, type, fn);
            })
            return $this;
        },
        off: function (type, fn) {
            var $this = this;
            if (arguments.length === 0) {
                $this.each(function (index, ele) {
                    ele.eventsCache = {};
                })
            } else if (arguments.length === 1) {
                $this.each(function (index, ele) {
                    ele['on' + type] = null;
                })
            } else if (arguments.length === 2) {
                $this.each(function (index, ele) {
                    ln.removeEvent(ele, type, fn);
                })
            }
        },

    })
    ln.prototype.init.prototype = ln.prototype;
    window.ln = ln;
})(window)