import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ModalParams } from '../modal-params';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';

export const PROGRESS_TEXT = '_PROGRESS_TEXT_';
export const PROGRESS_INTERRUPT = '_PROGRESS_INTERRUPT_';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit, OnDestroy {
  @Input() params: ModalParams | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  private sub: Subscription | undefined;
  public progressText = '';

  constructor(private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.sub = this.eventGeneratorService.on(PROGRESS_TEXT).subscribe(
      event => this.progressText = event.content
    );
   this.progressText = this.params?.bodyText ? this.params?.bodyText : '';
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  interrupt(): void {
    this.eventGeneratorService.emit({ key: PROGRESS_INTERRUPT });
  }
}
