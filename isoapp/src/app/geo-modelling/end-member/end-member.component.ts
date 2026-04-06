import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { EndMemberItem } from 'src/app/services/common/geo-model.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';

export interface EndMember {
  name: string;
  member: Array<EndMemberItem>;
  multipleSelectionMode: boolean;
  maxSelectable: number;
  inverse?: boolean;
}

export const MULTIPLE_SELECTION_MODE = '_MULTIPLE_SELECTION_MODE_';
export const SECOND_SELECTION = '_SECOND_SELECTION_';
export const RESET_SELECTION = '_RESET_SELECTION_';
export const RESET_SELECTION_OUT = '_RESET_SELECTION_OUT_';
export const END_MEMBER = '_END_MEMBER_';
export const END_MEMBER_SET = '_END_MEMBER_SET_';
export const INVERSE = '_INVERSE_';

@Component({
  selector: 'app-end-member',
  templateUrl: './end-member.component.html',
  styleUrls: ['./end-member.component.scss']
})

export class EndMemberComponent implements OnInit, OnDestroy {
  @Input('members') members: Array<Array<EndMemberItem>> | undefined;
  @Output() outMember = new EventEmitter<any>();
  @Output() onSelect = new EventEmitter<any>();

  public endMembers = new Array<EndMember>();
  // public multipleSelectionMode = false;
  public subReset: Subscription | undefined;
  public subMember: Subscription | undefined;
  public subMultiSelect: Subscription | undefined;
  public subInverse: Subscription | undefined;
  public activeMember = '';

  constructor(private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.subInverse = this.eventGeneratorService.on(INVERSE).subscribe(
      (event: any) => {
        let m = this.getMemberByName(event.content.active);
        m.inverse = event.content.checked;
      }
    );
    this.subReset = this.eventGeneratorService.on(RESET_SELECTION).subscribe(
      (event: any) => {
        this.unSelectAll();
      }
    );
    this.subMember = this.eventGeneratorService.on(END_MEMBER).subscribe(
      (event: any) => {
        this.activeMember = event.content;
      }
    )
    this.subMultiSelect = this.eventGeneratorService.on(MULTIPLE_SELECTION_MODE).subscribe(
      (event: any) => {
        let m = this.getMemberByName(event.content.active);
        m.multipleSelectionMode = event.content.checked;
        if (!event.content.checked) {
          this.unSelectByMember(m.name);
          m.maxSelectable = 1;
          this.eventGeneratorService.emit({ key: RESET_SELECTION_OUT, content: m.name });
        } else {
          m.maxSelectable = 2;
        }
      }
    )
    console.log(this.members);
    this.analyzeMembers();
  }

  ngOnDestroy(): void {
    if (!!this.subReset) {
      this.subReset.unsubscribe();
    }
    if (!!this.subMember) {
      this.subMember.unsubscribe();
    }
    if (!!this.subMultiSelect) {
      this.subMultiSelect.unsubscribe();
    }
    if (!!this.subInverse) {
      this.subInverse.unsubscribe();
    }
  }

  private analyzeMembers() {
    if (!!this.members) {
      for (let i = 0; i < this.members?.length; i++) {
        let member = this.members[i];
        let iid = this.getItinerisId(member);
        for (let m of member) {
          if (m.type === 'F') {
            let sname = m.name.toLowerCase();
            if (sname.indexOf('sample') >= 0) {
              let newMember = new Array<EndMemberItem>();
              for (let nm of member) {
                if (nm.type !== 'F') {
                  newMember.push(nm);
                }
              }
              let name = m.value + ' [' + iid + ']';
                this.endMembers.push({ name: name, member: newMember, multipleSelectionMode: false, maxSelectable: 1 });
              break;
            }
          }
        }
      }
      this.outMember.emit(this.endMembers);
    }
  }

  private getItinerisId(member: Array<EndMemberItem>): string {
    for (let m of member) {
      if (m.type === 'F' && m.name.toUpperCase() === 'ITINERIS_ID')
        return m.value;
    }
    return '';
  }

  private getMemberByName(name: string): EndMember {
    for (let m of this.endMembers) {
      if (m.name === name) {
        return m;
      }
    }
    return { name: '', member: new Array<EndMemberItem>(), multipleSelectionMode: false, maxSelectable: 1 };
  }

  public onRightClick(event: any) {
    event.preventDefault();
    console.log(event);
  }

  public onClick(item: EndMemberItem, memberName: string): void {
    if (memberName === this.activeMember) {
      let m = this.getMemberByName(memberName);
      if (!m.multipleSelectionMode) {
        this.unSelectByMember(memberName);
      }
      let nSelected = this.countSelected(m);

      // true === item.selected ? item.selected = false : (nSelected < m.maxSelectable ? item.selected = true : item.selected = false);
      item.selected = !!item.selected ? !item.selected : true;
      item.selected = nSelected < m.maxSelectable ? item.selected = true : item.selected = false;
      if (nSelected == m.maxSelectable && !item.selected)
        return;
      let outItem = { ...item };
      let ind = outItem.value.indexOf(' [');
      let um = outItem.value.substring(ind + 2, outItem.value.indexOf(']'));
      if (ind > 0) {
        outItem.value = outItem.value.substring(0, ind);
        outItem.um = um;
      }
      if (!!m.inverse) {
        let x = parseFloat(outItem.value);
        outItem.value = '' + (1 / x);
        outItem.um = '1/' + um;
      }
      this.onSelect.emit({ 'memberName': memberName, 'item': outItem });
    }
  }

  public selectActive(e: EndMember) {
    this.activeMember = e.name;
    this.eventGeneratorService.emit({ key: END_MEMBER_SET, content: this.activeMember });
  }

  private countSelected(em: EndMember): number {
    let count = 0;
    for (let m of em.member) {
      if (!!m.selected) {
        count++;
      }
    }
    return count;
  }

  private unSelectByMember(memberName: string) {
    if (!!this.endMembers) {
      for (let em of this.endMembers) {
        if (em.name === memberName) {
          for (let m of em.member) {
            m.selected = false;
          }
          break;
        }
      }
    }
  }

  private unSelectAll(): void {
    if (!!this.endMembers) {
      for (let em of this.endMembers) {
        for (let m of em.member) {
          m.selected = false;
        }
        em.maxSelectable = 1;
      }
    }
  }

}
