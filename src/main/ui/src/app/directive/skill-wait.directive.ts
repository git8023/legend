import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges
} from '@angular/core';

/**
 * 技能等待蒙层
 */
@Directive({
  selector: '[skill-wait]'
})
export class SkillWaitDirective implements OnInit, OnChanges {

  @Input("skill-wait") isWait: boolean = false;
  @Output('skill-wait') myEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private el: ElementRef,
    private render: Renderer2
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render.setStyle(this.el.nativeElement, 'display', this.isWait ? 'block' : 'none');
  }

  ngOnInit(): void {
    this.render.setStyle(this.el.nativeElement, 'top', '0');
    this.render.listen(this.el.nativeElement, 'click', event => event.stopPropagation());
  }

}
