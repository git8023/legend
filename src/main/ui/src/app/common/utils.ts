import {isArray, isDate, isFunction, isNullOrUndefined, isNumber, isObject, isString} from 'util';
import {FormControl, FormGroup} from '@angular/forms';
import {ElementRef} from '@angular/core';

//<editor-fold desc="Define">
//<editor-fold desc="Other">
//////////////////////////////////////////// other
/**
 * 对象克隆
 * @param o
 * @return {any}
 */
export function clone(o: any) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * 展开对象属性为ognl表达式
 * @param {array|object} o 数组或对象
 * @param {boolean} skipNullOrUndef=true 跳过值为null或undefined的属性
 * @return {?} 将多级属性展开为一级属性后的对象
 */
export function extJson(o: any, skipNullOrUndef = true): { [prop: string]: any } {
  skipNullOrUndef = (undefined === skipNullOrUndef);
  const ret = {};
  ext(clone(o), null, ret);
  return ret;

  function ext(json, prefix, ret) {
    // const isArr = Array.isArray(json);
    eachO(json, (v, k) => {
      if (skipNullOrUndef && (isNullOrUndefined(v) || '' === v))
        return true;

      // 数组或数字属性名都是用中括号'[]'
      let nk;
      if (!isNaN(k)) nk = prefix ? (prefix + "[" + k + "]") : k;
      else nk = prefix ? (prefix + "." + k) : k;

      // 赋值
      if (!isObject(v)) ret[nk] = v;
      else ext(v, nk, ret);
    });
    return ret;
  }
}

/**
 * 增量步骤执行
 * @param {number} star 起始值
 * @param {number} end 结束边界值
 * @param {number} step 步长
 * @param {(v) => (boolean | void)} f 步长处理回调函数
 */
export function incrStep(star: number, end: number, step: number, f: (v) => boolean | any) {
  while (star <= end) {
    if (false === f(star)) break;
    star += step;
  }
}

/**
 * 属性拷贝
 * @param {object} src 来源
 * @param {object} dest 目标
 * @param {(k, sv, dv) => (boolean | any)} [each] 控制函数, true-跳过本次, false-跳过后续, undefined-覆盖dest中k属性
 * @return dest
 */
export function copyProps(src: object, dest: object, each?: (k, sv, dv) => boolean | any): object {
  each = isFunction(each) ? each : () => undefined;
  if (isObject(src) && isObject(dest) && !(isNullOrUndefined(src) || isNullOrUndefined(dest))) {
    eachO(src, (sv, k) => {
      const hr = each(k, sv, dest[k]);
      if (undefined === hr) dest[k] = sv;
      return hr;
    });
  }
  return dest;
}

/**
 * 反射执行函数
 * @param fn 目标函数
 * @param _this 上下文环境
 * @param args 参数列表
 */
export function apply(fn: Function, _this?: any, args?: []) {
  if (isFunction(fn))
    return fn.apply(_this, args);
}

/**
 * 范围内随机数
 * @param min 最小值
 * @param max 最大值
 */
export function rand(min: number, max: number): number {
  return parseInt(Math.random() * (max - min + 1) + '') + min;
}

function G() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

/**
 * 生成GUID码
 */
export function guid(): string {
  return (G() + G() + "-" + G() + "-" + G() + "-" + G() + "-" + G() + G() + G()).toUpperCase();
}

//</editor-fold>

//<editor-fold desc="object">
//////////////////////////////////////////// object
/**
 * 对象属性遍历
 * @param {object} o 目标对象
 * @param {(v: T, k: (string | any)) => (boolean | any)} f 属性处理函数
 */
export function eachO<T>(o: object, f: (v: T, k: string | any) => boolean | any) {
  for (const k in o)
    if (o.hasOwnProperty(k) && false === f(o[k], k))
      break;
}

/**
 * 清空对象属性
 * @param {object} o 目标对象
 * @param {(v: any, k: string) => (boolean | void)} f true-跳过当前属性, false-跳过后续所有, undefined-删除当前属性
 */
