import { Component, OnInit } from '@angular/core';
import { ColorSchemeService } from '../color-schemes/color-scheme.service';

@Component({
  selector: 'app-render-settings',
  templateUrl: './render-settings.component.html',
  styleUrls: ['./render-settings.component.css']
})
export class RenderSettingsComponent implements OnInit {

  maxIterations = 250;
  continuousColoring = true;
  colorSchemes: { label: string, index: number }[];
  selectedColorSchemeIndex: number;

  constructor(private colorSchemeService: ColorSchemeService) {
    this.colorSchemes = colorSchemeService.colorSchemeIndices;
    this.selectedColorSchemeIndex = this.colorSchemes[0].index;
  }

  ngOnInit() {
  }

}
