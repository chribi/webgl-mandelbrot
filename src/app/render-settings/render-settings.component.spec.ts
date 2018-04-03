import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderSettingsComponent } from './render-settings.component';
import { FormsModule } from '@angular/forms';
import { ColorSchemeService } from '../color-schemes/color-scheme.service';

describe('RenderSettingsComponent', () => {
  let component: RenderSettingsComponent;
  let fixture: ComponentFixture<RenderSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenderSettingsComponent ],
      providers: [ ColorSchemeService ],
      imports: [ FormsModule ]
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