export function clearO(o: object, f?: (v: any, k: string) => boolean | void) {
  f = !isFunction(f) ? f : () => undefined;
  eachO(o, (v, k) => {
    let r = f(v, k);
    if (true === r) return;
    if (false === r) return false;
    delete o[k];
  });
}

/**
 *
 * 获取对象属性值列表
 * @param {?} o 目标对象
 * @param {boolean} skipInvalid 跳过null/undefined属性值
 * @return {Array<T>} 对象属性列表
 */
export function valuesO<T>(o: { [s: string]: T }, skipInvalid = true): Array<T> {
  let ret: Array<T> = [];
  eachO<T>(o, v => !isNullOrUndefined(v) && ret.push(v));
  return ret;
}

/**
 * 合并属性
 * @param {object} dest 目标对象
 * @param {object} src 源对象
 * @param {boolean} incr=true true-属性增量, false-属性减量
 * @return {object} 目标对象
 */
export function mergeO(dest: object, src: object, incr = true): object {
  eachO<any>(src, (v, k) => {
    if (incr) dest[k] = v;
    else delete dest[k];
  });
  return dest;
}

/**
 * 获取所有属性
 * @param {object} o 目标对象
 * @return {Array<string>} 属性列表
 */
export function keysO(o: any): Array<string> {
  const r = [];
  eachO(o, (v, k) => r.push(k));
  return r;
}

//</editor-fold>

//<editor-fold desc="array">
//////////////////////////////////////////// Array
/**
 * 数组遍历
 * @param {Array<T>} a
 * @param {((e: T, i?: number|string) => boolean) | void | any} f
 */
export function eachA<T>(a: Array<T>, f?: (((e: T, i?: number | string) => boolean) | void | any)) {
  if (!isArray(a)) return a;
  if (!isFunction(f)) f = () => true;
  for (let i = 0, len = a.length; i < len; i++)
    if (false === f(a[i] as T, i))
      break;
  return a;
}

/**
 * 追加唯一目标值, 如果校验存在则跳过
 * @param {Array<T>} a 数组
 * @param {T} e 新元素
 * @param {string | ((el: T, i: number) => boolean)} c 唯一值属性名或比较器函数(返回true表示存在)
 * @return {number} 与e匹配的元素索引
 */
export function pushUniqueA<T>(a: Array<T>, e: T, c?: string | ((el: T, i: number) => boolean)): number {
  let foundIndex = indexA(a, e, c);
  if (-1 !== foundIndex)
    return foundIndex;
  return a.push(e) - 1;
}

/**
 * 查找索引
 * @param {Array<T>} a 数组
 * @param {T} e 查找条件
 * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
 * @return {number} 索引, -1表示未找到
 */
export function indexA<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): number {
  let fn: (el: T, i: number) => boolean;
  if (!(k instanceof Function)) {
    if (isNullOrUndefined(k)) fn = el => el === e;
    else if (isString(k)) fn = el => el[k + ''] === e[k + ''];
  }

  let foundIdx = -1;
  eachA(a, (el, i) => {
    if (true === fn(el, i)) {
      foundIdx = i;
      return false;
    }
  });
  return foundIdx;
}

/**
 * 查找目标值
 * @param {Array<T>} a 数组
 * @param {T} e 查找条件
 * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
 * @return {T | null} 查找成功返回目标值, 否则返回null
 */
export function findA<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): T | null {
  const i = indexA(a, e, k);
  return -1 !== i ? a[i] : null;
}

/**
 * 删除
 * @param {Array<T>} a 数组
 * @param {T} e 查找条件
 * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
 * @return {T | null} 删除成功返回被删除目标值, 否则返回null
 */
export function removeA<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): T | null {
  const i = indexA(a, e, k);
  if (-1 === i) return null;
  return a.splice(i, 1)[0];
}

/**
 * 合并
 * @param {Array<T>} t 目标数组
 * @param {Array<T>} s 元素组
 */
export function concatA<T>(t: Array<T>, s: Array<T>) {
  if (!isArray(t) || !isArray(s)) throw '无效数组参数';
  Array.prototype.push.apply(t, s);
}

