import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {execMethod} from "../common/utils";
import {isNullOrUndefined} from "util";

/**
 * 延迟删除
 */
@Directive({
  selector: '[durationDelete]'
})
export class DurationDeleteDirective implements OnInit {

  // 缓存数量
  static currentCache = 0;

  // 缓存控件列表
  static caches: DurationDeleteDirective[] = [];

  // 默认配置
  readonly DEFAULT_CONFIG: DelayConfigure = {
    // 缓冲区长度, 低于该长度不做自动删除处理
    cacheLength: 5,
    // 动画持续时长: 毫秒
    duration: 1000,
    // 正常显示时长: 毫秒
    displayDuration: 3000,
  };

  // 配置
  @Input("durationDelete")
  configure: DelayConfigure = {};

  /**
   * DOM删除后调用, 该函数如果使用到this对象必须使用指向函数方式实现 ()=>{}
   */
  @Input("onDeleted")
  onDeleted?: (data?: any) => void;

  constructor(
    private el: ElementRef,
    private render: Renderer2
  ) {
  }

  ngOnInit(): void {
    DurationDeleteDirective.caches.push(this);
    let cacheLength = this.configure.cacheLength;
    let maxCache = isNaN(cacheLength) ? this.DEFAULT_CONFIG.cacheLength : cacheLength;
    if (++DurationDeleteDirective.currentCache > maxCache)
      DurationDeleteDirective.caches.shift().doDelete();
  }

  // 执行删除命令
  private doDelete() {
    // TODO 每个不同的业务使用不同的key防止相互干扰
    if (isNullOrUndefined(this.configure.cacheKey))
      this.configure.cacheKey = "undefined";

    setTimeout(() => {
      let dom = this.el.nativeElement;
      this.render.setStyle(dom, 'height', dom.clientHeight + 'px');
      this.render.setStyle(dom, 'opacity', dom.style.opacity);

      let displayDuration = isNaN(this.configure.displayDuration)
        ? this.DEFAULT_CONFIG.displayDuration
        : this.configure.displayDuration;
      setTimeout(() => {
        if (this.configure.extraClass)
          this.render.addClass(dom, this.configure.extraClass);
        this.render.addClass(dom, 'duration-delete');
        let duration = this.configure.duration || this.DEFAULT_CONFIG.duration;
        this.render.setStyle(dom, 'transition', `height ${duration}ms, opacity ${duration}ms`);

        // 由组件数据驱动删除
        setTimeout(() => {
          execMethod(this.onDeleted, null, this.configure.data);
        }, duration);

      }, displayDuration);
    });
  }

}

// 自动删除配置
export class DelayConfigure {

  // 缓冲区长度, 低于该长度不做自动删除处理
  // 默认: 5
  cacheLength?: number;

  // 动画持续时长: 毫秒
  // 默认: 1000
  duration?: number;

  // 正常显示时长: 毫秒
  // 默认: 3000
  displayDuration?: number;

  // 携带数据
  data?: any;

  // 额外样式
  extraClass?: string;

  // 缓存队列关键字
  cacheKey?: string;
}
