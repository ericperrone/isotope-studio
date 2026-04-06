import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Thesauri } from 'src/app/models/thesauri';
import { ThesauriService } from 'src/app/services/rest/thesauri.service';
import { ThesaurusComponent } from '../thesaurus/thesaurus.component';
import { CONFIRM } from '../modal-params';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-thesauri',
  templateUrl: './thesauri.component.html',
  styleUrls: ['./thesauri.component.scss']
})
export class ThesauriComponent implements OnInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  public thesauriList = new Array<Thesauri>();
  public ready = false;

  constructor(private thesauriService: ThesauriService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadThesauriList();
  }

  private loadThesauriList(): void {
    this.ready = false;
    this.thesauriList.length = 0;
    let ref = this.thesauriService.list().subscribe(
      (res: any) => {
        ref.unsubscribe();
        this.thesauriList = res;
        this.ready = true;
      }
    );
  }

  public close(): void {
    this.emitter.emit('close');
  }

  public openThesaurus(item: Thesauri): void {
    // console.log(item);
    let ref = this.thesauriService.getThesaurus(item.id).subscribe(
      (res: any) => {
        console.log(res);
        let modal = this.modalService.open(ThesaurusComponent, { centered: true, size: 'xl' });
        modal.componentInstance.params = { thesaurus: item, data: res };
        modal.componentInstance.emitter.subscribe((result: any) => {
          if (result.status === CONFIRM) {
            console.log(result);
            this.emitter.emit(result);
          }
          modal.close();
        });
        ref.unsubscribe();
      }
    );

  }
}