/**
 * 是否包含指定值
 * @param {Array<T>} a 数组
 * @param {T} e 数组元素
 * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
 * @return {boolean} true-已包含, false-未包含
 */
export function containsA<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): boolean {
  return -1 !== indexA(a, e, k);
}

/**
 * 数组转为指定属性映射的对象
 * @param {Array<any>} a 目标数组
 * @param {string | null | undefined} uk 数组元素唯一属性key, 如果值为undefined|null将使用下标映射
 * @return {{[s:string|number]:any}} 结果对象
 */
export function asMapA(a: Array<any>, uk: string | undefined | null) {
  const useIndex = isNullOrUndefined(uk);
  const r = {};
  eachA(a, (e, i) => r[useIndex ? i : e[uk]] = e);
  return r;
}

/**
 * 数组过滤
 * @param a {Array<any>} 目标数组
 * @param cb {(v: T, k: number) => boolean } 回调函数, false-删除, 其他-保留
 */
export function filterA<T>(a: Array<T>, cb: (v: T, k: number) => boolean | null) {
  let delKeys = [];
  eachA(a, (v, k) => {
    if (false === cb(v, k))
      delKeys.push(k);
  });

  delKeys = delKeys.reverse();
  eachA(delKeys, id => a.splice(id, 1));
}

/**
 * 数组按指定关键字分组
 * @param a 数组
 * @param k 关键字, 仅支持一级属性名
 */
export function groupA<T>(a: Array<T>, k: string): { [s: string]: Array<T> } {
  let ret = {};
  eachA(a, e => {
    let rk = e[k];
    let arr = ret[rk] || [];
    arr.push(e);
    ret[rk] = arr;
  });
  return ret;
}

/**
 * 提取数组中每个元素的指定属性值到一个数组中
 * @param a 数组
 * @param k 元素中的属性名
 */
export function extendPropsA<T, P>(a: Array<T>, k: string): Array<P> {
  let pa = [];
  eachA(a, e => pa.push(e[k]));
  return pa;
}

//</editor-fold>

//<editor-fold desc="date">
//////////////////////////////////////////// date

/**
 * 解析日期字符串或格式化为另一种日期规则字符串
 * @param {string} dateStr 源日期字符串
 * @param {string} inFmt 源日期字符串格式
 * @param {string} [outFmt=undefined] 输出日期字符串格式
 * @return {Date | string} 当指定outFmt时输出日期字符串, 否则返回日期对象
 */
export function datePoF(dateStr: string, inFmt: string, outFmt?: string): Date | string {
  const d = dateParse(dateStr, inFmt);
  if (d && isString(outFmt) && outFmt.trim().length)
    return dateFmt(d, outFmt);
  return d;
}

/**
 * 解析日期字符串
 * @param {string} dateStr 源日期字符串
 * @param {string} pattern 解析规则(yMDhmsS)
 * @return {Date | null} 解析成功返回日期对象, 否则返回null
 */
