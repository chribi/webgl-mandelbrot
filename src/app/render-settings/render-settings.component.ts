import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-render-settings',
  templateUrl: './render-settings.component.html',
  styleUrls: ['./render-settings.component.css']
})
export class RenderSettingsComponent implements OnInit {

  maxIterations = 250;
  constructor() { }

  ngOnInit() {
  }

}
