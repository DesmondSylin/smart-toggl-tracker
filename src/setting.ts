import { App, PluginSettingTab, Setting, ButtonComponent, Notice } from 'obsidian';
import SmartTogglTrackerPlugin from "./main";

import { is_debug, connect, logout } from './lib/toggl';

export interface SmartTogglTrackerPluginSettings {
  token: string;
  debug_mode: boolean;
}

export const DEFAULT_SETTINGS: SmartTogglTrackerPluginSettings = {
  token: '',
  debug_mode: false,
}

// 外掛設定頁
export class MySettingTab extends PluginSettingTab {
  plugin: SmartTogglTrackerPlugin;
  temp_token: string;

  constructor(app: App, plugin: SmartTogglTrackerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.temp_token = this.plugin.settings.token;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Setting for Smart Toggl Tracker' });

    // Toggl API Token
    new Setting(containerEl)
      .setName('Toggl API Token')
      .setDesc('In order to connect with Toggl, you need to enter your Toggl API Token. It`s can be found at https://track.toggl.com/profile')
      .addText(token_text => token_text
        .setPlaceholder('Enter your secret')
        .setValue('')
        .onChange(async (value) => {
          this.temp_token = value;
        }))
      .addButton((button: ButtonComponent) => {
        button.setButtonText('Connect');
        button.setCta();
        button.onClick(async () => {
          if (!this.temp_token) {
            new Notice('Token is empty');
            return;
          }
          button.setDisabled(true);
          try {
            await connect(this.temp_token);
            this.plugin.settings.token = this.temp_token;
            await this.plugin.saveSettings();
            button.setButtonText('success');
          } catch {
            button.setButtonText('failed');
          } finally {
            window.setTimeout(() => {
              button.setButtonText('connect');
              button.setDisabled(false);
            }, 2000);
          }
        });
      });

    // Logout
    if (this.plugin.settings.token) {
      new Setting(containerEl)
        .setName('Logout Toggl Connection')
        .addButton((button: ButtonComponent) => {
          button.setButtonText('Logout');
          button.setCta();
          button.onClick(async () => {
            if (!this.plugin.settings.token) {
              new Notice('You are not logged in yet');
              return;
            }
            button.setDisabled(true);
            try {
              logout();
              this.plugin.settings.token = '';
              await this.plugin.saveSettings();
              new Notice('Logout Successfully');
            } catch {
              new Notice('Logout Failed');
            } finally {
              button.setDisabled(false);
            }
          })
        });
    }

    // Debug mode
    new Setting(containerEl)
      .setName("Debug Mode")
      .setDesc("Use for developing")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.debug_mode)
          .onChange(async value => {
            is_debug.set(value);
            this.plugin.settings.debug_mode = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