export function dateParse(dateStr: string, pattern: string): Date | null {
  let metaPatterns = {
    /**
     * 元规则决策表, 每项决策中会新增三个属性:
     * <p>
     * beginIndex: {Number}<br>
     * pLength: {Number}<br>
     * original: {String}
     * </p>
     */
    metas: {
      /** 年规则 */
      y: {
        name: "Year", setYear: function (date) {
          date.setFullYear(this.original || 0);
        }
      },
      /** 月规则 */
      M: {
        name: "Month", setMonth: function (date) {
          date.setMonth(isNaN(this.original) ? 0 : (this.original - 1));
        }
      },
      /** 月中的天数规则 */
      d: {
        name: "Day", setDay: function (date) {
          date.setDate(this.original || 0);
        }
      },
      /** 小时规则 */
      h: {
        name: "Hour", setHour: function (date) {
          date.setHours(this.original || 0);
        }
      },
      /** 分钟规则 */
      m: {
        name: "Minute", setMinute: function (date) {
          date.setMinutes(this.original || 0);
        }
      },
      /** 秒规则 */
      s: {
        name: "Second", setSecond: function (date) {
          date.setSeconds(this.original || 0);
        }
      },
      /** 毫秒规则 */
      S: {
        name: "Millisecond", setMillisecond: function (date) {
          date.setMilliseconds(this.original || 0);
        }
      }
    },

    /**
     * 设值
     * @param date {Date|*} 目标日期
     * @returns {Date} 修改后日期
     */
    setValues: function (date) {
      this.metas.y.setYear(date);
      this.metas.M.setMonth(date);
      this.metas.d.setDay(date);
      this.metas.h.setHour(date);
      this.metas.m.setMinute(date);
      this.metas.s.setSecond(date);
      this.metas.S.setMillisecond(date);
      return date;
    },

    /**
     * 校验器
     * @param orgiDateStr {String} 日期字符串
     * @param tgtPattern {String} 解析规则
     * @returns {Boolean} true-解析成功, false-规则不能匹配日期字符串
     */
    validate: function (orgiDateStr, tgtPattern) {
      let
        NUMBER_PATTERN = "\\d",
        MX_PATTERN = "\\d+",
        replacedPattern = (tgtPattern || "") + "";
      if (!replacedPattern) return false;

      // 记录当前所能支持的所有元字符
      let metasStr = [];
      eachO(this.metas, (opt, key) => {
        metasStr.push(key);
      });

      // 替换pattern中年月日时分秒的字符为\d
      replacedPattern = replacedPattern.replace(/\//g, "\\/");
      eachA(metasStr, meta => {
        replacedPattern = replacedPattern.replace(eval("(/" + meta + "/g)"), "S" === meta ? MX_PATTERN : NUMBER_PATTERN);
      });
      replacedPattern = replacedPattern.replace(/\\\\/g, "\\").replace(/[\/]/g, "\/");

      // 使用替换后的pattern校验dateStr是否有效
      let result = eval("(/^" + replacedPattern + "$/)").test(orgiDateStr);
      if (result) {
        let _this = this;
        // 校验通过, 按顺序设置元规则开始索引和值
        // > 按元规则分组
        let metasGroup = metasStr.join("");
        // /([yMdhms])\1*/g: 提取的元规则
        let groupRegExp = eval("(/([" + metasGroup + "])\\1*/g)");
        // 替换掉日期字符串分隔符字符
        let onlyNumberDateStr = orgiDateStr.replace(/[^\d]+/g, "");
        // 把原pattern中的年月日时分秒解为有序的正则表达式数组,
        let originValueIndex = 0;
        eachA(tgtPattern.match(groupRegExp), function (metaGroup) {
          // :> 设置每个组的 beginIndex, pLength, original
          let meta = _this.metas[metaGroup[0]];
          meta.beginIndex = tgtPattern.indexOf(metaGroup);
          meta.pLength = metaGroup.length;
          if ("S" !== metaGroup[0])
            meta.original = onlyNumberDateStr.substring(originValueIndex, (originValueIndex + meta.pLength));
          else
            meta.original = onlyNumberDateStr.substring(originValueIndex);
          originValueIndex += meta.pLength;
        });
      }
      return result;
    }
  };

  let success = metaPatterns.validate(dateStr, pattern);
  return success ? metaPatterns.setValues(new Date()) : null;
}

/**
 * 日期格式化
 * @param {Date | number} date 日期对象或毫秒值
 * @param format {string} 格式化规则
 * @return {string | undefined} 成功返回日期字符串, 否则返回undefined
 */
export function dateFmt(date: Date | number, format: string): string {
  function formatter(format) {
    format = (format || "yyyy-MM-dd hh:mm:ss");
    let time = this.getTime();
    if (isNaN(time)) return;
    let o = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S": this.getMilliseconds()
    };

    if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (let k in o)
      if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1, RegExp.$1["length"] === 1
          ? o[k]
          : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  }

  if (isNullOrUndefined(date)) return '';
  if (isNumber(date)) date = new Date(date);
  if (!isDate(date)) throw "Error Type: Parameters 'date' must be a Date type";
  return formatter.call(date, format);
}

/**
 * 比较两个日期
 * @param {Date} d1 第一个日期
 * @param {Date} d2 第二个日期
 * @return {number} 正数:d1>d2, 0:d1=d2, 负数:d1<d2, NaN:d1无效
 */
