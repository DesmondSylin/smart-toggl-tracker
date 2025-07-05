import { App, Modal } from 'obsidian';
// @ts-ignore
import EntryMenu from "./view/EntryMenu.svelte";

interface ExistTogglEntry {
  description: string;
  project_id: number;
  tags: string[];
}

interface ExistTogglProject {
  id: number;
  name: string;
  color: string;
}

// 對話框
export class SuggestEntriesModal extends Modal {
  menu_modal: EntryMenu;
  exist_toggl_entries: ExistTogglEntry[] = [];
  exist_toggl_projects: ExistTogglProject[] = [];
  exist_toggl_tags: string[] = [];
  description: string = "";

  constructor(
    app: App,
    exist_toggl_entries: ExistTogglEntry[],
    exist_toggl_projects: ExistTogglProject[],
    exist_toggl_tags: string[],
    description: string
  ) {
    super(app);
    this.exist_toggl_entries = exist_toggl_entries;
    this.exist_toggl_projects = exist_toggl_projects;
    this.exist_toggl_tags = exist_toggl_tags;
    this.description = description;
  }

  onOpen(): void {
    this.menu_modal = new EntryMenu({
      target: this.contentEl,
      props: {
        app: this.app,
        exist_entries: this.exist_toggl_entries,
        exist_projects: this.exist_toggl_projects,
        exist_tags: this.exist_toggl_tags,
        description: this.description
      }
    });
    this.menu_modal.$on('selected', (event: any) => {
      (this.app as any).commands.executeCommandById('smart-toggl-tracker:show-tracker');
      this.close();
    })
  }

  onClose() {
    this.menu_modal.$destroy();
  }
}