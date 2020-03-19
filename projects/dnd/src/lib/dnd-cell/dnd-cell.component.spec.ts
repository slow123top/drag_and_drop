import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DndCellComponent } from './dnd-cell.component';

describe('DndComponent', () => {
  let component: DndCellComponent;
  let fixture: ComponentFixture<DndCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DndCellComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DndCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