export function dateDiff(d1: Date, d2 = new Date()): number {
  if (!(isDate(d1) && isDate(d2))) return NaN;
  return d1.getTime() - d2.getTime();
}

//</editor-fold>

//<editor-fold desc="Form">
//////////////////////////////////////////// NzForm
/**
 * angular表单校验
 * @param {FormGroup} fm 表单组
 * @return {boolean} true-校验通过, false-校验失败
 */
export function validNgForm(fm: FormGroup): boolean {
  eachO<FormControl>(fm.controls, c => {
    c.markAsDirty();
    c.updateValueAndValidity();
  });
  return fm.valid;
}

/**
 * 正则表达式表单内容校验
 * @param cfg.regex 正则表达式
 * @param [cfg.ret = {regexp: true}] 校验失败返回的消息
 * @param [cfg.truth] [true]-测试通过返回ret, false-测试失败返回ret
 */
export function regexpValidator(cfg: {
  regex: RegExp,
  ret?: any,
  truth?: boolean
}) {
  cfg.ret = cfg.ret || {regexp: true};
  if (isNullOrUndefined(cfg.truth))
    cfg.truth = true;

  return (c: FormControl) => {
    if (c.value) {
      let testResult = cfg.regex.test(c.value);
      if (testResult === cfg.truth)
        return cfg.ret;
    }

    return {};
  }
}

//</editor-fold>

