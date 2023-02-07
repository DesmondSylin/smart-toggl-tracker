import { Editor, CachedMetadata, TFile, Menu, MarkdownView, Modal, Notice, Plugin, Setting } from 'obsidian';

import { TimerView, VIEW_TYPE_TIMER } from "./view";
import { SmartTogglTrackerPluginSettings, MySettingTab, DEFAULT_SETTINGS } from "./setting";
import { SuggestEntriesModal } from "./SuggestModal"

import { sync as SyncToggl, stopTogglTimer, checkCandidate, is_debug, token } from "./lib/toggl";


export default class SmartTogglTrackerPlugin extends Plugin {
  settings: SmartTogglTrackerPluginSettings;
  TimerView: TimerView;

  async onload() {
    this.registerView(
      VIEW_TYPE_TIMER,
      (leaf) => (this.TimerView = new TimerView(leaf))
    );
    if (this.app.workspace.layoutReady) {
			this.initLeaf();
		} else {
			this.app.workspace.onLayoutReady(this.initLeaf.bind(this));
		}

    this.addCommand({
      id: 'show-tracker',
      name: 'Show Tracker',
      callback: () => this.activateView()
    })

    this.addCommand({
      id: 'sync-now',
      name: 'Sync Now',
      callback: () => {
        SyncToggl();
      }
    });

    this.addCommand({
      id: 'open-timer-panel',
      name: 'Open Timer Panel',
      callback: async () => {
        this.activateView();
      }
    });
    this.addCommand({
      id: 'stop-toggl-timer',
      name: 'Stop Toggl Timer',
      icon: 'stop-circle',
      callback: async () => {
        await stopTogglTimer();
        SyncToggl();
        new Notice('Timer is stopped');
      }
    });

    this.addCommand({
      id: 'start-toggl-timer',
      name: 'Start Toggl Timer',
      icon: 'timer',
      editorCallback: async (editor: Editor, _) => this.startEntrySelection(editor)
    });

    // 新增右鍵選單命令
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        menu.addItem((item) => {
          item.setTitle('Start Timer')
          .setIcon('timer')
          .onClick(() => {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
              const editor = view.editor;
              this.startEntrySelection(editor);
            }
          });
        });
      })
    );

    // This adds a settings tab so the user can configure various aspects of the plugin
    await this.loadSettings();
    this.addSettingTab(new MySettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
    // 	console.log('click', evt);
    // });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE_TIMER,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER)[0]
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    token.set(this.settings.token);
    is_debug.set(this.settings.debug_mode);
    if (!this.settings.debug_mode)  SyncToggl();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER).length) {
			return;
		}
		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_TIMER
		});
	}

  // 啟動候選清單
  startEntrySelection(editor: Editor) {
    const entry_candidates = this.getEntryMenu(editor);
    if (!entry_candidates) return;

    const exist_data = checkCandidate(entry_candidates);

    new SuggestEntriesModal(
      this.app,
      exist_data.exist_toggl_entries,
      exist_data.exist_toggl_projects,
      entry_candidates.candidate_tags,
      entry_candidates.description,
    ).open();
  }

  // 取得候選清單
  getEntryMenu(editor: Editor) {
    const file = app.workspace.getActiveFile();
    if (!file || !editor) return;
    const metadata = this.app.metadataCache.getCache(file.path);
    if (!metadata) return;

    const candidate_projects = [];
    const tags: string[] = [];
    let description = '';

    const cursor = editor.getCursor();
    const this_line = cursor.line;
    const this_line_content = editor.getLine(this_line).trim();
    const is_listItem = this_line_content.startsWith('- ') || this_line_content.startsWith('- [ ]');

    // Description
    if (editor.somethingSelected()) {
      description = editor.getSelection();
    } else {
      description = cleanContent(this_line_content);
      // 去掉hashtag
      var regex = /#+([^\s@$%^&*]+)/ig;
      description = description.replace(regex, '').trim();
    }

    // 候選Project
    // 檔名
    if (file?.basename) {
      candidate_projects.push(file.basename);
      if (!description) description = file.basename;
    }
    // 標題處理
    if (metadata.headings && metadata.headings.length > 0) {
      let max_level = 6;
      for (let index = metadata.headings.length - 1 ; index >= 0; index--) {
        const heading = metadata.headings[index];

        if (heading.position.start.line >= this_line) continue;
        if (heading.level < max_level) {
          candidate_projects.push(heading.heading);
          max_level = heading.level;
        }
        if (max_level === 1) break;
      }
    }
    // 清單處理
    if (metadata.listItems && is_listItem) {
      let last_parent = this_line;
      for (let index = metadata.listItems.length - 1; index >= 0; index--) {
        const list_item = metadata.listItems[index];
        const this_item_line = list_item.position.start.line;

        // 先找到目前這行的資訊
        if (this_item_line > last_parent) continue;
        // 如果上個找到的母項目不存在就跳出
        if (last_parent < 0) break;
        // 找到遊標所在項目的處理
        if (this_item_line === this_line) {
          last_parent = list_item.parent;
          continue;
        }
        // 找到母項目的處理
        if (this_item_line === last_parent) {
          candidate_projects.push(cleanContent(editor.getLine(this_item_line)));
          last_parent = list_item.parent;
        }
      }
    }
    // 路徑處理
    if (file.parent) {
      let last_path = file.parent;
      while (last_path.path !== '/' && last_path?.parent) {
        candidate_projects.push(last_path.name);
        last_path = last_path.parent;
      }
    }

    // tag候選
    if (metadata.tags) {
      for (const tag of metadata.tags) {
        if (tag.position.start.line === this_line) {
          if (tag.tag.includes('/')) {
            const all_tag = tag.tag.split('/');
            tags.push(all_tag[all_tag.length - 1]);
          } else {
            tags.push(tag.tag.substring(1));
          }
        }
      }
    }

    return {
      description,
      candidate_projects: candidate_projects,
      candidate_tags: tags
    }
  }
}


// 清理條目
function cleanContent(content: string) {
  let result = content.trim();
  if (result.startsWith('- [ ] ')) result = result.split('- [ ] ')[1]
  else if (result.startsWith('- ')) result = result.split('- ')[1]
  return result;
}