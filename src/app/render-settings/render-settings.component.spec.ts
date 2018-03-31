import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderSettingsComponent } from './render-settings.component';

describe('RenderSettingsComponent', () => {
  let component: RenderSettingsComponent;
  let fixture: ComponentFixture<RenderSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