// //<editor-fold desc="http">
// //////////////////////////////////////////// http
// /**
//  * Observable 简单错误处理
//  * @param {string} operation 操作描述
//  * @param {T} result 期望结果
//  * @return {(e: any) => Observable<T>}
//  */
// export function handleError<T>(operation = 'operation', result?: T) {
//   return (e: any): Observable<T> => {
//     console.error(e);
//     // if (isNullOrUndefined(result))
//     //   return of({flag:false, message:'请求失败: ' + e.status});
//     return of(result);
//   };
// }
//
// /**
//  * 创建HttpParams对象
//  * @param {object} param 参数
//  * @param {boolean} expandProps=true true-将param中所有属性展开为一级属性
//  * @return {HttpParams}
//  */
// export function createHttpParams(param: object, expandProps = true): HttpParams {
//   let hp = new HttpParams();
//   if (!param)
//     return hp;
//
//   if (expandProps)
//     param = extJson(param);
//   eachO(param, (v, k) => {
//     if (!isNullOrUndefined(v))
//       hp = hp.append(k, `${v}`);
//   });
//   return hp;
// }
//
// // /**
// //  * 处理服务器响应结果, 响应格式为 {flag:boolean, message:string, data:any, errorCode?:any}
// //  * @param {NzNotificationService} notify
// //  * @param {(ret) => any} okFn
// //  * @param {boolean} showSuccess
// //  * @param {?} final
// //  * @return {(ret) => void}
// //  */
// // export function handleResult(
// //   notify: NzNotificationService,
// //   okFn = ret => ret,
// //   showSuccess = false,
// //   final?: (ret: Result) => any
// // ) {
// //   return (ret: Result) => {
// //     if (ret.flag) {
// //       if (showSuccess) notify.success('提示', '操作成功');
// //       if (isFunction(okFn)) okFn(ret);
// //     } else {
// //       notify.warning('警告', ret.message);
// //     }
// //
// //     if (isFunction(final))
// //       final(ret);
// //   };
// // }
//
// // /**
// //  * 处理服务器响应结果, 响应格式为 {flag:boolean, message:string, data:any, errorCode?:any}
// //  * @param cfg
// //  * @param {NzNotificationService} cfg.notify 通知对象
// //  * @param {boolean} [cfg.showSuccess] true-ret.flag为true时提示'操作成功'
// //  * @param {function(Result):void} [cfg.onOk] ret.flag为true时的处理函数
// //  * @param {function(Result):void} [cfg.onFail] ret.flag为false时的处理函数, 如果不指定默认弹出警告框并提示 ret.message
// //  * @param {function(Result):void} [cfg.final] 所有流程处理完成后执行
// //  */
// // export function handleResult2(cfg: {
// //   notify?: NzNotificationService,
// //   showSuccess?: boolean,
// //   onOk?: (ret) => void,
// //   onFail?: (ret) => void,
// //   final?: (ret) => void
// // }) {
// //   return (ret: Result) => {
// //
// //     // true == reg.flag
// //     if (ret.flag) {
// //       if (cfg.showSuccess && cfg.notify)
// //         cfg.notify.success('提示', '操作成功');
// //
// //       if (cfg.onOk)
// //         cfg.onOk(ret);
// //
// //     }
// //
// //     // false == ret.flag
// //     else if (cfg.onFail) {
// //       cfg.onFail(ret);
// //     } else {
// //       if (cfg.notify)
// //         cfg.notify.warning('警告', ret.message);
// //     }
// //
// //     // 处理完成后
// //     if (cfg.final)
// //       cfg.final(ret);
// //   };
// // }
//
// /**
//  * 延迟处理和错误抓取
//  * @param delayRet 捕获到延迟时的响应数据
//  * @param tag 标记
//  */
// export function delayAndCatchError(delayRet?: Result, tag?: string): OperatorFunction<any, any>[] {
//   return [
//     ...pipesDelayMap(delayRet),
//     ...catchErr(tag)
//   ]
// }
//
// /**
//  * 请求异常捕获
//  * @param tag 标记
//  */
// export function catchErr(tag?: string) {
//   return [catchError(handleError(tag || 'ERROR', Result.fail))];
// }
//
// /**
//  * 请求延迟处理
//  * @param delayRet 请求延迟响应数据, 默认返回 {@link Result.timeout}
//  */
// export function pipesDelayMap(delayRet?: Result): OperatorFunction<any, any>[] {
//   return [delay(3000), map(() => delayRet || Result.timeout)]
// }
//
// /**
//  * 为指定Observable添加管道操作项
//  * @param obs Observable对象
//  * @param optFns 管道操作项
//  */
// export function pipes<T>(obs: Observable<T>, ...optFns: OperatorFunction<any, any>[]): Observable<T> {
//   let t = {obs};
//   eachA(optFns, fn => t.obs = t.obs.pipe(fn));
//   return t.obs;
// }
//
// /**
//  * post请求
//  * @param http HTTP客户端
//  * @param url 请求地址
//  * @param param 请求参数
//  * @param optFns 操作项, 默认支持 {@link catchErr()}
//  * @see catchErr()
//  */
// export function post<T>(
//   http: HttpClient,
//   url: string,
//   param?: any,
//   ...optFns: OperatorFunction<any, any>[]
// ): Observable<T> {
//   return pipes<T>(http.post<T>(url, createHttpParams(param)), ...(optFns || catchErr()));
// }
//
// /**
//  * 转换url查询参数
//  * @param {string} search location.search
//  * @returns {{[p: string]: string | string[]}} 参数对象
//  */
// export function urlParam(search: string): { [s: string]: string | string[] } {
//   let index = search.indexOf('?');
//   if (0 !== index) return {};
//
//   let ret = {};
//   search = search.substr(1);
//   search.split('&').forEach(s => {
//     let sp = s.split('=');
//     let key = sp[0];
//     let oldV = ret[key];
//     if (!oldV) {
//       ret[key] = decodeURIComponent(sp[1]);
//       return;
//     }
//
//     if (!isArray(oldV))
//       oldV = [oldV];
//     oldV.push(sp[1]);
//
//     ret[key] = oldV;
//   });
//   return ret;
// }
//
// //</editor-fold>

//<editor-fold desc="ognl">
/**
 * OGNL表达式对象工具
 */
