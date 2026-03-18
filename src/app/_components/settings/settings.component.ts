import { Component, OnInit } from '@angular/core';
import { Settings, SettingsService } from '../../_services/settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  settings: Settings | undefined;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings.subscribe((settings) => {
      this.settings = settings;
    });
  }

  toggleDetailed(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsService.changeOption('detailed', checked);
  }

  onLevelChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.settingsService.changeOption('talentlevel', value);
  }

  incrementLevel(): void {
    if (!this.settings) return;

    const newLevel = Math.min(this.settings.talentlevel + 1, 15);
    this.settingsService.changeOption('talentlevel', newLevel);
  }

  decrementLevel(): void {
    if (!this.settings) return;

    const newLevel = Math.max(this.settings.talentlevel - 1, 1);
    this.settingsService.changeOption('talentlevel', newLevel);
  }
}
