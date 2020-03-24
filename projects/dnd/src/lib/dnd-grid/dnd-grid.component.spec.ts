import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DndGridComponent } from './dnd-grid.component';

describe('DndComponent', () => {
  let component: DndGridComponent;
  let fixture: ComponentFixture<DndGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DndGridComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DndGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