export class Ognls {
  /**
   * 获取数组值
   * @param data {?} 源对象
   * @param {string} ognl 属性索引
   * @return {Array<any>} 属性值
   */
  public static getArrOgnlVal(data: object, ognl: string): Array<any> | any {
    // 获取数组对象
    let sIdx = ognl.indexOf("[");
    let arrK = ognl.substring(0, sIdx);
    let arr = data[arrK];
    let idxStr: string = ognl.substring(sIdx);
    let idxReg = /^(\[\d+])+$/;

    if (!idxReg.test(idxStr)) throw "非法下标索引:" + idxStr;

    // 获取值[1], [0][2]...
    let spArr: Array<string> = idxStr.split("][");

    // 一维数组
    if (1 === spArr.length) return arr[parseInt(idxStr.replace("[", "").replace("]", ""))];

    // 多维数组
    let val = arr;
    eachA(spArr, function (v) {
      if (!isArray(val)) return false;
      val = val[parseInt((v + "").replace("[", "").replace("]", ""))]
    });
    return val;
  }

  /**
   * 获取值
   * @param data {?} 源对象
   * @param {string} ognl 属性索引
   * @return {any} 属性值
   */
  public static getValue(data: object, ognl: string): any {
    if (isNullOrUndefined(data)) return null;
    if (!isString(ognl)) throw "Invalid parameter: ognl";

    let keys = ognl.split(".");
    if (1 === keys.length) {
      // 非数组
      let regex = /\[/;
      if (!regex.test(ognl)) return data ? data[ognl.trim()] : data;
      else return Ognls.getArrOgnlVal(data, ognl);
    }

    let idx = ognl.indexOf(".");
    let key = ognl.substring(0, idx);
    let isArr = /\[\d+]/.test(key);
    let d = isArr ? Ognls.getArrOgnlVal(data, key) : data[key];
    let newOgnl = ognl.substring(idx + 1);
    return Ognls.getValue(d, newOgnl);
  }

  /**
   * 设置值
   * @param v {?} 值
   * @param {string} _ognl 属性索引
   * @param {object} d 目标对象
   * @return {object}
   */
  public static setValue(v: any, _ognl: string, d: object) {
    if (!isObject(d)) return;
    let ognl = new Ognl(_ognl), tmp;

    // 数组
    if (ognl.isArray) {
      // 第一层数组直接赋值
      // 所以 ognl.floors 需要去掉一层
      let old = d[ognl.key];
      let arr;
      let fIndex = ognl.floors.shift();

      if (!isArray(old))
        arr = d[ognl.key] = [];
      else {
        arr = old;
        let existLen = arr.length;
        let offset: number = existLen - fIndex - 1;
        // 目标下标超出现有数组长度
        // 执行下标补位
        if (0 > offset) {
          offset = Math.abs(offset);
          while (0 < offset--)
            arr.push(undefined);
        }
        arr.splice(fIndex, 1, []);
      }

      // 第N层(N>1)
      let lastIndex = -1;
      eachA(ognl.floors, (v, k) => {
        lastIndex = k;
        arr.splice(v, 1, tmp = []);
        arr = tmp;
      });

      // 设置非数组维度的层级关系
      if (ognl.next) {
        arr.splice(fIndex, 1, tmp = tmp || {});
        Ognls.setValue(v, ognl.nextKey, tmp);
      } else {
        if (undefined !== lastIndex) arr.splice(lastIndex, 1, v);
        else arr[fIndex].push(v);
      }
    }

    // 对象
    else {
      if (ognl.next) {
        Ognls.setValue(v, ognl.nextKey, d[ognl.key] = {});
      } else {
        if (Array.isArray(d)) {
          d.push(tmp = {});
          d = tmp;
        }
        d[ognl.key] = v;
      }
    }
    return d;
  }
}

/**
 * 解析ognl表达式为节点单向链表
 */
class Ognl {
  key = "";
  nextKey = "";
  isArray = false;
  floors = [];
  next: Ognl;

  constructor(k: string) {
    let objIndex = k.indexOf(".");
    let arrIndex = k.indexOf("[");
    let hasMore = (-1 !== objIndex);

    if ((-1 !== arrIndex) && ((-1 === objIndex) || (arrIndex < objIndex)))
      this.isArray = true;

    if (hasMore) {
      this.key = k.substring(0, objIndex);
      this.nextKey = k.substring(objIndex + 1);
      this.next = new Ognl(k.substring(objIndex + 1));
    } else {
      this.key = k;
      this.next = null;
    }

    if (this.isArray) {
      let sp: Array<string> = this.key.split("[");
      this.key = sp.shift();
      eachA(sp, v => {
        this.floors.push(parseInt(v));
      });
    }
  }
}

//</editor-fold>

//<editor-fold desc="validation isXxx...">
//////////////////////////////////////////// validation

/**
 * 判断是nullOrUndefined或空字符串
 * @param {string | any} v 目标字符串
 * @param {boolean} isTrim=true 是否去掉两端空格
 * @return {boolean} true-null/undefined/空字符串
 */
export function isNullOrEmpty(v: string | any, isTrim = true): boolean {
  if (isNullOrUndefined(v)) return true;
  if (isString(v)) {
    if (isTrim) v = ('' + v).trim();
    return !v.length;
  }
  return false;
}

//</editor-fold>

//<editor-fold desc="ElementRef">
/**
 * 解析原生控件引用为盒模型
 * @param ref {ElementRef} 控件引用
 */
export function refBox(ref: ElementRef): { ch: number } {
  let el = ref.nativeElement;
  return {
    ch: el.clientHeight
  }
}

//</editor-fold>

/**
 * 本地存储
 */
export class Storages {

  /**
   * 本地永久性存储对象
   * @type {Storages}
   */
  public static LOCAL = new Storages(localStorage);

  /**
   * 本地会话级别存储
   * @type {Storages}
   */
  public static SESSION = new Storages(sessionStorage);

  constructor(private storage: Storage) {
  }

  /**
   * 获取或设置数据
   * @param {string} k 关键字
   * @param {T|null|undefined} [o] null-删除数据, undefined-获取数, any-设置数据
   * @returns {T} 如果<i>null===o</i>返回之前保存的数据,
   *              如果<i>undefined===o</i>返回当前保存的数据,
   *              如果<i>null!=o && undefined!=o</i>返回之前保存的数据
   */
  public data<T>(k: string, o?: T): T {
    let v = this.storage.getItem(k);
    if (o) this.storage.setItem(k, JSON.stringify(o));
    else if (null === o) this.storage.removeItem(k);
    return <T>JSON.parse(v + '');
  }

  /**
   * 获取或设置当前用户
   * @param {T} u 用户数据
   * @param {T|null|undefined} [u] null-删除数据, undefined-获取数, any-设置数据
   */
  public user<T>(u?: T): T {
    return this.data('__USR__', u);
  }
}

/**
 * 调试器
 */
export class Debugger {

  /**
   * 只在本地开发时执行
   * @param {Function} fn 目标函数
   * @returns {Debugger}
   */
  static dev(fn: Function) {
    if (this.isDevModel() && isFunction(fn))
      fn();
    return this;
  }

  /**
   * 只在线上环境执行
   * @param {Function} fn 目标函数
   * @returns {Debugger}
   */
  static prod(fn: Function) {
    if (!this.isDevModel() && isFunction(fn))
      fn();
    return this;
  }

  /**
   * 当前是否为开发模式
   * @returns {boolean} true-开发模式, false-线上模式
   */
  private static isDevModel() {
    return 'http://localhost:4200' === location.origin;
  }
}

/**
 * 定长消息队列
 * @param T 泛型参数
 */
export class MessageQueue<T> {

  // 队列
  queue: Array<T> = [];

  constructor(private cacheLength: number = 100) {
  }

  /**
   * 数据推入队列, 队列长度超出{@link cacheLength 缓冲区长度}时返回溢出数据
   * @param data 目标数据
   */
  pull(data: T): T {
    this.queue.push(data);
    if (this.cacheLength == this.queue.length) {
      return this.get();
    }
  }

  /**
   * 弹出队首数据
   */
  get(): T {
    if (0 < this.queue.length)
      return this.queue.shift();
  }

  /**
   * 删除指定消息
   * @param msg 消息对象
   * @param {string | ((el: T, i: number) => boolean)} [k] 唯一值属性名或比较器函数(返回true表示找到)
   */
  del(msg: any, k?: string | ((el: T, i: number) => boolean)) {
    removeA(this.queue, msg, k);
  }
}

//</editor-fold>
